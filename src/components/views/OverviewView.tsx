import React, { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  ArrowRight01Icon,
  Search01Icon,
  Message01Icon,
  Layers01Icon,
  CheckmarkCircle02Icon,
  TimeQuarter02Icon,
  FlashIcon,
} from '@hugeicons/core-free-icons';
import { Consumer, Deal } from '../../services/consumerService';
import { UserSession } from '../../services/authService';
import { HydraDBEngine } from '../../services/hydradb/engine';

interface OverviewViewProps {
  session?: UserSession;
  consumers: Consumer[];
  deals: Deal[];
  selectedConsumerId: string | null;
  onSelectConsumer: (consumerId: string) => void;
  onOpenAddConsumer: () => void;
  onOpenCopilot: (promptText?: string) => void;
  onNavigateTab: (tab: string) => void;
}

interface CustomerContextItem {
  id: string;
  customerName: string;
  company: string;
  insight: string;
  source: string;
  timeAgo: string;
  theme: 'priority' | 'concern' | 'preference' | 'expansion';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  session,
  consumers,
  deals,
  selectedConsumerId,
  onSelectConsumer,
  onOpenAddConsumer,
  onOpenCopilot,
  onNavigateTab,
}) => {
  const [askInput, setAskInput] = useState('');

  // Structured customer intelligence items grounded in real customer relationships and context
  const contextIntelligenceList: CustomerContextItem[] = useMemo(() => {
    return [
      {
        id: 'ctx-1',
        customerName: 'Sarah Chen',
        company: 'Apex Global Logistics',
        insight:
          'Apex Global Logistics has raised concerns about deployment complexity and multi-region synchronization across recent executive conversations.',
        source: 'Executive Conversation & Meeting Notes',
        timeAgo: '2h ago',
        theme: 'concern',
      },
      {
        id: 'ctx-2',
        customerName: 'Elena Rostova',
        company: 'Vanguard Fintech Group',
        insight:
          'Vanguard Fintech’s recent conversations indicate growing interest in expanding their license to consolidate 3 regional branches.',
        source: 'Email Exchange & Architecture Review',
        timeAgo: 'Yesterday',
        theme: 'expansion',
      },
      {
        id: 'ctx-3',
        customerName: 'Marcus Vance',
        company: 'Nexus Health Systems',
        insight:
          'Three healthcare contacts have independently requested dedicated security addendums and SOC 2 Type II compliance guarantees.',
        source: 'Compliance Addendum Review',
        timeAgo: '2 days ago',
        theme: 'preference',
      },
      {
        id: 'ctx-4',
        customerName: 'Julian Sterling',
        company: 'Hyperion Energy Labs',
        insight:
          'Customers are increasingly asking about faster implementation timelines, with Hyperion prioritizing dedicated onboarding SLA support.',
        source: 'Commercial Agreement Notes',
        timeAgo: '3 days ago',
        theme: 'priority',
      },
      {
        id: 'ctx-5',
        customerName: 'David Kim',
        company: 'Summit Media Networks',
        insight:
          'Finance approval cycle confirmed; David mentioned preference for single annual upfront billing rather than quarterly installments.',
        source: 'Stakeholder Sync',
        timeAgo: '4 days ago',
        theme: 'preference',
      },
    ];
  }, [consumers]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    onOpenCopilot(askInput.trim());
    setAskInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onOpenCopilot(askInput || 'What customer insights should I know about today?');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-2 sm:px-4 space-y-8 sm:space-y-10 animate-fadeIn selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* ==================================================================== */}
      {/* 1. LARGE CENTERED HEADING & CONTEXTUAL SENTENCE                      */}
      {/* ==================================================================== */}
      <div className="text-center space-y-2.5 pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
          What should you know today?
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal max-w-xl mx-auto leading-relaxed">
          ace has been learning from your customer conversations and business context.
        </p>
      </div>

      {/* ==================================================================== */}
      {/* 2. LARGE SEARCH / "ASK ACE" BAR                                      */}
      {/* ==================================================================== */}
      <div className="w-full max-w-2xl mx-auto">
        <form
          onSubmit={handleAskSubmit}
          className="w-full bg-white dark:bg-zinc-900 rounded-full border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 transition-all"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ace anything about your customers..."
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-normal"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="submit"
              className="inline-flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors cursor-pointer px-1.5 py-0.5"
            >
              <span>Ask ace</span>
            </button>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              Tab
            </span>
          </div>
        </form>

        {/* ================================================================== */}
        {/* 3. QUICK ACTION PILLS UNDERNEATH                                   */}
        {/* ================================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-4">
          <button
            type="button"
            onClick={() => onOpenCopilot('What changed across customer conversations recently?')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-110 transition-transform" />
            <span>What changed?</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCopilot('Summarize the top customer insights learned from recent interactions.')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-110 transition-transform" />
            <span>Customer insights</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCopilot('Show highlights from recent customer conversations and emails.')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Recent conversations</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCopilot('What emerging patterns or buyer preferences should I focus on?')}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-2xs transition-colors cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-110 transition-transform" />
            <span>Ask ace</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. TWO CLEAN INSIGHT CARDS: "What ace learned" & "What's changing"   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* ================================================================== */}
        {/* CARD 1: What ace learned                                           */}
        {/* ================================================================== */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              What ace learned
            </span>
            <button
              type="button"
              onClick={() => onOpenCopilot('Detail everything ace has learned about customer preferences and requirements')}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer p-1"
              title="Explore learned insights"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#966035] dark:text-amber-300 uppercase tracking-wider mb-1">
                Common Theme Identified
              </div>
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">
                Implementation speed & dedicated onboarding are the top decision criteria across accounts.
              </p>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              3 customers have independently mentioned that deployment timeline guarantees are more important than feature breadth.
            </p>

            {/* Subtle visual trend indicators */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                <span>Mention frequency</span>
                <span className="font-semibold text-rose-500">+40% this month</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-10 px-1">
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-t-md h-3" />
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-t-md h-5" />
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-t-md h-7" />
                <div className="flex-1 bg-rose-500 rounded-t-md h-10 shadow-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CARD 2: What's changing                                            */}
        {/* ================================================================== */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              What's changing
            </span>
            <button
              type="button"
              onClick={() => onOpenCopilot('What relationship changes or emerging patterns are happening right now?')}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer p-1"
              title="Explore customer shifts"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Donut progress visual matching reference */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray="79, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Shift</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white leading-none">79%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                Multi-region consolidation demand
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Vanguard Fintech and 2 other accounts are actively shifting from single-team pilots toward enterprise consolidation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. CLEAN "CUSTOMER CONTEXT" SECTION                                  */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Customer context</h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Recent intelligence and context learned from conversations, emails, and meetings
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenCopilot('Show me all customer context notes and historical interaction memory')}
            className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] dark:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Ask ace for details</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {contextIntelligenceList.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenCopilot(`Tell me more about the customer context for ${item.company}: "${item.insight}"`)}
              className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl px-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:bg-[#966035] group-hover:text-white transition-colors">
                  <HugeiconsIcon icon={Message01Icon} className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {item.company}
                    </span>
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {item.customerName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {item.insight}
                  </p>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                    Source: {item.source}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pl-11 sm:pl-0 sm:pt-0.5">
                <span className="text-[10px] text-zinc-400">{item.timeAgo}</span>
                <span className="text-xs font-semibold text-[#966035] dark:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <span>Explore</span>
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
