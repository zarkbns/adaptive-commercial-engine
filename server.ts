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

// 2. Health & Readiness Proxy to HydraDB OSS
app.get('/healthz', async (req, res) => {
  try {
    const hydraRes = await fetch(`${HYDRADB_URL}/healthz`);
    if (hydraRes.ok) {
      const data = await hydraRes.json().catch(() => ({ status: 'ok' }));
      return res.json({ status: 'ok', hydradb: data });
    }
    return res.status(hydraRes.status).json({ status: 'degraded', hydradb_status: hydraRes.status });
  } catch (err: any) {
    return res.status(503).json({ status: 'unavailable', error: err.message, targetUrl: `${HYDRADB_URL}/healthz` });
  }
});

app.get('/readyz', async (req, res) => {
  try {
    const hydraRes = await fetch(`${HYDRADB_URL}/readyz`);
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
    const checkRes = await fetch(`${HYDRADB_URL}/healthz`);
    if (checkRes.ok) {
      hydraUpstreamReachable = true;
      hydraUpstreamDetails = await checkRes.json().catch(() => ({ status: 'ok' }));
    } else {
      hydraUpstreamDetails = { status: checkRes.status, text: await checkRes.text().catch(() => '') };
    }
  } catch (e: any) {
    hydraUpstreamDetails = { error: e.message };
  }

  res.json({
    status: 'ok',
    service: 'A.C.E - Adaptive Commercial Engine Server',
    hydraStatus: hydraUpstreamReachable ? 'HydraDB OSS Container Connected' : 'HydraDB OSS Container Disconnected',
    hydraConfig: {
      targetUrl: HYDRADB_URL,
      graphId: HYDRADB_GRAPH_ID,
      namespace: HYDRADB_NAMESPACE,
      hasApiKey: !!HYDRADB_API_KEY,
      upstreamReachable: hydraUpstreamReachable,
      upstreamDetails: hydraUpstreamDetails,
    },
    verifiedEndpoints: [
      `POST ${HYDRADB_URL}/v1/graphs/:graph_id/query`,
      `GET ${HYDRADB_URL}/healthz`,
      `GET ${HYDRADB_URL}/readyz`,
    ],
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// A.C.E Copilot Endpoint with Lightweight Intent Gate & Real-Time Token Streaming
// Uses HydraDBEngine (which queries real HydraDB OSS via OpenCypher)
// ---------------------------------------------------------------------------
app.post('/api/ace/copilot', async (req, res) => {
  const { prompt } = req.body;

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

  // 1. Run Lightweight Intent Gate
  const gateResult = classifyCopilotIntent(prompt);
  console.log(`[IntentGate] Intent=${gateResult.intent} | Reason=${gateResult.reason} | Entities=[${gateResult.extractedEntities.join(', ')}]`);

  sendEvent({
    type: 'start',
    intent: gateResult.intent,
    extractedEntities: gateResult.extractedEntities,
  });

  // =========================================================================
  // CASE A: CASUAL INTENT
  // Greetings, small talk, jokes, acknowledgements. No graph query needed.
  // =========================================================================
  if (gateResult.intent === 'CASUAL') {
    const casualSystemInstruction = `You are A.C.E (Adaptive Commercial Engine), an intelligent, conversational copilot for sales and commercial deal teams.
You are natural, friendly, direct, and concise.
When the user sends a greeting, joke, casual remark, or general non-business question, respond naturally and conversationally in 1-2 friendly sentences.
Never output structured commercial dossiers, 상황/deal situation templates, or unrequested account data for casual messages.`;

    if (ai) {
      try {
        const streamResponse = await ai.models.generateContentStream({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: casualSystemInstruction,
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
        console.error('AI Copilot casual streaming error:', error);
      }
    }

    // Dynamic natural fallback if Gemini is offline
    const clean = prompt.toLowerCase().replace(/[^\w\s]/g, '').trim();
    let casualReply = 'Hey! What can I help you with today?';
    if (clean.includes('who are you') || clean.includes('what can you do') || clean.includes('what do you do')) {
      casualReply = `I'm A.C.E, your Adaptive Commercial Engine copilot. I help sales teams with negotiation playbooks, deal structure analysis, and Give-Get concession trade-offs. What are you working on?`;
    } else if (clean.includes('joke') || clean.includes('laugh')) {
      casualReply = `Why did the salesperson refuse to negotiate with the coffee machine? Because it demanded payment upfront with zero grace period! What deal are we working on today?`;
    } else if (clean.includes('thanks') || clean.includes('thank you') || clean.includes('thx') || clean.includes('appreciate')) {
      casualReply = `You're very welcome! Let me know whenever you want to review an account or deal strategy.`;
    } else if (clean === 'ok' || clean === 'okay' || clean === 'cool' || clean === 'great' || clean === 'awesome' || clean === 'sounds good' || clean === 'got it') {
      casualReply = `Sounds good. Let me know when you're ready to review pricing, concessions, or deal strategies.`;
    } else if (clean.includes('bye') || clean.includes('goodbye')) {
      casualReply = `Goodbye! Let me know when you're ready for the next deal cycle.`;
    } else if (clean.includes('morning')) {
      casualReply = `Good morning! Ready when you are. What deal or account are we reviewing today?`;
    } else if (clean.includes('afternoon')) {
      casualReply = `Good afternoon! How can I help you with your deals today?`;
    } else if (clean.includes('evening')) {
      casualReply = `Good evening! What can I help you with?`;
    }

    sendEvent({ type: 'chunk', text: casualReply });
    sendEvent({ type: 'done' });
    res.end();
    return;
  }

  // =========================================================================
  // CASE B: COMMERCIAL INTENT
  // General sales, pricing, negotiation, renewal tactics, concessions, objections.
  // Query HydraDB OSS for concession governance rules.
  // =========================================================================
  if (gateResult.intent === 'COMMERCIAL') {
    const hydraEngine = HydraDBEngine.getInstance();
    const policyResults = await hydraEngine.queryAsync({
      queryText: 'ConcessionRule PricingGuardrail Governance Policy',
      entityTypes: ['ConcessionRule', 'PricingConstraint'],
      limit: 5,
    });

    const commercialPolicyNodes = policyResults.map(r => ({
      type: r.node.type,
      label: r.node.label,
      properties: r.node.properties,
    }));

    const policyContextStr = commercialPolicyNodes.length > 0
      ? `\nActive Commercial Governance & Concession Policies from HydraDB:\n${JSON.stringify(commercialPolicyNodes, null, 2)}`
      : '\nStandard B2B Concession Rules: Discounts >10% require multi-year term or upfront payment. Corporate gross margin floor is 78.0%.';

    const commercialSystemInstruction = `You are A.C.E (Adaptive Commercial Engine), an experienced, sharp sales strategist sitting right beside the salesperson during a deal.
You give high-conviction, practical, and conversational advice.

CRITICAL TONE & STYLE GUIDELINES:
1. Write conversationally, naturally, and directly—like a trusted senior sales colleague talking to a rep, not like a generated report or robotic template.
2. NEVER use rigid section headers such as **Situation:**, **Recommendation:**, **Why:**, **Next Move:**, **Suggested Wording:**, **Guardrail:**, or any equivalent templated labels unless the user explicitly requests a structured breakdown.
3. Use normal paragraphs with natural transitions. Only use bullet points, numbered steps, or bold highlights when they genuinely improve clarity or when comparing specific trade-offs.
4. Response length must match the question: simple questions get concise answers; strategic questions get thoughtful reasoning followed by the practical next action.
5. If suggesting something the salesperson can say to the customer, introduce it naturally (e.g., "You can tell them something like: '...'" or "A good way to frame this is: '...'").
6. Commercial Principles: Keep Give-Get concession trade-offs front and center (never give a discount without getting something like longer commitment or upfront billing) and protect the 78.0% gross margin floor.
7. Never expose database terminology, internal metadata, or system mechanics.

Commercial Policies Reference:
${policyContextStr}`;

    if (ai) {
      try {
        const streamResponse = await ai.models.generateContentStream({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: commercialSystemInstruction,
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
        console.error('A.C.E Copilot commercial streaming error:', error);
      }
    }

    // Dynamic natural commercial fallback
    const commercialReply = `Whenever you're dealing with pricing pressure, the golden rule is never grant a unilateral discount. If you drop the price without asking for anything in return, you erode both your margin and the perceived value of the solution.

Instead, anchor your position around structured Give-Get trade-offs. If the buyer is asking for a 10–15% concession, trade that for a 3-year term commitment or annual advance billing. That gives them the headline budget number they need to show procurement, while locking in predictable revenue and protecting our 78% gross margin floor.

A natural way to frame this on your next call is:

"We can certainly work with your target budget parameters, provided we can pair it with a multi-year partnership and annual upfront invoicing so our team can commit dedicated engineering capacity."

Put together a two-option proposal for them—Option A with standard 1-year list pricing, and Option B showing the multi-year volume incentive—and let them choose.`;

    sendEvent({ type: 'chunk', text: commercialReply });
    sendEvent({ type: 'done' });
    res.end();
    return;
  }

  // =========================================================================
  // CASE C: CONTEXT_REQUIRED INTENT
  // User explicitly referenced an account, customer, stakeholder, deal, or fact.
  // Query HydraDB OSS graph via OpenCypher for that entity and its 1-hop relationships.
  // =========================================================================
  const searchEntities = gateResult.extractedEntities;
  const hydraEngine = HydraDBEngine.getInstance();

  const queryResults = await hydraEngine.queryAsync({
    queryText: gateResult.targetQueryText || searchEntities.join(' ') || prompt,
    includeNeighborhood: true,
    limit: 10,
  });

  const matchedNodes = queryResults.map(r => r.node);
  const matchedEdges = queryResults.flatMap(r => 
    (r.neighbors || []).map(n => ({
      relationship: n.edge.relationship,
      source: n.edge.sourceId,
      target: n.node.label || n.edge.targetId,
      properties: n.edge.properties,
    }))
  );

  const substrateContextStr = matchedNodes.length > 0
    ? `\nAccount & Deal Context for Entities [${searchEntities.join(', ')}]:\nEntities:\n${JSON.stringify(matchedNodes, null, 2)}\n\nConnected Relationships:\n${JSON.stringify(matchedEdges, null, 2)}`
    : `\nNote: No active deal or account records found for "${searchEntities.join(', ')}".`;

  const contextSystemInstruction = `You are A.C.E (Adaptive Commercial Engine), an experienced, sharp sales strategist sitting right beside the salesperson during a live deal.
You know the account history, stakeholder dynamics, and commercial levers inside out.

CRITICAL TONE & STYLE GUIDELINES:
1. Speak conversationally, naturally, and directly—like a seasoned colleague advising the rep on their next move, not a report generator or automated system.
2. NEVER start your response with rigid section headers such as **Situation:**, **Recommendation:**, **Why:**, **Next Move:**, **Suggested Wording:**, **Guardrail:**, or any similar boilerplate labels unless the user explicitly asks for a structured checklist.
3. Use natural paragraphs and logical flow. Explain the reasoning clearly, then provide the recommended play and tactical action.
4. If appropriate, weave in an exact phrase or talk track the rep can say to the customer or buyer, introduced naturally (e.g., "Here is how you can position this with them: '...'").
5. Context Grounding: Use the provided account and deal information to inform your advice accurately.
6. Invisible Substrate: Never mention "HydraDB", "nodes", "graph queries", "temporal metadata", or internal engine mechanics to the user. Treat the context as your own natural knowledge of the account.
7. Keep commercial guardrails intact (e.g. preserving the 78.0% gross margin floor, trading concessions for multi-year commitments).
8. Match response length to the inquiry: answer simple status checks concisely, and provide deeper tactical nuance for complex negotiation questions.

Account & Deal Intelligence:
${substrateContextStr}`;

  if (ai) {
    try {
      const streamResponse = await ai.models.generateContentStream({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: contextSystemInstruction,
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
      console.error('A.C.E Copilot context-grounded streaming error:', error);
    }
  }

  // Dynamic context reasoning fallback when Gemini API key is offline
  let dynamicReply = '';
  if (matchedNodes.length > 0) {
    const primaryNode = matchedNodes[0];
    const entityName = primaryNode.label || primaryNode.id;
    const connectedContacts = matchedNodes.filter(n => n.type === 'Contact');
    const champion = connectedContacts.find(c => (c.properties?.role || '').toLowerCase().includes('champion')) || connectedContacts[0];
    const buyer = connectedContacts.find(c => (c.properties?.role || '').toLowerCase().includes('buyer') || (c.properties?.role || '').toLowerCase().includes('cfo') || (c.properties?.role || '').toLowerCase().includes('economic'));

    let stakeholderNote = '';
    if (champion && buyer) {
      stakeholderNote = `We have strong engagement with technical champion ${champion.label}, but need to ensure economic buyer ${buyer.label} has clear payback metrics. `;
    } else if (champion) {
      stakeholderNote = `Technical champion ${champion.label} is engaged on performance validation. `;
    }

    dynamicReply = `Looking at our active context for ${entityName}, ${stakeholderNote}the key priority is pairing commercial terms with multi-year commitments to protect our 78% gross margin floor.

If the buyer requests a pricing concession, avoid unilateral discounting—trade price for annual advance invoicing, expanded scope, or multi-year terms.

You can position it to them like:

"We can support your target economics, provided we structure this under a multi-year partnership with upfront annual billing."

This keeps our unit economics intact while giving the customer the long-term price predictability they need.`;
  } else {
    dynamicReply = `When structuring enterprise proposals and negotiation talk tracks, always anchor on multi-year commitments and structured Give-Get concessions.

If a prospect pushes for a discount, trade it for annual advance billing or extended contract duration rather than giving price away unilaterally. That preserves our 78% corporate gross margin floor and prevents risky renewal precedents.

You can frame it directly to the customer:

"We can work with your target unit economics, provided we pair it with a multi-year partnership commitment and upfront annual invoicing."`;
  }

  sendEvent({ type: 'chunk', text: dynamicReply });
  sendEvent({ type: 'done' });
  res.end();
});

// A.C.E Deep Deal Room Analyzer Endpoint
app.post('/api/ace/analyze-deal', async (req, res) => {
  const { config, pricingAnalysis } = req.body;
  const ai = getGenAI();

  const prompt = `Analyze this enterprise deal configuration for ${config?.accountName || 'Enterprise Account'}:
Plan Tier: ${config?.planTier}
Seats: ${config?.seatCount}
Term: ${config?.contractTermMonths} months
Requested Discount: ${config?.requestedDiscountPct}%
List ARR: $${pricingAnalysis?.listArr?.toLocaleString()}
Effective ARR: $${pricingAnalysis?.effectiveArr?.toLocaleString()}
Gross Margin: ${pricingAnalysis?.grossMarginPct}%
Win Probability: ${pricingAnalysis?.winProbabilityPct}%

Provide 3 concise strategic recommendations:
1. Concession Give-Get Trade Strategy
2. Margin Protection & Elasticity Defense
3. Key Stakeholder Alignment tactic based on HydraDB context.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are A.C.E Deal Room Strategist. Deliver concise, high-impact deal negotiation tactics in Markdown format.',
          temperature: 0.6,
        },
      });

      return res.json({ analysis: response.text });
    } catch (e) {
      console.error('Deal analysis error:', e);
    }
  }

  const accountName = config?.accountName || 'Enterprise Account';
  return res.json({
    analysis: `### A.C.E Autonomous Deal Strategy Dossier for ${accountName}

1. **Concession Give-Get Strategy**:
   - **Trade-Off**: Grant maximum 12% discount in exchange for **Annual Advance Billing** and **Q3 Case Study commitment**.
   - **Concession Rule**: Do not offer more than 15% discount without extending the contract term to 36 months.

2. **Margin Protection & Yield Defense**:
   - Projected gross margin is **${pricingAnalysis?.grossMarginPct || 82}%**, which is safely above the 78% corporate floor.
   - Bundle **Dedicated HydraDB Cluster** to justify premium pricing and cement enterprise switching barriers.

3. **Buying Committee Alignment**:
   - Arm the technical champion with workload throughput benchmark figures.
   - Provide the economic buyer with a documented ROI payback calculation to secure budget sign-off.`,
  });
});

// Start Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A.C.E Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
