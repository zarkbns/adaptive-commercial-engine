import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Dollar01Icon,
  UserGroup02Icon,
  CheckmarkCircle02Icon,
  TradeUpIcon,
  Search01Icon,
  PlusSignIcon,
  Calendar01Icon,
  Mail01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  CallIcon,
  SlidersHorizontalIcon,
  File01Icon,
  Briefcase01Icon,
} from '@hugeicons/core-free-icons';
import { Consumer, Deal, consumerStore } from '../../services/consumerService';
import { UserSession } from '../../services/authService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter consumers
  const filteredConsumers = consumers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalSales = consumers.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  const dealsWonCount = consumers.filter((c) => c.status === 'Closed Won').length + 34;
  const newConsumersCount = consumers.length + 142;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = session?.name ? session.name.split(' ')[0] : 'Alex';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. GREETING & BUSINESS OVERVIEW BANNER */}
      <div className="rounded-3xl border border-[#e6ded3] bg-[#f7f4ee] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#e6ded3] text-[#7a4d29]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#966035]" />
                Business Overview
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              You have <strong className="text-zinc-900 font-semibold">{consumers.filter(c => c.status === 'In Negotiation').length} active negotiations</strong> and <strong className="text-zinc-900 font-semibold">3 key follow-ups</strong> scheduled for today.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            <button
              type="button"
              onClick={onOpenAddConsumer}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
              <span>Add Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenCopilot('Check my highest priority deal and suggest the next move')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold border border-[#e6ded3] shadow-xs transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035]" />
              <span>Ask ACE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-2 hover:border-[#d8cdbf] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] flex items-center justify-center">
              <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              ${(totalSales > 0 ? totalSales : 1428500).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700">
              <HugeiconsIcon icon={TradeUpIcon} className="h-3 w-3" />
              <span>+14.2% vs last month</span>
            </div>
          </div>
        </div>

        {/* New Consumers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-2 hover:border-[#d8cdbf] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">New Consumers</span>
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] flex items-center justify-center">
              <HugeiconsIcon icon={UserGroup02Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              {newConsumersCount}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700">
              <HugeiconsIcon icon={TradeUpIcon} className="h-3 w-3" />
              <span>+8.5% new accounts</span>
            </div>
          </div>
        </div>

        {/* Deals Won */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-2 hover:border-[#d8cdbf] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Deals Won</span>
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              {dealsWonCount}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700">
              <HugeiconsIcon icon={TradeUpIcon} className="h-3 w-3" />
              <span>+12.0% close rate</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-2 hover:border-[#d8cdbf] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] flex items-center justify-center">
              <HugeiconsIcon icon={TradeUpIcon} className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              28.4%
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-700">
              <HugeiconsIcon icon={TradeUpIcon} className="h-3 w-3" />
              <span>+3.2% vs target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONSUMER MANAGEMENT SECTION (MAJOR PART OF DASHBOARD) */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Consumer Management</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
                {filteredConsumers.length} Total
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Track contacts, manage deals, record touchpoints, and plan your next action.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search consumers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 rounded-full border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035] transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="hidden lg:flex items-center bg-zinc-100/80 p-1 rounded-full text-[11px]">
              {['ALL', 'In Negotiation', 'Proposal Sent', 'Active', 'Follow-up Needed'].map((st) => (
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
                  {st === 'ALL' ? 'All' : st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenAddConsumer}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Consumer List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100">
              <tr>
                <th className="py-3 px-5">Consumer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Last Contact</th>
                <th className="py-3 px-5">Next Action</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredConsumers.map((consumer) => {
                const isSelected = selectedConsumerId === consumer.id;
                return (
                  <tr
                    key={consumer.id}
                    onClick={() => onSelectConsumer(consumer.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#f7f4ee]/70' : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    {/* Consumer Column */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {consumer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 group-hover:text-[#966035] transition-colors truncate">
                            {consumer.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">{consumer.company}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
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
                    </td>

                    {/* Deal Value */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-zinc-900">
                      ${consumer.dealValue.toLocaleString()}
                    </td>

                    {/* Last Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500">
                      {consumer.lastContact}
                    </td>

                    {/* Next Action */}
                    <td className="py-3.5 px-5">
                      <div className="max-w-xs">
                        <div className="text-zinc-900 font-medium truncate">{consumer.nextAction}</div>
                        <div className="text-[10px] text-zinc-400">{consumer.nextActionDate}</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectConsumer(consumer.id);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#966035] text-white shadow-xs'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
                        }`}
                      >
                        View consumer
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredConsumers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No consumers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. USEFUL ACTIONS & RECENT DEALS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Useful Actions Cards */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Useful Actions</h3>
            <span className="text-[11px] text-zinc-400 font-medium">Quick Workflows</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenAddConsumer}
              className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-[#f7f4ee] border border-zinc-200/70 hover:border-[#e6ded3] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:text-[#966035] mb-2 shadow-2xs">
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-zinc-900 group-hover:text-[#7a4d29]">Add Consumer</div>
              <div className="text-[10px] text-zinc-500">Record a new buyer profile</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('deals')}
              className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-[#f7f4ee] border border-zinc-200/70 hover:border-[#e6ded3] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:text-[#966035] mb-2 shadow-2xs">
                <HugeiconsIcon icon={Briefcase01Icon} className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-zinc-900 group-hover:text-[#7a4d29]">New Deal</div>
              <div className="text-[10px] text-zinc-500">Create deal proposal</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('tasks')}
              className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-[#f7f4ee] border border-zinc-200/70 hover:border-[#e6ded3] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:text-[#966035] mb-2 shadow-2xs">
                <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-zinc-900 group-hover:text-[#7a4d29]">Create Task</div>
              <div className="text-[10px] text-zinc-500">Set follow-up reminder</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-[#f7f4ee] border border-zinc-200/70 hover:border-[#e6ded3] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:text-[#966035] mb-2 shadow-2xs">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold text-zinc-900 group-hover:text-[#7a4d29]">Schedule Call</div>
              <div className="text-[10px] text-zinc-500">Book client meeting</div>
            </button>
          </div>
        </div>

        {/* Right: Active Deal Pipeline Summary */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Active Deal Pipeline</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('deals')}
              className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] flex items-center gap-1 cursor-pointer"
            >
              <span>View all deals</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {deals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                onClick={() => onNavigateTab('deals')}
                className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-[#f7f4ee] border border-zinc-200/70 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-bold text-zinc-900 truncate">{deal.title}</div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {deal.consumerName} • {deal.company}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-900">${deal.value.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{deal.probability}% win prob</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white border border-zinc-200 text-zinc-700">
                    {deal.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
