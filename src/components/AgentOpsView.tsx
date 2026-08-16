import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  BotIcon, 
  CpuIcon, 
  Database01Icon, 
  Shield01Icon, 
  FlashIcon, 
  PlayIcon, 
  CheckmarkCircle02Icon, 
  ComputerTerminalIcon 
} from '@hugeicons/core-free-icons';
import { AgentExecutionLog } from '../services/ace/types';
import { ACEAgentOrchestrator } from '../services/ace/agentOrchestrator';

interface AgentOpsViewProps {
  logs: AgentExecutionLog[];
}

export const AgentOpsView: React.FC<AgentOpsViewProps> = ({ logs }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const agents = [
    {
      name: 'A.C.E Commander',
      role: 'Master Strategy Orchestration',
      status: 'Active Loop',
      icon: FlashIcon,
      color: 'border-zinc-200/80 bg-white text-zinc-900',
      description: 'Coordinates sub-agent objectives, synthesizes executive deal summaries, and enforces commercial governance.',
    },
    {
      name: 'Context & Knowledge Engine',
      role: 'Enterprise Memory & Synthesis',
      status: 'Active',
      icon: Database01Icon,
      color: 'border-zinc-200/80 bg-white text-zinc-900',
      description: 'Provides contextual grounding, historical deal precedents, and customer profile synchronization.',
    },
    {
      name: 'Pricing & Yield Optimizer',
      role: 'Elasticity & Margin Protection',
      status: 'Floor 78.0%',
      icon: CpuIcon,
      color: 'border-zinc-200/80 bg-white text-zinc-900',
      description: 'Computes real-time concession boundaries, Give-Get trade terms, and algorithmic payback models.',
    },
    {
      name: 'Deal Risk Sentry',
      role: 'Competitor Intel & Gatekeepers',
      status: 'Sentry Mode',
      icon: Shield01Icon,
      color: 'border-zinc-200/80 bg-white text-zinc-900',
      description: 'Monitors competitor pricing pressure, detects compliance gating, and suggests real-time counter-strategies.',
    },
    {
      name: 'Lead Prospector',
      role: 'Intent Signal Ingestion',
      status: 'Ingestion Mode',
      icon: BotIcon,
      color: 'border-zinc-200/80 bg-white text-zinc-900',
      description: 'Tracks hiring velocity, technology stack changes, and buying committee sentiment shifts across target accounts.',
    },
  ];

  const filteredLogs = selectedAgent === 'ALL'
    ? logs
    : logs.filter((l) => l.agentName === selectedAgent);

  const handleRunAgentAction = async (agentName: string) => {
    setIsExecuting(agentName);
    const orchestrator = ACEAgentOrchestrator.getInstance();

    if (agentName === 'Pricing & Yield Optimizer') {
      await orchestrator.executeYieldOptimizationSweep();
    } else if (agentName === 'Hydra Memory Agent') {
      await orchestrator.executeTemporalContextReindex();
    } else {
      await orchestrator.executeLeadSignalAudit();
    }

    setIsExecuting(null);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={BotIcon} className="h-5 w-5 text-zinc-800" />
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Autonomous Multi-Agent Commercial Fleet
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Coordinated multi-agent commercial system running continuous background loops over HydraDB's temporal context substrate.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          return (
            <div
              key={agent.name}
              className={`rounded-3xl border p-5 space-y-3 shadow-xs transition-all ${agent.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={agent.icon} className="h-4 w-4 text-zinc-700" />
                  <span className="font-bold text-zinc-900 text-sm">{agent.name}</span>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="text-[11px] font-semibold text-zinc-600">{agent.role}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">{agent.description}</p>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{agent.status}</span>
                <button
                  id={`btn-trigger-${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleRunAgentAction(agent.name)}
                  disabled={isExecuting === agent.name}
                  className="flex items-center space-x-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <HugeiconsIcon icon={PlayIcon} className="h-2.5 w-2.5 fill-current" />
                  <span>{isExecuting === agent.name ? 'Running...' : 'Trigger Cycle'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Execution Telemetry Terminal */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={ComputerTerminalIcon} className="h-4 w-4 text-zinc-700" />
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Agent Execution Telemetry Log</span>
          </div>

          {/* Filter Agent Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-zinc-400 font-medium mr-1">Filter:</span>
            {['ALL', 'A.C.E Commander', 'Hydra Memory Agent', 'Pricing & Yield Optimizer', 'Deal Risk Sentry', 'Lead Prospector'].map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAgent(a)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                  selectedAgent === a
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {a.replace('A.C.E ', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto scrollbar-thin font-mono text-xs">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-3.5 space-y-1 hover:border-zinc-200 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-900">{log.agentName}</span>
                  <span className="text-zinc-400">&rarr;</span>
                  <span className="text-zinc-700 font-semibold">{log.action}</span>
                </div>
                <span className="text-zinc-400 font-normal">{log.timestamp}</span>
              </div>

              <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">{log.details}</p>

              {log.temporalCommitHash && (
                <div className="pt-1 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>DAG Commit: <span className="text-zinc-700 font-semibold">{log.temporalCommitHash.substring(0, 16)}</span></span>
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" /> State Persisted
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

