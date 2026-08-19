import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SlidersHorizontalIcon,
  Mic01Icon,
  ArrowUp01Icon,
  Layers01Icon,
  Analytics01Icon,
  UserGroup02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Briefcase01Icon,
  Calendar01Icon,
  Logout01Icon,
  BookOpen01Icon,
  Message01Icon,
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
      title: 'Know customer needs and key decision makers',
      description: 'Continuous memory of key contacts, preferences, and sentiment captured across every call and meeting.',
      highlights: ['Understand key champions', 'Track sentiment shifts', 'Retain relationship context across your whole team'],
    },
    {
      id: 'pricing' as const,
      label: 'Pricing',
      icon: Analytics01Icon,
      title: 'Protect commercial terms with structured trade-offs',
      description: 'Get automated Give-Get suggestions to preserve unit economics when customers request discounts.',
      highlights: ['Protect gross margin floors', 'Trade price concessions for multi-year commitments', 'Keep clear pricing records'],
    },
    {
      id: 'agents' as const,
      label: 'Intelligence',
      icon: SparklesIcon,
      title: 'Real-time reasoning across customer memory',
      description: 'Ask ace anything to pull customer context, synthesize recent interaction history, or prepare talk tracks.',
      highlights: ['Instant answers from customer data', 'Cross-customer pattern detection', 'Next steps and talk tracks ready in seconds'],
    },
    {
      id: 'team' as const,
      label: 'Team',
      icon: Briefcase01Icon,
      title: 'Keep leadership, sales, and operations in sync',
      description: 'Shared intelligence on customer agreements, timelines, and commercial guardrails in one place.',
      highlights: ['Unified customer history', 'Connected schedule and milestones', 'Integrates with your existing workspace'],
    },
  ];

  const currentTabContent = tabs.find((t) => t.id === activeTab) || tabs[2];

  const integrations = [
    {
      id: 'figma',
      name: 'Figma',
      status: 'Connected',
      details: 'Product specs and customer wireframes',
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      iconText: '31',
      status: 'Connected',
      details: 'Meeting times and stakeholder attendees',
    },
    {
      id: 'slack',
      name: 'Slack',
      status: 'Connected',
      details: 'Team communications and deal alerts',
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
      details: 'Customer org charts and workflows',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      status: 'Connected',
      details: 'Customer proposals, quotes, and files',
    },
    {
      id: 'messages',
      name: 'Messages',
      status: 'Connected',
      details: 'Direct customer text conversations',
    },
    {
      id: 'notion',
      name: 'Notion',
      iconText: 'N',
      status: 'Connected',
      details: 'Playbooks and documentation',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200">
      {/* 1. TOP BAR NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-[#f8f9fa]/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand - Real 180px Logo */}
          <div className="flex items-center">
            <img
              src="https://i.ibb.co/gLHGDBz0/1001308108-removebg-preview.png"
              alt="ace"
              className="w-[150px] sm:w-[180px] h-auto object-contain dark:brightness-110"
              style={{ width: '180px', maxWidth: '100%' }}
            />
          </div>

          {/* Action CTAs & Theme Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />

            {session.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignOut}
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
                <button
                  onClick={onLaunchApp}
                  id="btn-launch-app-top"
                  className="flex items-center space-x-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <span>Dashboard</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onLaunchApp}
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer hidden sm:block"
                >
                  Sign in
                </button>
                <button
                  onClick={onLaunchApp}
                  id="btn-launch-app-top"
                  className="flex items-center space-x-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
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
      <section id="overview" className="relative pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-semibold shadow-2xs">
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
            <span>Customer Intelligence & Business Memory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl mx-auto leading-[1.15]">
            Persistent customer intelligence and business memory
          </h1>

          <p className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            ace continuously remembers and connects what your business learns across every conversation, email, and meeting so your team never loses customer context.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onLaunchApp}
              id="btn-hero-enter-ace"
              className="flex items-center space-x-2 rounded-full bg-[#966035] hover:bg-[#83532c] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>{session.isAuthenticated ? 'Open dashboard' : 'Get started'}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
            <a
              href="#product-preview"
              className="px-5 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              See interactive demo
            </a>
          </div>
        </div>

        {/* HERO COMMAND BAR DOCK */}
        <div className="max-w-4xl mx-auto relative pt-2">
          <div className="relative z-30 flex items-center justify-center gap-2 sm:gap-3 px-2">
            {/* Center Main Rounded Pill Input Bar */}
            <div className="flex-1 max-w-2xl h-12 sm:h-14 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg px-4 sm:px-6 flex items-center justify-between">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask ace about an account, customer insights, or talk tracks..."
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none pr-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onLaunchApp();
                  }
                }}
              />

              <button
                type="button"
                onClick={onLaunchApp}
                title="Ask ace"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#966035] hover:bg-[#83532c] text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 stroke-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT INTERACTIVE TABS PREVIEW */}
      <section id="product-preview" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            How ace powers your customer context
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Explore the four pillars of accumulated customer memory and commercial reasoning.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex overflow-x-auto justify-center gap-2 pb-4 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <HugeiconsIcon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Showcase Card */}
        <div className="mt-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {currentTabContent.label}
            </span>
            <h3 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {currentTabContent.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {currentTabContent.description}
            </p>

            <ul className="space-y-2 pt-2">
              {currentTabContent.highlights.map((h, i) => (
                <li key={i} className="flex items-center space-x-2.5 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <button
                type="button"
                onClick={onLaunchApp}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Launch in workspace</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Preview Box */}
          <div className="lg:col-span-6 bg-[#f7f4ee] dark:bg-zinc-800/80 rounded-2xl p-5 border border-[#e6ded3] dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ded3] dark:border-zinc-700">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#966035]" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Live Intelligence Feed</span>
              </div>
              <span className="text-[10px] text-zinc-400">Updated just now</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
                <div className="font-bold text-zinc-900 dark:text-white">Apex Global Logistics • Sarah Chen</div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Hesitation centered around deployment complexity into legacy freight systems. Demanding dedicated onboarding support before sign-off.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
                <div className="font-bold text-zinc-900 dark:text-white">Vanguard Fintech Group • Elena Rostova</div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Expansion into 4 European subsidiaries requires enterprise SSO and granular RBAC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKSPACE INTEGRATIONS CONSTELLATION */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Connects seamlessly across your stack
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            ace synthesizes context from meetings, documents, email threads, and collaborative tools.
          </p>
        </div>

        {/* Integration Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveIntegration(item.id)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-[#966035] transition-colors">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {item.status}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <img
              src="https://i.ibb.co/gLHGDBz0/1001308108-removebg-preview.png"
              alt="ace"
              className="w-[140px] h-auto object-contain mx-auto md:mx-0 dark:brightness-110"
              style={{ width: '140px' }}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
              Persistent customer intelligence and business memory for modern teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLaunchApp}
              className="flex items-center space-x-2 rounded-full bg-[#966035] hover:bg-[#83532c] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>{session.isAuthenticated ? 'Open dashboard' : 'Get started'}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 gap-4">
          <div className="flex items-center space-x-3">
            <span>© {new Date().getFullYear()} ace Inc. All rights reserved.</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center space-x-6">
            <span>SOC 2 Certified</span>
            <span>Enterprise Security</span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
