import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Dollar01Icon,
  TradeUpIcon,
  CheckmarkCircle02Icon,
  Briefcase01Icon,
} from '@hugeicons/core-free-icons';

interface ReportsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenCopilot }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Reports</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
            Monthly Performance
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Simple sales performance reports, deal cycle velocity, and win rate analysis.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Quarterly Target Pacing</div>
          <div className="text-2xl font-extrabold text-zinc-900">114%</div>
          <div className="text-[11px] text-emerald-700 font-medium">$1.42M achieved of $1.25M quota</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Average Deal Cycle</div>
          <div className="text-2xl font-extrabold text-zinc-900">18.5 Days</div>
          <div className="text-[11px] text-emerald-700 font-medium">4.2 days faster than average</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Average Margin Preserved</div>
          <div className="text-2xl font-extrabold text-zinc-900">82.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium">Safely above 78% floor</div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900">Revenue by Product Plan</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
              <span>Enterprise Platform Plan ($480k avg)</span>
              <span>62% of revenue</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#966035] rounded-full" style={{ width: '62%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
              <span>Growth Dedicated Suite ($320k avg)</span>
              <span>28% of revenue</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-800 rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
              <span>Starter Regional Tier ($95k avg)</span>
              <span>10% of revenue</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-400 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
