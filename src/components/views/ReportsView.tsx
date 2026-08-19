import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  ArrowRight01Icon,
  BookOpen01Icon,
  TradeUpIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

interface ReportsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenCopilot }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Insights & Synthesis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              Cross-Customer Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            High-level patterns, customer preference shifts, and strategic recommendations synthesized from ongoing customer interactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('Generate a comprehensive synthesis of recent customer requirements, common objections, and emerging market patterns.')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace for report</span>
        </button>
      </div>

      {/* Synthesis Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Customer Priority</div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">Deployment Speed</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            68% of recent conversations emphasize go-live support and SLA guarantees over feature add-ons.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Emerging Shift</div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">Branch Consolidation</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Multi-location enterprises are seeking centralized platform administration across regional subsidiaries.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Compliance Focus</div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">SOC 2 & Dedicated Cloud</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Security and compliance guarantees remain essential for regulated healthcare and fintech clients.
          </p>
        </div>
      </div>

      {/* Synthesis Breakdown */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Key Requirements by Frequency</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Fast onboarding & dedicated implementation team</span>
              <span>78% of customers</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#966035] rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Annual upfront billing with multi-year rate lock</span>
              <span>64% of customers</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#966035] rounded-full" style={{ width: '64%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Enterprise SSO and granular role-based permissions</span>
              <span>52% of customers</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#966035] rounded-full" style={{ width: '52%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
