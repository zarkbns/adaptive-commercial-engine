import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserGroup02Icon, 
  Building01Icon, 
  FlashIcon, 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon, 
  SparklesIcon
} from '@hugeicons/core-free-icons';
import { getAccountIntelligenceList } from '../services/ace/prospectorEngine';
import { AccountIntelligence } from '../services/ace/types';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';

interface AccountIntelligenceViewProps {
  onOpenDealRoom: (dealId: string) => void;
}

export const AccountIntelligenceView: React.FC<AccountIntelligenceViewProps> = ({ onOpenDealRoom }) => {
  const accounts = useMemo(() => getAccountIntelligenceList(), []);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [executedActionId, setExecutedActionId] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || accounts[0],
    [accounts, selectedAccountId]
  );

  const handleExecuteNBA = (account: AccountIntelligence) => {
    ACEAgentOrchestrator.getInstance().addLog({
      agentName: 'A.C.E Commander',
      action: `Executed NBA: ${account.nextBestAction.action}`,
      status: 'SUCCESS',
      details: `Dispatched via ${account.nextBestAction.suggestedChannel} for ${account.name}. Rationale: ${account.nextBestAction.rationale}`,
    });

    setExecutedActionId(account.id);
    setTimeout(() => setExecutedActionId(null), 5000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={UserGroup02Icon} className="h-5 w-5 text-zinc-800" />
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Account Intelligence & Buying Centers
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Multi-stakeholder influence mapping, buying signal detection, and autonomous Next Best Actions grounded in HydraDB.
        </p>
      </div>

      {/* Account Selector Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        {accounts.map((acc) => (
          <button
            key={acc.id}
            id={`tab-account-${acc.id}`}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`shrink-0 flex items-center space-x-2.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              selectedAccountId === acc.id
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
            }`}
          >
            <HugeiconsIcon icon={Building01Icon} className={`h-4 w-4 ${selectedAccountId === acc.id ? 'text-white' : 'text-zinc-500'}`} />
            <div className="text-left">
              <div>{acc.name}</div>
              <div className={`text-[10px] font-normal ${selectedAccountId === acc.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
                Intent: {acc.intentScore}% • {acc.tier}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Account Deep Dossier */}
      {selectedAccount && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Buying Center Org Map & Stakeholders */}
          <div className="lg:col-span-8 space-y-5">
            {/* Account Metadata Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-zinc-900">{selectedAccount.name}</h2>
                    <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                      {selectedAccount.industry}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{selectedAccount.domain} • Stage: {selectedAccount.buyingStage}</div>
                </div>

                <button
                  onClick={() => onOpenDealRoom(selectedAccount.id)}
                  className="flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs self-start sm:self-auto transition-colors cursor-pointer"
                >
                  <span>Open in Deal Room</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Account Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60">
                  <div className="text-zinc-400 text-[10px]">Intent Velocity</div>
                  <div className="text-base font-bold text-zinc-900 font-mono mt-1">{selectedAccount.intentScore}/100</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60">
                  <div className="text-zinc-400 text-[10px]">ARR Potential</div>
                  <div className="text-base font-bold text-zinc-900 font-mono mt-1">${selectedAccount.potentialArr.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60">
                  <div className="text-zinc-400 text-[10px]">Deal Velocity</div>
                  <div className="text-base font-bold text-emerald-600 font-mono mt-1">{selectedAccount.dealVelocityDays} Days</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60">
                  <div className="text-zinc-400 text-[10px]">Account Health</div>
                  <div className="text-base font-bold text-zinc-900 font-mono mt-1">{selectedAccount.healthScore}%</div>
                </div>
              </div>
            </div>

            {/* Stakeholder Influence Matrix */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={UserGroup02Icon} className="h-4 w-4 text-zinc-700" /> Buying Committee & Champion Influence Map
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Champions */}
                {selectedAccount.champions.map((champ, idx) => (
                  <div key={idx} className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Technical Champion</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-emerald-700 font-medium border border-emerald-200">
                        {champ.sentiment}
                      </span>
                    </div>
                    <div className="font-bold text-zinc-900 text-sm">{champ.name}</div>
                    <p className="text-[11px] text-zinc-500">{champ.title}</p>
                  </div>
                ))}

                {/* Economic Buyers */}
                {selectedAccount.economicBuyers.map((buyer, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-700 tracking-wider">Economic Buyer</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-zinc-600 font-medium border border-zinc-200">
                        Budget: {buyer.budgetSigned ? 'Signed' : 'Pending Review'}
                      </span>
                    </div>
                    <div className="font-bold text-zinc-900 text-sm">{buyer.name}</div>
                    <p className="text-[11px] text-zinc-500">{buyer.title}</p>
                  </div>
                ))}

                {/* Blockers / Security Stakeholders */}
                {selectedAccount.blockers.map((blocker, idx) => (
                  <div key={idx} className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Security Gatekeeper / Risk</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-amber-700 font-medium border border-amber-200">
                        Mitigation Active
                      </span>
                    </div>
                    <div className="font-bold text-zinc-900 text-sm">{blocker.name} ({blocker.title})</div>
                    <p className="text-[11px] text-zinc-600">
                      Gating Concern: <span className="text-zinc-800 font-medium">{blocker.concern}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Autonomous Next Best Action & Signal Feed */}
          <div className="lg:col-span-4 space-y-5">
            {/* Autonomous NBA Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-zinc-800" /> Next Best Action
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {selectedAccount.nextBestAction.urgency} Urgency
                </span>
              </div>

              <div className="font-bold text-zinc-900 text-sm leading-snug">
                {selectedAccount.nextBestAction.action}
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed bg-white p-3 rounded-2xl border border-zinc-200/60 shadow-2xs">
                <span className="font-semibold text-zinc-800">Context Rationale:</span> {selectedAccount.nextBestAction.rationale}
              </p>

              <button
                id="btn-execute-nba"
                onClick={() => handleExecuteNBA(selectedAccount)}
                className="w-full flex items-center justify-center space-x-2 rounded-full bg-zinc-900 hover:bg-black active:scale-98 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5" />
                <span>Execute via {selectedAccount.nextBestAction.suggestedChannel}</span>
              </button>

              {executedActionId === selectedAccount.id && (
                <div className="rounded-2xl bg-white border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center space-x-2 animate-fadeIn shadow-2xs">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Action dispatched & recorded in HydraDB!</span>
                </div>
              )}
            </div>

            {/* Buying Signals Stream */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 text-zinc-700" /> Buying Signals & Telemetry
              </span>

              <div className="space-y-2">
                {selectedAccount.signals.map((sig, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-800">{sig.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Confidence: {((sig.confidence || 0.9) * 100).toFixed(0)}%</span>
                      <span>{sig.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
