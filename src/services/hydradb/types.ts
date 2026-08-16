/**
 * HydraDB Core System Types
 * Temporal Context Graph & Vector Memory Substrate for Autonomous AI Agents
 */

export type HydraMemoryTier = 'hot' | 'warm' | 'cold';

export type HydraEntityType =
  | 'Account'
  | 'Contact'
  | 'Deal'
  | 'BuyingSignal'
  | 'PricingConstraint'
  | 'MarketCondition'
  | 'AgentDecision'
  | 'InteractionEpisode'
  | 'Competitor'
  | 'ConcessionRule';

export interface HydraMemoryNode {
  id: string;
  type: HydraEntityType;
  label: string;
  properties: Record<string, any>;
  validFrom: string; // ISO timestamp
  validTo?: string | null; // ISO timestamp (null = currently active)
  embedding?: number[]; // Vector embedding representation
  tier: HydraMemoryTier;
  accessCount: number;
  lastAccessed: string;
  commitHash: string;
  version: number;
  tags: string[];
}

export type HydraRelationshipType =
  | 'CHAMPIONS'
  | 'DECIDES_PRICING'
  | 'COMPETES_WITH'
  | 'BUDGET_OWNER'
  | 'INFLUENCES'
  | 'HAS_OBJECTION'
  | 'PRICING_LINKED_TO'
  | 'PART_OF_ACCOUNT'
  | 'TRIGGERED_BY'
  | 'CONCESSION_TIED_TO';

export interface HydraEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: HydraRelationshipType;
  weight: number; // 0.0 - 1.0 confidence/strength
  properties: Record<string, any>;
  validFrom: string;
  validTo?: string | null;
  commitHash: string;
}

export interface HydraMutation {
  addedNodes?: HydraMemoryNode[];
  updatedNodes?: HydraMemoryNode[];
  removedNodeIds?: string[];
  addedEdges?: HydraEdge[];
  removedEdgeIds?: string[];
}

export interface HydraCommit {
  commitHash: string;
  parentHash: string | null;
  timestamp: string;
  authorAgent: string;
  changeSummary: string;
  mutation: HydraMutation;
  metadata?: Record<string, any>;
}

export interface HydraQueryOptions {
  queryText?: string;
  vectorEmbedding?: number[];
  entityTypes?: HydraEntityType[];
  temporalAsOf?: string; // Point-in-time time travel
  tierPriority?: HydraMemoryTier[];
  minSimilarity?: number;
  limit?: number;
  includeNeighborhood?: boolean;
  maxHops?: number;
}

export interface HydraQueryResult {
  node: HydraMemoryNode;
  score: number; // Composite hybrid score (semantic + graph + recency)
  semanticScore?: number;
  graphCentralityScore?: number;
  temporalDecayScore?: number;
  neighbors?: {
    edge: HydraEdge;
    node: HydraMemoryNode;
  }[];
}

export interface HydraTierMetrics {
  hotItemCount: number;
  hotMemoryBytes: number;
  warmItemCount: number;
  warmMemoryBytes: number;
  coldItemCount: number;
  coldMemoryBytes: number;
  cacheHitRatio: number;
  totalQueries: number;
  totalCommits: number;
  avgLatencyMs: number;
}

/**
 * Official HydraDB v2 Ingest & Polling Protocols
 */
export interface HydraIngestPayload {
  content: string;
  source?: string;
  contextType?: string;
  metadata?: Record<string, any>;
  entities?: Partial<HydraMemoryNode>[];
  relations?: Partial<HydraEdge>[];
  authorAgent?: string;
}

export interface HydraIngestJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  indexing_status?: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  createdAt: string;
}

export interface HydraJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  indexing_status?: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 - 100
  extractedEntitiesCount?: number;
  extractedRelationsCount?: number;
  completedAt?: string;
  error?: string;
  resultNodeIds?: string[];
}

export interface HydraRelationsResponse {
  nodes: HydraMemoryNode[];
  edges: HydraEdge[];
  totalEntities?: number;
  totalRelations?: number;
  asOfTimestamp?: string;
}
