import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlashIcon,
  SlidersHorizontalIcon,
  PlusSignIcon,
  Mic01Icon,
  ArrowUp01Icon,
  Layers01Icon,
  Analytics01Icon,
  UserGroup02Icon,
  ComputerTerminalIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Share01Icon,
  Shield01Icon,
  Database01Icon,
  Link01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeTab, setActiveTab] = useState<'client-portal' | 'kpi-tracking' | 'workflow-automation' | 'team-management'>('workflow-automation');
  const [inputValue, setInputValue] = useState('');
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const tabs = [
    {
      id: 'client-portal' as const,
      label: 'Client portal',
      icon: ComputerTerminalIcon,
      title: 'Real-Time Buying Center Intelligence',
      description: 'Map economic buyers, champions, and gatekeepers automatically with sentiment tracking and live signal ingestion.',
      highlights: ['Automated buying committee mapping', 'Dynamic stakeholder sentiment scoring', 'Interactive Deal Room portal access'],
    },
    {
      id: 'kpi-tracking' as const,
      label: 'KPI tracking',
      icon: Analytics01Icon,
      title: 'Margin Protection & Elasticity Modeling',
      description: 'Continuous yield optimization sweeps that protect ARR floors while optimizing Give-Get commercial trade terms.',
      highlights: ['Dynamic gross margin guardrails', 'Algorithmic payback & discount floors', 'Real-time concession velocity metrics'],
    },
    {
      id: 'workflow-automation' as const,
      label: 'Workflow automation',
      icon: Layers01Icon,
      title: 'Autonomous Multi-Agent Orchestration',
      description: 'A coordinated fleet of specialized AI agents continuously evaluating contract drafts, competitor tactics, and pipeline risks.',
      highlights: ['Grounded execution over HydraDB memory', 'Sub-2ms temporal context retrieval', 'Automated trigger cycles & DAG commits'],
    },
    {
      id: 'team-management' as const,
      label: 'Team management',
      icon: UserGroup02Icon,
      title: 'Cross-Functional Commercial Alignment',
      description: 'Keep Sales, Legal, RevOps, and Executive leadership perfectly synchronized on critical deal milestones and approvals.',
      highlights: ['Role-based commercial governance', 'Single pane for concession approvals', 'Instant sync across Slack, Calendar & Drive'],
    },
  ];

  const currentTabContent = tabs.find((t) => t.id === activeTab) || tabs[2];

  const integrations = [
    {
      id: 'figma',
      name: 'Figma',
      badge: 'Red dot',
      status: 'Design Specs Synced',
      details: 'Product tiering & feature matrix integration',
      x: '14%',
      y: '32%',
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      iconText: '31',
      badge: 'Red tab',
      status: '12 Deal Meetings',
      details: 'Buying committee attendance & temporal scheduling',
      x: '28%',
      y: '16%',
    },
    {
      id: 'slack',
      name: 'Slack',
      badge: 'Red tab',
      status: 'Live Signals',
      details: 'Real-time pricing approvals & concession chatter',
      x: '56%',
      y: '18%',
    },
    {
      id: 'meet',
      name: 'Google Meet',
      badge: null,
      status: 'Call Recording Active',
      details: 'Autonomous transcript summarization & sentiment feed',
      x: '78%',
      y: '22%',
    },
    {
      id: 'miro',
      name: 'Miro',
      badge: 'Red dot + Sync',
      status: 'Org Mapping Live',
      details: 'Visual stakeholder influence matrix graph',
      x: '90%',
      y: '48%',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      badge: 'Link Pill',
      status: 'Contracts Synced',
      details: 'Master Service Agreements & Redline extraction',
      x: '26%',
      y: '72%',
    },
    {
      id: 'messages',
      name: 'Messages',
      badge: 'Red tab',
      status: 'Buyer SMS Feed',
      details: 'Direct executive buyer communication stream',
      x: '54%',
      y: '68%',
    },
    {
      id: 'notion',
      name: 'Notion',
      iconText: 'N',
      badge: 'Bell Pill',
      status: 'Playbooks Active',
      details: 'Battlecard knowledge base & pricing policy sync',
      x: '78%',
      y: '76%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans antialiased selection:bg-zinc-200">
      {/* 1. TOP BAR NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-[#f8f9fa]/90 backdrop-blur-md border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <HugeiconsIcon icon={FlashIcon} className="h-4.5 w-4.5 fill-current" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-zinc-900">A.C.E</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600">
                Commercial Engine
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-zinc-600">
            <a href="#hero-dock" className="hover:text-zinc-900 transition-colors">Overview</a>
            <a href="#high-performance" className="hover:text-zinc-900 transition-colors">High Performance</a>
            <a href="#integrations" className="hover:text-zinc-900 transition-colors">Integrations</a>
            <a href="#ecosystem" className="hover:text-zinc-900 transition-colors">Substrate</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLaunchApp}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              id="btn-launch-app-top"
              className="flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>Launch App</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH FANNED CARD DOCK (REFERENCE IMAGE 1) */}
      <section id="hero-dock" className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-[11px] font-medium text-zinc-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Commercial Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            Adaptive Commercial Execution for Enterprise
          </h1>

          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Unify buying centers, enforce margin guardrails, and execute deal-winning negotiation strategies with adaptive enterprise intelligence.
          </p>
        </div>

        {/* HERO VISUAL: 5 FANNED CARDS + PILL COMMAND DOCK (IMAGE 1 REPRODUCTION) */}
        <div className="max-w-4xl mx-auto relative pt-12">
          {/* Fanned Layered Cards Rising Behind the Bar */}
          <div className="relative h-44 sm:h-52 w-full flex items-end justify-center mb-[-28px] z-10 pointer-events-none select-none">
            {/* Card 1 (Far Left, Tilted -10deg) */}
            <div className="w-36 sm:w-44 h-40 sm:h-48 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 shadow-md transform -rotate-12 translate-y-3 -mr-6 sm:-mr-8 p-4 flex flex-col justify-between opacity-95 transition-transform hover:-translate-y-2">
              <div className="flex items-center space-x-1 opacity-20">
                <div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-sm" />
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-900" />
                <div className="w-3.5 h-3.5 rotate-45 border-2 border-zinc-900" />
              </div>
              <div className="space-y-1.5 opacity-30">
                <div className="h-2 bg-zinc-400 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-300 rounded-full w-1/2" />
              </div>
            </div>

            {/* Card 2 (Left Center, Tilted -5deg with Amber/Yellow Tab) */}
            <div className="w-36 sm:w-44 h-44 sm:h-52 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 shadow-lg transform -rotate-6 translate-y-1 -mr-4 sm:-mr-6 overflow-hidden flex flex-col opacity-98 transition-transform hover:-translate-y-2">
              {/* Yellow / Amber Header Tab */}
              <div className="h-10 sm:h-12 bg-[#fbbf24] w-full rounded-t-2xl sm:rounded-t-3xl" />
              <div className="p-3 sm:p-4 space-y-2 flex-1">
                <div className="h-1.5 bg-zinc-200 rounded-full w-full" />
                <div className="h-1.5 bg-zinc-200 rounded-full w-full" />
                <div className="h-1.5 bg-zinc-200 rounded-full w-4/5" />
                <div className="h-1.5 bg-zinc-200 rounded-full w-3/5" />
              </div>
            </div>

            {/* Card 3 (Center, Coral / Red Tab) */}
            <div className="w-38 sm:w-48 h-48 sm:h-56 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 shadow-xl transform rotate-0 z-20 overflow-hidden flex flex-col transition-transform hover:-translate-y-2">
              {/* Coral / Red Header Tab */}
              <div className="h-9 sm:h-11 bg-[#f43f5e] w-full rounded-t-2xl sm:rounded-t-3xl" />
              <div className="p-3 sm:p-4 space-y-2.5 flex-1 bg-white">
                <div className="h-2 bg-zinc-200 rounded-full w-3/4" />
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="h-5 bg-zinc-100 rounded-md" />
                  <div className="h-5 bg-zinc-100 rounded-md" />
                  <div className="h-5 bg-zinc-100 rounded-md" />
                </div>
              </div>
            </div>

            {/* Card 4 (Right Center, Tilted +5deg with Recording Mic Visual) */}
            <div className="w-36 sm:w-44 h-44 sm:h-52 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 shadow-lg transform rotate-6 translate-y-1 -ml-4 sm:-ml-6 flex flex-col items-center justify-center p-4 opacity-98 transition-transform hover:-translate-y-2">
              {/* Concentric Microphone / Recording Target */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-100/80 flex items-center justify-center shadow-inner relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xs flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#ef4444] shadow-xs" />
                </div>
              </div>
            </div>

            {/* Card 5 (Far Right, Tilted +10deg with Blue Dogear Corner) */}
            <div className="w-36 sm:w-44 h-40 sm:h-48 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 shadow-md transform rotate-12 translate-y-3 -ml-6 sm:-ml-8 p-4 flex flex-col justify-between relative overflow-hidden opacity-95 transition-transform hover:-translate-y-2">
              {/* Blue Folded Dogear Corner */}
              <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10">
                <div className="w-0 h-0 border-t-[32px] sm:border-t-[40px] border-t-[#3b82f6] border-l-[32px] sm:border-l-[40px] border-l-transparent rounded-bl-lg" />
              </div>
              <div className="pt-2 space-y-2 opacity-50">
                <div className="h-3 bg-zinc-200 rounded-md w-1/3" />
                <div className="h-3 bg-zinc-200 rounded-md w-2/3" />
                <div className="h-3 bg-zinc-200 rounded-md w-1/2" />
              </div>
              <div className="h-2 bg-zinc-200 rounded-full w-3/4 opacity-40" />
            </div>
          </div>

          {/* MAIN PILL COMMAND BAR DOCK (IMAGE 1 REPRODUCTION) */}
          <div className="relative z-30 flex items-center justify-center gap-2 sm:gap-3 px-2">
            {/* Left Pill Selector [Icon + Dropdown Chevron] */}
            <div className="h-12 sm:h-14 px-3 sm:px-4 rounded-full bg-[#e9ecef]/80 sm:bg-white sm:border sm:border-zinc-200/80 shadow-xs flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors shrink-0">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              </div>
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Center Main Rounded Pill Input Bar */}
            <div className="flex-1 max-w-2xl h-12 sm:h-14 rounded-full bg-white border border-zinc-200/90 shadow-lg px-4 sm:px-6 flex items-center justify-between">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask A.C.E or generate strategy..."
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none pr-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onLaunchApp();
                  }
                }}
              />

              {/* Right Inside Action Icons */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 text-zinc-400 shrink-0">
                <button
                  type="button"
                  title="Concession parameters"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Add context document"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Voice dictation"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Mic01Icon} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Far Right Submit Button (Circular Up Arrow) */}
            <button
              onClick={onLaunchApp}
              title="Execute in Copilot"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-zinc-200/90 shadow-md flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5 stroke-2" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. "BUILT FOR HIGH PERFORMANCE" SECTION (REFERENCE IMAGE 2) */}
      <section id="high-performance" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header (Image 2 Exact Framing) */}
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Built for high performance
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            ACE gives your team everything it needs to stay aligned, track performance, and scale with confidence — all in one place.
          </p>
        </div>

        {/* Segmented Control Pill Container (Image 2 Reproduction) */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap items-center justify-center rounded-full bg-[#f2eee7] p-1.5 border border-[#e5dfd5] shadow-2xs gap-1">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <HugeiconsIcon icon={tab.icon} className={`h-4 w-4 ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Display Container (Image 2 Reproduction) */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 backdrop-blur-xs p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Tilted Minimal UI Card Preview Inside Soft Beige Canvas */}
            <div className="lg:col-span-6 rounded-3xl bg-[#f5f1ea] p-6 sm:p-10 flex items-center justify-center min-h-[360px] sm:min-h-[420px] relative overflow-hidden">
              {/* Background Dashed Wireframe Layer */}
              <div className="absolute w-[80%] h-[80%] rounded-3xl border-2 border-dashed border-[#dcd6cb] transform -rotate-3" />

              {/* Foreground Tilted Crisp White UI Card */}
              <div className="relative z-10 w-[88%] bg-white rounded-2xl p-5 shadow-lg border border-zinc-200/80 transform rotate-2 space-y-4">
                {/* Top header bar */}
                <div className="h-5 w-24 bg-[#e8e4dc] rounded-full" />

                {/* Main preview box */}
                <div className="h-32 sm:h-36 w-full bg-[#e8e4dc] rounded-xl flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <HugeiconsIcon icon={currentTabContent.icon} className="h-6 w-6 text-zinc-500" />
                  </div>
                </div>

                {/* Skeleton preview lines */}
                <div className="space-y-2 pt-1">
                  <div className="h-2.5 bg-[#f0ece5] rounded-full w-4/5" />
                  <div className="h-2.5 bg-[#f0ece5] rounded-full w-3/5" />
                </div>

                {/* Bottom Action Row: 3 Avatar Dots + Button Pill */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#e8e4dc]" />
                    <div className="w-5 h-5 rounded-full bg-[#e8e4dc]" />
                    <div className="w-5 h-5 rounded-full bg-[#e8e4dc]" />
                  </div>
                  <div className="h-5 w-16 bg-[#e8e4dc] rounded-full" />
                </div>
              </div>
            </div>

            {/* Right Column: Structured Editorial Content & Minimal Skeleton Accents */}
            <div className="lg:col-span-6 space-y-6">
              {/* Sub-badge pill matching Image 2 */}
              <div className="h-4 w-20 bg-[#e8e4dc] rounded-full" />

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {currentTabContent.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {currentTabContent.description}
                </p>
              </div>

              {/* Minimal Line Skeleton Block (Image 2 right-side framing) */}
              <div className="space-y-2 py-2">
                <div className="h-3 bg-[#e8e4dc] rounded-full w-full" />
                <div className="h-3 bg-[#f0ece5] rounded-full w-5/6" />
                <div className="h-3 bg-[#f0ece5] rounded-full w-3/4" />
              </div>

              {/* Key Capabilities List */}
              <div className="space-y-2.5 pt-2">
                {currentTabContent.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs sm:text-sm text-zinc-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3 stroke-2" />
                    </div>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={onLaunchApp}
                  className="flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                >
                  <span>Explore in Workspace</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONNECTED INTEGRATION CONSTELLATION SECTION (REFERENCE IMAGE 3) */}
      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-[11px] font-medium text-zinc-700 shadow-2xs">
            <HugeiconsIcon icon={Link01Icon} className="h-3 w-3 text-zinc-700" />
            <span>Zero-Friction Ingestion Loop</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Connected Enterprise Ecosystem
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Continuous temporal synchronization across communication channels, meeting transcripts, document drives, and project trackers.
          </p>
        </div>

        {/* Constellation Canvas (Exact Image 3 Reproduction) */}
        <div className="relative rounded-3xl border border-zinc-200/80 bg-white p-8 sm:p-14 min-h-[460px] sm:min-h-[540px] shadow-xs overflow-hidden flex items-center justify-center">
          {/* Subtle Background Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Curved Hairline Connecting Lines (SVG paths) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-400/80" fill="none" strokeWidth="1.2" strokeDasharray="3 3">
            {/* Figma to Google Calendar */}
            <path d="M 160 180 Q 240 100 320 120" />
            {/* Google Calendar to Slack */}
            <path d="M 360 120 Q 500 80 620 130" />
            {/* Google Meet to Miro */}
            <path d="M 820 150 Q 880 230 940 280" />
            {/* Messages to Notion */}
            <path d="M 580 390 Q 720 400 820 420" />
            {/* Drive to Center */}
            <path d="M 300 380 Q 420 320 540 370" />
          </svg>

          {/* Floating Application Tiles (Image 3 exact placement) */}
          <div className="relative w-full h-[400px] sm:h-[460px]">
            {/* 1. Figma (Top-Left) */}
            <div
              onClick={() => setActiveIntegration('figma')}
              className="absolute left-[8%] sm:left-[12%] top-[30%] -translate-y-1/2 rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20 group"
            >
              <div className="relative">
                {/* Figma colored icon representation */}
                <div className="w-8 h-8 flex flex-col justify-between">
                  <div className="flex">
                    <div className="w-4 h-4 rounded-l-full bg-[#f24e1e]" />
                    <div className="w-4 h-4 rounded-r-full bg-[#ff7262]" />
                  </div>
                  <div className="flex">
                    <div className="w-4 h-4 rounded-l-full bg-[#a259ff]" />
                    <div className="w-4 h-4 rounded-full bg-[#1abcfe]" />
                  </div>
                  <div className="flex">
                    <div className="w-4 h-4 rounded-full bg-[#0acf83]" />
                  </div>
                </div>
                {/* Red dot badge */}
                <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-white shadow-2xs" />
              </div>
            </div>

            {/* 2. Google Calendar "31" (Top Center-Left) */}
            <div
              onClick={() => setActiveIntegration('calendar')}
              className="absolute left-[24%] sm:left-[28%] top-[12%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex flex-col items-center">
                {/* Red top tab badge */}
                <div className="absolute -top-4 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                <span className="text-xl font-bold font-mono text-zinc-900 pt-1">31</span>
              </div>
            </div>

            {/* 3. Slack (Top Center) */}
            <div
              onClick={() => setActiveIntegration('slack')}
              className="absolute left-[50%] sm:left-[54%] top-[14%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative">
                {/* Red tab badge */}
                <div className="absolute -top-4 -right-1 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                {/* Slack hashtag icon */}
                <div className="w-8 h-8 grid grid-cols-2 gap-1 p-0.5">
                  <div className="bg-[#e01e5a] rounded-sm" />
                  <div className="bg-[#36c5f0] rounded-sm" />
                  <div className="bg-[#2eb67d] rounded-sm" />
                  <div className="bg-[#ecb22e] rounded-sm" />
                </div>
              </div>
            </div>

            {/* 4. Google Meet (Top Right) */}
            <div
              onClick={() => setActiveIntegration('meet')}
              className="absolute right-[18%] sm:right-[22%] top-[18%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative">
                {/* Google Meet icon visual */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-5 bg-[#00ac47] rounded-sm relative flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[7px] border-l-[#1a73e8] border-b-[5px] border-b-transparent ml-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Miro (Far Right) */}
            <div
              onClick={() => setActiveIntegration('miro')}
              className="absolute right-[6%] sm:right-[10%] top-[45%] -translate-y-1/2 rounded-2xl bg-[#ffd02f] p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                {/* Red notification dot */}
                <span className="absolute -top-4 -right-2 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-white shadow-2xs" />
                <span className="text-xl font-black text-black tracking-tighter">///</span>
                {/* Small sync pill */}
                <span className="absolute -bottom-4 right-0 text-[8px] font-bold bg-white px-1.5 py-0.5 rounded-full shadow-2xs border border-zinc-200 text-zinc-700">
                  SYNC
                </span>
              </div>
            </div>

            {/* 6. Google Drive (Bottom Left) */}
            <div
              onClick={() => setActiveIntegration('drive')}
              className="absolute left-[20%] sm:left-[24%] bottom-[20%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex flex-col items-center">
                {/* Triangle Drive icon representation */}
                <div className="w-8 h-7 relative flex items-center justify-center">
                  <div className="w-7 h-6 border-b-4 border-b-[#0066da] border-l-4 border-l-[#00ac47] border-r-4 border-r-[#ffba00] rounded-sm transform rotate-12" />
                </div>
                {/* Link icon pill */}
                <span className="absolute -bottom-3 -left-2 text-[9px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1 text-zinc-600">
                  <HugeiconsIcon icon={Link01Icon} className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            {/* 7. Messages / Chat (Bottom Center) */}
            <div
              onClick={() => setActiveIntegration('messages')}
              className="absolute left-[48%] sm:left-[52%] bottom-[24%] rounded-2xl bg-[#34c759] p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                {/* Red top tab badge */}
                <div className="absolute -top-4 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                {/* White chat bubble icon */}
                <div className="w-7 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full" />
                </div>
              </div>
            </div>

            {/* 8. Notion (Bottom Right) */}
            <div
              onClick={() => setActiveIntegration('notion')}
              className="absolute right-[18%] sm:right-[22%] bottom-[16%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                <span className="text-2xl font-black font-serif text-zinc-900">N</span>
                {/* Black notification pill with bell */}
                <span className="absolute -bottom-3 -right-3 bg-zinc-900 text-white text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <span>🔔</span>
                </span>
              </div>
            </div>

            {/* Center Core Info Modal / Popover */}
            {activeIntegration && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl max-w-xs text-center space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900 uppercase">
                    {integrations.find((i) => i.id === activeIntegration)?.name} Integration
                  </span>
                  <button
                    onClick={() => setActiveIntegration(null)}
                    className="text-zinc-400 hover:text-zinc-700 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs font-semibold text-emerald-700">
                  {integrations.find((i) => i.id === activeIntegration)?.status}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {integrations.find((i) => i.id === activeIntegration)?.details}
                </p>
                <button
                  onClick={onLaunchApp}
                  className="w-full rounded-full bg-zinc-900 text-white text-[11px] font-semibold py-1.5 hover:bg-black transition-colors cursor-pointer mt-1"
                >
                  View Ingestion Stream
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <footer id="ecosystem" className="border-t border-zinc-200/80 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="text-base font-bold text-zinc-900">A.C.E Platform</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-md">
              Enterprise Commercial Engine with multi-agent reasoning, dynamic yield protection, and buying center intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-black px-6 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>Launch Enterprise App</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-4">
          <div>© {new Date().getFullYear()} A.C.E Inc. All rights reserved.</div>
          <div className="flex items-center space-x-6">
            <span>Enterprise Security</span>
            <span>SOC 2 Type II Certified</span>
            <span>99.99% SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
