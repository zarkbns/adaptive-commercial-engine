import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './components/LandingPage';
import { HydraDBEngine } from './services/hydradb/engine';
import { ACEAgentOrchestrator } from './services/ace/agentOrchestrator';
import { HydraTierMetrics } from './services/hydradb/types';
import { AgentExecutionLog } from './services/ace/types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#app' || search.includes('view=app')) {
        return 'app';
      }
    }
    return 'landing';
  });

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

  const handleLaunchApp = () => {
    setCurrentView('app');
    if (typeof window !== 'undefined') {
      window.location.hash = 'app';
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onLaunchApp={handleLaunchApp} />;
  }

  return (
    <MainLayout
      metrics={metrics}
      logs={logs}
      onRefreshMetrics={refreshMetrics}
      onBackToLanding={handleBackToLanding}
    />
  );
}


