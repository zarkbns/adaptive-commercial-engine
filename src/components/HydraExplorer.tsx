import React, { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Database01Icon, 
  Search01Icon, 
  Layers01Icon, 
  Activity01Icon, 
  FilterIcon, 
  Clock01Icon, 
  Share01Icon,
  SparklesIcon,
  BookOpen01Icon,
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
  const [subTab, setSubTab] = useState<'knowledge' | 'timeline' | 'semantic'>('knowledge');
  const [selectedNode, setSelectedNode] = useState<HydraMemoryNode | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Snapshot
  const graphSnapshot = useMemo(() => {
    return hydra.getGraphSnapshot();
  }, [hydra, metrics]);

  // Commits / Timeline
  const commits = useMemo(() => {
    return hydra.getCommits();
  }, [hydra, metrics]);

  // Vector search handler
  const handleExecuteSearch = () => {
    if (!searchQuery.trim()) return;
    const results = hydra.queryCache({
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

  const filteredNodes = useMemo(() => {
    return graphSnapshot.nodes.filter((node) => {
      const matchesType = typeFilter === 'ALL' || node.type === typeFilter;
      const matchesSearch =
        !searchQuery ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(node.properties).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [graphSnapshot.nodes, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Knowledge Explorer</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {filteredNodes.length} Memory Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Explore accumulated customer knowledge, learned entity context, and historical interaction memory.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full text-xs shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('knowledge')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              subTab === 'knowledge'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Knowledge Base
          </button>
          <button
            type="button"
            onClick={() => setSubTab('timeline')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              subTab === 'timeline'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Memory Timeline
          </button>
          <button
            type="button"
            onClick={() => setSubTab('semantic')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              subTab === 'semantic'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Semantic Search
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer memory by topic, account, or preference..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
          {['ALL', 'Account', 'Contact', 'Deal', 'BuyingSignal'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setTypeFilter(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                typeFilter === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'ALL' ? 'All Knowledge' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {subTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNodes.length === 0 ? (
            <div className="col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <HugeiconsIcon icon={BookOpen01Icon} className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No memory records found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No customer knowledge items match your current query.
              </p>
            </div>
          ) : (
            filteredNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer space-y-3 hover:shadow-sm ${
                  selectedNode?.id === node.id
                    ? 'border-[#966035] ring-2 ring-[#966035]/15 shadow-xs'
                    : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{node.label}</div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{node.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Version {node.version}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                  {Object.entries(node.properties).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex items-baseline justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>Last updated: {new Date(node.validFrom).toLocaleDateString()}</span>
                  <span className="font-medium text-[#966035] dark:text-amber-300">Active Knowledge</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'timeline' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Knowledge Evolution Timeline</h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {commits.map((commit) => (
              <div key={commit.commitHash} className="py-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white">{commit.changeSummary}</span>
                  <span className="text-[10px] text-zinc-400">{new Date(commit.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-zinc-500">Learned by: {commit.authorAgent}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'semantic' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Semantic Knowledge Matching</h2>
          <p className="text-xs text-zinc-500">
            Query customer memory using natural concepts, questions, or specific conversation themes.
          </p>
          {searchResults.length > 0 ? (
            <div className="space-y-3 pt-2">
              {searchResults.map((res, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">{res.node?.label}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{JSON.stringify(res.node?.properties)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-400">
              Enter a search phrase above to query customer memory semantically.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
