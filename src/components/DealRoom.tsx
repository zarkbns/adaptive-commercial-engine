import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Dollar01Icon, 
  SparklesIcon, 
  SlidersHorizontalIcon, 
  Award01Icon, 
  BotIcon, 
  FileCheckIcon, 
  CheckmarkCircle02Icon, 
  CancelCircleIcon
} from '@hugeicons/core-free-icons';
import confetti from 'canvas-confetti';
import { DealConfiguration, PricingAnalysisResult } from '../services/ace/types';
import { calculateCommercialPricing } from '../services/ace/pricingEngine';
import { HydraDBEngine } from '../services/hydradb/engine';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';

interface DealRoomProps {
  initialDealId?: string | null;
  onOpenHydra: () => void;
}

export const DealRoom: React.FC<DealRoomProps> = ({ initialDealId, onOpenHydra }) => {
  const availableAccounts = useMemo(() => {
    const hydra = HydraDBEngine.getInstance();
    const snapshot = hydra.getGraphSnapshot();
    const accountNodes = (snapshot.nodes || []).filter(
      (n) => n.type?.toLowerCase() === 'account'
    );
    if (accountNodes.length > 0) {
      return accountNodes.map((a) => ({
        id: a.id,
        name: a.label,
        targetArr: a.properties?.targetArr || 400000,
      }));
    }
    return [
      { id: 'acc_primary', name: 'Enterprise Client Alpha', targetArr: 450000 },
      { id: 'acc_secondary', name: 'Commercial Client Beta', targetArr: 280000 },
    ];
  }, []);

  const [selectedAccount, setSelectedAccount] = useState<string>(() => {
    const hydra = HydraDBEngine.getInstance();
    if (initialDealId) {
      const node = hydra.getNode(initialDealId);
      if (node?.label) return node.label;
    }
    const accounts = hydra.getGraphSnapshot().nodes.filter((n) => n.type?.toLowerCase() === 'account');
    return accounts[0]?.label || 'Enterprise Client Alpha';
  });

  const [planTier, setPlanTier] = useState<DealConfiguration['planTier']>('Enterprise');
  const [seatCount, setSeatCount] = useState<number>(350);
  const [contractTermMonths, setContractTermMonths] = useState<number>(36);
  const [requestedDiscountPct, setRequestedDiscountPct] = useState<number>(14);
  const [paymentTerms, setPaymentTerms] = useState<DealConfiguration['paymentTerms']>('Annual Advance');

  // Addons state
  const [addOns, setAddOns] = useState({
    dedicatedHydraCluster: true,
    realtimeVectorIndexing: true,
    sla24x7Support: true,
    complianceBAAPack: false,
    customAIInferenceUnits: 15, // in millions
  });

  // AI Analysis State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiDealDossier, setAiDealDossier] = useState<string | null>(null);
  const [commitSuccessHash, setCommitSuccessHash] = useState<string | null>(null);

  // Compute live pricing analysis
  const currentConfig: DealConfiguration = useMemo(() => ({
    id: `deal_${selectedAccount.toLowerCase().replace(/\s+/g, '_')}`,
    accountName: selectedAccount,
    planTier,
    seatCount,
    contractTermMonths,
    requestedDiscountPct,
    addOns,
    paymentTerms,
  }), [selectedAccount, planTier, seatCount, contractTermMonths, requestedDiscountPct, addOns, paymentTerms]);

  const pricingAnalysis: PricingAnalysisResult = useMemo(() => {
    return calculateCommercialPricing(currentConfig);
  }, [currentConfig]);

  // Request AI Deal Strategy from server-side Gemini endpoint
  const handleGenerateAIDealStrategy = async () => {
    setIsAnalyzingAI(true);
    setAiDealDossier(null);

    try {
      const response = await fetch('/api/ace/analyze-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: currentConfig, pricingAnalysis }),
      });
      const data = await response.json();
      setAiDealDossier(data.analysis);

      ACEAgentOrchestrator.getInstance().addLog({
        agentName: 'Pricing & Yield Optimizer',
        action: 'AI Deal Room Synthesis Generated',
        status: 'SUCCESS',
        details: `Synthesized concession trade dossier for ${selectedAccount}. Effective ARR: $${pricingAnalysis.effectiveArr.toLocaleString()}.`,
      });
    } catch (e) {
      console.error('Failed to generate AI deal analysis:', e);
      setAiDealDossier(`**Concession Strategy**: Grant 12% maximum discount in exchange for 36-Month binding term with Annual Advance payment.`);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Commit deal structure to HydraDB Temporal Graph
  const handleCommitDealToHydra = () => {
    const hydra = HydraDBEngine.getInstance();
    const commit = hydra.commit(
      'ace-pricing-optimizer',
      `Commercial Deal Terms Authorized for ${selectedAccount}`,
      {
        updatedNodes: [
          {
            id: `deal_${selectedAccount.toLowerCase().replace(/\s+/g, '_')}`,
            type: 'Deal',
            label: `${selectedAccount} - Commercial Contract (${planTier})`,
            properties: {
              targetArr: pricingAnalysis.effectiveArr,
              seats: seatCount,
              termMonths: contractTermMonths,
              discountPct: requestedDiscountPct,
              grossMarginPct: pricingAnalysis.grossMarginPct,
              winProbability: pricingAnalysis.winProbabilityPct,
              paymentTerms,
              addOns,
            },
            tier: 'hot',
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            commitHash: '',
            version: 1,
            validFrom: new Date().toISOString(),
            tags: ['ActiveContract', 'CommittedDeal', planTier],
          },
        ],
      },
      { pricingHealthScore: pricingAnalysis.priceHealthScore, paybackMonths: pricingAnalysis.paybackMonths }
    );

    setCommitSuccessHash(commit.commitHash);

    ACEAgentOrchestrator.getInstance().addLog({
      agentName: 'A.C.E Commander',
      action: 'Commercial Contract Terms Committed to HydraDB',
      status: 'ADAPTED',
      details: `Authorized $${pricingAnalysis.effectiveArr.toLocaleString()} ARR for ${selectedAccount}. Gross margin locked at ${pricingAnalysis.grossMarginPct}%.`,
      temporalCommitHash: commit.commitHash,
    });

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => setCommitSuccessHash(null), 8000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 text-zinc-800" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              Dynamic Deal Room & Yield Simulator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Simulate real-time price elasticity, Give-Get concession trade-offs, and gross margin guardrails.
          </p>
        </div>

        {/* Account Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">Target Account:</span>
          <select
            id="select-account"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs focus:border-zinc-400 focus:outline-none"
          >
            {availableAccounts.map((acc) => (
              <option key={acc.id} value={acc.name}>
                {acc.name} (${(acc.targetArr / 1000).toFixed(0)}k ARR Target)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Configurator Left, Live Intelligence Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Deal Configurator Controls */}
        <div className="lg:col-span-6 space-y-5 rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
            <span className="text-xs font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4 text-zinc-700" /> Deal Parameter Matrix
            </span>
            <span className="text-[11px] font-mono text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded-md shadow-2xs">
              Elasticity: {pricingAnalysis.elasticityIndex}x
            </span>
          </div>

          {/* Plan Tier Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700">Deployment Architecture Tier</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Starter', 'Growth', 'Enterprise', 'Sovereign-Dedicated'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  id={`btn-tier-${tier}`}
                  onClick={() => setPlanTier(tier)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    planTier === tier
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Seat Count Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-700">Licensed User Seats</span>
              <span className="font-mono text-zinc-900 font-bold">{seatCount} Seats</span>
            </div>
            <input
              type="range"
              min="20"
              max="1500"
              step="10"
              value={seatCount}
              onChange={(e) => setSeatCount(Number(e.target.value))}
              className="w-full accent-zinc-900 bg-zinc-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>20 seats</span>
              <span>500 seats</span>
              <span>1500 seats</span>
            </div>
          </div>

          {/* Contract Term Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700">Contract Commitment Period</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { months: 12, label: '12 Months (Standard)' },
                { months: 24, label: '24 Months (+4% Bonus)' },
                { months: 36, label: '36 Months (+8.5% Concession)' },
              ].map((term) => (
                <button
                  key={term.months}
                  type="button"
                  onClick={() => setContractTermMonths(term.months)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-center ${
                    contractTermMonths === term.months
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          {/* Requested Discount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-700">Requested Volume Discount</span>
              <span className={`font-mono font-bold ${requestedDiscountPct > 15 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {requestedDiscountPct}% Off List
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={requestedDiscountPct}
              onChange={(e) => setRequestedDiscountPct(Number(e.target.value))}
              className="w-full accent-zinc-900 bg-zinc-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>0% (List)</span>
              <span className="text-emerald-600">10% (Pre-Approved)</span>
              <span className="text-amber-600">15% (Give-Get Req)</span>
              <span className="text-rose-600">&gt;20% (Exec Gate)</span>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700">Payment & Invoicing Terms</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Annual Advance', 'Multi-Year Upfront', 'Quarterly', 'Monthly'] as const).map((terms) => (
                <button
                  key={terms}
                  type="button"
                  onClick={() => setPaymentTerms(terms)}
                  className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                    paymentTerms === terms
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {terms}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Matrix */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-200/60">
            <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
              <span>HydraDB Architecture & Security Add-ons</span>
              <span className="text-[10px] text-zinc-400">Auto-calculated</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 rounded-xl bg-white border border-zinc-200/80 p-2.5 cursor-pointer hover:border-zinc-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={addOns.dedicatedHydraCluster}
                  onChange={(e) => setAddOns({ ...addOns, dedicatedHydraCluster: e.target.checked })}
                  className="rounded text-zinc-900 border-zinc-300"
                />
                <span className="text-zinc-700">Dedicated HydraDB (+$45k)</span>
              </label>

              <label className="flex items-center space-x-2 rounded-xl bg-white border border-zinc-200/80 p-2.5 cursor-pointer hover:border-zinc-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={addOns.realtimeVectorIndexing}
                  onChange={(e) => setAddOns({ ...addOns, realtimeVectorIndexing: e.target.checked })}
                  className="rounded text-zinc-900 border-zinc-300"
                />
                <span className="text-zinc-700">Realtime Vectors (+$18k)</span>
              </label>

              <label className="flex items-center space-x-2 rounded-xl bg-white border border-zinc-200/80 p-2.5 cursor-pointer hover:border-zinc-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={addOns.sla24x7Support}
                  onChange={(e) => setAddOns({ ...addOns, sla24x7Support: e.target.checked })}
                  className="rounded text-zinc-900 border-zinc-300"
                />
                <span className="text-zinc-700">24/7 SRE SLA (+$24k)</span>
              </label>

              <label className="flex items-center space-x-2 rounded-xl bg-white border border-zinc-200/80 p-2.5 cursor-pointer hover:border-zinc-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={addOns.complianceBAAPack}
                  onChange={(e) => setAddOns({ ...addOns, complianceBAAPack: e.target.checked })}
                  className="rounded text-zinc-900 border-zinc-300"
                />
                <span className="text-zinc-700">HIPAA & SOC2 (+$30k)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Commercial Intelligence, Yield & Give-Get Concession Matrix */}
        <div className="lg:col-span-6 space-y-4">
          {/* Real-time Economic Outcome Card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Commercial Pricing Model
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                pricingAnalysis.marginAlert === 'SAFE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Status: {pricingAnalysis.marginAlert}
              </span>
            </div>

            {/* ARR & Gross Margin Outputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-zinc-400">Effective Contract ARR</div>
                <div className="text-3xl font-extrabold tracking-tight text-zinc-900 font-mono">
                  ${pricingAnalysis.effectiveArr.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400 line-through">
                  List ARR: ${pricingAnalysis.listArr.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-zinc-400">Protected Gross Margin</div>
                <div className="text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
                  {pricingAnalysis.grossMarginPct}%
                </div>
                <div className="text-[11px] text-zinc-500">
                  Projected LTV: <span className="text-zinc-900 font-semibold font-mono">${(pricingAnalysis.projectedLtv / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            {/* Win Probability & Payback */}
            <div className="pt-3 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-zinc-50 p-2.5 border border-zinc-200/60">
                <div className="text-zinc-400 text-[10px]">Win Probability</div>
                <div className="font-bold text-zinc-900 font-mono mt-0.5">{pricingAnalysis.winProbabilityPct}%</div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-2.5 border border-zinc-200/60">
                <div className="text-zinc-400 text-[10px]">CAC Payback</div>
                <div className="font-bold text-zinc-900 font-mono mt-0.5">{pricingAnalysis.paybackMonths} Mo</div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-2.5 border border-zinc-200/60">
                <div className="text-zinc-400 text-[10px]">Price Health</div>
                <div className="font-bold text-emerald-600 font-mono mt-0.5">{pricingAnalysis.priceHealthScore}/100</div>
              </div>
            </div>
          </div>

          {/* Give-Get Concession Trade Matrix */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-zinc-700" /> Give-Get Concession Trade Rules
              </span>
              <span className="text-[10px] text-zinc-400">HydraDB Governance</span>
            </div>

            <div className="space-y-2">
              {pricingAnalysis.concessionGiveGets.map((concession, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-3 text-xs transition-all ${
                    requestedDiscountPct >= concession.requestedDiscount
                      ? concession.approved
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                      : 'border-zinc-100 bg-zinc-50/60 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-zinc-800">{concession.give}</span>
                    <span className="flex items-center gap-1">
                      {concession.approved ? (
                        <span className="text-emerald-700 font-mono flex items-center gap-1">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" /> Approved Trade
                        </span>
                      ) : (
                        <span className="text-rose-700 font-mono flex items-center gap-1">
                          <HugeiconsIcon icon={CancelCircleIcon} className="h-3.5 w-3.5" /> Blocked (24+ Mo Req)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-1 text-[11px] text-zinc-500">
                    <span className="text-zinc-700 font-medium">Required Customer Give-Gets:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-500">
                      {concession.getReqs.map((req, rIdx) => (
                        <li key={rIdx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row: AI Deal Strategist & Commit to HydraDB */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-ai-analyze-deal"
              onClick={handleGenerateAIDealStrategy}
              disabled={isAnalyzingAI}
              className="w-full sm:w-1/2 flex items-center justify-center space-x-2 rounded-full bg-zinc-900 hover:bg-black active:scale-98 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <HugeiconsIcon icon={SparklesIcon} className={`h-3.5 w-3.5 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingAI ? 'Synthesizing...' : 'Generate Battlecard'}</span>
            </button>

            <button
              id="btn-commit-hydra"
              onClick={handleCommitDealToHydra}
              className="w-full sm:w-1/2 flex items-center justify-center space-x-2 rounded-full bg-white hover:bg-zinc-50 active:scale-98 px-4 py-2.5 text-xs font-bold text-zinc-800 border border-zinc-200/80 shadow-xs transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={FileCheckIcon} className="h-3.5 w-3.5" />
              <span>Commit Terms to HydraDB</span>
            </button>
          </div>

          {commitSuccessHash && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Deal terms committed atomically! Hash: <span className="font-mono font-bold">{commitSuccessHash.substring(0, 14)}</span></span>
              </div>
              <button
                onClick={onOpenHydra}
                className="underline hover:text-emerald-950 shrink-0 ml-2 font-semibold"
              >
                View in Graph &rarr;
              </button>
            </div>
          )}

          {/* AI Deal Dossier View */}
          {aiDealDossier && (
            <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-4 text-xs text-zinc-800 space-y-2 animate-fadeIn shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <HugeiconsIcon icon={BotIcon} className="h-4 w-4 text-zinc-700" /> A.C.E Strategy Dossier
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Autonomous Strategy</span>
              </div>
              <div className="prose prose-xs max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {aiDealDossier}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
