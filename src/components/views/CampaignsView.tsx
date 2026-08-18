import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroup02Icon,
  Mail01Icon,
  TradeUpIcon,
  PlusSignIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface CampaignsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenCopilot }) => {
  const campaigns = consumerStore.getCampaigns();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Campaigns</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              {campaigns.filter(c => c.status === 'Active').length} Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Run focused outreach sequences to target consumer accounts and schedule qualification demos.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-zinc-900 leading-snug">{camp.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    camp.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              <div className="text-xs text-zinc-500">
                Audience: <span className="font-semibold text-zinc-800">{camp.targetAudience}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium">Reply Rate</div>
                  <div className="text-sm font-extrabold text-zinc-900">{camp.replyRate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium">Conversion</div>
                  <div className="text-sm font-extrabold text-emerald-700">{camp.conversionRate}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-400">
              <span>{camp.contactsCount} Contacts</span>
              <span>Started {camp.startedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
