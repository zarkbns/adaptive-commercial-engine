import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  PlusSignIcon,
  Mail01Icon,
  CallIcon,
  Calendar01Icon,
  Briefcase01Icon,
  UserGroup02Icon,
  SlidersHorizontalIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');

  const industries = Array.from(new Set(consumers.map((c) => c.industry || 'General')));

  const filteredConsumers = consumers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Consumers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              {filteredConsumers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your consumer directory, track active opportunities, and plan strategic next steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddConsumer}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            <span>Add Consumer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, email, or industry..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 rounded-full border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center space-x-1 bg-zinc-100/80 p-1 rounded-full text-[11px]">
            {['ALL', 'In Negotiation', 'Proposal Sent', 'Active', 'Closed Won'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Consumer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredConsumers.map((consumer) => {
          const isSelected = selectedConsumerId === consumer.id;
          return (
            <div
              key={consumer.id}
              onClick={() => onSelectConsumer(consumer.id)}
              className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                isSelected ? 'border-[#966035] ring-2 ring-[#966035]/20 shadow-xs' : 'border-zinc-200/80 shadow-xs hover:border-zinc-300'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      {consumer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900 truncate hover:text-[#966035] transition-colors">
                        {consumer.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">{consumer.company}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                      consumer.status === 'Closed Won'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : consumer.status === 'In Negotiation'
                        ? 'bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]'
                        : consumer.status === 'Proposal Sent'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {consumer.status}
                  </span>
                </div>

                {/* Deal & Contact Metadata */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Deal Value:</span>
                    <span className="font-bold text-zinc-900">${consumer.dealValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Industry:</span>
                    <span className="text-zinc-700">{consumer.industry || 'Enterprise'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Last Contact:</span>
                    <span className="text-zinc-700">{consumer.lastContact}</span>
                  </div>
                </div>

                {/* Next Action Box */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Next Step</div>
                  <div className="text-xs font-semibold text-zinc-800 bg-[#f7f4ee] border border-[#e6ded3] rounded-xl p-2.5">
                    {consumer.nextAction}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCopilot(`Give me strategic negotiation talk tracks for ${consumer.name} at ${consumer.company}`);
                  }}
                  className="text-zinc-600 hover:text-[#966035] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" />
                  <span>Ask ACE</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectConsumer(consumer.id);
                  }}
                  className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
