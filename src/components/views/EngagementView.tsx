import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Message01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  TimeQuarter02Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface EngagementViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const EngagementView: React.FC<EngagementViewProps> = ({ onOpenCopilot }) => {
  const activities = consumerStore.getActivities();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Conversations & Interactions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              Interaction Stream
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Chronological stream of customer emails, calls, notes, and meeting highlights synthesized into accumulated memory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('Summarize recent customer interactions and highlight any emerging patterns or concerns.')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace to summarize</span>
        </button>
      </div>

      {/* Interaction Stream List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Customer Interactions</h2>
          <span className="text-xs text-zinc-400">All channels</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {activities.map((act) => (
            <div
              key={act.id}
              onClick={() => onOpenCopilot(`What did ace learn from this interaction: "${act.title}" with ${act.consumerName}?`)}
              className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl px-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:bg-[#966035] group-hover:text-white transition-colors">
                  <HugeiconsIcon icon={Message01Icon} className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">{act.title}</span>
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{act.consumerName}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pl-11 sm:pl-0 sm:pt-0.5">
                <span className="text-[10px] text-zinc-400">{act.timestamp}</span>
                <span className="text-xs font-semibold text-[#966035] dark:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <span>Reason with ace</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
