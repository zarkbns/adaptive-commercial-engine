import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  TradeUpIcon, 
  Dollar01Icon, 
  Shield01Icon, 
  Analytics01Icon, 
  FlashIcon, 
  Clock01Icon, 
  Alert01Icon, 
  CheckmarkCircle02Icon, 
  ArrowUpRight01Icon, 
  Refresh01Icon, 
  SlidersHorizontalIcon, 
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { HydraTierMetrics } from '../services/hydradb/types';
import { AgentExecutionLog } from '../services/ace/types';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';
import { HydraDBEngine } from '../services/hydradb/engine';

interface CommandCenterProps {
  metrics: HydraTierMetrics;
  logs: AgentExecutionLog[];
  onSelectDeal: (dealId: string) => void;
  onOpenHydra: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  metrics,
  logs,
  onSelectDeal,
  onOpenHydra,
}) => {
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [sweepFeedback, setSweepFeedback] = useState<string | null>(null);

  const handleRunYieldSweep = async () => {
    setIsRunningSweep(true);
    setSweepFeedback(null);
    try {
      const commitHash = await ACEAgentOrchestrator.getInstance().executeYieldOptimizationSweep();
      setSweepFeedback(`Yield optimization completed successfully.`);
      setTimeout(() => setSweepFeedback(null), 6000);
    } finally {
      setIsRunningSweep(false);
    }
  };

  const handleAuditSignals = async () => {
    await ACEAgentOrchestrator.getInstance().executeLeadSignalAudit();
    setSweepFeedback('Commercial signals updated. Stakeholder strategies refreshed.');
    setTimeout(() => setSweepFeedback(null), 6000);
  };

  const activeDeals = useMemo(() => {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = hydra.getGraphSnapshot();
    const dealNodes = snapshot.nodes.filter((n) => n.type === 'Deal');
    const accountNodes = snapshot.nodes.filter((n) => n.type === 'Account');
    const contactNodes = snapshot.nodes.filter((n) => n.type === 'Contact');

    if (dealNodes.length > 0) {
      return dealNodes.map((deal) => {
        const relatedEdge = snapshot.edges.find((e) => e.sourceId === deal.id || e.targetId === deal.id);
        let accountName = deal.label.split(' - ')[0] || 'Enterprise Client';
        if (relatedEdge) {
          const accNodeId = relatedEdge.sourceId === deal.id ? relatedEdge.targetId : relatedEdge.sourceId;
          const accNode = accountNodes.find((a) => a.id === accNodeId);
          if (accNode) accountName = accNode.label;
        }

        const championContact = contactNodes.find((c) => (c.properties?.role || '').toLowerCase().includes('champion'));

        return {
          id: deal.id,
          account: accountName,
          tier: deal.tags?.find((t) => t.includes('Tier')) || 'Enterprise Tier',
          targetArr: deal.properties?.targetArr || 420000,
          marginPct: deal.properties?.targetGrossMarginPct || deal.properties?.grossMarginPct || 82.5,
          winProb: deal.properties?.winProbability || 80,
          velocityDays: 12,
          champion: championContact?.label ? `${championContact.label} (${championContact.properties?.role?.split('&')?.[0]?.trim() || 'Champion'})` : 'Primary Sponsor',
          status: deal.properties?.dealStage || 'Negotiation',
          concessionRule: deal.properties?.concessionEnforced || (deal.properties?.discountRequestedPct ? `${deal.properties.discountRequestedPct}% discount tied to multi-year commitment` : 'Margin protection active'),
          urgentAlert: false,
        };
      });
    }

    if (accountNodes.length > 0) {
      return accountNodes.map((acc, idx) => ({
        id: `deal_${acc.id}`,
        account: acc.label,
        tier: acc.tags?.find((t) => t.includes('Tier')) || 'Enterprise Tier',
        targetArr: acc.properties?.targetArr || 350000,
        marginPct: 82.5,
        winProb: 78,
        velocityDays: 14,
        champion: 'Primary Sponsor',
        status: acc.properties?.dealStage || 'Proposal Review',
        concessionRule: '10% volume concession tied to annual prepay',
        urgentAlert: idx === 0,
      }));
    }

    return [];
  }, [metrics.totalCommits]);

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner with Commercial Overview Status */}
      <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                Commercial Overview & Active Pipeline
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">
              Autonomous yield optimization, margin protection, and real-time commercial alignment across all active enterprise accounts.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-run-yield-sweep"
              onClick={handleRunYieldSweep}
              disabled={isRunningSweep}
              className="flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <HugeiconsIcon icon={Refresh01Icon} className={`h-3.5 w-3.5 ${isRunningSweep ? 'animate-spin' : ''}`} />
              <span>{isRunningSweep ? 'Optimizing...' : 'Run Yield Sweep'}</span>
            </button>

            <button
              id="btn-audit-signals"
              onClick={handleAuditSignals}
              className="flex items-center space-x-1.5 rounded-full bg-white hover:bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 border border-zinc-200/80 transition-all shadow-xs cursor-pointer"
            >
              <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5 text-zinc-500" />
              <span>Refresh Signals</span>
            </button>
          </div>
        </div>

        {sweepFeedback && (
          <div className="mt-3 rounded-2xl bg-white border border-zinc-200 px-3.5 py-2 text-xs text-zinc-800 flex items-center space-x-2 shadow-2xs">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{sweepFeedback}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Pipeline ARR */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Pipeline ARR</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
              <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">$1,650,000</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <HugeiconsIcon icon={TradeUpIcon} className="h-3 w-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">4 active deals in current cycle</p>
        </div>

        {/* Metric 2: Average Gross Margin */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Protected Gross Margin</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
              <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">84.2%</span>
            <span className="text-xs font-medium text-zinc-500">(Floor: 78.0%)</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Give-Get trade guardrails active</p>
        </div>

        {/* Metric 3: Win Rate Potential */}
        <div 
          onClick={onOpenHydra}
          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs cursor-pointer hover:border-zinc-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Target Win Probability</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700 group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">79.5%</span>
            <span className="text-xs font-semibold text-emerald-600">+6.2%</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Enterprise qualified</span>
            <span className="text-zinc-600 group-hover:underline flex items-center font-medium">View Deals <HugeiconsIcon icon={ArrowRight01Icon} className="h-2.5 w-2.5 ml-0.5" /></span>
          </p>
        </div>

        {/* Metric 4: Win Velocity */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Deal Velocity</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">15.5 Days</span>
            <span className="text-xs font-semibold text-emerald-600">-4.2 days vs avg</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Autonomous concession validation</p>
        </div>
      </div>

      {/* Main Content: Pipeline Matrix & Autonomous Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Commercial Pipeline */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Active Pipeline & Concession Health</h2>
            </div>
            <span className="text-xs text-zinc-400">Click deal to simulate in Dynamic Deal Room</span>
          </div>

          <div className="space-y-3">
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                id={`deal-card-${deal.id}`}
                onClick={() => onSelectDeal(deal.id)}
                className="group relative rounded-2xl border border-zinc-200/80 bg-white p-4.5 transition-all hover:border-zinc-300 cursor-pointer shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-zinc-900 text-sm group-hover:text-black transition-colors">
                        {deal.account}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                        {deal.tier}
                      </span>
                      {deal.urgentAlert && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                          <HugeiconsIcon icon={Alert01Icon} className="h-2.5 w-2.5" /> Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Champion: <span className="text-zinc-700 font-medium">{deal.champion}</span> • Stage: <span className="text-zinc-700">{deal.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-base font-bold text-zinc-900 tracking-tight font-mono">
                        ${deal.targetArr.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400">Target ARR</div>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-200 hidden sm:block" />
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600 font-mono">
                        {deal.marginPct}%
                      </div>
                      <div className="text-[11px] text-zinc-400">Gross Margin</div>
                    </div>
                  </div>
                </div>

                {/* Win Probability & Concession Rule Footer */}
                <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-400 font-medium">Win Probability:</span>
                    <div className="w-24 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          deal.winProb >= 80 ? 'bg-emerald-600' : deal.winProb >= 70 ? 'bg-zinc-800' : 'bg-amber-600'
                        }`}
                        style={{ width: `${deal.winProb}%` }}
                      />
                    </div>
                    <span className="font-mono text-zinc-700 font-semibold">{deal.winProb}%</span>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-500">
                    <span className="text-[11px] text-zinc-500 truncate max-w-[280px]">
                      Policy: <span className="text-zinc-800 font-medium">{deal.concessionRule}</span>
                    </span>
                    <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Autonomous Agent Activity Stream */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Agent Telemetry Log</h2>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs space-y-2.5 max-h-[480px] overflow-y-auto scrollbar-thin">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 text-xs space-y-1 hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                    {log.agentName}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">{log.timestamp}</span>
                </div>

                <div className="font-medium text-zinc-700">{log.action}</div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{log.details}</p>

                {log.temporalCommitHash && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Commit: {log.temporalCommitHash.substring(0, 14)}</span>
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-zinc-700 border border-zinc-200">
                      HydraDAG
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
