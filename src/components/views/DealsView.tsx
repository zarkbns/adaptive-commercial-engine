import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Briefcase01Icon,
  PlusSignIcon,
  Search01Icon,
  Dollar01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { Deal, consumerStore } from '../../services/consumerService';

interface DealsViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const DealsView: React.FC<DealsViewProps> = ({ onOpenCopilot }) => {
  const [deals, setDeals] = useState<Deal[]>(() => consumerStore.getDeals());
  const [searchTerm, setSearchTerm] = useState('');

  const stages: Deal['stage'][] = ['Discovery', 'Solutioning', 'Proposal', 'Negotiation', 'Won'];

  const filteredDeals = deals.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Deals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              ${totalPipelineValue.toLocaleString()} Total Pipeline
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Track deal stages from initial discovery through pricing proposals and negotiation to closing.
          </p>
        </div>
      </div>

      {/* Kanban Board of Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={stage} className="bg-zinc-50/80 rounded-2xl p-3 border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-bold text-zinc-900">{stage}</div>
                <span className="text-[10px] font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-zinc-200">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-semibold px-1">
                ${(stageTotal / 1000).toFixed(0)}k
              </div>

              <div className="space-y-2.5">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-2xl p-3.5 border border-zinc-200 shadow-xs space-y-2.5 hover:border-[#966035] transition-colors cursor-pointer"
                    onClick={() => onOpenCopilot(`Review strategy and next move for deal: ${deal.title}`)}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-900 leading-snug">{deal.title}</div>
                      <div className="text-[11px] text-zinc-500">{deal.consumerName}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                      <span className="font-extrabold text-zinc-900">${(deal.value / 1000).toFixed(0)}k</span>
                      <span className="text-[10px] font-semibold text-emerald-700">{deal.probability}% win</span>
                    </div>

                    <div className="text-[10px] text-zinc-600 bg-zinc-50 p-2 rounded-xl border border-zinc-200/60 leading-tight">
                      <span className="font-semibold text-zinc-800">Next: </span>
                      {deal.nextStep}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-zinc-400 italic">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
