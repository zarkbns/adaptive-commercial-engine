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
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Link01Icon,
  SparklesIcon,
  Briefcase01Icon,
  Calendar01Icon,
  Location01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { UserSession } from '../services/authService';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onLaunchApp: () => void;
  session?: UserSession;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  session = { isAuthenticated: false },
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'stakeholders' | 'pricing' | 'agents' | 'team'>('agents');
  const [inputValue, setInputValue] = useState('');
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const tabs = [
    {
      id: 'stakeholders' as const,
      label: 'Contacts',
      icon: UserGroup02Icon,
      title: 'Know the buyers and decision makers',
      description: 'See who makes decisions and how they feel from meeting notes and emails.',
      highlights: ['Find the key buyers', 'Track customer sentiment', 'See who is engaged on every deal'],
    },
    {
      id: 'pricing' as const,
      label: 'Pricing',
      icon: Analytics01Icon,
      title: 'Protect your profits on every deal',
      description: 'Set clear discount limits and get simple trade-off suggestions when customers ask for lower prices.',
      highlights: ['Set clear profit floor rules', 'Trade discounts for longer contracts', 'Track all deal concessions'],
    },
    {
      id: 'agents' as const,
      label: 'Deal Helpers',
      icon: Layers01Icon,
      title: 'Find deal risks and answers fast',
      description: 'Automated helpers review draft terms, check competitor moves, and flag deal risks.',
      highlights: ['Get quick answers from your deal data', 'Look up account history in seconds', 'Get next steps ready to send'],
    },
    {
      id: 'team' as const,
      label: 'Team',
      icon: Briefcase01Icon,
      title: 'Keep sales, legal, and leaders on the same page',
      description: 'One shared place for deal approvals, price terms, and next steps.',
      highlights: ['Clear approval steps', 'Shared timeline and milestones', 'Works with your calendar, email, and files'],
    },
  ];

  const currentTabContent = tabs.find((t) => t.id === activeTab) || tabs[2];

  const integrations = [
    {
      id: 'figma',
      name: 'Figma',
      status: 'Connected',
      details: 'Product tiers and feature specs',
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      iconText: '31',
      status: 'Connected',
      details: 'Meeting times and attendee lists',
    },
    {
      id: 'slack',
      name: 'Slack',
      status: 'Connected',
      details: 'Team chat and discount requests',
    },
    {
      id: 'meet',
      name: 'Google Meet',
      status: 'Connected',
      details: 'Call notes and action items',
    },
    {
      id: 'miro',
      name: 'Miro',
      status: 'Connected',
      details: 'Org charts and team maps',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      status: 'Connected',
      details: 'Contracts, quotes, and files',
    },
    {
      id: 'messages',
      name: 'Messages',
      status: 'Connected',
      details: 'Direct customer chats',
    },
    {
      id: 'notion',
      name: 'Notion',
      iconText: 'N',
      status: 'Connected',
      details: 'Price lists and sales guides',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans antialiased selection:bg-zinc-200">
      {/* 1. TOP BAR NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-[#f8f9fa]/90 backdrop-blur-md border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand - Clean single brand mark without subtitle badge */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 fill-current" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900">ace</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {session.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignOut}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
                <button
                  onClick={onLaunchApp}
                  id="btn-launch-app-top"
                  className="flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Dashboard</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onLaunchApp}
                  className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer hidden sm:block"
                >
                  Sign in
                </button>
                <button
                  onClick={onLaunchApp}
                  id="btn-launch-app-top"
                  className="flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Get started</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="overview" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            Close better deals and protect your profit
          </h1>

          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            ace brings together your accounts, deal history, emails, and meetings so your team can understand buyers, price fairly, and win deals faster.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onLaunchApp}
              id="btn-hero-enter-ace"
              className="flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-black px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>{session.isAuthenticated ? 'Open dashboard' : 'Get started'}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
            <a
              href="#product-preview"
              className="px-5 py-3 rounded-full bg-white border border-zinc-200/90 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              See preview
            </a>
          </div>
        </div>

        {/* HERO PILL COMMAND BAR DOCK */}
        <div className="max-w-4xl mx-auto relative pt-4">
          <div className="relative z-30 flex items-center justify-center gap-2 sm:gap-3 px-2">
            {/* Left Pill Selector */}
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
                placeholder="Ask about an account, discount rules, or next steps..."
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
                  title="Pricing rules"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Attach file"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Voice input"
                  onClick={onLaunchApp}
                  className="hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Mic01Icon} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Far Right Submit Button */}
            <button
              onClick={onLaunchApp}
              title="Run"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black text-white shadow-md flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5 stroke-2 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. VISUAL PRODUCT PREVIEW SECTION */}
      <section id="product-preview" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            A simple workspace built to win deals
          </h2>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need in one screen: account history, deal terms, timelines, and pricing help.
          </p>
        </div>

        {/* Scaled Preview Frame */}
        <div className="rounded-[32px] border border-zinc-200/80 bg-[#f4f5f8] p-4 sm:p-6 shadow-xl relative overflow-hidden group">
          {/* Mock Top Controls */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 fill-current text-white" />
              </div>
              <div className="h-8 px-4 rounded-full bg-white border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
                <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-3.5 w-3.5 text-zinc-400" />
                <span>Search accounts, deals, or signals...</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onLaunchApp}
                className="h-8 px-3 rounded-full bg-black text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800"
              >
                <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
                <span>Copilot</span>
              </button>
            </div>
          </div>

          {/* Mock 3-Column Preview Grid */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Left Nav & Feed Preview */}
            <div className="col-span-12 sm:col-span-4 lg:col-span-3 space-y-3">
              <div className="bg-white rounded-2xl p-3.5 border border-zinc-200 shadow-xs space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">Live Account Context</div>
                    <div className="text-[10px] text-zinc-500 truncate">$480k Target ARR</div>
                  </div>
                </div>
                <div className="h-16 rounded-xl bg-zinc-100 border border-zinc-200/70 flex items-center justify-center text-[10px] font-semibold text-zinc-500">
                  94% Buying Interest
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-zinc-900">Buying Signal</div>
                <div className="text-[10px] text-zinc-500">18 Platform jobs posted</div>
              </div>
            </div>

            {/* Center Workspace Preview */}
            <div className="col-span-12 sm:col-span-8 lg:col-span-6 bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900">Deal Terms & Price Calculator</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Margin Protected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="text-[9px] uppercase font-semibold text-zinc-400">Profit Target</div>
                    <div className="text-sm font-bold text-zinc-900">82.5%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="text-[9px] uppercase font-semibold text-zinc-400">Payment Plan</div>
                    <div className="text-sm font-bold text-zinc-900">3-Year Upfront</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-xl bg-[#f4f5f8] border border-zinc-200 text-[11px] text-zinc-600 flex items-center justify-between">
                <span>Ask about deal terms or discounts...</span>
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">
                  ↑
                </div>
              </div>
            </div>

            {/* Right Sidebar Preview */}
            <div className="hidden lg:block col-span-3 space-y-3">
              <div className="bg-white rounded-2xl p-3.5 border border-zinc-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                  <span>Price Rules</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <div className="text-[11px] text-zinc-600">78% Minimum Margin Set</div>
                <div className="text-[11px] text-zinc-600">Give-Get Policy Active</div>
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-zinc-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-zinc-900">Next Step</div>
                <div className="text-[10px] text-zinc-500">Pricing call in 24h</div>
              </div>
            </div>
          </div>

          {/* Interactive Overlay on Hover */}
          <div className="mt-4 text-center">
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-900 hover:text-black transition-colors cursor-pointer"
            >
              <span>Open live workspace</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. CAPABILITIES SECTION */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Made for busy sales teams
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Stay on track, know who to talk to, keep your profit margins safe, and make quick decisions.
          </p>
        </div>

        {/* Segmented Control Pill Container */}
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

        {/* Feature Display Container */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 backdrop-blur-xs p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Minimal UI Card Preview */}
            <div className="lg:col-span-6 rounded-3xl bg-[#f5f1ea] p-6 sm:p-10 flex items-center justify-center min-h-[340px] relative overflow-hidden">
              <div className="absolute w-[80%] h-[80%] rounded-3xl border-2 border-dashed border-[#dcd6cb] transform -rotate-3" />
              <div className="relative z-10 w-[88%] bg-white rounded-2xl p-5 shadow-lg border border-zinc-200/80 transform rotate-2 space-y-4">
                <div className="h-5 w-24 bg-[#e8e4dc] rounded-full" />
                <div className="h-28 sm:h-32 w-full bg-[#e8e4dc] rounded-xl flex items-center justify-center">
                  <HugeiconsIcon icon={currentTabContent.icon} className="h-8 w-8 text-zinc-500" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-2.5 bg-[#f0ece5] rounded-full w-4/5" />
                  <div className="h-2.5 bg-[#f0ece5] rounded-full w-3/5" />
                </div>
              </div>
            </div>

            {/* Right Column: Structured Editorial Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {currentTabContent.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {currentTabContent.description}
                </p>
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
                  <span>Open workspace</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONNECTED INTEGRATION CONSTELLATION SECTION */}
      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Connect your everyday tools
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Sync calendars, emails, meetings, and files straight into your workspace.
          </p>
        </div>

        {/* Constellation Canvas */}
        <div className="relative rounded-3xl border border-zinc-200/80 bg-white p-8 sm:p-14 min-h-[440px] sm:min-h-[500px] shadow-xs overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Curved Hairline Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-400/80" fill="none" strokeWidth="1.2" strokeDasharray="3 3">
            <path d="M 160 180 Q 240 100 320 120" />
            <path d="M 360 120 Q 500 80 620 130" />
            <path d="M 820 150 Q 880 230 940 280" />
            <path d="M 580 390 Q 720 400 820 420" />
            <path d="M 300 380 Q 420 320 540 370" />
          </svg>

          {/* Floating Application Tiles */}
          <div className="relative w-full h-[380px] sm:h-[420px]">
            {/* 1. Figma */}
            <div
              onClick={() => setActiveIntegration('figma')}
              className="absolute left-[8%] sm:left-[12%] top-[30%] -translate-y-1/2 rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative">
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
                <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-white shadow-2xs" />
              </div>
            </div>

            {/* 2. Google Calendar "31" */}
            <div
              onClick={() => setActiveIntegration('calendar')}
              className="absolute left-[24%] sm:left-[28%] top-[12%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-4 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                <span className="text-xl font-bold font-mono text-zinc-900 pt-1">31</span>
              </div>
            </div>

            {/* 3. Slack */}
            <div
              onClick={() => setActiveIntegration('slack')}
              className="absolute left-[50%] sm:left-[54%] top-[14%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative">
                <div className="absolute -top-4 -right-1 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                <div className="w-8 h-8 grid grid-cols-2 gap-1 p-0.5">
                  <div className="bg-[#e01e5a] rounded-sm" />
                  <div className="bg-[#36c5f0] rounded-sm" />
                  <div className="bg-[#2eb67d] rounded-sm" />
                  <div className="bg-[#ecb22e] rounded-sm" />
                </div>
              </div>
            </div>

            {/* 4. Google Meet */}
            <div
              onClick={() => setActiveIntegration('meet')}
              className="absolute right-[18%] sm:right-[22%] top-[18%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-5 bg-[#00ac47] rounded-sm relative flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[7px] border-l-[#1a73e8] border-b-[5px] border-b-transparent ml-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Miro */}
            <div
              onClick={() => setActiveIntegration('miro')}
              className="absolute right-[6%] sm:right-[10%] top-[45%] -translate-y-1/2 rounded-2xl bg-[#ffd02f] p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute -top-4 -right-2 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-white shadow-2xs" />
                <span className="text-xl font-black text-black tracking-tighter">///</span>
              </div>
            </div>

            {/* 6. Google Drive */}
            <div
              onClick={() => setActiveIntegration('drive')}
              className="absolute left-[20%] sm:left-[24%] bottom-[20%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-7 relative flex items-center justify-center">
                  <div className="w-7 h-6 border-b-4 border-b-[#0066da] border-l-4 border-l-[#00ac47] border-r-4 border-r-[#ffba00] rounded-sm transform rotate-12" />
                </div>
              </div>
            </div>

            {/* 7. Messages / Chat */}
            <div
              onClick={() => setActiveIntegration('messages')}
              className="absolute left-[48%] sm:left-[52%] bottom-[24%] rounded-2xl bg-[#34c759] p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute -top-4 w-7 h-2.5 bg-[#ef4444] rounded-full shadow-2xs" />
                <div className="w-7 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full" />
                </div>
              </div>
            </div>

            {/* 8. Notion */}
            <div
              onClick={() => setActiveIntegration('notion')}
              className="absolute right-[18%] sm:right-[22%] bottom-[16%] rounded-2xl bg-white border border-zinc-200/80 p-3.5 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center">
                <span className="text-2xl font-black font-serif text-zinc-900">N</span>
              </div>
            </div>

            {/* Center Info Popover */}
            {activeIntegration && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl max-w-xs text-center space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900 uppercase">
                    {integrations.find((i) => i.id === activeIntegration)?.name}
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
                  Open in workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <footer className="border-t border-zinc-200/80 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="text-base font-bold text-zinc-900">ace</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-md">
              Simple deal execution for fast-growing sales teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-black px-6 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>{session.isAuthenticated ? 'Open dashboard' : 'Get started'}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-4">
          <div className="flex items-center space-x-3">
            <span>© {new Date().getFullYear()} ace Inc. All rights reserved.</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center space-x-6">
            <span>Security</span>
            <span>SOC 2 Certified</span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
