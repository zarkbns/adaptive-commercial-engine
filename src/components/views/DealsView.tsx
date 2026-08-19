import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Briefcase01Icon,
  Search01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  BookOpen01Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import { Deal, consumerStore } from '../../services/consumerService';

interface DealsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const DealsView: React.FC<DealsViewProps> = ({ onOpenCopilot }) => {
  const [deals] = useState<Deal[]>(() => consumerStore.getDeals());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Commercial Context & Reasoning</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {deals.length} Active Engagements
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Commercial history, customer preferences, trade-offs, and ace's strategic reasoning across ongoing agreements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('What commercial trade-offs and recommendations does ace suggest across active customer engagements?')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace about agreements</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="relative max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, company, or agreement scope..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
          />
        </div>
      </div>

      {/* Engagements List */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <HugeiconsIcon icon={BookOpen01Icon} className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No commercial engagements found</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No agreements match your search. Try searching by contact or company name.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onOpenCopilot(`What commercial insights and talk tracks should I use for ${deal.title} with ${deal.consumerName}?`)}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs hover:shadow-sm cursor-pointer space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">{deal.title}</span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{deal.company}</span>
                  </div>
                  <div className="text-xs text-zinc-500">Key Stakeholder: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{deal.consumerName}</strong></div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {deal.stage} Discussion
                  </span>
                </div>
              </div>

              {/* ace's Reasoning & Learned Context */}
              <div className="p-4 rounded-2xl bg-[#f7f4ee] dark:bg-zinc-800/80 border border-[#e6ded3] dark:border-zinc-700/80 space-y-1.5">
                <div className="text-[10px] font-bold text-[#7a4d29] dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
                  <span>ace Reasoning & Context</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {deal.nextStep || 'Customer requested multi-year agreement terms. Trade for annual upfront billing is recommended.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-zinc-400">
                <span>Engagement ID: {deal.id}</span>
                <span className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] dark:text-amber-300 flex items-center gap-1">
                  <span>Ask ace for strategic guidance</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
