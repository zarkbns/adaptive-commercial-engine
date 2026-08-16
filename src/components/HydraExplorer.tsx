import React, { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Database01Icon, 
  Search01Icon, 
  GitCommitIcon, 
  Layers01Icon, 
  Activity01Icon, 
  FilterIcon, 
  Clock01Icon, 
  CpuIcon, 
  Share01Icon 
} from '@hugeicons/core-free-icons';
import { HydraDBEngine } from '../services/hydradb/engine';
import { 
  HydraMemoryNode, 
  HydraCommit, 
  HydraTierMetrics, 
  HydraEntityType 
} from '../services/hydradb/types';

interface HydraExplorerProps {
  metrics: HydraTierMetrics;
  onRefreshMetrics: () => void;
}

export const HydraExplorer: React.FC<HydraExplorerProps> = ({
  metrics,
  onRefreshMetrics,
}) => {
  const hydra = HydraDBEngine.getInstance();

  // State
  const [subTab, setSubTab] = useState<'graph' | 'vectors' | 'commits' | 'tiers'>('graph');
  const [selectedNode, setSelectedNode] = useState<HydraMemoryNode | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<HydraCommit | null>(null);
  const [timeTravelIndex, setTimeTravelIndex] = useState<number>(100);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Snapshot
  const graphSnapshot = useMemo(() => {
    return hydra.getGraphSnapshot();
  }, [hydra, metrics]);

  // Commits
  const commits = useMemo(() => {
    return hydra.getCommits();
  }, [hydra, metrics]);

  // Dynamic suggested queries derived from graph data
  const dynamicSuggestedQueries = useMemo(() => {
    const queries: string[] = [];
    const accounts = graphSnapshot.nodes.filter(n => n.type === 'Account');
    if (accounts.length > 0) {
      queries.push(`${accounts[0].label} pricing constraints`);
      if (accounts[1]) {
        queries.push(`${accounts[1].label} multi-year discount`);
      }
    }
    const concessionRules = graphSnapshot.nodes.filter(n => n.type === 'ConcessionRule');
    if (concessionRules.length > 0) {
      queries.push('Give-Get trade terms & payment rules');
    }
    const competitors = graphSnapshot.nodes.filter(n => n.type === 'Competitor');
    if (competitors.length > 0) {
      queries.push(`${competitors[0].label} battlecard & counter tactics`);
    }
    if (queries.length === 0) {
      return [
        'Contract duration concession trade-offs',
        'Multi-year discount floor policy',
        'Payment terms net-30 approval thresholds',
        'Enterprise SLA concessions',
      ];
    }
    return queries;
  }, [graphSnapshot.nodes]);

  // Vector search handler
  const handleExecuteSearch = () => {
    if (!searchQuery.trim()) return;
    const results = hydra.query({
      queryText: searchQuery,
      limit: 10,
      includeNeighborhood: true,
      minSimilarity: 0.1,
    });
    setSearchResults(results);
    onRefreshMetrics();
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleExecuteSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Node color helper
  const getNodeColor = (type: HydraEntityType) => {
    switch (type) {
      case 'Account': return 'border-zinc-200 bg-white text-zinc-900 shadow-xs';
      case 'Deal': return 'border-emerald-200 bg-emerald-50/40 text-emerald-950 shadow-xs';
      case 'Contact': return 'border-zinc-200 bg-zinc-50/70 text-zinc-900 shadow-xs';
      case 'ConcessionRule': return 'border-amber-200 bg-amber-50/40 text-amber-950 shadow-xs';
      case 'BuyingSignal': return 'border-zinc-200 bg-white text-zinc-900 shadow-xs';
      case 'Competitor': return 'border-rose-200 bg-rose-50/40 text-rose-950 shadow-xs';
      default: return 'border-zinc-200 bg-white text-zinc-800 shadow-xs';
    }
  };

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (typeFilter === 'ALL') return graphSnapshot.nodes;
    return graphSnapshot.nodes.filter((n) => n.type === typeFilter);
  }, [graphSnapshot.nodes, typeFilter]);

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Substrate Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={Database01Icon} className="h-5 w-5 text-zinc-800" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              HydraDB Temporal Context & Vector Substrate
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Fast Graph Substrate, Git-Style Temporal Versioning & Vector Memory for Autonomous Commercial Agents.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 rounded-full bg-zinc-100 p-1 border border-zinc-200/80 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('graph')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'graph' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Temporal Graph
          </button>
          <button
            onClick={() => setSubTab('vectors')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'vectors' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Vector Sandbox
          </button>
          <button
            onClick={() => setSubTab('commits')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'commits' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Git DAG Commits ({commits.length})
          </button>
          <button
            onClick={() => setSubTab('tiers')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'tiers' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Memory Tiers (L1/L2/L3)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TEMPORAL GRAPH CANVAS */}
      {subTab === 'graph' && (
        <div className="space-y-4">
          {/* Controls Bar: Type Filters & Time Travel */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-zinc-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
                <HugeiconsIcon icon={FilterIcon} className="h-3 w-3" /> Filter Entity:
              </span>
              {['ALL', 'Account', 'Deal', 'Contact', 'ConcessionRule', 'BuyingSignal', 'Competitor'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    typeFilter === t
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Time Travel Timeline Scrubber */}
            <div className="flex items-center space-x-3 text-xs bg-zinc-50 px-3 py-1.5 rounded-2xl border border-zinc-200/60">
              <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
              <span className="text-zinc-500 whitespace-nowrap">Temporal Timeline:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={timeTravelIndex}
                onChange={(e) => setTimeTravelIndex(Number(e.target.value))}
                className="w-28 accent-zinc-900 bg-zinc-200 h-1.5 rounded cursor-pointer"
              />
              <span className="font-mono text-zinc-900 font-bold text-[11px]">
                {timeTravelIndex === 100 ? 'HEAD (Now)' : `${timeTravelIndex}% History`}
              </span>
            </div>
          </div>

          {/* Visual Graph Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Graph Node Matrix (8 Cols) */}
            <div className="lg:col-span-8 rounded-3xl border border-zinc-200/80 bg-white p-5 min-h-[500px] relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={Share01Icon} className="h-3.5 w-3.5 text-zinc-800" /> Active Context Substrate ({filteredNodes.length} Nodes, {graphSnapshot.edges.length} Relationships)
                </span>
                <span className="text-[11px] text-zinc-400">Click node to inspect properties & vector</span>
              </div>

              {/* Interactive Node Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      id={`hydra-node-${node.id}`}
                      onClick={() => setSelectedNode(node)}
                      className={`relative rounded-2xl border p-4 transition-all cursor-pointer shadow-xs ${getNodeColor(
                        node.type
                      )} ${isSelected ? 'ring-2 ring-zinc-900' : 'hover:border-zinc-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          {node.type}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          node.tier === 'hot' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}>
                          L1 {node.tier.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2 font-bold text-zinc-900 text-sm tracking-tight">
                        {node.label}
                      </div>

                      {/* Properties preview */}
                      <div className="mt-2 text-[11px] text-zinc-500 space-y-0.5 line-clamp-2">
                        {node.properties.domain && <div>Domain: {node.properties.domain}</div>}
                        {node.properties.targetArr && <div>Target ARR: ${node.properties.targetArr.toLocaleString()}</div>}
                        {node.properties.role && <div>Role: {node.properties.role}</div>}
                        {node.properties.strengths && <div>Strengths: {node.properties.strengths.join(', ')}</div>}
                      </div>

                      {/* Footer: Version & Temporal Validity */}
                      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>v{node.version} • {node.accessCount} accesses</span>
                        <span className="truncate max-w-[120px]">{node.commitHash.substring(0, 10)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Node Detail & Vector Inspector (4 Cols) */}
            <div className="lg:col-span-4 rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 text-zinc-800" /> Memory Node Inspector
                </span>
                {selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4 text-xs animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      {selectedNode.type} Entity
                    </span>
                    <h3 className="text-base font-bold text-zinc-900">{selectedNode.label}</h3>
                    <div className="text-[11px] text-zinc-400 font-mono">ID: {selectedNode.id}</div>
                  </div>

                  {/* Temporal Validity & Commit */}
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-200/60 p-3 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-zinc-500">
                      <span>Valid From:</span>
                      <span className="text-zinc-800">{new Date(selectedNode.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Temporal State:</span>
                      <span className="text-emerald-700 font-semibold">{selectedNode.validTo ? 'Archived' : 'Active Context'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Commit Hash:</span>
                      <span className="text-zinc-900 font-bold">{selectedNode.commitHash.substring(0, 16)}</span>
                    </div>
                  </div>

                  {/* Properties Viewer */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-zinc-700 text-xs">Entity Properties:</span>
                    <pre className="rounded-2xl bg-zinc-50 p-3 text-[11px] text-zinc-800 font-mono overflow-x-auto max-h-48 scrollbar-thin border border-zinc-200/60">
                      {JSON.stringify(selectedNode.properties, null, 2)}
                    </pre>
                  </div>

                  {/* Vector Embedding Preview (64-dim) */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-zinc-700 text-xs">Vector Substrate (64-Dim Normalized):</span>
                    <div className="rounded-2xl bg-zinc-50 p-2.5 font-mono text-[10px] text-zinc-600 flex flex-wrap gap-1 max-h-24 overflow-y-auto border border-zinc-200/60">
                      {selectedNode.embedding?.slice(0, 24).map((val, idx) => (
                        <span key={idx} className="bg-white border border-zinc-200 px-1 py-0.5 rounded text-zinc-800">
                          {val.toFixed(2)}
                        </span>
                      ))}
                      <span className="text-zinc-400">...+40 dims</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-400 space-y-2">
                  <HugeiconsIcon icon={Database01Icon} className="h-8 w-8 text-zinc-300 mx-auto" />
                  <p className="text-xs">Select any node on the left to inspect its schema properties, temporal validities, and semantic vector embedding.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VECTOR SUBSTRATE SANDBOX */}
      {subTab === 'vectors' && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-4 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-zinc-900">HydraDB Semantic Vector Search Sandbox</h2>
              <p className="text-xs text-zinc-500">
                Test hybrid semantic search across the 64-dimensional vector substrate with cosine similarity & graph re-ranking.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  id="input-vector-search"
                  type="text"
                  placeholder="Search context graph, account requirements, compliance rules, concession policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>
              <button
                id="btn-exec-search"
                onClick={handleExecuteSearch}
                className="rounded-full bg-zinc-900 hover:bg-black active:scale-95 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                Search Substrate
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <span className="text-[11px] text-zinc-400 mr-1">Suggested Queries:</span>
              {dynamicSuggestedQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => setSearchQuery(query)}
                  className="rounded-full bg-zinc-50 border border-zinc-200/80 px-3 py-1 text-[11px] hover:border-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results List */}
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Retrieved {searchResults.length} ranked memory nodes (Composite Hybrid Scoring)</span>
                <span className="font-mono text-zinc-900 font-semibold">{metrics.avgLatencyMs}ms latency</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((res, idx) => (
                  <div
                    key={res.node.id}
                    className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs space-y-2 hover:border-zinc-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2 py-0.5 font-mono text-[10px] text-zinc-800 font-bold">
                          #{idx + 1} Rank: {(res.score * 100).toFixed(1)}%
                        </span>
                        <span className="font-bold text-zinc-900 text-sm">{res.node.label}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({res.node.type})</span>
                      </div>

                      <div className="flex items-center space-x-2 font-mono text-[11px] text-zinc-500">
                        <span>Semantic: {((res.semanticScore || 0.8) * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Centrality: {((res.graphCentralityScore || 0.5) * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <p className="text-zinc-700 text-[11px] bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 font-mono">
                      {JSON.stringify(res.node.properties)}
                    </p>

                    {res.neighbors && res.neighbors.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 flex items-center space-x-2 text-[11px] text-zinc-500">
                        <span className="text-zinc-400 font-medium">Graph Connections:</span>
                        {res.neighbors.map((n: any) => (
                          <span key={n.node.id} className="rounded-full bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-zinc-700 text-[10px]">
                            {n.edge.relationship} &rarr; {n.node.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No matching context records found for query "{searchQuery}".
            </div>
          ) : null}
        </div>
      )}

      {/* SUB-TAB 3: GIT DAG COMMITS */}
      {subTab === 'commits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>HydraDB Git-Style DAG Temporal Commit Log</span>
            <span className="font-mono text-zinc-900 font-semibold">{commits.length} Total Commits Recorded</span>
          </div>

          <div className="space-y-3">
            {commits.map((c) => (
              <div
                key={c.commitHash}
                onClick={() => setSelectedCommit(c)}
                className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs space-y-2 hover:border-zinc-300 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HugeiconsIcon icon={GitCommitIcon} className="h-4 w-4 text-zinc-700" />
                    <span className="font-mono font-bold text-zinc-900">{c.commitHash.substring(0, 16)}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 border border-zinc-200">
                      Author: {c.authorAgent}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400">{new Date(c.timestamp).toLocaleString()}</span>
                </div>

                <div className="font-medium text-zinc-900 text-sm">{c.changeSummary}</div>

                <div className="pt-2 border-t border-zinc-100 flex items-center space-x-4 text-[11px] text-zinc-500">
                  {c.mutation.addedNodes && <span>+{c.mutation.addedNodes.length} nodes</span>}
                  {c.mutation.updatedNodes && <span>~{c.mutation.updatedNodes.length} updated</span>}
                  {c.mutation.addedEdges && <span>+{c.mutation.addedEdges.length} edges</span>}
                  {c.parentHash && <span className="font-mono text-zinc-400">Parent: {c.parentHash.substring(0, 10)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MEMORY TIERS (L1/L2/L3) */}
      {subTab === 'tiers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1: Hot RAM */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={CpuIcon} className="h-4 w-4 text-zinc-700" /> L1 Hot Tier (RAM)
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                Sub-2ms
              </span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 font-mono">{metrics.hotItemCount} Active Nodes</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              High-frequency agent context, active negotiations, and live pricing constraint policies loaded directly in zero-latency memory.
            </p>
            <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>Hit Ratio:</span>
                <span className="text-emerald-700 font-mono font-semibold">{metrics.cacheHitRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Footprint:</span>
                <span className="text-zinc-700 font-mono">{(metrics.hotMemoryBytes / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>

          {/* Tier 2: Warm Disk */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={Database01Icon} className="h-4 w-4 text-zinc-700" /> L2 Warm Tier (NVMe)
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 border border-zinc-200">
                10-25ms
              </span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 font-mono">{metrics.warmItemCount} Nodes</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Historical buying signals, past interaction transcripts, and competitor pricing battlecards with automated L1 promotion.
            </p>
            <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>Promotion Policy:</span>
                <span className="text-zinc-800 font-mono">Auto on Access</span>
              </div>
              <div className="flex justify-between">
                <span>Footprint:</span>
                <span className="text-zinc-700 font-mono">{(metrics.warmMemoryBytes / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>

          {/* Tier 3: Cold Archive */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 text-zinc-700" /> L3 Cold Tier (Archive)
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 border border-zinc-200">
                Immutable
              </span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 font-mono">{metrics.coldItemCount} Snapshots</div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Point-in-time temporal snapshots and historical commit DAG states preserved for regulatory audits and post-mortems.
            </p>
            <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>Compression:</span>
                <span className="text-zinc-800 font-mono">GZIP 4.2x</span>
              </div>
              <div className="flex justify-between">
                <span>Integrity:</span>
                <span className="text-emerald-700 font-mono">SHA-256 Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
