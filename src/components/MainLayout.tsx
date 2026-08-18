import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  SlidersHorizontalIcon,
  Location01Icon,
  Calendar01Icon,
  Link01Icon,
  Settings01Icon,
  PlusSignIcon,
  Mail01Icon,
  StarIcon,
  Clock01Icon,
  Navigation01Icon,
  File01Icon,
  UserIcon,
  ArrowUpRight01Icon,
  Briefcase01Icon,
  Mic01Icon,
  ArrowUp01Icon,
  Layout01Icon,
  FlashIcon,
  Building01Icon,
  SparklesIcon,
  Database01Icon,
  UserGroup02Icon,
  BotIcon,
  CheckmarkCircle02Icon,
  TradeUpIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { HydraTierMetrics } from '../services/hydradb/types';
import { AgentExecutionLog } from '../services/ace/types';
import { UserSession } from '../services/authService';
import { CommandCenter } from './CommandCenter';
import { DealRoom } from './DealRoom';
import { AccountIntelligenceView } from './AccountIntelligenceView';
import { HydraExplorer } from './HydraExplorer';
import { AgentOpsView } from './AgentOpsView';
import { AICopilotDrawer } from './AICopilotDrawer';
import { HydraDBEngine } from '../services/hydradb/engine';
import { getAccountIntelligenceList } from '../services/ace/prospectorEngine';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';

interface MainLayoutProps {
  metrics?: HydraTierMetrics;
  logs?: AgentExecutionLog[];
  onRefreshMetrics?: () => void;
  onBackToLanding?: () => void;
  onSignOut?: () => void;
  session?: UserSession;
}

type NavTab = 'command-center' | 'deal-room' | 'accounts' | 'hydra-explorer' | 'agent-ops';

export const MainLayout: React.FC<MainLayoutProps> = ({
  metrics = { hotNodesCount: 12, warmNodesCount: 48, coldNodesCount: 150, avgLatencyMs: 1.8, cacheHitRatio: 98.4, totalQueriesServed: 1240 },
  logs = [],
  onRefreshMetrics = () => {},
  onBackToLanding,
  onSignOut,
  session,
}) => {
  // Navigation & interaction states
  const [activeNav, setActiveNav] = useState<NavTab>('command-center');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_apex_logistics');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Search & bottom input dock states
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Right sidebar interactive toggle states
  const [marginFloorToggle, setMarginFloorToggle] = useState(true);
  const [giveGetToggle, setGiveGetToggle] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Dynamic context retrieval from HydraDB & prospector engine
  const accounts = useMemo(() => getAccountIntelligenceList(), []);
  
  const hydraSnapshot = useMemo(() => {
    try {
      return HydraDBEngine.getInstance().getGraphSnapshot();
    } catch {
      return { nodes: [], edges: [] };
    }
  }, [metrics]);

  const activeAccount = useMemo(() => {
    const found = accounts.find((a) => a.id === selectedAccountId);
    if (found) return found;
    return accounts[0] || null;
  }, [accounts, selectedAccountId]);

  // Feed items derived dynamically from HydraDB nodes and relations
  const feedItems = useMemo(() => {
    const items: any[] = [];
    const nodes = hydraSnapshot.nodes || [];

    // 1. Account nodes
    const accountNodes = nodes.filter((n) => n.type === 'Account');
    accountNodes.forEach((acc, index) => {
      items.push({
        id: acc.id,
        type: 'featured_account',
        title: acc.label,
        subtitle: `${acc.properties?.industry || 'Enterprise'} • $${((acc.properties?.targetArr || 400000) / 1000).toFixed(0)}k ARR`,
        time: acc.properties?.currentStage || 'Active Deal',
        badge: `${acc.properties?.dealHealthScore || acc.properties?.intentScore || 90}% Intent`,
        tag: acc.tags?.[0] || 'Enterprise Tier',
        isFeatured: index === 0,
      });
    });

    // 2. Contact / Champion nodes
    const contactNodes = nodes.filter((n) => n.type === 'Contact');
    contactNodes.forEach((c) => {
      items.push({
        id: c.id,
        type: 'contact',
        title: `${c.label} • ${c.properties?.role || 'Stakeholder'}`,
        subtitle: `${c.properties?.sentiment || 'Neutral'} Sentiment • Influence ${c.properties?.influenceScore || 0.8}`,
        time: 'Active Contact',
        badge: c.properties?.role?.includes('Champion') ? 'Champion' : 'Stakeholder',
        tag: 'Buying Committee',
        isFeatured: false,
      });
    });

    // 3. BuyingSignal nodes
    const signalNodes = nodes.filter((n) => n.type === 'BuyingSignal');
    signalNodes.forEach((s) => {
      items.push({
        id: s.id,
        type: 'signal',
        title: s.label,
        subtitle: `Confidence: ${((s.properties?.confidence || 0.9) * 100).toFixed(0)}%`,
        time: 'Signal',
        badge: 'High Intent',
        tag: s.tags?.[0] || 'Buying Signal',
        isFeatured: false,
      });
    });

    // 4. Deal nodes
    const dealNodes = nodes.filter((n) => n.type === 'Deal');
    dealNodes.forEach((d) => {
      items.push({
        id: d.id,
        type: 'deal',
        title: d.label,
        subtitle: `Target ARR: $${((d.properties?.targetArr || 0) / 1000).toFixed(0)}k • Margin ${d.properties?.grossMarginExpectedPct || 82}%`,
        time: 'Contract',
        badge: 'In Review',
        tag: 'Deal Term',
        isFeatured: false,
      });
    });

    // 5. ConcessionRule / PricingConstraint nodes
    const ruleNodes = nodes.filter((n) => n.type === 'ConcessionRule' || n.type === 'PricingConstraint');
    ruleNodes.forEach((r) => {
      items.push({
        id: r.id,
        type: 'rule',
        title: r.label,
        subtitle: r.properties?.rule || 'Gross margin floor enforced at 78.0%',
        time: 'Live Policy',
        badge: '78% Floor',
        tag: 'Pricing Policy',
        isFeatured: false,
      });
    });

    return items.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      );
    });
  }, [hydraSnapshot, searchQuery]);

  const handleSelectFeedItem = (item: any) => {
    if (item.type === 'featured_account' || item.id.startsWith('acc_')) {
      setSelectedAccountId(item.id);
      setActiveNav('accounts');
    } else if (item.type === 'deal') {
      setSelectedDealId(item.id);
      setActiveNav('deal-room');
    } else if (item.type === 'contact') {
      setActiveNav('accounts');
    } else if (item.type === 'rule' || item.type === 'signal') {
      setActiveNav('command-center');
    }
  };

  const handleBottomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsCopilotOpen(true);
    setInputValue('');
  };

  const handleExecuteNBAAction = () => {
    if (!activeAccount) return;
    ACEAgentOrchestrator.getInstance().addLog({
      agentName: 'ace Commander',
      action: `Executed NBA: ${activeAccount.nextBestAction.action}`,
      status: 'SUCCESS',
      details: `Dispatched via ${activeAccount.nextBestAction.suggestedChannel} for ${activeAccount.name}.`,
    });
    setActionSuccessMsg('Action executed successfully.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-zinc-900 font-sans antialiased p-3 sm:p-5 lg:p-6 flex flex-col justify-between selection:bg-zinc-200">
      {/* 1. TOP BAR */}
      <header className="w-full mb-4 flex items-center justify-between gap-4">
        {/* Left Side: ace Logo Box + Search Bar Pill */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          {/* Top Left Brand Box: Exact ace Logo Asset (FlashIcon in Squircle) */}
          <button
            type="button"
            onClick={onBackToLanding}
            title="ace Commercial Engine • Return to Overview"
            className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs hover:bg-black transition-all cursor-pointer shrink-0 active:scale-95 group"
          >
            <HugeiconsIcon icon={FlashIcon} className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
          </button>

          {/* Search Bar Pill with Filter Toggle */}
          <div className="flex-1 h-11 bg-white rounded-full border border-zinc-200/80 px-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 flex-1">
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts, deals, or signals..."
                className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none placeholder:text-zinc-400"
              />
              {!searchQuery && (
                <div className="hidden sm:block h-2 w-20 bg-zinc-100 rounded-full shrink-0 pointer-events-none" />
              )}
            </div>
            <button
              type="button"
              title="Filter"
              className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Copilot Action Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            id="btn-open-copilot-top"
            onClick={() => setIsCopilotOpen(true)}
            title="Open Copilot"
            className="h-10 px-4 rounded-full bg-black text-white flex items-center space-x-2 hover:bg-zinc-800 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-white animate-pulse" />
            <span className="text-xs font-semibold tracking-tight hidden sm:inline">Copilot</span>
          </button>
        </div>
      </header>

      {/* 2. THREE-COLUMN WORKSPACE LAYOUT */}
      <div className="flex-1 flex gap-4 lg:gap-5 w-full items-stretch overflow-hidden">
        {/* ==================================================================== */}
        {/* COLUMN 1: LEFT SIDEBAR (Navigation Rail + Feed Sub-list)             */}
        {/* ==================================================================== */}
        <div className="flex gap-3 sm:gap-4 shrink-0">
          {/* Narrow Navigation Rail */}
          <aside className="w-12 sm:w-14 shrink-0 flex flex-col items-center justify-between py-1 bg-transparent">
            {/* Top Navigation Stack */}
            <div className="flex flex-col items-center space-y-3.5 w-full">
              {/* 1. Overview */}
              <button
                type="button"
                id="nav-commercial-pulse"
                onClick={() => setActiveNav('command-center')}
                title="Overview"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === 'command-center'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
              </button>

              {/* 2. Deals */}
              <button
                type="button"
                id="nav-deal-room-rail"
                onClick={() => setActiveNav('deal-room')}
                title="Deals"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === 'deal-room'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
              </button>

              {/* 3. Accounts */}
              <button
                type="button"
                id="nav-buying-centers-rail"
                onClick={() => setActiveNav('accounts')}
                title="Accounts & Stakeholders"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === 'accounts'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <HugeiconsIcon icon={Navigation01Icon} className="h-4 w-4 transform rotate-45" />
              </button>

              {/* 4. Data Graph */}
              <button
                type="button"
                id="nav-hydradb-rail"
                onClick={() => setActiveNav('hydra-explorer')}
                title="Data Graph"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === 'hydra-explorer'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
              </button>

              {/* 5. Activity */}
              <button
                type="button"
                id="nav-agentops-rail"
                onClick={() => setActiveNav('agent-ops')}
                title="Activity"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === 'agent-ops'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Profile Button with Dropdown Menu */}
            <div className="w-full flex justify-center pt-4 relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="User & Operator Profile"
                className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
              >
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              </button>

              {/* User Profile Popover */}
              {isProfileMenuOpen && (
                <div className="absolute left-14 bottom-0 z-50 w-56 rounded-2xl bg-white border border-zinc-200 shadow-xl p-3 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {session?.avatar || 'CO'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {session?.name || 'Commercial Operator'}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {session?.role || 'RevOps Director'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNav('accounts');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                    >
                      <HugeiconsIcon icon={UserIcon} className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Buying Centers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onBackToLanding) onBackToLanding();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                    >
                      <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Public Landing Page</span>
                    </button>

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-zinc-100 pt-2 mt-1 font-semibold"
                      >
                        <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Left Feed Cards Sub-list */}
          <section className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col gap-3.5 overflow-y-auto pr-0.5 scrollbar-thin">
            {feedItems.map((item, idx) => {
              if (item.isFeatured) {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFeedItem(item)}
                    className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    {/* Header: Avatar + Title & Subtitle */}
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {item.title[0]}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate group-hover:text-black">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{item.subtitle}</div>
                      </div>
                    </div>

                    {/* Featured Image Box with Landscape Graphic (Matching Reference) */}
                    <div className="w-full h-32 rounded-2xl bg-zinc-100/90 border border-zinc-200/60 relative overflow-hidden flex items-end justify-center p-3">
                      <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-zinc-300/80" />
                      <svg className="w-full h-16 text-zinc-200/90" viewBox="0 0 200 80" fill="currentColor">
                        <polygon points="20,80 80,30 140,80" />
                        <polygon points="90,80 150,20 210,80" />
                      </svg>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white/90 rounded-full text-zinc-800 border border-zinc-200 shadow-xs">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFeedItem(item)}
                  className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-2 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center text-xs font-semibold shrink-0">
                      {item.title[0]}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-zinc-900 truncate group-hover:text-black">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">{item.time}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 2: LARGE CENTRAL WORKSPACE                                   */}
        {/* ==================================================================== */}
        <main className="flex-1 min-w-0 bg-white rounded-[32px] border border-zinc-200/80 shadow-xs flex flex-col justify-between p-5 sm:p-7 relative overflow-hidden">
          {/* Scrollable Center Body Area */}
          <div className="w-full flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin">
            {/* View Switcher Routing */}
            {activeNav === 'command-center' && (
              <CommandCenter
                metrics={metrics}
                logs={logs}
                onSelectDeal={(dealId) => {
                  setSelectedDealId(dealId);
                  setActiveNav('deal-room');
                }}
                onOpenHydra={() => setActiveNav('hydra-explorer')}
              />
            )}

            {activeNav === 'deal-room' && (
              <DealRoom
                initialDealId={selectedDealId}
                onOpenHydra={() => setActiveNav('hydra-explorer')}
              />
            )}

            {activeNav === 'accounts' && (
              <AccountIntelligenceView
                onOpenDealRoom={(dealId) => {
                  setSelectedDealId(dealId);
                  setActiveNav('deal-room');
                }}
              />
            )}

            {activeNav === 'hydra-explorer' && (
              <HydraExplorer
                metrics={metrics}
                onRefreshMetrics={onRefreshMetrics}
              />
            )}

            {activeNav === 'agent-ops' && (
              <AgentOpsView logs={logs} />
            )}
          </div>

          {/* Central Bottom Action & Input Dock (Matching Reference Structure) */}
          <div className="w-full pt-3 border-t border-zinc-100 shrink-0">
            <form
              onSubmit={handleBottomInputSubmit}
              className="w-full bg-[#f4f5f7] rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex items-center justify-between gap-3 border border-zinc-200/60 shadow-inner"
            >
              {/* Left Action Chips */}
              <div className="hidden sm:flex items-center space-x-1.5 pl-1.5">
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-medium text-zinc-600 border border-zinc-200 shadow-xs hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Give-Get Rules
                </button>
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-medium text-zinc-600 border border-zinc-200 shadow-xs hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Margin Floor
                </button>
              </div>

              {/* Center Input Area */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about deals, accounts, or pricing..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-800 focus:outline-none px-2 placeholder:text-zinc-400"
              />

              {/* Right Side: Microphone + Black Submit Button */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  title="Voice input"
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Mic01Icon} className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  title="Send to Copilot"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 stroke-2" />
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* ==================================================================== */}
        {/* COLUMN 3: RIGHT CONTEXTUAL SIDEBAR (PERMANENT DESKTOP COLUMN)        */}
        {/* ==================================================================== */}
        <section className="hidden xl:flex w-72 lg:w-80 shrink-0 flex-col gap-4 overflow-y-auto pl-0.5 scrollbar-thin">
          {/* Card 1 (Top): Account & Commercial Overview */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
            {/* Header: Layout / Grid Icon + Popout Arrow */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Layout01Icon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">
                  {activeAccount ? activeAccount.name : 'Account Summary'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveNav('command-center')}
                title="View full dashboard"
                className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Two Side-by-Side Preview Blocks (Matching Reference Layout) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Left Preview Block: Target ARR */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Target ARR</div>
                <div className="text-base font-bold text-zinc-900">
                  ${((activeAccount?.potentialArr || activeAccount?.activeArr || 400000)).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <HugeiconsIcon icon={TradeUpIcon} className="h-2.5 w-2.5" />
                  +18.4% vs List
                </div>
              </div>

              {/* Right Preview Block: Gross Margin */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Gross Margin</div>
                <div className="text-base font-bold text-zinc-900">82.5%</div>
                <div className="text-[10px] text-zinc-500 font-medium">Floor 78.0% Active</div>
              </div>
            </div>

            {/* Account Status Pill */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-zinc-500">Buying Intent</span>
              <span className="font-semibold text-zinc-900">{activeAccount?.intentScore || 90}% Score</span>
            </div>

            {/* Bottom Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>

          {/* Card 2 (Middle): Activity / Calendar & Deal Timeline */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
            {/* Header: Calendar Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">Upcoming Activity</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                Next 48h
              </span>
            </div>

            {/* Wide Meeting / Milestone Banner Block */}
            <div className="w-full p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1">
              <div className="text-xs font-semibold text-zinc-900">Executive Pricing Review</div>
              <div className="text-[11px] text-zinc-500 leading-tight">
                Reviewing 36-mo Give-Get concession package with C-suite stakeholders.
              </div>
            </div>

            {/* Bottom Row: Timestamp + Attendee Stakeholder Avatars */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400 font-medium">Tomorrow, 10:00 AM</span>
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                  SC
                </div>
                <div className="w-6 h-6 rounded-full bg-zinc-600 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                  MV
                </div>
                <div className="w-6 h-6 rounded-full bg-zinc-400 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                  +2
                </div>
              </div>
            </div>

            {/* Bottom Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>

          {/* Card 3 (Bottom): Commercial Guardrails & Controls */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
            {/* Header: Briefcase Icon + Plus Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Briefcase01Icon} className="h-4 w-4 text-zinc-700" />
                <span className="text-xs font-bold text-zinc-900">Pricing Rules</span>
              </div>
              <button
                type="button"
                onClick={handleExecuteNBAAction}
                title="Run recommendation"
                className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
              </button>
            </div>

            {/* Row 1: Margin Floor Guardrail Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setMarginFloorToggle(!marginFloorToggle)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    marginFloorToggle ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      marginFloorToggle ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-zinc-800">78% Margin Floor</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {marginFloorToggle ? 'Enforced' : 'Off'}
              </span>
            </div>

            {/* Row 2: Give-Get Concession Rule Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setGiveGetToggle(!giveGetToggle)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    giveGetToggle ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      giveGetToggle ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-zinc-800">Give-Get Policy</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                {giveGetToggle ? 'Multi-Year' : 'Flexible'}
              </span>
            </div>

            {/* Next Best Action Trigger Feedback */}
            {actionSuccessMsg && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Bottom Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>
        </section>
      </div>

      {/* Slide-over Copilot Drawer (Does NOT destroy 3-column layout) */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
