import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { HydraDBEngine } from './services/hydradb/engine';
import { ACEAgentOrchestrator } from './services/ace/agentOrchestrator';
import { HydraTierMetrics } from './services/hydradb/types';
import { AgentExecutionLog } from './services/ace/types';

export default function App() {
  const [metrics, setMetrics] = useState<HydraTierMetrics>(() => {
    return HydraDBEngine.getInstance().getMetrics();
  });

  const [logs, setLogs] = useState<AgentExecutionLog[]>(() => {
    return ACEAgentOrchestrator.getInstance().getLogs();
  });

  const refreshMetrics = () => {
    setMetrics(HydraDBEngine.getInstance().getMetrics());
  };

  useEffect(() => {
    const unsubscribe = ACEAgentOrchestrator.getInstance().subscribe((newLogs) => {
      setLogs(newLogs);
      setMetrics(HydraDBEngine.getInstance().getMetrics());
    });
    return () => unsubscribe();
  }, []);

  return (
    <MainLayout
      metrics={metrics}
      logs={logs}
      onRefreshMetrics={refreshMetrics}
    />
  );
}

