import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  ArrowRight01Icon,
  Message01Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface CampaignsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenCopilot }) => {
  const campaigns = consumerStore.getCampaigns();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Outreach & Learning Streams</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {campaigns.length} Active Streams
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Targeted customer interaction streams, feedback capture channels, and message resonation signals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('What messaging and topics are resonating best across active customer outreach streams?')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace about resonance</span>
        </button>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            onClick={() => onOpenCopilot(`What customer insights were captured from the outreach stream: "${camp.name}"?`)}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-[#966035] transition-colors">{camp.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                  {camp.status}
                </span>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Audience: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{camp.targetAudience}</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Contacts Engaged:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{camp.contactsCount}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Response Rate:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{camp.replyRate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800 text-zinc-400">
              <span>Started: {camp.startedAt}</span>
              <span className="text-xs font-semibold text-[#966035] dark:text-amber-300 flex items-center gap-0.5">
                <span>Explore</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
