import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  Analytics01Icon, 
  Database01Icon, 
  UserGroup02Icon, 
  BotIcon, 
  Search01Icon, 
  FilterIcon, 
  Calendar01Icon, 
  Link01Icon, 
  Settings01Icon, 
  PlusSignIcon, 
  Location01Icon, 
  ArrowUpRight01Icon, 
  Clock01Icon, 
  Shield01Icon, 
  Dollar01Icon, 
  Refresh01Icon, 
  FlashIcon, 
  SlidersHorizontalIcon, 
  CheckmarkCircle02Icon,
  GridIcon,
  Briefcase01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { AIChatView } from './AIChatView';
import { CommandCenter } from './CommandCenter';
import { DealRoom } from './DealRoom';
import { HydraExplorer } from './HydraExplorer';
import { AccountIntelligenceView } from './AccountIntelligenceView';
import { AgentOpsView } from './AgentOpsView';
import { HydraTierMetrics } from '../services/hydradb/types';
import { AgentExecutionLog } from '../services/ace/types';
import { HydraDBEngine } from '../services/hydradb/engine';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';
import { getAccountIntelligenceList } from '../services/ace/prospectorEngine';

interface MainLayoutProps {
  metrics: HydraTierMetrics;
  logs: AgentExecutionLog[];
  onRefreshMetrics: () => void;
  onBackToLanding?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  metrics,
  logs,
  onRefreshMetrics,
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'command-center' | 'deal-room' | 'hydra-explorer' | 'accounts' | 'agent-ops'>('chat');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [marginGuardrailEnabled, setMarginGuardrailEnabled] = useState(true);
  const [indexingEnabled, setIndexingEnabled] = useState(true);
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [sweepNotification, setSweepNotification] = useState<string | null>(null);

  // Accounts from HydraDB
  const accounts = useMemo(() => getAccountIntelligenceList(), [metrics.totalCommits]);

  // Filtered account signals for left content column
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.tier.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  const featuredAccount = accounts[0] || null;

  const handleSelectAccountSignal = (accId: string) => {
    setSelectedDealId(`deal_${accId}`);
    setActiveTab('deal-room');
  };

  const handleRunYieldSweep = async () => {
    setIsRunningSweep(true);
    try {
      const commitHash = await ACEAgentOrchestrator.getInstance().executeYieldOptimizationSweep();
      setSweepNotification(`Sweep complete: ${commitHash.substring(0, 10)}`);
      onRefreshMetrics();
      setTimeout(() => setSweepNotification(null), 5000);
    } finally {
      setIsRunningSweep(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans antialiased p-3 sm:p-4 lg:p-6 flex flex-col justify-between selection:bg-zinc-200">
      {/* 1. TOP BAR */}
      <header className="w-full mb-4 flex items-center justify-between px-2">
        {/* Left Brand / Status Glyph */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-900 shadow-xs">
            <HugeiconsIcon icon={FlashIcon} className="h-5 w-5 fill-current" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <span>A.C.E</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600">
                Commercial Substrate
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Adaptive Commercial Engine • HydraDB</p>
          </div>
        </div>

        {/* Right Circular Icon Utilities Matching Reference */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200/80 px-3.5 py-1.5 rounded-full transition-colors shadow-xs cursor-pointer mr-1 hidden sm:inline-flex items-center space-x-1.5"
            >
              <span>Landing Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('hydra-explorer')}
            title="HydraDB Substrate Location"
            className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agent-ops')}
            title="Temporal Execution Timeline"
            className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            title="Connected Buying Centers"
            className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <HugeiconsIcon icon={Link01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deal-room')}
            title="Commercial Settings & Concessions"
            className="w-9 h-9 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleRunYieldSweep}
            disabled={isRunningSweep}
            title="Run Autonomous Yield Sweep"
            className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black transition-transform active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 stroke-2" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 4-COLUMN WORKSPACE */}
      <div className="flex-1 flex gap-4 w-full max-w-[1720px] mx-auto items-stretch overflow-hidden min-h-[750px]">
        {/* COLUMN 1: LEFT SIDEBAR (Narrow vertical rail) */}
        <aside className="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-between py-4 bg-transparent">
          {/* Top Logo / Navigation Group */}
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* AI Conversation (Active/Primary) */}
            <button
              onClick={() => setActiveTab('chat')}
              title="A.C.E AI Conversation"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'chat'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
            </button>

            {/* Commercial Pulse */}
            <button
              onClick={() => setActiveTab('command-center')}
              title="Commercial Pulse"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'command-center'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4" />
            </button>

            {/* Deal Room */}
            <button
              onClick={() => setActiveTab('deal-room')}
              title="Dynamic Deal Room"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'deal-room'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4" />
            </button>

            {/* HydraDB Graph */}
            <button
              onClick={() => setActiveTab('hydra-explorer')}
              title="HydraDB Temporal Graph"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'hydra-explorer'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Database01Icon} className="h-4 w-4" />
            </button>

            {/* Buying Centers */}
            <button
              onClick={() => setActiveTab('accounts')}
              title="Account Intelligence"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'accounts'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={UserGroup02Icon} className="h-4 w-4" />
            </button>

            {/* Agent Ops */}
            <button
              onClick={() => setActiveTab('agent-ops')}
              title="Autonomous Agent Ops"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'agent-ops'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={BotIcon} className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom User Avatar */}
          <div className="w-10 h-10 rounded-full bg-zinc-200/80 text-zinc-600 flex items-center justify-center border border-zinc-300/60 shadow-2xs font-semibold text-xs">
            <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
          </div>
        </aside>

        {/* COLUMN 2: LEFT CONTENT COLUMN (Stacked customer/account signal cards) */}
        <section className="hidden md:flex w-72 lg:w-80 shrink-0 flex-col gap-3.5 overflow-hidden">
          {/* Top Search Pill Matching Reference */}
          <div className="bg-white rounded-full border border-zinc-200/80 px-3.5 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2 flex-1">
              <HugeiconsIcon icon={Search01Icon} className="h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            <button type="button" className="text-zinc-400 hover:text-zinc-700">
              <HugeiconsIcon icon={FilterIcon} className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Stacked Signal Cards Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
            {/* Top Featured Account Signal Card */}
            {featuredAccount && (
              <div
                onClick={() => handleSelectAccountSignal(featuredAccount.id)}
                className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 border border-zinc-200/60 shrink-0 font-bold text-xs">
                    {featuredAccount.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-zinc-900 truncate">{featuredAccount.name}</h3>
                    <p className="text-[11px] text-zinc-400 truncate">{featuredAccount.industry} • {featuredAccount.tier}</p>
                  </div>
                </div>

                {/* Visual Signal Preview Box Matching Reference */}
                <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 border border-zinc-200/60 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-700">Buying Intent</span>
                    <span className="font-bold text-zinc-900">{featuredAccount.intentScore}%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 font-medium truncate">
                      Stage: {featuredAccount.buyingStage}
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-zinc-800 h-1.5 rounded-full"
                        style={{ width: `${featuredAccount.intentScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {featuredAccount.nextBestAction.action}
                </div>
              </div>
            )}

            {/* Other Stacked Signal Cards */}
            {filteredAccounts.slice(featuredAccount ? 1 : 0).map((acc) => (
              <div
                key={acc.id}
                onClick={() => handleSelectAccountSignal(acc.id)}
                className="bg-white rounded-2xl p-3.5 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 border border-zinc-200/60 shrink-0 font-semibold text-[11px]">
                      {acc.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 truncate group-hover:text-black">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        ${(acc.potentialArr / 1000).toFixed(0)}k ARR • {acc.dealVelocityDays}d velocity
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 shrink-0">
                    {acc.intentScore}%
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 line-clamp-1">
                  {acc.nextBestAction.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMN 3: CENTER COLUMN (The largest surface in layout - ACE AI Conversation Area) */}
        <main className="flex-1 min-w-0 flex flex-col h-full">
          {activeTab === 'chat' && (
            <AIChatView
              onSelectAccount={handleSelectAccountSignal}
              onOpenDealRoom={(dealId) => {
                setSelectedDealId(dealId);
                setActiveTab('deal-room');
              }}
            />
          )}

          {activeTab === 'command-center' && (
            <div className="h-full overflow-y-auto bg-white rounded-[32px] border border-zinc-200/80 shadow-sm p-6">
              <CommandCenter
                metrics={metrics}
                logs={logs}
                onSelectDeal={(dealId) => {
                  setSelectedDealId(dealId);
                  setActiveTab('deal-room');
                }}
                onOpenHydra={() => setActiveTab('hydra-explorer')}
              />
            </div>
          )}

          {activeTab === 'deal-room' && (
            <div className="h-full overflow-y-auto bg-white rounded-[32px] border border-zinc-200/80 shadow-sm p-6">
              <DealRoom
                initialDealId={selectedDealId}
                onOpenHydra={() => setActiveTab('hydra-explorer')}
              />
            </div>
          )}

          {activeTab === 'hydra-explorer' && (
            <div className="h-full overflow-y-auto bg-white rounded-[32px] border border-zinc-200/80 shadow-sm p-6">
              <HydraExplorer
                metrics={metrics}
                onRefreshMetrics={onRefreshMetrics}
              />
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="h-full overflow-y-auto bg-white rounded-[32px] border border-zinc-200/80 shadow-sm p-6">
              <AccountIntelligenceView
                onOpenDealRoom={(dealId) => {
                  setSelectedDealId(dealId);
                  setActiveTab('deal-room');
                }}
              />
            </div>
          )}

          {activeTab === 'agent-ops' && (
            <div className="h-full overflow-y-auto bg-white rounded-[32px] border border-zinc-200/80 shadow-sm p-6">
              <AgentOpsView logs={logs} />
            </div>
          )}
        </main>

        {/* COLUMN 4: RIGHT COLUMN (Narrow Analytics Column) */}
        <section className="hidden xl:flex w-72 lg:w-80 shrink-0 flex-col gap-4 overflow-y-auto">
          {/* Card 1: Key Commercial Metrics Matching Reference */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={GridIcon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">Commercial Metrics</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('command-center')}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 2 Metric Tile Blocks */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Gross Margin</span>
                <div className="text-lg font-bold text-zinc-900">84.2%</div>
                <div className="text-[10px] text-emerald-600 font-medium">Floor: 78.0%</div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-200/60 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Active ARR</span>
                <div className="text-lg font-bold text-zinc-900">$1.65M</div>
                <div className="text-[10px] text-zinc-500 font-medium">+18% Q/Q</div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Hydra Cache Hit</span>
              <span className="font-mono font-semibold text-zinc-800">{metrics.cacheHitRatio}% ({metrics.avgLatencyMs}ms)</span>
            </div>

            {/* Minimal Dot Pagination Matching Reference */}
            <div className="flex justify-center space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            </div>
          </div>

          {/* Card 2: Active Deal / Yield Health Card */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">Autonomous Yield Sentry</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            {/* Highlight Banner */}
            <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">Concession Protection</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Active Shield
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Give-Get trade matrices actively enforce multi-year commitments for all discounts &gt;8%.
              </p>
            </div>

            {sweepNotification && (
              <div className="rounded-xl bg-zinc-100 border border-zinc-300 p-2 text-[10px] text-zinc-800 flex items-center gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>{sweepNotification}</span>
              </div>
            )}

            {/* Minimal Dot Pagination */}
            <div className="flex justify-center space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            </div>
          </div>

          {/* Card 3: Policy & Concession Controls Matching Reference */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Briefcase01Icon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">Governance Controls</span>
              </div>
              <button
                type="button"
                onClick={handleRunYieldSweep}
                disabled={isRunningSweep}
                className="text-zinc-500 hover:text-zinc-900"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Control Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-800">Margin Floor (78%)</div>
                  <div className="text-[10px] text-zinc-400">Strict concession lock</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMarginGuardrailEnabled(!marginGuardrailEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    marginGuardrailEnabled ? 'bg-zinc-900' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      marginGuardrailEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    } top-0.5 absolute`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-800">Real-time Memory Indexing</div>
                  <div className="text-[10px] text-zinc-400">L1 hot cache promotion</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIndexingEnabled(!indexingEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    indexingEnabled ? 'bg-zinc-900' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      indexingEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    } top-0.5 absolute`}
                  />
                </button>
              </div>
            </div>

            {/* Minimal Dot Pagination */}
            <div className="flex justify-center space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
