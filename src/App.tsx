import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './components/LandingPage';
import { HydraDBEngine } from './services/hydradb/engine';
import { ACEAgentOrchestrator } from './services/ace/agentOrchestrator';
import { HydraTierMetrics } from './services/hydradb/types';
import { AgentExecutionLog } from './services/ace/types';
import { AuthService, UserSession } from './services/authService';

type RoutePath = '/' | '/dashboard';

function parseCurrentRoute(): RoutePath {
  if (typeof window === 'undefined') return '/';
  
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase();
  
  if (path === '/dashboard' || hash === '#/dashboard' || hash === '#dashboard' || hash === '#app') {
    return '/dashboard';
  }
  return '/';
}

export default function App() {
  const [session, setSession] = useState<UserSession>(() => {
    return AuthService.getInstance().getSession();
  });

  const [route, setRoute] = useState<RoutePath>(() => {
    const requested = parseCurrentRoute();
    const currentSession = AuthService.getInstance().getSession();
    
    // Guard: if accessing /dashboard while not authenticated, redirect to /
    if (requested === '/dashboard' && !currentSession.isAuthenticated) {
      if (typeof window !== 'undefined') {
        if (window.location.pathname === '/dashboard') {
          window.history.replaceState(null, '', '/');
        } else if (window.location.hash) {
          window.location.hash = '';
        }
      }
      return '/';
    }
    return requested;
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

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribeAuth = AuthService.getInstance().subscribe((newSession) => {
      setSession(newSession);
      if (!newSession.isAuthenticated) {
        setRoute('/');
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '/');
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to browser popstate and hashchange for forward/back button routing
  useEffect(() => {
    const handleLocationChange = () => {
      const targetRoute = parseCurrentRoute();
      const currentSession = AuthService.getInstance().getSession();

      if (targetRoute === '/dashboard' && !currentSession.isAuthenticated) {
        setRoute('/');
        window.history.replaceState(null, '', '/');
      } else {
        setRoute(targetRoute);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Subscribe to agent orchestrator logs
  useEffect(() => {
    const unsubscribeOrchestrator = ACEAgentOrchestrator.getInstance().subscribe((newLogs) => {
      setLogs(newLogs);
      setMetrics(HydraDBEngine.getInstance().getMetrics());
    });
    return () => unsubscribeOrchestrator();
  }, []);

  const navigateTo = (targetRoute: RoutePath) => {
    const currentSession = AuthService.getInstance().getSession();
    if (targetRoute === '/dashboard' && !currentSession.isAuthenticated) {
      // Sign in temporary user
      AuthService.getInstance().signIn();
    }
    
    setRoute(targetRoute);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', targetRoute);
      } catch {
        // Fallback for sandboxes that restrict pushState
        window.location.hash = targetRoute === '/dashboard' ? '#/dashboard' : '';
      }
    }
  };

  const handleLaunchApp = () => {
    if (!session.isAuthenticated) {
      AuthService.getInstance().signIn();
    }
    navigateTo('/dashboard');
  };

  const handleBackToLanding = () => {
    navigateTo('/');
  };

  const handleSignOut = () => {
    AuthService.getInstance().signOut();
    navigateTo('/');
  };

  if (route === '/dashboard' && session.isAuthenticated) {
    return (
      <MainLayout
        metrics={metrics}
        logs={logs}
        onRefreshMetrics={refreshMetrics}
        onBackToLanding={handleBackToLanding}
        onSignOut={handleSignOut}
        session={session}
      />
    );
  }

  return (
    <LandingPage
      onLaunchApp={handleLaunchApp}
      session={session}
      onSignOut={handleSignOut}
    />
  );
}
