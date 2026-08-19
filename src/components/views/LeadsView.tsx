import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
  BookOpen01Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import { Lead, consumerStore } from '../../services/consumerService';

interface LeadsViewProps {
  onLeadConverted?: (consumerId: string) => void;
  onOpenCopilot: (promptText?: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onLeadConverted, onOpenCopilot }) => {
  const [leads, setLeads] = useState<Lead[]>(() => consumerStore.getLeads());
  const [searchTerm, setSearchTerm] = useState('');
  const [convertedNotice, setConvertedNotice] = useState<string | null>(null);

  const handleConvert = (lead: Lead) => {
    const newConsumer = consumerStore.convertLeadToConsumer(lead.id);
    setLeads(consumerStore.getLeads());
    if (newConsumer) {
      setConvertedNotice(`Added ${lead.name} to persistent customer memory!`);
      setTimeout(() => setConvertedNotice(null), 4000);
      if (onLeadConverted) onLeadConverted(newConsumer.id);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Inbound Signals & Inquiries</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {leads.length} Inbound Signals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Prospective customer inquiries, requirement signals, and early conversation themes captured across channels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('What emerging requirements are inbound prospective customers asking about?')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace about signals</span>
        </button>
      </div>

      {convertedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{convertedNotice}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="relative max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inquiries by contact, company, or requirement..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
          />
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <HugeiconsIcon icon={BookOpen01Icon} className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No inbound signals found</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No inquiry signals match your current search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{lead.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{lead.company}</div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                  {lead.source}
                </span>
              </div>

              {/* Expressed Need / Requirement */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
                <div className="text-[10px] font-bold text-[#7a4d29] dark:text-amber-300 uppercase tracking-wider">
                  Expressed Requirement
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {lead.interest}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <span className="text-[11px] text-zinc-400">Captured {lead.createdAt}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onOpenCopilot(`What talk track and customer intelligence should I use when responding to ${lead.name} at ${lead.company}?`)}
                    className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] dark:text-amber-300 cursor-pointer"
                  >
                    Ask ace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConvert(lead)}
                    className="px-3 py-1 rounded-full bg-zinc-900 dark:bg-zinc-800 hover:bg-black text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Add to Memory
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
