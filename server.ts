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

  // Query authoritative HydraDB graph context or memory projection
  let memoryContext: any[] = [];
  let hydraAvailable = false;
  try {
    const hydraEngine = HydraDBEngine.getInstance();
    // 1. Try querying live graph relations directly via OpenCypher from HydraDB OSS
    try {
      const liveSnapshot = await hydraEngine.fetchAuthoritativeGraphSnapshot();
      if (liveSnapshot && liveSnapshot.nodes && liveSnapshot.nodes.length > 0) {
        hydraAvailable = true;
        const q = prompt.toLowerCase();
        memoryContext = liveSnapshot.nodes.filter(n => {
          const label = (n.label || '').toLowerCase();
          const props = JSON.stringify(n.properties || {}).toLowerCase();
          const tags = (n.tags || []).join(' ').toLowerCase();
          return q.includes(label) || props.includes(q) || tags.includes(q) || label.includes(q.slice(0, 5));
        });
        if (memoryContext.length === 0) {
          memoryContext = liveSnapshot.nodes.slice(0, 10);
        }
      }
    } catch {
      // If live network query encounters transient latency, read from the synchronized memory cache projection
      const snapshot = hydraEngine.getGraphSnapshot();
      if (snapshot && snapshot.nodes && snapshot.nodes.length > 0) {
        const q = prompt.toLowerCase();
        memoryContext = snapshot.nodes.filter(n => {
          const label = (n.label || '').toLowerCase();
          const props = JSON.stringify(n.properties || {}).toLowerCase();
          const tags = (n.tags || []).join(' ').toLowerCase();
          return q.includes(label) || props.includes(q) || tags.includes(q) || label.includes(q.slice(0, 5));
        });
        if (memoryContext.length === 0) {
          memoryContext = snapshot.nodes.slice(0, 8);
        }
      }
    }
  } catch (err: any) {
    console.warn('HydraDB context retrieval notice:', err?.message);
  }

  // Built-in customer intelligence business context
  const customerKnowledgeBase = `
ACCUMULATED CUSTOMER INTELLIGENCE & BUSINESS MEMORY:
1. Apex Global Logistics (Contact: Sarah Chen, VP of Supply Chain)
   - Recent Conversations: Raised concerns about deployment complexity and technical integration into legacy freight software.
   - Requirement: Demands dedicated onboarding engineer and milestone-based sign-off.
   - Commercial Context: 3-year enterprise agreement under review ($340,000 ARR). Prefers annual advance billing.

2. Vanguard Fintech Group (Contact: Elena Rostova, Head of Infrastructure)
   - Recent Conversations: High interest in expanding platform usage across 4 regional European and UK banking subsidiaries.
   - Requirement: Enterprise single sign-on (SSO), granular RBAC, and dedicated tenant isolation.
   - Commercial Context: $420,000 multi-region agreement in proposal stage.

3. Nexus Health Systems (Contact: Marcus Vance, Chief Compliance Officer)
   - Recent Conversations: Completed compliance sync. Explicitly requires dedicated SOC 2 Type II audit report, HIPAA BAA, and EU-US Data Privacy Framework addendum before pilot rollout.
   - Requirement: Compliance guarantees are non-negotiable.

4. Hyperion Energy Labs (Contact: Julian Sterling, Operations Director)
   - Recent Conversations: Inquired about expedited onboarding timelines. Emphasized that implementation speed matters more than feature depth.
   - Requirement: Go-live within 45 days.

5. Summit Media Networks (Contact: David Kim, VP Finance)
   - Recent Conversations: Financial approval cycle confirmed. Prefers single upfront annual billing rather than quarterly installments in exchange for standard rate locks.

CROSS-CUSTOMER PATTERNS & SYNTHESIS:
- Decision Factor: 68% of recent customer conversations cite implementation speed and dedicated onboarding assistance over extra software features.
- Billing Preference: Strong customer willingness to commit to annual advance invoicing in exchange for multi-year price locks.
- Security Standard: Compliance and SOC 2 documentation is mandatory for all healthcare, financial, and enterprise infrastructure accounts.
${memoryContext.length > 0 ? `\nHYDRADB RETRIEVED GRAPH CONTEXT & ONTOLOGY NODES:\n${JSON.stringify(memoryContext, null, 2)}` : ''}
`;

  const systemInstruction = `You are ace, an intelligent Customer Intelligence Agent and persistent business memory.
Your purpose is to remember and connect what the business learns across all customer conversations, emails, meetings, notes, and relationship histories.

Tone & Behavior Guidelines:
1. You are engaging, intelligent, conversational, direct, and helpful. You hold genuine, natural multi-turn conversations with the user.
2. When the user asks general, casual, or follow-up questions (e.g. "what are you", "huh", "explain that", "what did you mean", "who is Sarah?"), answer conversationally and concisely like a smart colleague.
3. When the user asks about customers, conversations, what changed, or insights, draw directly from your accumulated Customer Intelligence & Business Memory.
4. If asked about a customer not in your knowledge base, explain what you currently know and invite them to add details or ask about existing accounts.
5. NEVER output technical database jargon, "HydraDB", "OSS", "graph substrate errors", or code errors to the user. Speak naturally from your accumulated memory.

${customerKnowledgeBase}
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
        model: 'gemini-3.7-flash',
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

  // Conversational Fallback if Gemini client is unavailable
  const p = prompt.toLowerCase().trim();
  let fallbackReply = '';

  if (p.includes('what are you') || p.includes('who are you')) {
    fallbackReply = `I'm **ace**, your customer intelligence agent and business memory. I continuously remember and connect everything we learn from customer emails, calls, and meetings so you always have immediate context on customer needs, key concerns, and relationship history.`;
  } else if (p.includes('huh') || p.includes('what') || p.includes('mean') || p.includes('explain')) {
    fallbackReply = `I'm tracking recent conversations across our customers. For instance, **Apex Global Logistics** is focused on implementation speed and onboarding support, while **Vanguard Fintech** wants to expand to 4 regional branches. What customer would you like to explore?`;
  } else if (p.includes('sarah') || p.includes('apex')) {
    fallbackReply = `**Sarah Chen (Apex Global Logistics)** has raised concerns regarding deployment complexity in their freight workflow. She is looking for a dedicated onboarding engineer and milestone-based sign-offs on their 3-year agreement ($340k ARR).`;
  } else if (p.includes('vanguard') || p.includes('elena')) {
    fallbackReply = `**Elena Rostova (Vanguard Fintech Group)** wants to roll out across their European and UK regional branches. Their key requirements are enterprise SSO and granular role-based permissions for their $420k agreement.`;
  } else if (p.includes('marcus') || p.includes('nexus') || p.includes('compliance')) {
    fallbackReply = `**Marcus Vance (Nexus Health Systems)** completed a compliance sync. They require SOC 2 Type II reports, HIPAA BAA, and EU-US Data Privacy addendums before moving forward.`;
  } else if (p.includes('insight') || p.includes('pattern') || p.includes('learn') || p.includes('highlight') || p.includes('conversation')) {
    fallbackReply = `Here are the top themes ace has learned from recent customer conversations:

1. **Deployment Speed over Feature Breadth**: 68% of customers (including Apex Global and Hyperion Energy) prioritize fast onboarding guarantees over extra feature sets.
2. **Multi-Region Expansion**: Vanguard Fintech is preparing to consolidate 4 regional branch workflows into our platform.
3. **Annual Upfront Preference**: Summit Media and Apex Global both prefer annual upfront invoicing in exchange for multi-year price locks.

Would you like to review specific customer conversation notes or talk tracks?`;
  } else {
    fallbackReply = `I've synthesized our customer notes and recent conversation history. Let me know which customer, relationship shift, or emerging requirement you'd like to look into!`;
  }

  sendEvent({ type: 'chunk', text: fallbackReply });
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
        model: 'gemini-3.7-flash',
        contents: prompt,
      });
      return res.json({ analysis: response.text });
    } catch (e: any) {
      console.error('Deal analyzer error:', e);
    }
  }

  res.json({
    analysis: `For ${config?.accountName || 'this customer'}, recommend pairing multi-year commitments with annual advance billing. Avoid unilateral discounting to protect customer relationship value.`,
  });
});

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
  });
}

startServer();
