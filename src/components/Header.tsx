import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  FlashIcon, 
  Database01Icon, 
  SparklesIcon, 
  Analytics01Icon, 
  UserGroup02Icon, 
  BotIcon 
} from '@hugeicons/core-free-icons';
import { HydraTierMetrics } from '../services/hydradb/types';

interface HeaderProps {
  activeTab: 'command-center' | 'deal-room' | 'hydra-explorer' | 'accounts' | 'agent-ops';
  setActiveTab: (tab: 'command-center' | 'deal-room' | 'hydra-explorer' | 'accounts' | 'agent-ops') => void;
  metrics: HydraTierMetrics;
  onOpenCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onOpenCopilot,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">A.C.E</span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                v2.4 Core
              </span>
              <span className="hidden rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800/60 sm:inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Adaptive Engine Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Adaptive Commercial Engine • HydraDB Context Substrate
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80">
          <button
            id="nav-command-center"
            onClick={() => setActiveTab('command-center')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'command-center'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HugeiconsIcon icon={Analytics01Icon} className="h-3.5 w-3.5" />
            <span>Commercial Pulse</span>
          </button>

          <button
            id="nav-deal-room"
            onClick={() => setActiveTab('deal-room')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'deal-room'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-amber-400" />
            <span>Dynamic Deal Room</span>
          </button>

          <button
            id="nav-hydra-explorer"
            onClick={() => setActiveTab('hydra-explorer')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'hydra-explorer'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HugeiconsIcon icon={Database01Icon} className="h-3.5 w-3.5 text-cyan-400" />
            <span>HydraDB Graph</span>
          </button>

          <button
            id="nav-accounts"
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'accounts'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HugeiconsIcon icon={UserGroup02Icon} className="h-3.5 w-3.5 text-indigo-400" />
            <span>Buying Centers</span>
          </button>

          <button
            id="nav-agent-ops"
            onClick={() => setActiveTab('agent-ops')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'agent-ops'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HugeiconsIcon icon={BotIcon} className="h-3.5 w-3.5 text-emerald-400" />
            <span>Agentic Ops</span>
          </button>
        </nav>

        {/* Right: HydraDB Status & AI Copilot Button */}
        <div className="flex items-center space-x-2.5">
          {/* Hydra Substrate Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
            <div className="flex items-center space-x-1 text-slate-400">
              <HugeiconsIcon icon={Database01Icon} className="h-3 w-3 text-cyan-400" />
              <span>HydraDB:</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="font-mono text-cyan-300 font-semibold">{metrics.cacheHitRatio}% Hit</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-emerald-400">{metrics.avgLatencyMs}ms</span>
            </div>
          </div>

          {/* AI Copilot Trigger */}
          <button
            id="btn-open-copilot"
            onClick={onOpenCopilot}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/30"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-amber-300 animate-spin" />
            <span>A.C.E Copilot</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('command-center')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'command-center' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Pulse
        </button>
        <button
          onClick={() => setActiveTab('deal-room')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'deal-room' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Deal Room
        </button>
        <button
          onClick={() => setActiveTab('hydra-explorer')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'hydra-explorer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          HydraDB
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'accounts' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Buying Centers
        </button>
        <button
          onClick={() => setActiveTab('agent-ops')}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'agent-ops' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Agents
        </button>
      </div>
    </header>
  );
};
