/**
 * ace (Adaptive Commercial Engine) Types
 */

export interface DealConfiguration {
  id: string;
  accountName: string;
  planTier: 'Starter' | 'Growth' | 'Enterprise' | 'Sovereign-Dedicated';
  seatCount: number;
  contractTermMonths: number; // 12, 24, 36
  requestedDiscountPct: number;
  addOns: {
    dedicatedHydraCluster: boolean;
    realtimeVectorIndexing: boolean;
    sla24x7Support: boolean;
    complianceBAAPack: boolean;
    customAIInferenceUnits: number; // in millions
  };
  paymentTerms: 'Annual Advance' | 'Multi-Year Upfront' | 'Quarterly' | 'Monthly';
}

export interface PricingAnalysisResult {
  listArr: number;
  effectiveArr: number;
  grossMarginPct: number;
  projectedLtv: number;
  paybackMonths: number;
  winProbabilityPct: number;
  elasticityIndex: number; // 0.0 - 2.0 (1.0 = unit elasticity)
  priceHealthScore: number; // 0 - 100
  recommendedDiscountPct: number;
  concessionGiveGets: {
    requestedDiscount: number;
    approved: boolean;
    give: string;
    getReqs: string[];
    marginDeltaPct: number;
  }[];
  marginAlert: 'SAFE' | 'WARNING' | 'CRITICAL_LEAK';
  hydraContextTraces: {
    entityId: string;
    label: string;
    relevanceReason: string;
    temporalStatus: string;
  }[];
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  agentName: 'ace Commander' | 'A.C.E Commander' | 'Hydra Memory Agent' | 'Pricing & Yield Optimizer' | 'Deal Risk Sentry' | 'Lead Prospector';
  action: string;
  status: 'SUCCESS' | 'RUNNING' | 'ADAPTED' | 'WARNING';
  details: string;
  temporalCommitHash?: string;
  dataPayload?: Record<string, any>;
}

export interface AccountIntelligence {
  id: string;
  name: string;
  domain: string;
  industry: string;
  tier: string;
  intentScore: number; // 0 - 100
  buyingStage: string;
  activeArr: number;
  potentialArr: number;
  dealVelocityDays: number;
  healthScore: number;
  champions: { name: string; title: string; sentiment: string }[];
  economicBuyers: { name: string; title: string; budgetSigned: boolean }[];
  blockers: { name: string; title: string; concern: string }[];
  signals: { title: string; confidence: number; date: string }[];
  nextBestAction: {
    action: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedChannel: 'Email' | 'Executive Call' | 'Live Demo' | 'Contract Addendum';
    rationale: string;
  };
}
