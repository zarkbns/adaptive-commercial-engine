import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Mail01Icon,
  CallIcon,
  File01Icon,
  CheckmarkCircle02Icon,
  TradeUpIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface EngagementViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const EngagementView: React.FC<EngagementViewProps> = ({ onOpenCopilot }) => {
  const activities = consumerStore.getActivities();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Engagement</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
            Customer Touchpoints
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Monitor response times, recent client interactions, call summaries, and engagement velocity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Average Response Time</div>
          <div className="text-2xl font-extrabold text-zinc-900">1.4 hours</div>
          <div className="text-[11px] text-emerald-700 font-medium">35% faster than benchmark</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Weekly Touchpoints</div>
          <div className="text-2xl font-extrabold text-zinc-900">48 Interactions</div>
          <div className="text-[11px] text-emerald-700 font-medium">+18% active outreach</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-zinc-500">Meeting Acceptance Rate</div>
          <div className="text-2xl font-extrabold text-zinc-900">88.5%</div>
          <div className="text-[11px] text-emerald-700 font-medium">High buyer intent</div>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">Recent Engagement Activity</h2>

        <div className="divide-y divide-zinc-100">
          {activities.map((act) => (
            <div key={act.id} className="py-3.5 flex items-start space-x-3.5 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] flex items-center justify-center shrink-0 mt-0.5 border border-[#e6ded3]">
                {act.type === 'call' && <HugeiconsIcon icon={CallIcon} className="h-4 w-4" />}
                {act.type === 'email' && <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />}
                {act.type === 'meeting' && <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />}
                {act.type === 'proposal' && <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />}
                {act.type === 'deal_won' && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-900">{act.title}</div>
                  <span className="text-[10px] text-zinc-400 font-medium">{act.timestamp}</span>
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">{act.description}</div>
                <div className="text-[11px] text-[#7a4d29] font-semibold mt-1">{act.consumerName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
