import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { classifyCopilotIntent } from './src/services/ace/intentGate';

dotenv.config();

const app = express();
const PORT = 3000;
const HYDRADB_URL = process.env.HYDRADB_URL || 'http://localhost:8000';
const HYDRADB_API_KEY = process.env.HYDRADB_API_KEY || '';
const HYDRADB_DATABASE = 'ace';

function getHydraHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'API-Version': '2',
    ...(HYDRADB_API_KEY ? { 'Authorization': `Bearer ${HYDRADB_API_KEY}` } : {}),
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
// Authoritative HydraDB v2 Substrate & Ingestion Engine (Server-Side)
// ---------------------------------------------------------------------------

interface ServerHydraJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  content: string;
  source?: string;
  contextType?: string;
  extractedEntitiesCount: number;
  extractedRelationsCount: number;
  resultNodeIds: string[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface ServerHydraNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  validFrom: string;
  validTo?: string | null;
  tier: 'hot' | 'warm' | 'cold';
  accessCount: number;
  lastAccessed: string;
  commitHash: string;
  version: number;
  tags: string[];
}

interface ServerHydraEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number;
  properties: Record<string, any>;
  validFrom: string;
  validTo?: string | null;
  commitHash: string;
}

// Initial Authoritative Commercial Substrate Entities
const hydraNodesStore = new Map<string, ServerHydraNode>();
const hydraEdgesStore = new Map<string, ServerHydraEdge>();
const hydraJobsStore = new Map<string, ServerHydraJob>();

function seedHydraSubstrate() {
  const now = new Date().toISOString();
  const initialNodes: ServerHydraNode[] = [
    {
      id: 'acc_apex_logistics',
      type: 'Account',
      label: 'Apex Logistics Global',
      properties: {
        industry: 'Supply Chain & Freight Tech',
        annualRevenue: '$2.8B',
        employeeCount: 14500,
        techStack: ['Snowflake', 'Kafka', 'Kubernetes'],
        dealStage: 'Negotiation / Concession Phase',
        targetArr: 480000,
        dealHealthScore: 92,
      },
      tier: 'hot',
      accessCount: 342,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['Tier1', 'Enterprise', 'HighVelocity'],
    },
    {
      id: 'contact_sarah_chen',
      type: 'Contact',
      label: 'Sarah Chen',
      properties: {
        role: 'VP Engineering & Technical Champion',
        department: 'Infrastructure Architecture',
        influenceScore: 0.94,
        sentiment: 'Strongly Positive',
        painPoints: ['Sub-second vector lookup across 100M events', 'State loss in distributed agent workflows'],
      },
      tier: 'hot',
      accessCount: 188,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['Champion', 'Engineering'],
    },
    {
      id: 'contact_marcus_vance',
      type: 'Contact',
      label: 'Marcus Vance',
      properties: {
        role: 'Chief Commercial Officer & Economic Buyer',
        department: 'Executive Leadership',
        influenceScore: 0.98,
        sentiment: 'ROI Driven / Cautious on Upfronts',
        budgetSignedOff: false,
        discountExpectationPct: 15,
      },
      tier: 'hot',
      accessCount: 215,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['EconomicBuyer', 'Executive'],
    },
    {
      id: 'deal_apex_enterprise_license',
      type: 'Deal',
      label: 'Apex Logistics - Global Commercial Engine Deployment',
      properties: {
        targetArr: 480000,
        termMonths: 24,
        seats: 250,
        listArr: 520000,
        discountRequestedPct: 15,
        targetGrossMarginPct: 83.4,
      },
      tier: 'hot',
      accessCount: 450,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['ActiveDeal', 'HighARR'],
    },
    {
      id: 'signal_expansion_hiring',
      type: 'BuyingSignal',
      label: 'Apex posted 18 Senior AI Platform Engineer roles in Q2',
      properties: {
        source: 'Job Board & LinkedIn Intelligence',
        confidence: 0.96,
        detectedAt: now,
      },
      tier: 'warm',
      accessCount: 45,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['ExpansionSignal', 'Hiring'],
    },
    {
      id: 'rule_concession_matrix_apex',
      type: 'ConcessionRule',
      label: 'A.C.E Enterprise Concession Matrix: Discount > 10% requires Multi-Year or Prepay',
      properties: {
        maxUnilateralDiscountPct: 10,
        mandatoryGiveGetConditions: [
          '3-Year Annual Advance Billing',
          'Co-Marketing Case Study Release within 90 days',
          'Standard Support SLA (no custom dedicated SRE without margin surcharge)',
        ],
        minimumGrossMarginFloorPct: 78.0,
      },
      tier: 'hot',
      accessCount: 310,
      lastAccessed: now,
      commitHash: 'hydra_init_01',
      version: 1,
      validFrom: now,
      tags: ['Policy', 'Governance', 'PricingGuardrail'],
    },
  ];

  initialNodes.forEach((n) => hydraNodesStore.set(n.id, n));

  const initialEdges: ServerHydraEdge[] = [
    {
      id: 'edge_chen_champions_deal',
      sourceId: 'contact_sarah_chen',
      targetId: 'deal_apex_enterprise_license',
      relationship: 'CHAMPIONS',
      weight: 0.94,
      properties: { championStrength: 'High', verifiedMeetings: 6 },
      validFrom: now,
      commitHash: 'hydra_init_01',
    },
    {
      id: 'edge_marcus_decides_pricing',
      sourceId: 'contact_marcus_vance',
      targetId: 'deal_apex_enterprise_license',
      relationship: 'DECIDES_PRICING',
      weight: 0.98,
      properties: { decisionAuthority: 'Final Sign-off' },
      validFrom: now,
      commitHash: 'hydra_init_01',
    },
    {
      id: 'edge_deal_tied_to_account',
      sourceId: 'deal_apex_enterprise_license',
      targetId: 'acc_apex_logistics',
      relationship: 'PART_OF_ACCOUNT',
      weight: 1.0,
      properties: {},
      validFrom: now,
      commitHash: 'hydra_init_01',
    },
    {
      id: 'edge_concession_enforced_on_deal',
      sourceId: 'rule_concession_matrix_apex',
      targetId: 'deal_apex_enterprise_license',
      relationship: 'CONCESSION_TIED_TO',
      weight: 0.99,
      properties: { strictEnforcement: true },
      validFrom: now,
      commitHash: 'hydra_init_01',
    },
    {
      id: 'edge_signal_targets_account',
      sourceId: 'signal_expansion_hiring',
      targetId: 'acc_apex_logistics',
      relationship: 'TRIGGERED_BY',
      weight: 0.92,
      properties: {},
      validFrom: now,
      commitHash: 'hydra_init_01',
    },
  ];

  initialEdges.forEach((e) => hydraEdgesStore.set(e.id, e));
}

seedHydraSubstrate();

// Helper: Ingestion processing simulation that extracts entities and relations
function processIngestionJob(jobId: string) {
  const job = hydraJobsStore.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.progress = 25;

  setTimeout(() => {
    job.progress = 65;
    const now = new Date().toISOString();

    // Extract or register new node from the ingested text
    const newNodeId = 'node_' + Math.random().toString(36).substring(2, 10);
    const summary = job.content.length > 80 ? job.content.substring(0, 80) + '...' : job.content;

    const extractedNode: ServerHydraNode = {
      id: newNodeId,
      type: job.contextType || 'InteractionEpisode',
      label: summary,
      properties: {
        rawContent: job.content,
        source: job.source || 'Direct Ingest',
        ingestedAt: now,
      },
      tier: 'hot',
      accessCount: 1,
      lastAccessed: now,
      commitHash: 'commit_' + jobId.substring(0, 8),
      version: 1,
      validFrom: now,
      tags: ['IngestedContext', job.contextType || 'General'],
    };

    hydraNodesStore.set(newNodeId, extractedNode);
    job.resultNodeIds.push(newNodeId);
    job.extractedEntitiesCount++;

    // Link to Apex Logistics or primary deal if mentioned
    if (job.content.toLowerCase().includes('apex') || job.content.toLowerCase().includes('logistics')) {
      const edgeId = 'edge_' + Math.random().toString(36).substring(2, 10);
      const edge: ServerHydraEdge = {
        id: edgeId,
        sourceId: newNodeId,
        targetId: 'acc_apex_logistics',
        relationship: 'PART_OF_ACCOUNT',
        weight: 0.9,
        properties: { automatedExtraction: true },
        validFrom: now,
        commitHash: 'commit_' + jobId.substring(0, 8),
      };
      hydraEdgesStore.set(edgeId, edge);
      job.extractedRelationsCount++;
    }

    job.progress = 100;
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
  }, 400);
}

// ---------------------------------------------------------------------------
// Official HydraDB v2 API Endpoints
// Flow: /databases/status -> /context/ingest -> /context/status/:jobId -> /query -> /context/relations
// ---------------------------------------------------------------------------

// 0. GET /databases/status (and /api/hydra/databases/status)
const handleDatabasesStatus = async (req: express.Request, res: express.Response) => {
  const database = (req.query.database as string) || HYDRADB_DATABASE;

  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const upstreamRes = await fetch(`${process.env.HYDRADB_URL}/databases/status?database=${encodeURIComponent(database)}`, {
        headers: getHydraHeaders(),
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn('HydraDB upstream databases/status check fallback to native engine:', e);
    }
  }

  // Native substrate response confirming ready_for_ingestion
  return res.json({
    database,
    status: 'online',
    data: {
      infra: {
        ready_for_ingestion: true,
        cluster_health: 'healthy',
        storage_tier: 'in-memory-accelerated',
        active_shards: 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/databases/status', handleDatabasesStatus);
app.get('/api/hydra/databases/status', handleDatabasesStatus);

// 1. POST /context/ingest (and /api/hydra/context/ingest)
const handleContextIngest = async (req: express.Request, res: express.Response) => {
  const body = req.body || {};
  const { content, source, contextType, metadata, entities, relations, authorAgent, file } = body;

  if (!content && !file && (!entities || entities.length === 0)) {
    return res.status(400).json({ error: 'Context content or entities are required for ingestion' });
  }

  // Pre-ingest check: verify /databases/status?database=ace for data.infra.ready_for_ingestion
  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const statusCheckRes = await fetch(`${process.env.HYDRADB_URL}/databases/status?database=ace`, {
        headers: getHydraHeaders(),
      });
      if (statusCheckRes.ok) {
        const statusData = await statusCheckRes.json();
        if (statusData?.data?.infra && statusData.data.infra.ready_for_ingestion === false) {
          return res.status(503).json({ error: 'HydraDB cluster database=ace is not ready for ingestion' });
        }
      }
    } catch (e) {
      console.warn('HydraDB pre-ingest /databases/status check warning:', e);
    }

    // Forward to remote HydraDB instance using multipart/form-data with database form field
    try {
      const formData = new FormData();
      formData.append('database', 'ace');
      if (content) formData.append('content', content);
      if (source) formData.append('source', source);
      if (contextType) formData.append('contextType', contextType);
      if (authorAgent) formData.append('authorAgent', authorAgent);
      if (metadata) formData.append('metadata', typeof metadata === 'string' ? metadata : JSON.stringify(metadata));
      if (entities) formData.append('entities', typeof entities === 'string' ? entities : JSON.stringify(entities));
      if (relations) formData.append('relations', typeof relations === 'string' ? relations : JSON.stringify(relations));

      const upstreamRes = await fetch(`${process.env.HYDRADB_URL}/context/ingest`, {
        method: 'POST',
        headers: getHydraHeaders(),
        body: formData,
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn('HydraDB upstream multipart forward fallback to native engine:', e);
    }
  }

  const jobId = 'job_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  // If explicit entities/relations were passed, register them immediately
  const resultNodeIds: string[] = [];
  let extractedEntities = 0;
  let extractedRelations = 0;

  if (Array.isArray(entities)) {
    for (const ent of entities) {
      if (ent.id && ent.label) {
        const fullNode: ServerHydraNode = {
          id: ent.id,
          type: ent.type || 'ContextEntity',
          label: ent.label,
          properties: ent.properties || {},
          tier: ent.tier || 'hot',
          accessCount: ent.accessCount || 1,
          lastAccessed: now,
          commitHash: 'hydra_' + jobId.substring(0, 8),
          version: (ent.version || 0) + 1,
          validFrom: ent.validFrom || now,
          tags: ent.tags || ['Ingested'],
        };
        hydraNodesStore.set(fullNode.id, fullNode);
        resultNodeIds.push(fullNode.id);
        extractedEntities++;
      }
    }
  }

  if (Array.isArray(relations)) {
    for (const rel of relations) {
      if (rel.sourceId && rel.targetId) {
        const edgeId = rel.id || 'edge_' + Math.random().toString(36).substring(2, 9);
        const fullEdge: ServerHydraEdge = {
          id: edgeId,
          sourceId: rel.sourceId,
          targetId: rel.targetId,
          relationship: rel.relationship || 'RELATED_TO',
          weight: rel.weight ?? 0.85,
          properties: rel.properties || {},
          validFrom: rel.validFrom || now,
          commitHash: 'hydra_' + jobId.substring(0, 8),
        };
        hydraEdgesStore.set(edgeId, fullEdge);
        extractedRelations++;
      }
    }
  }

  const newJob: ServerHydraJob = {
    jobId,
    status: entities && entities.length > 0 ? 'completed' : 'queued',
    progress: entities && entities.length > 0 ? 100 : 0,
    content: content || 'Batch Entities Ingestion',
    source: source || authorAgent || 'A.C.E Ingest Pipeline',
    contextType: contextType || 'CommercialEvent',
    extractedEntitiesCount: extractedEntities,
    extractedRelationsCount: extractedRelations,
    resultNodeIds,
    createdAt: now,
    completedAt: entities && entities.length > 0 ? now : undefined,
  };

  hydraJobsStore.set(jobId, newJob);

  if (newJob.status !== 'completed') {
    processIngestionJob(jobId);
  }

  return res.json({
    jobId,
    status: newJob.status,
    indexing_status: newJob.status,
    message: 'Context submitted to HydraDB ingestion substrate',
    createdAt: now,
  });
};

app.post('/context/ingest', handleContextIngest);
app.post('/api/hydra/context/ingest', handleContextIngest);

// 2. GET /context/status/:jobId (and /api/hydra/context/status/:jobId)
const handleContextStatus = async (req: express.Request, res: express.Response) => {
  const { jobId } = req.params;

  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const upstreamRes = await fetch(`${process.env.HYDRADB_URL}/context/status/${jobId}`, {
        headers: getHydraHeaders(),
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn('HydraDB upstream status forward fallback:', e);
    }
  }

  const job = hydraJobsStore.get(jobId);
  if (!job) {
    return res.status(404).json({ error: `HydraDB Ingestion Job '${jobId}' not found` });
  }

  return res.json({
    jobId: job.jobId,
    status: job.status,
    indexing_status: job.status,
    progress: job.progress,
    extractedEntitiesCount: job.extractedEntitiesCount,
    extractedRelationsCount: job.extractedRelationsCount,
    resultNodeIds: job.resultNodeIds,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  });
};

app.get('/context/status/:jobId', handleContextStatus);
app.get('/api/hydra/context/status/:jobId', handleContextStatus);

// 3. POST /query (and /api/hydra/query)
const handleHydraQuery = async (req: express.Request, res: express.Response) => {
  const { query, queryText, entityTypes, limit = 15, includeRelations = true, temporalAsOf } = req.body;
  const searchText = (query || queryText || '').toLowerCase();

  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const payload = {
        database: 'ace',
        ...req.body,
      };
      const upstreamRes = await fetch(`${process.env.HYDRADB_URL}/query`, {
        method: 'POST',
        headers: getHydraHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn('HydraDB upstream query forward fallback:', e);
    }
  }

  const results: any[] = [];
  const nodes = Array.from(hydraNodesStore.values());

  for (const node of nodes) {
    if (entityTypes && Array.isArray(entityTypes) && entityTypes.length > 0) {
      if (!entityTypes.includes(node.type)) continue;
    }

    let score = 0.5; // Base relevance
    const nodeText = (node.label + ' ' + JSON.stringify(node.properties) + ' ' + (node.tags || []).join(' ')).toLowerCase();

    if (searchText) {
      const words = searchText.split(/\s+/).filter(Boolean);
      let matches = 0;
      for (const w of words) {
        if (nodeText.includes(w)) matches++;
      }
      if (matches > 0) {
        score = Math.min(0.99, 0.6 + (matches / words.length) * 0.38);
      } else {
        score = 0.3; // low default
      }
    }

    // Boost hot tier
    if (node.tier === 'hot') score = Math.min(1.0, score + 0.05);

    let neighbors: any[] = [];
    if (includeRelations) {
      const relatedEdges = Array.from(hydraEdgesStore.values()).filter(
        (e) => e.sourceId === node.id || e.targetId === node.id
      );
      neighbors = relatedEdges.map((edge) => {
        const targetNodeId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
        const targetNode = hydraNodesStore.get(targetNodeId);
        return {
          edge,
          node: targetNode,
        };
      }).filter((n) => !!n.node);
    }

    results.push({
      node,
      score: Number(score.toFixed(3)),
      semanticScore: Number(score.toFixed(3)),
      graphCentralityScore: Number((neighbors.length * 0.15).toFixed(2)),
      neighbors,
    });
  }

  results.sort((a, b) => b.score - a.score);
  const sliced = results.slice(0, limit);

  return res.json({
    database: 'ace',
    query: searchText,
    totalMatches: sliced.length,
    results: sliced,
    asOf: temporalAsOf || new Date().toISOString(),
  });
};

app.post('/query', handleHydraQuery);
app.post('/api/hydra/query', handleHydraQuery);

// 4. GET /context/relations (and /api/hydra/context/relations)
const handleContextRelations = async (req: express.Request, res: express.Response) => {
  const { entityId, entityType } = req.query;

  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('database', 'ace');
      if (entityId && typeof entityId === 'string') searchParams.set('entityId', entityId);
      if (entityType && typeof entityType === 'string') searchParams.set('entityType', entityType);

      const upstreamRes = await fetch(`${process.env.HYDRADB_URL}/context/relations?${searchParams.toString()}`, {
        headers: getHydraHeaders(),
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn('HydraDB upstream relations forward fallback:', e);
    }
  }

  let nodes = Array.from(hydraNodesStore.values());
  let edges = Array.from(hydraEdgesStore.values());

  if (entityType && typeof entityType === 'string') {
    nodes = nodes.filter((n) => n.type === entityType);
    const validIds = new Set(nodes.map((n) => n.id));
    edges = edges.filter((e) => validIds.has(e.sourceId) || validIds.has(e.targetId));
  }

  if (entityId && typeof entityId === 'string') {
    edges = edges.filter((e) => e.sourceId === entityId || e.targetId === entityId);
    const connectedIds = new Set<string>([entityId]);
    edges.forEach((e) => {
      connectedIds.add(e.sourceId);
      connectedIds.add(e.targetId);
    });
    nodes = nodes.filter((n) => connectedIds.has(n.id));
  }

  return res.json({
    database: 'ace',
    nodes,
    edges,
    totalEntities: nodes.length,
    totalRelations: edges.length,
    asOfTimestamp: new Date().toISOString(),
  });
};

app.get('/context/relations', handleContextRelations);
app.get('/api/hydra/context/relations', handleContextRelations);

// Health endpoint
app.get('/api/health', async (req, res) => {
  let hydraUpstreamReachable = false;
  let hydraUpstreamDetails: any = null;

  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const checkRes = await fetch(`${process.env.HYDRADB_URL}/query`, {
        method: 'POST',
        headers: getHydraHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ database: 'ace', query: 'Target Corp', limit: 3 }),
      });
      if (checkRes.ok) {
        hydraUpstreamReachable = true;
        hydraUpstreamDetails = await checkRes.json();
      }
    } catch (e: any) {
      hydraUpstreamDetails = { error: e.message };
    }
  }

  res.json({
    status: 'ok',
    service: 'A.C.E - Adaptive Commercial Engine Server',
    hydraStatus: 'HydraDB v2 Context Substrate Active',
    hydraConfig: {
      database: 'ace',
      configuredUrl: HYDRADB_URL,
      hasApiKey: !!HYDRADB_API_KEY,
      upstreamReachable: hydraUpstreamReachable,
      upstreamSampleQuery: hydraUpstreamDetails,
    },
    hydraEndpoints: [
      'GET /databases/status?database=ace',
      'POST /context/ingest',
      'GET /context/status/:jobId',
      'POST /query',
      'GET /context/relations?database=ace',
    ],
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// A.C.E Copilot Endpoint with Lightweight Intent Gate & Real-Time Token Streaming
// ---------------------------------------------------------------------------
app.post('/api/ace/copilot', async (req, res) => {
  const { prompt, conversationHistory } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers for true low-latency token streaming
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const ai = getGenAI();

  // 1. Run Lightweight Intent Gate (Keep existing HydraDB retrieval and intent-gating behavior unchanged)
  const gateResult = classifyCopilotIntent(prompt);
  console.log(`[IntentGate] Intent=${gateResult.intent} | Reason=${gateResult.reason} | Entities=[${gateResult.extractedEntities.join(', ')}]`);

  sendEvent({
    type: 'start',
    intent: gateResult.intent,
    extractedEntities: gateResult.extractedEntities,
  });

  // =========================================================================
  // CASE A: CASUAL INTENT
  // Greetings, small talk, jokes, acknowledgements, normal conversation.
  // Rule: Must NOT query HydraDB and must NOT inject any account/deal context.
  // Must generate natural conversational response via Gemini.
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
  // Rule: Query HydraDB ONLY for general commercial governance / concession rules.
  // Do NOT query or inject specific customer accounts (like Apex or Target).
  // =========================================================================
  if (gateResult.intent === 'COMMERCIAL') {
    const commercialPolicyNodes: any[] = [];
    for (const node of hydraNodesStore.values()) {
      if (node.type === 'ConcessionRule' || node.tags?.includes('Policy') || node.tags?.includes('PricingGuardrail')) {
        commercialPolicyNodes.push({
          type: node.type,
          label: node.label,
          properties: node.properties,
        });
      }
    }

    const policyContextStr = commercialPolicyNodes.length > 0
      ? `\nActive Commercial Governance & Concession Policies:\n${JSON.stringify(commercialPolicyNodes, null, 2)}`
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
  // Rule: Query HydraDB specifically for that context and its graph relationships.
  // =========================================================================
  const matchedNodes: any[] = [];
  const matchedEdges: any[] = [];
  const searchEntities = gateResult.extractedEntities;

  // 1. Query remote HydraDB instance if configured
  if (process.env.HYDRADB_URL && process.env.HYDRADB_URL !== 'http://localhost:8000') {
    try {
      const hydraRes = await fetch(`${process.env.HYDRADB_URL}/query`, {
        method: 'POST',
        headers: getHydraHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          database: 'ace',
          query: gateResult.targetQueryText || prompt,
          limit: 10,
          includeRelations: true,
        }),
      });
      if (hydraRes.ok) {
        const hydraData = await hydraRes.json();
        if (hydraData.results && Array.isArray(hydraData.results)) {
          for (const item of hydraData.results) {
            if (item.node) matchedNodes.push(item.node);
            if (item.neighbors && Array.isArray(item.neighbors)) {
              for (const n of item.neighbors) {
                if (n.edge) {
                  matchedEdges.push({
                    relationship: n.edge.relationship,
                    target: n.node ? n.node.label : n.edge.targetId,
                    properties: n.edge.properties,
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('HydraDB upstream query during context retrieval fallback:', err);
    }
  }

  // 2. Query local HydraDB substrate nodes specifically matching the target entities
  for (const node of hydraNodesStore.values()) {
    const nodeText = (node.label + ' ' + JSON.stringify(node.properties) + ' ' + (node.tags || []).join(' ') + ' ' + node.id).toLowerCase();
    const isEntityMatch = searchEntities.some(ent => nodeText.includes(ent.toLowerCase()));

    if (isEntityMatch && !matchedNodes.some(n => n.id === node.id)) {
      matchedNodes.push({
        id: node.id,
        type: node.type,
        label: node.label,
        properties: node.properties,
        tier: node.tier,
      });

      // Retrieve connected relationships from HydraDB
      for (const edge of hydraEdgesStore.values()) {
        if (edge.sourceId === node.id || edge.targetId === node.id) {
          const otherNodeId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
          const otherNode = hydraNodesStore.get(otherNodeId);
          matchedEdges.push({
            relationship: edge.relationship,
            target: otherNode ? otherNode.label : otherNodeId,
            properties: edge.properties,
          });
        }
      }
    }
  }

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

