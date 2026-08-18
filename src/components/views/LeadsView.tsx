import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  StarIcon,
  TradeUpIcon,
  Mail01Icon,
  CallIcon,
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
      setConvertedNotice(`Converted ${lead.name} to active consumer!`);
      setTimeout(() => setConvertedNotice(null), 4000);
      if (onLeadConverted) onLeadConverted(newConsumer.id);
    }
  };

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Leads</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              {leads.length} Inbound Opportunities
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Qualify incoming prospect leads, track interest signals, and convert high-scoring leads into active consumers.
          </p>
        </div>
      </div>

      {convertedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600" />
          <span>{convertedNotice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-zinc-200/80 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, company, or interest..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 rounded-full border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
          />
        </div>
      </div>

      {/* Leads Table & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">{lead.name}</div>
                  <div className="text-xs text-zinc-500">{lead.company}</div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3] text-[11px] font-bold">
                <HugeiconsIcon icon={StarIcon} className="h-3 w-3 fill-current text-[#966035]" />
                <span>{lead.score} Score</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1.5 text-xs">
              <div className="text-zinc-500 font-medium">Interest Area:</div>
              <div className="text-zinc-900 font-semibold">{lead.interest}</div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                <span>Source: {lead.source}</span>
                <span>Added: {lead.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                {lead.status}
              </span>

              <button
                type="button"
                onClick={() => handleConvert(lead)}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Convert to Consumer</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
