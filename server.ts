import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { classifyCopilotIntent } from './src/services/ace/intentGate';
import { HydraDBEngine } from './src/services/hydradb/engine';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HYDRADB_URL = (process.env.HYDRADB_URL || 'http://hydradb:8443').replace(/\/+$/, '');
const HYDRADB_ADMIN_URL = (process.env.HYDRADB_ADMIN_URL || 'http://hydradb:9090').replace(/\/+$/, '');
const HYDRADB_API_KEY = process.env.HYDRADB_API_KEY || '';
const HYDRADB_NAMESPACE = process.env.HYDRADB_NAMESPACE || 'default';
const HYDRADB_GRAPH_ID = process.env.HYDRADB_GRAPH_ID || process.env.HYDRADB_DATABASE || 'default';

function getHydraHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Graph-Namespace': HYDRADB_NAMESPACE,
    ...(HYDRADB_API_KEY ? { Authorization: `Bearer ${HYDRADB_API_KEY}` } : {}),
    ...extraHeaders,
  };
  return headers;
}

app.use(express.json());

// Initialize Google GenAI client lazily/safely
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return genAIClient;
}

// ---------------------------------------------------------------------------
// HydraDB OSS Direct Proxy & Reverse Gateway
// All OpenCypher queries and graph mutations route directly to the real HydraDB container.
// ---------------------------------------------------------------------------

// 1. OpenCypher Query & Mutation Endpoint (Direct Forwarder to HydraDB OSS)
app.post('/v1/graphs/:graph_id/query', async (req, res) => {
  const { graph_id } = req.params;
  const targetUrl = `${HYDRADB_URL}/v1/graphs/${encodeURIComponent(graph_id)}/query`;

  try {
    const upstreamHeaders = getHydraHeaders({
      ...(req.headers['authorization'] ? { Authorization: req.headers['authorization'] as string } : {}),
      ...(req.headers['x-graph-namespace'] ? { 'X-Graph-Namespace': req.headers['x-graph-namespace'] as string } : {}),
    });

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (err: any) {
    return res.status(503).json({
      error: `HydraDB OSS upstream unavailable at ${HYDRADB_URL}`,
      details: err.message,
    });
  }
});

// 2. Health & Readiness Proxy to HydraDB OSS (port 9090 /readyz)
app.get('/healthz', async (req, res) => {
  try {
    const hydraRes = await fetch(`${HYDRADB_ADMIN_URL}/readyz`);
    if (hydraRes.ok) {
      return res.json({
        status: 'ok',
        hydradb: 'ready',
      });
    }
    return res.status(503).json({
      status: 'degraded',
      hydradb_status: hydraRes.status,
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'unavailable',
      error: err.message,
      targetUrl: `${HYDRADB_ADMIN_URL}/readyz`,
    });
  }
});

app.get('/readyz', async (req, res) => {
  try {
    const hydraRes = await fetch(`${HYDRADB_ADMIN_URL}/readyz`);
    const text = await hydraRes.text();
    return res.status(hydraRes.status).send(text);
  } catch (err: any) {
    return res.status(503).send(`HydraDB readyz check failed: ${err.message}`);
  }
});

// 3. Application System Health & Substrate Inspection Endpoint
app.get('/api/health', async (req, res) => {
  let hydraUpstreamReachable = false;
  let hydraUpstreamDetails: any = null;

  try {
    const checkRes = await fetch(`${HYDRADB_ADMIN_URL}/readyz`);
    if (checkRes.ok) {
      hydraUpstreamReachable = true;
      hydraUpstreamDetails = { status: 'ready', code: checkRes.status };
    } else {
      hydraUpstreamDetails = { status: checkRes.status, text: await checkRes.text().catch(() => '') };
    }
  } catch (e: any) {
    hydraUpstreamDetails = { error: e.message };
  }

  res.json({
    status: 'ok',
    service: 'ace - Customer Intelligence Agent Server',
    hydraStatus: hydraUpstreamReachable ? 'HydraDB OSS Container Connected' : 'HydraDB OSS Container Disconnected',
    hydraConfig: {
      queryUrl: HYDRADB_URL,
      adminUrl: HYDRADB_ADMIN_URL,
      graphId: HYDRADB_GRAPH_ID,
      namespace: HYDRADB_NAMESPACE,
      hasApiKey: !!HYDRADB_API_KEY,
      upstreamReachable: hydraUpstreamReachable,
      upstreamDetails: hydraUpstreamDetails,
    },
    verifiedEndpoints: [
      `POST ${HYDRADB_URL}/v1/graphs/:graph_id/query`,
      `GET ${HYDRADB_ADMIN_URL}/readyz`,
    ],
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Authoritative Customer Memory Backend Endpoints
// UI is a direct projection of HydraDB graph memory.
// ---------------------------------------------------------------------------

// 1. Overview & Synthesis Endpoint
app.get('/api/customer-memory/overview', async (_req, res) => {
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = await hydra.fetchAuthoritativeGraphSnapshot();
    const nodes = snapshot.nodes || [];
    const edges = snapshot.edges || [];

    const accounts = nodes.filter((n) => n.type === 'Account');
    const contacts = nodes.filter((n) => n.type === 'Contact');
    const interactions = nodes.filter((n) => n.type === 'InteractionEpisode');
    const requirements = nodes.filter((n) => n.type === 'PricingConstraint' || n.tags.includes('Requirement'));
    const patterns = nodes.filter((n) => n.type === 'BuyingSignal' || n.type === 'MarketCondition' || n.tags.includes('EmergingPattern'));
    const deals = nodes.filter((n) => n.type === 'Deal');

    // Build synthesized learned themes from real HydraDB graph nodes
    const learnedThemes = patterns.map((p) => ({
      id: p.id,
      title: p.label,
      description: p.properties?.stat || p.properties?.details || p.properties?.description || 'Extracted from customer interactions.',
      stat: p.properties?.stat || `${p.properties?.confidence ? Math.round(p.properties.confidence * 100) : 85}% of recent conversations`,
      growth: p.properties?.trendGrowth || '+35%',
    }));

    // Build context items from real interaction episodes
    const contextItems = interactions.map((i) => ({
      id: i.id,
      title: i.label,
      company: i.properties?.company || 'Connected Customer',
      customerName: i.properties?.customerName || i.properties?.participants?.[0] || 'Stakeholder',
      summary: i.properties?.summary || i.label,
      timestamp: i.properties?.timestamp || i.validFrom || 'Recent',
      channel: i.properties?.channel || 'Conversation',
    }));

    return res.json({
      available: true,
      stats: {
        totalAccounts: accounts.length,
        totalContacts: contacts.length,
        totalInteractions: interactions.length,
        activeDeals: deals.length,
        connectedRequirements: requirements.length,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.label,
        industry: a.properties?.industry || 'General',
        dealValue: a.properties?.dealValue || 0,
        status: a.properties?.status || 'Active',
        notes: a.properties?.notes || '',
      })),
      learnedThemes,
      contextItems,
      totalGraphEntities: nodes.length,
      totalGraphEdges: edges.length,
    });
  } catch (err: any) {
    return res.status(503).json({
      available: false,
      error: 'HydraDB OSS graph unavailable',
      details: err.message,
    });
  }
});

// 2. Customer Accounts & Stakeholders
app.get('/api/customer-memory/accounts', async (_req, res) => {
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = await hydra.fetchAuthoritativeGraphSnapshot();
    const nodes = snapshot.nodes || [];
    const edges = snapshot.edges || [];

    const accountNodes = nodes.filter((n) => n.type === 'Account');
    const contactNodes = nodes.filter((n) => n.type === 'Contact');
    const dealNodes = nodes.filter((n) => n.type === 'Deal');

    const accounts = accountNodes.map((acc) => {
      // Find connected contacts via edges
      const connectedContactIds = edges
        .filter((e) => e.targetId === acc.id || e.sourceId === acc.id)
        .map((e) => (e.sourceId === acc.id ? e.targetId : e.sourceId));

      const primaryContact = contactNodes.find((c) =>
        connectedContactIds.includes(c.id) || c.properties?.company === acc.label
      ) || contactNodes[0];

      const linkedDeal = dealNodes.find((d) =>
        d.properties?.company === acc.label || connectedContactIds.includes(d.id)
      );

      return {
        id: acc.id,
        name: primaryContact ? primaryContact.label : acc.label,
        company: acc.label,
        email: primaryContact?.properties?.email || `contact@${acc.properties?.domain || 'company.com'}`,
        phone: primaryContact?.properties?.phone || '',
        role: primaryContact?.properties?.role || 'Executive Stakeholder',
        status: acc.properties?.status || 'Active',
        dealValue: linkedDeal?.properties?.value || acc.properties?.dealValue || 0,
        industry: acc.properties?.industry || 'Enterprise',
        lastContact: acc.properties?.lastContact || 'Recent',
        nextAction: acc.properties?.nextAction || 'Review customer context',
        nextActionDate: acc.properties?.nextActionDate || 'Scheduled',
        assignedRep: acc.properties?.assignedRep || 'Commercial Team',
        sentiment: primaryContact?.properties?.sentiment || 'Positive',
        notes: acc.properties?.notes || '',
        tags: acc.tags || [],
      };
    });

    return res.json({ available: true, accounts });
  } catch (err: any) {
    return res.status(503).json({ available: false, error: err.message, accounts: [] });
  }
});

// 3. Create or Update Customer Account in HydraDB
app.post('/api/customer-memory/accounts', async (req, res) => {
  const { name, company, email, phone, role, industry, dealValue, notes } = req.body;
  if (!company) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  const accountId = 'acc_' + company.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const contactId = 'contact_' + (name || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const timestamp = new Date().toISOString();

  try {
    const hydra = HydraDBEngine.getInstance();
    await hydra.ingestAndAwait({
      content: `New customer account ${company} and contact ${name || ''} created`,
      source: 'ace Frontend',
      authorAgent: 'Commercial Team',
      contextType: 'CustomerAccount',
      entities: [
        {
          id: accountId,
          type: 'Account',
          label: company,
          tier: 'hot',
          properties: {
            domain: email ? email.split('@')[1] : '',
            industry: industry || 'Enterprise',
            dealValue: Number(dealValue || 0),
            status: 'Active',
            notes: notes || '',
            lastContact: 'Just now',
          },
          tags: ['Account', industry || 'Enterprise'],
        },
        {
          id: contactId,
          type: 'Contact',
          label: name || 'Contact',
          tier: 'hot',
          properties: {
            role: role || 'Stakeholder',
            company,
            email: email || '',
            phone: phone || '',
            sentiment: 'New Inquiry',
          },
          tags: ['Contact', 'Stakeholder'],
        },
      ],
      relations: [
        {
          id: `rel_${contactId}_${accountId}`,
          sourceId: contactId,
          targetId: accountId,
          relationship: 'PART_OF_ACCOUNT',
          weight: 1.0,
          validFrom: timestamp,
        },
      ],
    });

    return res.json({
      success: true,
      accountId,
      contactId,
      message: 'Committed to HydraDB OSS',
    });
  } catch (err: any) {
    return res.status(503).json({ error: 'Failed to persist customer in HydraDB', details: err.message });
  }
});

// 4. Customer Interactions / Conversations Endpoint
app.get('/api/customer-memory/interactions', async (_req, res) => {
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = await hydra.fetchAuthoritativeGraphSnapshot();
    const nodes = snapshot.nodes || [];

    const interactions = nodes
      .filter((n) => n.type === 'InteractionEpisode')
      .map((i) => ({
        id: i.id,
        title: i.label,
        description: i.properties?.summary || i.label,
        timestamp: i.properties?.timestamp || i.validFrom || 'Recent',
        consumerName: i.properties?.customerName || i.properties?.participants?.[0] || 'Stakeholder',
        company: i.properties?.company || '',
        channel: i.properties?.channel || 'Conversation',
      }));

    return res.json({ available: true, interactions });
  } catch (err: any) {
    return res.status(503).json({ available: false, error: err.message, interactions: [] });
  }
});

// 5. Commercial Deals & Agreements Endpoint
app.get('/api/customer-memory/deals', async (_req, res) => {
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = await hydra.fetchAuthoritativeGraphSnapshot();
    const nodes = snapshot.nodes || [];

    const deals = nodes
      .filter((n) => n.type === 'Deal')
      .map((d) => ({
        id: d.id,
        title: d.properties?.title || d.label,
        company: d.properties?.company || '',
        consumerName: d.properties?.consumerName || 'Stakeholder',
        value: d.properties?.value || d.properties?.targetArr || 0,
        stage: d.properties?.stage || 'Negotiation',
        probability: d.properties?.probability || 80,
        closeDate: d.properties?.closeDate || 'Upcoming',
        nextStep: d.properties?.nextStep || 'Review agreement terms',
      }));

    return res.json({ available: true, deals });
  } catch (err: any) {
    return res.status(503).json({ available: false, error: err.message, deals: [] });
  }
});

// ---------------------------------------------------------------------------
// ace Customer Intelligence Copilot Endpoint with Multi-Turn Conversation History
// ---------------------------------------------------------------------------
app.post('/api/ace/copilot', async (req, res) => {
  const { prompt, conversationHistory } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers for token streaming
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const ai = getGenAI();

  sendEvent({
    type: 'start',
  });

  // Query authoritative HydraDB graph context
  let retrievedContext: any[] = [];
  let isLiveHydraDB = false;
  let hydraError: string | null = null;
  try {
    const hydraEngine = HydraDBEngine.getInstance();
    const liveSnapshot = await hydraEngine.fetchAuthoritativeGraphSnapshot();
    if (liveSnapshot && liveSnapshot.nodes && liveSnapshot.nodes.length > 0) {
      isLiveHydraDB = true;
      const q = prompt.toLowerCase();
      retrievedContext = liveSnapshot.nodes.filter((n) => {
        const label = (n.label || '').toLowerCase();
        const props = JSON.stringify(n.properties || {}).toLowerCase();
        const tags = (n.tags || []).join(' ').toLowerCase();
        return q.includes(label) || props.includes(q) || tags.includes(q) || label.includes(q.slice(0, 5));
      });
      if (retrievedContext.length === 0) {
        retrievedContext = liveSnapshot.nodes.slice(0, 15);
      }
    }
  } catch (liveErr: any) {
    hydraError = liveErr?.message || 'HydraDB OSS connection unavailable';
    console.warn('HydraDB context retrieval notice:', hydraError);
  }

  // Build context block purely from HydraDB retrieved nodes
  const graphContextBlock = retrievedContext.length > 0
    ? `AUTHORITATIVE CUSTOMER GRAPH CONTEXT FROM HYDRADB:\n${JSON.stringify(retrievedContext, null, 2)}`
    : isLiveHydraDB
    ? 'HYDRADB STATUS: Connected, but no matching customer entities were found for this query.'
    : `HYDRADB STATUS: Database unavailable (${hydraError}). No customer memory retrieved.`;

  const systemInstruction = `You are ace, an intelligent Customer Intelligence Agent and persistent business memory.
Your purpose is to reason over persistent, connected customer knowledge stored in HydraDB across emails, conversations, meetings, and relationship histories.

Tone & Behavior Guidelines:
1. You are engaging, intelligent, conversational, direct, and helpful. You hold genuine, natural multi-turn conversations with the user.
2. Ground all customer answers exclusively in the retrieved customer graph context below. Never invent or hallucinate customer entities, deals, or facts.
3. If the graph context is empty or HydraDB is unavailable, explain politely that no customer context is available or connected in memory yet.
4. When the user asks general or greeting questions (e.g. "what are you", "who are you", "help me"), answer conversationally like a smart colleague.
5. NEVER output technical database jargon, "OpenCypher syntax", or internal database schemas. Speak naturally from your accumulated customer memory.

${graphContextBlock}
`;

  // Build multi-turn contents array for Gemini
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      if (msg.text && typeof msg.text === 'string') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }
  }

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  if (ai) {
    try {
      const streamResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of streamResponse) {
        const text = chunk.text;
        if (text) {
          sendEvent({ type: 'chunk', text });
        }
      }

      sendEvent({ type: 'done' });
      res.end();
      return;
    } catch (error: any) {
      console.error('Gemini copilot streaming error:', error);
    }
  }

  // Explicit degraded notice if Gemini reasoning service is unavailable (never fabricate customer data)
  const degradedNotice = !ai
    ? `Reasoning service is operating without an active AI key. Connected customer graph is available in HydraDB (${retrievedContext.length} entities loaded).`
    : `AI reasoning service encountered a temporary error. HydraDB customer graph is online.`;

  sendEvent({ type: 'chunk', text: degradedNotice });
  sendEvent({ type: 'done' });
  res.end();
});

// ace Deal Analyzer Endpoint
app.post('/api/ace/analyze-deal', async (req, res) => {
  const { config, pricingAnalysis } = req.body;
  const ai = getGenAI();

  const prompt = `Analyze this commercial engagement for ${config?.accountName || 'Customer Account'}:
Tier: ${config?.planTier}
Seats: ${config?.seatCount}
Term: ${config?.contractTermMonths} months
Discount: ${config?.requestedDiscountPct}%
List ARR: $${pricingAnalysis?.listArr?.toLocaleString()}
Effective ARR: $${pricingAnalysis?.effectiveArr?.toLocaleString()}
Gross Margin: ${pricingAnalysis?.grossMarginPct}%
Win Probability: ${pricingAnalysis?.winProbabilityPct}%

Provide strategic reasoning on customer trade-offs, concession strategy, and talk tracks conversationally.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return res.json({ analysis: response.text });
    } catch (e: any) {
      console.error('Deal analyzer error:', e);
      return res.status(503).json({ error: 'AI reasoning temporarily unavailable' });
    }
  }

  res.json({
    analysis: 'AI reasoning service unavailable. Recommend verifying gross margin floor and trading multi-year term commitments for rate concessions.',
  });
});

// ---------------------------------------------------------------------------
// Deterministic HydraDB Auto-Bootstrap Function
// Ingests initial deterministic customer knowledge into HydraDB OSS if graph is empty.
// ---------------------------------------------------------------------------
async function bootstrapHydraDBIfEmpty() {
  try {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = await hydra.fetchAuthoritativeGraphSnapshot();
    if (snapshot.nodes && snapshot.nodes.length > 0) {
      console.log(`[HydraDB Bootstrap] Graph already contains ${snapshot.nodes.length} nodes and ${snapshot.edges.length} edges. Skipping bootstrap.`);
      return;
    }

    console.log('[HydraDB Bootstrap] Initializing deterministic customer memory into HydraDB OSS...');
    await hydra.ingestAndAwait({
      content: 'Bootstrap authoritative customer knowledge base',
      source: 'ace Bootstrap Protocol',
      authorAgent: 'System Orchestrator',
      contextType: 'CommercialBootstrap',
      entities: [
        // Accounts
        {
          id: 'acc_apex',
          type: 'Account',
          label: 'Apex Global Logistics',
          tier: 'hot',
          properties: {
            domain: 'apexlogistics.com',
            industry: 'Supply Chain & Logistics',
            dealValue: 480000,
            status: 'In Negotiation',
            lastContact: 'Today, 10:30 AM',
            nextAction: 'Send updated 3-year pricing proposal',
            nextActionDate: 'Tomorrow at 9:00 AM',
            assignedRep: 'Alex Morgan',
            notes: 'Decision committee is reviewing multi-year pricing terms. Champion is aligned on technical scope.',
          },
          tags: ['Enterprise', 'SupplyChain', 'ActiveNegotiation'],
        },
        {
          id: 'acc_vanguard',
          type: 'Account',
          label: 'Vanguard Fintech Group',
          tier: 'hot',
          properties: {
            domain: 'vanguardfintech.io',
            industry: 'Financial Services',
            dealValue: 420000,
            status: 'Proposal Sent',
            lastContact: 'Yesterday, 3:15 PM',
            nextAction: 'Deliver multi-region branch consolidation architecture',
            nextActionDate: 'Thursday at 2:00 PM',
            assignedRep: 'Taylor Reed',
            notes: 'Expanding from pilot to 4 European and UK subsidiaries. Demands enterprise SSO and dedicated tenant isolation.',
          },
          tags: ['Enterprise', 'Fintech', 'Expansion'],
        },
        {
          id: 'acc_nexus',
          type: 'Account',
          label: 'Nexus Health Systems',
          tier: 'warm',
          properties: {
            domain: 'nexushealth.org',
            industry: 'Healthcare & Life Sciences',
            dealValue: 290000,
            status: 'In Negotiation',
            lastContact: '2 days ago',
            nextAction: 'Submit SOC 2 Type II and HIPAA BAA compliance pack',
            nextActionDate: 'Friday at 11:00 AM',
            assignedRep: 'Jordan Hayes',
            notes: 'Compliance review gating pilot. Completed security sync with Chief Compliance Officer.',
          },
          tags: ['Enterprise', 'Healthcare', 'ComplianceGated'],
        },
        {
          id: 'acc_hyperion',
          type: 'Account',
          label: 'Hyperion Energy Labs',
          tier: 'warm',
          properties: {
            domain: 'hyperionenergy.io',
            industry: 'Energy & CleanTech',
            dealValue: 195000,
            status: 'Active',
            lastContact: '3 days ago',
            nextAction: 'Review onboarding milestones for 45-day rollout',
            nextActionDate: 'Next Monday at 10:00 AM',
            assignedRep: 'Samira Patel',
            notes: 'Prioritizes deployment timeline guarantees and dedicated onboarding SLA over feature breadth.',
          },
          tags: ['Growth', 'Energy', 'HighVelocity'],
        },
        {
          id: 'acc_summit',
          type: 'Account',
          label: 'Summit Media Networks',
          tier: 'warm',
          properties: {
            domain: 'summitmedia.com',
            industry: 'Media & Entertainment',
            dealValue: 310000,
            status: 'Follow-up Needed',
            lastContact: '4 days ago',
            nextAction: 'Finalize annual advance billing terms',
            nextActionDate: 'Wednesday at 4:00 PM',
            assignedRep: 'Alex Morgan',
            notes: 'Finance approval confirmed. Prefers single annual advance payment in exchange for 3-year rate lock.',
          },
          tags: ['Enterprise', 'Media', 'AnnualBilling'],
        },
        {
          id: 'acc_beacon',
          type: 'Account',
          label: 'Beacon Retail Group',
          tier: 'warm',
          properties: {
            domain: 'beaconretail.com',
            industry: 'Retail & E-commerce',
            dealValue: 145000,
            status: 'Active',
            lastContact: '1 week ago',
            nextAction: 'Demonstrate omnichannel customer memory sync',
            nextActionDate: 'Friday at 3:00 PM',
            assignedRep: 'Taylor Reed',
            notes: 'Evaluating customer context unification across 80 retail storefronts.',
          },
          tags: ['MidMarket', 'Retail', 'Evaluation'],
        },

        // Contacts
        {
          id: 'contact_sarah_chen',
          type: 'Contact',
          label: 'Sarah Chen',
          tier: 'hot',
          properties: {
            role: 'VP of Supply Chain',
            company: 'Apex Global Logistics',
            email: 'sarah.chen@apexlogistics.com',
            phone: '+1 (415) 890-2341',
            sentiment: 'Constructive / Cautious on Deployment',
            champion: true,
          },
          tags: ['Champion', 'SupplyChain', 'Executive'],
        },
        {
          id: 'contact_elena_rostova',
          type: 'Contact',
          label: 'Elena Rostova',
          tier: 'hot',
          properties: {
            role: 'Head of Infrastructure',
            company: 'Vanguard Fintech Group',
            email: 'e.rostova@vanguardfintech.io',
            phone: '+44 20 7946 0912',
            sentiment: 'High Champion / Expansion Advocate',
            champion: true,
          },
          tags: ['Champion', 'Infrastructure', 'Fintech'],
        },
        {
          id: 'contact_marcus_vance',
          type: 'Contact',
          label: 'Marcus Vance',
          tier: 'warm',
          properties: {
            role: 'Chief Compliance Officer',
            company: 'Nexus Health Systems',
            email: 'm.vance@nexushealth.org',
            phone: '+1 (617) 555-0198',
            sentiment: 'Rigorous Compliance Gating',
            economicBuyer: true,
          },
          tags: ['SecurityGate', 'Compliance', 'Healthcare'],
        },
        {
          id: 'contact_julian_sterling',
          type: 'Contact',
          label: 'Julian Sterling',
          tier: 'warm',
          properties: {
            role: 'Operations Director',
            company: 'Hyperion Energy Labs',
            email: 'j.sterling@hyperionenergy.io',
            phone: '+1 (512) 555-0843',
            sentiment: 'Fast Deployment Priority',
            champion: true,
          },
          tags: ['Champion', 'Operations', 'Energy'],
        },
        {
          id: 'contact_david_kim',
          type: 'Contact',
          label: 'David Kim',
          tier: 'warm',
          properties: {
            role: 'VP Finance',
            company: 'Summit Media Networks',
            email: 'd.kim@summitmedia.com',
            phone: '+1 (212) 555-0144',
            sentiment: 'Annual Upfront Advocate',
            budgetOwner: true,
          },
          tags: ['BudgetOwner', 'Finance', 'Media'],
        },
        {
          id: 'contact_rachel_adams',
          type: 'Contact',
          label: 'Rachel Adams',
          tier: 'warm',
          properties: {
            role: 'VP Customer Experience',
            company: 'Beacon Retail Group',
            email: 'rachel.a@beaconretail.com',
            phone: '+1 (312) 555-0182',
            sentiment: 'Evaluating Omnichannel Context',
          },
          tags: ['Evaluator', 'Retail'],
        },

        // Interactions / Conversations
        {
          id: 'conv_apex_01',
          type: 'InteractionEpisode',
          label: 'Architecture & Legacy Freight Integration Review',
          tier: 'hot',
          properties: {
            channel: 'Video Call',
            timestamp: 'Today, 10:30 AM',
            participants: ['Sarah Chen', 'Alex Morgan'],
            customerName: 'Sarah Chen',
            company: 'Apex Global Logistics',
            summary: 'Sarah raised concerns regarding deployment complexity and synchronization latency with legacy AS400 freight tracker. Requested dedicated onboarding engineer and milestone-based sign-off on the 3-year agreement ($340k ARR).',
          },
          tags: ['Conversation', 'TechnicalReview', 'ObjectionIdentified'],
        },
        {
          id: 'conv_vanguard_01',
          type: 'InteractionEpisode',
          label: 'Multi-Region Branch Consolidation Sync',
          tier: 'hot',
          properties: {
            channel: 'Executive Meeting',
            timestamp: 'Yesterday, 3:15 PM',
            participants: ['Elena Rostova', 'Taylor Reed'],
            customerName: 'Elena Rostova',
            company: 'Vanguard Fintech Group',
            summary: 'Elena confirmed growing demand to expand platform usage across 4 regional European and UK banking subsidiaries. Explicitly requires enterprise SSO, granular RBAC, and dedicated tenant isolation.',
          },
          tags: ['Conversation', 'ExpansionSync', 'Requirements'],
        },
        {
          id: 'conv_nexus_01',
          type: 'InteractionEpisode',
          label: 'Security & Healthcare Compliance Audit',
          tier: 'warm',
          properties: {
            channel: 'Video Call',
            timestamp: '2 days ago',
            participants: ['Marcus Vance', 'Jordan Hayes'],
            customerName: 'Marcus Vance',
            company: 'Nexus Health Systems',
            summary: 'Marcus completed compliance review. Confirmed that SOC 2 Type II audit report, HIPAA BAA, and EU-US Data Privacy Framework addendum are mandatory before pilot rollout.',
          },
          tags: ['Conversation', 'SecurityAudit', 'ComplianceRequirement'],
        },
        {
          id: 'conv_hyperion_01',
          type: 'InteractionEpisode',
          label: 'Implementation Timeline & SLA Review',
          tier: 'warm',
          properties: {
            channel: 'Email Exchange',
            timestamp: '3 days ago',
            participants: ['Julian Sterling', 'Samira Patel'],
            customerName: 'Julian Sterling',
            company: 'Hyperion Energy Labs',
            summary: 'Julian emphasized that implementation speed within 45 days and dedicated onboarding support matter more to them than additional software features.',
          },
          tags: ['Conversation', 'TimelineSLA', 'PrioritySignal'],
        },
        {
          id: 'conv_summit_01',
          type: 'InteractionEpisode',
          label: 'Commercial Terms & Payment Sync',
          tier: 'warm',
          properties: {
            channel: 'Stakeholder Sync',
            timestamp: '4 days ago',
            participants: ['David Kim', 'Alex Morgan'],
            customerName: 'David Kim',
            company: 'Summit Media Networks',
            summary: 'David confirmed finance approval. Stated strong customer willingness to commit to annual advance invoicing in exchange for a 3-year rate lock.',
          },
          tags: ['Conversation', 'PaymentTerms', 'PreferenceSignal'],
        },

        // Patterns & Requirements
        {
          id: 'signal_speed_priority',
          type: 'BuyingSignal',
          label: 'Market Pattern: Implementation Speed Outweighs Features',
          tier: 'hot',
          properties: {
            confidence: 0.94,
            stat: '68% of recent conversations cite implementation speed and dedicated onboarding assistance over extra software features.',
            trendGrowth: '+40% this month',
          },
          tags: ['EmergingPattern', 'MarketIntel'],
        },
        {
          id: 'signal_consolidation_shift',
          type: 'BuyingSignal',
          label: 'Market Pattern: Multi-Region Enterprise Branch Consolidation',
          tier: 'hot',
          properties: {
            confidence: 0.91,
            stat: 'Vanguard Fintech and 2 other accounts are actively shifting from single-team pilots toward enterprise consolidation.',
            shiftMagnitude: '79%',
          },
          tags: ['EmergingPattern', 'Consolidation'],
        },

        // Deals
        {
          id: 'deal_apex_3yr',
          type: 'Deal',
          label: 'Apex Global Enterprise Agreement',
          tier: 'hot',
          properties: {
            title: 'Apex Global Logistics 3-Year Deployment',
            company: 'Apex Global Logistics',
            consumerName: 'Sarah Chen',
            value: 480000,
            stage: 'Negotiation',
            probability: 85,
            closeDate: 'Next Month',
            nextStep: 'Deliver updated 3-year pricing schedule with dedicated onboarding SLA',
          },
          tags: ['EnterpriseDeal', 'Negotiation'],
        },
        {
          id: 'deal_vanguard_global',
          type: 'Deal',
          label: 'Vanguard Multi-Region Consolidation',
          tier: 'hot',
          properties: {
            title: 'Vanguard Multi-Region Consolidation',
            company: 'Vanguard Fintech Group',
            consumerName: 'Elena Rostova',
            value: 420000,
            stage: 'Proposal',
            probability: 75,
            closeDate: 'Q4 2026',
            nextStep: 'Review regional branch tenant isolation specs',
          },
          tags: ['EnterpriseDeal', 'Expansion'],
        },
        {
          id: 'deal_nexus_health',
          type: 'Deal',
          label: 'Nexus Clinical Security Deployment',
          tier: 'warm',
          properties: {
            title: 'Nexus Clinical Security Deployment',
            company: 'Nexus Health Systems',
            consumerName: 'Marcus Vance',
            value: 290000,
            stage: 'Solutioning',
            probability: 60,
            closeDate: 'Q4 2026',
            nextStep: 'Provide SOC 2 Type II audit documentation',
          },
          tags: ['EnterpriseDeal', 'ComplianceGated'],
        },
      ],
      relations: [
        // Contact to Account
        { id: 'rel_c_apex', sourceId: 'contact_sarah_chen', targetId: 'acc_apex', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_c_vanguard', sourceId: 'contact_elena_rostova', targetId: 'acc_vanguard', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_c_nexus', sourceId: 'contact_marcus_vance', targetId: 'acc_nexus', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_c_hyperion', sourceId: 'contact_julian_sterling', targetId: 'acc_hyperion', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_c_summit', sourceId: 'contact_david_kim', targetId: 'acc_summit', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_c_beacon', sourceId: 'contact_rachel_adams', targetId: 'acc_beacon', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },

        // Interactions to Accounts
        { id: 'rel_i_apex', sourceId: 'conv_apex_01', targetId: 'acc_apex', relationship: 'TRIGGERED_BY', weight: 1.0 },
        { id: 'rel_i_vanguard', sourceId: 'conv_vanguard_01', targetId: 'acc_vanguard', relationship: 'TRIGGERED_BY', weight: 1.0 },
        { id: 'rel_i_nexus', sourceId: 'conv_nexus_01', targetId: 'acc_nexus', relationship: 'TRIGGERED_BY', weight: 1.0 },
        { id: 'rel_i_hyperion', sourceId: 'conv_hyperion_01', targetId: 'acc_hyperion', relationship: 'TRIGGERED_BY', weight: 1.0 },
        { id: 'rel_i_summit', sourceId: 'conv_summit_01', targetId: 'acc_summit', relationship: 'TRIGGERED_BY', weight: 1.0 },

        // Deals to Accounts
        { id: 'rel_d_apex', sourceId: 'deal_apex_3yr', targetId: 'acc_apex', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_d_vanguard', sourceId: 'deal_vanguard_global', targetId: 'acc_vanguard', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
        { id: 'rel_d_nexus', sourceId: 'deal_nexus_health', targetId: 'acc_nexus', relationship: 'PART_OF_ACCOUNT', weight: 1.0 },
      ],
    });

    console.log('[HydraDB Bootstrap] Deterministic customer memory successfully initialized.');
  } catch (err: any) {
    console.warn('[HydraDB Bootstrap Notice] Could not seed HydraDB at startup (HydraDB may be booting):', err.message);
  }
}

// ---------------------------------------------------------------------------
// Frontend Vite Integration & Static File Serving
// ---------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ace Server] Listening on http://0.0.0.0:${PORT}`);
    // Attempt non-blocking bootstrap after launch
    setTimeout(() => {
      bootstrapHydraDBIfEmpty();
    }, 1500);
  });
}

startServer();
