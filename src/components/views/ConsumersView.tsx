import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  PlusSignIcon,
  Mail01Icon,
  CallIcon,
  UserGroup02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  BookOpen01Icon,
  TimeQuarter02Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import { Consumer } from '../../services/consumerService';

interface ConsumersViewProps {
  consumers: Consumer[];
  selectedConsumerId: string | null;
  onSelectConsumer: (id: string) => void;
  onOpenAddConsumer: () => void;
  onOpenCopilot: (promptText?: string) => void;
}

export const ConsumersView: React.FC<ConsumersViewProps> = ({
  consumers,
  selectedConsumerId,
  onSelectConsumer,
  onOpenAddConsumer,
  onOpenCopilot,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');

  const industries = Array.from(new Set(consumers.map((c) => c.industry || 'General')));

  const filteredConsumers = consumers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Knowledge</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {filteredConsumers.length} Customer Profiles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Accumulated intelligence, conversation history, key concerns, and relationship context learned across all customer interactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenCopilot('What are the key themes and preferences across all our customers?')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
            <span>Ask ace</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddConsumer}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer context by name, company, or topic..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-zinc-100/80 dark:bg-zinc-800 p-1 rounded-full text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedIndustry('ALL')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                selectedIndustry === 'ALL'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Industries
            </button>
            {industries.slice(0, 3).map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  selectedIndustry === ind
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Knowledge Grid */}
      {filteredConsumers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <HugeiconsIcon icon={BookOpen01Icon} className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No customer profiles found</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No customer context matches your search query. Try searching by contact name, company, or industry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConsumers.map((consumer) => {
            const isSelected = selectedConsumerId === consumer.id;
            return (
              <div
                key={consumer.id}
                onClick={() => onSelectConsumer(consumer.id)}
                className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer space-y-4 hover:shadow-sm group ${
                  isSelected
                    ? 'border-[#966035] ring-2 ring-[#966035]/15 shadow-xs'
                    : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                      {consumer.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{consumer.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{consumer.company}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                    {consumer.industry || 'Enterprise'}
                  </span>
                </div>

                {/* What ace knows: Key Learned Context & Notes */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1.5">
                  <div className="text-[10px] font-bold text-[#7a4d29] dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
                    <span>What ace knows</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {consumer.notes || `${consumer.name} from ${consumer.company} is evaluating technical and multi-year licensing terms.`}
                  </p>
                </div>

                {/* Recent context and recommendations */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>Last conversation:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{consumer.lastContact}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>Key focus area:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[180px]">{consumer.nextAction}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] text-zinc-400">{consumer.email}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCopilot(`Tell me everything ace has learned about ${consumer.name} at ${consumer.company}`);
                    }}
                    className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] dark:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ask ace</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
