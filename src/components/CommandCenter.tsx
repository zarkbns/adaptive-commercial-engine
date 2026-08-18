import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  TradeUpIcon, 
  Dollar01Icon, 
  Shield01Icon, 
  Analytics01Icon, 
  FlashIcon, 
  Clock01Icon, 
  CheckmarkCircle02Icon, 
  Refresh01Icon, 
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { HydraTierMetrics } from '../services/hydradb/types';
import { AgentExecutionLog } from '../services/ace/types';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';

interface CommandCenterProps {
  metrics: HydraTierMetrics;
  logs?: AgentExecutionLog[];
  onSelectDeal?: (dealId: string) => void;
  onOpenHydra: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onOpenHydra,
}) => {
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [sweepFeedback, setSweepFeedback] = useState<string | null>(null);

  const handleRunYieldSweep = async () => {
    setIsRunningSweep(true);
    setSweepFeedback(null);
    try {
      await ACEAgentOrchestrator.getInstance().executeYieldOptimizationSweep();
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

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner with Overview Status */}
      <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                Active Deals & Pipeline
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">
              Check pricing rules, profit margins, and key contacts across your accounts.
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
              <span>{isRunningSweep ? 'Optimizing...' : 'Check Pricing'}</span>
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
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Pipeline Value</span>
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
          <p className="mt-1 text-[11px] text-zinc-400">4 active deals in progress</p>
        </div>

        {/* Metric 2: Average Gross Margin */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Average Profit Margin</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
              <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">84.2%</span>
            <span className="text-xs font-medium text-zinc-500">(Floor: 78.0%)</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Discount rules active</p>
        </div>

        {/* Metric 3: Win Rate Potential */}
        <div 
          onClick={onOpenHydra}
          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs cursor-pointer hover:border-zinc-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estimated Win Rate</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700 group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">79.5%</span>
            <span className="text-xs font-semibold text-emerald-600">+6.2%</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>High probability deals</span>
            <span className="text-zinc-600 group-hover:underline flex items-center font-medium">View Graph <HugeiconsIcon icon={ArrowRight01Icon} className="h-2.5 w-2.5 ml-0.5" /></span>
          </p>
        </div>

        {/* Metric 4: Win Velocity */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Average Deal Time</span>
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">15.5 Days</span>
            <span className="text-xs font-semibold text-emerald-600">-4.2 days vs avg</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Fast discount approvals</p>
        </div>
      </div>
    </div>
  );
};
