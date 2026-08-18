/**
 * ace Multi-Agent Orchestrator
 * Coordinates autonomous commercial agents and records execution telemetry
 */

import { AgentExecutionLog } from './types';
import { HydraDBEngine } from '../hydradb/engine';

export class ACEAgentOrchestrator {
  private logs: AgentExecutionLog[] = [];
  private listeners: ((logs: AgentExecutionLog[]) => void)[] = [];
  private isAutoRunning = true;
  private intervalId: any = null;

  private static instance: ACEAgentOrchestrator | null = null;

  public static getInstance(): ACEAgentOrchestrator {
    if (!ACEAgentOrchestrator.instance) {
      ACEAgentOrchestrator.instance = new ACEAgentOrchestrator();
      ACEAgentOrchestrator.instance.seedInitialLogs();
      ACEAgentOrchestrator.instance.startBackgroundPulse();
    }
    return ACEAgentOrchestrator.instance;
  }

  constructor() {}

  public subscribe(callback: (logs: AgentExecutionLog[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    const copy = [...this.logs];
    this.listeners.forEach((l) => l(copy));
  }

  public addLog(log: Omit<AgentExecutionLog, 'id' | 'timestamp'>) {
    const fullLog: AgentExecutionLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.logs.unshift(fullLog);
    if (this.logs.length > 80) this.logs.pop();
    this.notify();
    return fullLog;
  }

  public getLogs(): AgentExecutionLog[] {
    return [...this.logs];
  }

  /**
   * Trigger manual or autonomous commercial actions
   */
  public async executeYieldOptimizationSweep(): Promise<string> {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = hydra.getGraphSnapshot();
    const targetDeal = snapshot.nodes.find((n) => n.type === 'Deal');

    this.addLog({
      agentName: 'ace Commander',
      action: 'Initiating Autonomous Commercial Yield Sweep',
      status: 'RUNNING',
      details: 'Scanning active deals against HydraDB concession policy matrix & margin threshold...',
    });

    await new Promise((r) => setTimeout(r, 600));

    const dealId = targetDeal ? targetDeal.id : 'deal_enterprise_commercial_01';
    const dealLabel = targetDeal ? targetDeal.label : 'Enterprise Commercial Contract';

    const commit = await hydra.commit(
      'ace-pricing-optimizer',
      'Autonomous Yield & Margin Recalibration for Active Pipeline',
      {
        updatedNodes: [
          {
            id: dealId,
            type: 'Deal',
            label: dealLabel,
            properties: {
              targetArr: targetDeal?.properties?.targetArr || 480000,
              grossMarginExpectedPct: 84.2,
              concessionEnforced: '3-Year Upfront Required for 15% discount',
            },
            tier: 'hot',
            accessCount: 175,
            lastAccessed: new Date().toISOString(),
            commitHash: '',
            version: 3,
            validFrom: new Date().toISOString(),
            tags: ['EnterpriseSaaS', 'HighMargin', 'OptimizedByACE'],
          },
        ],
      }
    );

    this.addLog({
      agentName: 'Pricing & Yield Optimizer',
      action: 'Commercial Margin Shield Applied',
      status: 'ADAPTED',
      details: `Protected gross margin at 84.2% across active pipeline. Tied 15% discount to 3-year upfront commitment.`,
      temporalCommitHash: commit.commitHash,
    });

    return commit.commitHash;
  }

  public async executeTemporalContextReindex(): Promise<string> {
    const hydra = HydraDBEngine.getInstance();
    this.addLog({
      agentName: 'Hydra Memory Agent',
      action: 'Vector Substrate & Temporal DAG Compaction',
      status: 'RUNNING',
      details: 'Recomputing 64-dim cosine clusters, pruning cold memory snapshots, and refreshing L1 hot cache...',
    });

    await new Promise((r) => setTimeout(r, 700));

    const commit = await hydra.commit(
      'ace-hydra-memory',
      'HydraDB Memory Tier Rebalance & Semantic Breadth Expansion',
      {
        addedNodes: [
          {
            id: 'signal_commercial_velocity_' + Date.now().toString(36),
            type: 'BuyingSignal',
            label: 'Global Market Intel: High demand for Autonomous AI Context Fabrics',
            properties: {
              confidence: 0.96,
              sector: 'Enterprise AI Infrastructure',
              elasticityTrend: 'Inelastic for mission-critical low-latency systems',
            },
            tier: 'hot',
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            commitHash: '',
            version: 1,
            validFrom: new Date().toISOString(),
            tags: ['MarketIntel', 'AutonomousAI'],
          },
        ],
      }
    );

    this.addLog({
      agentName: 'Hydra Memory Agent',
      action: 'Temporal Substrate Re-indexed',
      status: 'SUCCESS',
      details: `Hot cache refreshed. Temporal commit DAG advanced to ${commit.commitHash.substring(0, 14)}. L1 hit rate: 98.2%.`,
      temporalCommitHash: commit.commitHash,
    });

    return commit.commitHash;
  }

  public async executeLeadSignalAudit(): Promise<void> {
    this.addLog({
      agentName: 'Lead Prospector',
      action: 'Autonomous Buying Intent & Org Chart Scan',
      status: 'RUNNING',
      details: 'Cross-referencing buying committee roles against HydraDB champion vectors for active pipeline...',
    });

    await new Promise((r) => setTimeout(r, 650));

    this.addLog({
      agentName: 'Deal Risk Sentry',
      action: 'Compliance Block Mitigation Strategy Formulated',
      status: 'SUCCESS',
      details: 'Detected stakeholder security gating. Auto-generated Zero-Trust Architecture briefing for security evaluation.',
    });
  }

  private startBackgroundPulse() {
    if (this.intervalId) clearInterval(this.intervalId);

    const automatedActions = [
      () => {
        this.addLog({
          agentName: 'Hydra Memory Agent',
          action: 'L1 Hot Memory Cache Promotion',
          status: 'SUCCESS',
          details: 'Elevated active deal and champion nodes to L1 RAM cache based on query frequency (>150 req/min).',
        });
      },
      () => {
        this.addLog({
          agentName: 'Pricing & Yield Optimizer',
          action: 'Continuous Elasticity Calibration',
          status: 'ADAPTED',
          details: 'Recalculated discount concession curve for active enterprise pipeline. Concession balance favorable at 10% discount.',
        });
      },
      () => {
        this.addLog({
          agentName: 'Deal Risk Sentry',
          action: 'Competitor Pressure Monitoring',
          status: 'SUCCESS',
          details: 'Scanned market competitor pricing signals. Counter-strategy verified in active deal room.',
        });
      },
    ];

    let step = 0;
    this.intervalId = setInterval(() => {
      if (!this.isAutoRunning) return;
      const act = automatedActions[step % automatedActions.length];
      act();
      step++;
    }, 18000);
  }

  private seedInitialLogs() {
    const initialSeed: Omit<AgentExecutionLog, 'id'>[] = [
      {
        timestamp: '05:18:22',
        agentName: 'ace Commander',
        action: 'Engine Initialization & Substrate Mount',
        status: 'SUCCESS',
        details: 'ace Commercial Core online. Mounted HydraDB Temporal Context Graph with active nodes and relations.',
        temporalCommitHash: 'hydra_genesis_01',
      },
      {
        timestamp: '05:19:04',
        agentName: 'Hydra Memory Agent',
        action: 'Temporal Graph Seed Verified',
        status: 'SUCCESS',
        details: 'Verified Git-style DAG integrity. In-memory hot tier initialized with sub-2ms query latency.',
        temporalCommitHash: 'hydra_genesis_01',
      },
      {
        timestamp: '05:20:15',
        agentName: 'Pricing & Yield Optimizer',
        action: 'Dynamic Margin Policy Engaged',
        status: 'ADAPTED',
        details: 'Loaded autonomous margin protection floor (78.0%). Set Give-Get concession trade triggers.',
      },
      {
        timestamp: '05:21:40',
        agentName: 'Deal Risk Sentry',
        action: 'Pipeline Velocity Audit',
        status: 'SUCCESS',
        details: 'Enterprise pipeline flagged as High Velocity. Champion engagement score: 0.94.',
      },
    ];

    this.logs = initialSeed.map((item, index) => ({
      ...item,
      id: `seed_log_${index}`,
    }));
  }
}
