import React, { useState, useMemo, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Layout01Icon,
  UserGroup02Icon,
  StarIcon,
  TradeUpIcon,
  Megaphone01Icon,
  Briefcase01Icon,
  File01Icon,
  Calendar01Icon,
  Analytics01Icon,
  Settings01Icon,
  Search01Icon,
  PlusSignIcon,
  SparklesIcon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  CallIcon,
  Clock01Icon,
  ArrowUpRight01Icon,
  Menu01Icon,
  Cancel01Icon,
  Logout01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { UserSession } from '../services/authService';
import { consumerStore, Consumer, Deal, TaskItem } from '../services/consumerService';
import { OverviewView } from './views/OverviewView';
import { ConsumersView } from './views/ConsumersView';
import { LeadsView } from './views/LeadsView';
import { EngagementView } from './views/EngagementView';
import { CampaignsView } from './views/CampaignsView';
import { DealsView } from './views/DealsView';
import { TasksView } from './views/TasksView';
import { CalendarView } from './views/CalendarView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AICopilotDrawer } from './AICopilotDrawer';
import { AddConsumerModal } from './AddConsumerModal';

export type NavItemKey =
  | 'overview'
  | 'consumers'
  | 'leads'
  | 'engagement'
  | 'campaigns'
  | 'deals'
  | 'tasks'
  | 'calendar'
  | 'reports'
  | 'settings';

interface MainLayoutProps {
  onBackToLanding?: () => void;
  onSignOut?: () => void;
  session?: UserSession;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  onBackToLanding,
  onSignOut,
  session,
}) => {
  // Navigation State (Exclusively 10 items)
  const [activeNav, setActiveNav] = useState<NavItemKey>('overview');

  // Mobile / Tablet Drawer states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRightContextOpenMobile, setIsRightContextOpenMobile] = useState(false);

  // Store data state
  const [consumers, setConsumers] = useState<Consumer[]>(() => consumerStore.getConsumers());
  const [deals, setDeals] = useState<Deal[]>(() => consumerStore.getDeals());
  const [tasks, setTasks] = useState<TaskItem[]>(() => consumerStore.getTasks());
  const [selectedConsumerId, setSelectedConsumerId] = useState<string | null>('c1');

  // Search & bottom input dock
  const [globalSearch, setGlobalSearch] = useState('');
  const [assistantInput, setAssistantInput] = useState('');

  // Assistant & modal controls
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>(undefined);
  const [isAddConsumerOpen, setIsAddConsumerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Subscribe to data changes
  useEffect(() => {
    const unsub = consumerStore.subscribe(() => {
      setConsumers(consumerStore.getConsumers());
      setDeals(consumerStore.getDeals());
      setTasks(consumerStore.getTasks());
    });
    return unsub;
  }, []);

  // Selected consumer details for right context panel
  const selectedConsumer = useMemo(() => {
    if (!selectedConsumerId) return consumers[0] || null;
    return consumers.find((c) => c.id === selectedConsumerId) || consumers[0] || null;
  }, [consumers, selectedConsumerId]);

  // Handle opening assistant with custom prompt
  const handleOpenAssistant = (promptText?: string) => {
    setCopilotInitialPrompt(promptText);
    setIsCopilotOpen(true);
  };

  // Handle bottom dock input submission
  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    handleOpenAssistant(assistantInput.trim());
    setAssistantInput('');
  };

  // 10 Left Navigation Items (clean & non-technical)
  const navItems = [
    { key: 'overview' as NavItemKey, label: 'Overview', icon: Layout01Icon },
    { key: 'consumers' as NavItemKey, label: 'Consumers', icon: UserGroup02Icon },
    { key: 'leads' as NavItemKey, label: 'Leads', icon: StarIcon },
    { key: 'engagement' as NavItemKey, label: 'Engagement', icon: TradeUpIcon },
    { key: 'campaigns' as NavItemKey, label: 'Campaigns', icon: Megaphone01Icon },
    { key: 'deals' as NavItemKey, label: 'Deals', icon: Briefcase01Icon },
    { key: 'tasks' as NavItemKey, label: 'Tasks', icon: File01Icon },
    { key: 'calendar' as NavItemKey, label: 'Calendar', icon: Calendar01Icon },
    { key: 'reports' as NavItemKey, label: 'Reports', icon: Analytics01Icon },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings01Icon },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-zinc-900 font-sans antialiased flex flex-col selection:bg-zinc-200 overflow-x-hidden">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER BAR (Logo 180px, Search, Quick Actions)               */}
      {/* ==================================================================== */}
      <header className="w-full bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile hamburger & 180px Logo */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
          </button>

          {/* 180px Logo as requested by user */}
          <button
            type="button"
            onClick={() => setActiveNav('overview')}
            className="flex items-center focus:outline-none cursor-pointer group"
            title="ace • Sales Workspace"
          >
            <img
              src="https://i.ibb.co/gLHGDBz0/1001308108-removebg-preview.png"
              alt="ace"
              className="w-[180px] h-auto object-contain transition-opacity group-hover:opacity-90"
              style={{ width: '180px' }}
            />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="w-full h-10 bg-zinc-50 hover:bg-white focus-within:bg-white rounded-full border border-zinc-200 px-4 flex items-center space-x-2.5 transition-all focus-within:border-[#966035] focus-within:ring-1 focus-within:ring-[#966035]/20 shadow-2xs">
            <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search consumers, deals, or tasks..."
              className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Right Actions: Add Consumer, Ask ACE, Right Panel Toggle on Mobile, User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => setIsAddConsumerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Consumer</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAssistant()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#f7f4ee] hover:bg-[#ede4d8] text-[#7a4d29] border border-[#e6ded3] text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035]" />
            <span className="hidden md:inline">Ask ACE</span>
          </button>

          {/* Context toggle for mobile/tablet */}
          <button
            type="button"
            onClick={() => setIsRightContextOpenMobile(!isRightContextOpenMobile)}
            className="xl:hidden p-2 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
            title="Toggle context details"
          >
            <HugeiconsIcon icon={Layout01Icon} className="h-4 w-4" />
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold hover:bg-black transition-colors shadow-xs cursor-pointer"
              title="User Account"
            >
              {session?.avatar || (session?.name ? session.name[0] : 'A')}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-white border border-zinc-200 shadow-xl p-3 space-y-2.5 animate-fadeIn">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-[#966035] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {session?.avatar || (session?.name ? session.name[0] : 'A')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">
                      {session?.name || 'Alex Morgan'}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {session?.role || 'Senior Sales Representative'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onBackToLanding) onBackToLanding();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={Layout01Icon} className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Public Landing Page</span>
                  </button>

                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 border-t border-zinc-100 pt-2 mt-1 font-semibold"
                    >
                      <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. THREE-PANEL DESKTOP LAYOUT                                        */}
      {/* Left: 220–240px | Middle: flexible workspace | Right: 300–340px      */}
      {/* ==================================================================== */}
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto p-3 sm:p-4 lg:p-5 gap-4 lg:gap-5 overflow-hidden">
        {/* ================================================================== */}
        {/* PANEL 1: LEFT NAVIGATION (220–240px)                               */}
        {/* ================================================================== */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 lg:static lg:z-auto
            w-[230px] shrink-0 bg-white lg:bg-white rounded-r-3xl lg:rounded-3xl border-r lg:border border-zinc-200/80
            p-4 flex flex-col justify-between shadow-sm lg:shadow-xs transition-transform duration-200
            ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="space-y-4">
            {/* Mobile Header in Drawer */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-zinc-100">
              <img
                src="https://i.ibb.co/gLHGDBz0/1001308108-removebg-preview.png"
                alt="ace"
                className="w-[140px] h-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation List (10 Clean Items) */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Menu
              </div>
              {navItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.key);
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#966035] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-[#f7f4ee]'
                    }`}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Left: Salesperson Quick Status */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <div className="p-3 rounded-2xl bg-[#f7f4ee] border border-[#e6ded3] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#7a4d29] uppercase tracking-wider">Quota Progress</span>
                <span className="text-[11px] font-extrabold text-[#7a4d29]">89%</span>
              </div>
              <div className="h-1.5 w-full bg-[#e6ded3] rounded-full overflow-hidden">
                <div className="h-full bg-[#966035] rounded-full" style={{ width: '89%' }} />
              </div>
              <div className="text-[10px] text-zinc-500 pt-0.5">$285k of $320k target</div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Backdrop */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ================================================================== */}
        {/* PANEL 2: MIDDLE WORKSPACE (Flexible, Largest Area)                  */}
        {/* ================================================================== */}
        <main className="flex-1 min-w-0 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col justify-between p-4 sm:p-6 lg:p-7 overflow-hidden">
          {/* Scrollable Main View Area */}
          <div className="w-full flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin">
            {activeNav === 'overview' && (
              <OverviewView
                session={session}
                consumers={consumers}
                deals={deals}
                selectedConsumerId={selectedConsumerId}
                onSelectConsumer={(id) => {
                  setSelectedConsumerId(id);
                  if (window.innerWidth < 1280) {
                    setIsRightContextOpenMobile(true);
                  }
                }}
                onOpenAddConsumer={() => setIsAddConsumerOpen(true)}
                onOpenCopilot={(prompt) => handleOpenAssistant(prompt)}
                onNavigateTab={(tab) => setActiveNav(tab as NavItemKey)}
              />
            )}

            {activeNav === 'consumers' && (
              <ConsumersView
                consumers={consumers}
                selectedConsumerId={selectedConsumerId}
                onSelectConsumer={(id) => {
                  setSelectedConsumerId(id);
                  if (window.innerWidth < 1280) {
                    setIsRightContextOpenMobile(true);
                  }
                }}
                onOpenAddConsumer={() => setIsAddConsumerOpen(true)}
                onOpenCopilot={(prompt) => handleOpenAssistant(prompt)}
              />
            )}

            {activeNav === 'leads' && (
              <LeadsView
                onLeadConverted={(newId) => {
                  setSelectedConsumerId(newId);
                  setActiveNav('consumers');
                }}
                onOpenCopilot={(prompt) => handleOpenAssistant(prompt)}
              />
            )}

            {activeNav === 'engagement' && (
              <EngagementView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'campaigns' && (
              <CampaignsView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'deals' && (
              <DealsView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'tasks' && (
              <TasksView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'calendar' && (
              <CalendarView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'reports' && (
              <ReportsView onOpenCopilot={(prompt) => handleOpenAssistant(prompt)} />
            )}

            {activeNav === 'settings' && (
              <SettingsView session={session} />
            )}
          </div>

          {/* Central Bottom Action & Input Dock (ACE Assistant) */}
          <div className="w-full pt-3 border-t border-zinc-100 shrink-0">
            <form
              onSubmit={handleAssistantSubmit}
              className="w-full bg-[#f7f4ee] rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 border border-[#e6ded3] shadow-inner"
            >
              {/* Quick Action Chips */}
              <div className="hidden lg:flex items-center space-x-1.5 pl-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenAssistant('Find consumers needing follow-up today')}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-zinc-700 border border-[#e6ded3] shadow-2xs hover:text-[#966035] hover:border-[#966035] transition-colors cursor-pointer"
                >
                  Find consumer
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAssistant('Check my highest value deal in negotiation')}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-zinc-700 border border-[#e6ded3] shadow-2xs hover:text-[#966035] hover:border-[#966035] transition-colors cursor-pointer"
                >
                  Check deal
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAssistant('Create a follow-up task for tomorrow morning')}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-zinc-700 border border-[#e6ded3] shadow-2xs hover:text-[#966035] hover:border-[#966035] transition-colors cursor-pointer"
                >
                  Create task
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAssistant('Schedule a prep meeting for executive pricing review')}
                  className="px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-zinc-700 border border-[#e6ded3] shadow-2xs hover:text-[#966035] hover:border-[#966035] transition-colors cursor-pointer"
                >
                  Schedule meeting
                </button>
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask ACE about a consumer, deal, or next step..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-900 focus:outline-none px-2 placeholder:text-zinc-400"
              />

              {/* Submit Button (Warm Brown) */}
              <button
                type="submit"
                title="Ask ACE"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#966035] hover:bg-[#83532c] active:scale-95 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 stroke-2" />
              </button>
            </form>
          </div>
        </main>

        {/* ================================================================== */}
        {/* PANEL 3: RIGHT CONTEXT PANEL (300–340px)                           */}
        {/* ================================================================== */}
        <aside
          className={`
            ${isRightContextOpenMobile ? 'fixed inset-y-0 right-0 z-40 bg-white w-[320px] p-4 shadow-2xl overflow-y-auto' : 'hidden xl:flex'}
            xl:static xl:z-auto xl:w-[320px] shrink-0 flex-col gap-4 overflow-y-auto pl-0.5 scrollbar-thin
          `}
        >
          {/* Mobile Close Button */}
          {isRightContextOpenMobile && (
            <div className="xl:hidden flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-900">Context Details</span>
              <button
                type="button"
                onClick={() => setIsRightContextOpenMobile(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Card 1: Selected Consumer Details (Dynamic Context) */}
          {selectedConsumer && (
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#966035]" />
                  <span className="text-xs font-bold text-zinc-900">Selected Consumer</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
                  {selectedConsumer.status}
                </span>
              </div>

              {/* Profile Overview */}
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {selectedConsumer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-zinc-900 truncate">{selectedConsumer.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{selectedConsumer.company}</div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/60">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Deal Value</div>
                  <div className="text-sm font-extrabold text-zinc-900">${selectedConsumer.dealValue.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/60">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Last Contact</div>
                  <div className="text-xs font-bold text-zinc-800 truncate">{selectedConsumer.lastContact}</div>
                </div>
              </div>

              {/* Next Step Box */}
              <div className="space-y-1 bg-[#f7f4ee] border border-[#e6ded3] p-3 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-[#7a4d29] tracking-wider">Next Step</div>
                <div className="text-xs font-semibold text-zinc-900">{selectedConsumer.nextAction}</div>
                <div className="text-[10px] text-zinc-500 pt-0.5">{selectedConsumer.nextActionDate}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenAssistant(`What talk track should I use with ${selectedConsumer.name} at ${selectedConsumer.company}?`)}
                  className="flex-1 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                >
                  Ask ACE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    consumerStore.addTask({
                      title: `Follow up with ${selectedConsumer.name}`,
                      relatedTo: selectedConsumer.company,
                      dueDate: 'Tomorrow',
                      priority: 'High',
                      type: 'Call',
                    });
                    setActiveNav('tasks');
                  }}
                  className="px-3 py-2 rounded-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  + Task
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Performance Overview */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Performance Overview</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                On Target
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Monthly Sales Target:</span>
                <span className="font-bold text-zinc-900">$285k / $320k</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#966035] rounded-full" style={{ width: '89%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-500 font-medium">Win Rate:</span>
                <span className="font-bold text-emerald-700">74.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Average Deal Cycle:</span>
                <span className="font-bold text-zinc-900">18.5 days</span>
              </div>
            </div>
          </div>

          {/* Card 3: Upcoming Tasks Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Upcoming Tasks</span>
              <button
                type="button"
                onClick={() => setActiveNav('tasks')}
                className="text-[11px] font-semibold text-[#966035] hover:text-[#7a4d29] cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => consumerStore.toggleTask(task.id)}
                  className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer text-xs"
                >
                  <button
                    type="button"
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center mt-0.5 shrink-0 ${
                      task.completed
                        ? 'bg-[#966035] border-[#966035] text-white'
                        : 'border-zinc-300 hover:border-[#966035]'
                    }`}
                  >
                    {task.completed && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {task.title}
                    </div>
                    <div className="text-[10px] text-zinc-400">{task.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Recent Activity Stream */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Recent Activity</span>
              <span className="text-[10px] text-zinc-400">Live</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-[#f7f4ee] text-[#966035] border border-[#e6ded3] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Mail01Icon} className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Sent revised 3-year quote</div>
                  <div className="text-[10px] text-zinc-400">Sarah Chen • 25m ago</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-[#f7f4ee] text-[#966035] border border-[#e6ded3] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  <HugeiconsIcon icon={CallIcon} className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Completed compliance sync</div>
                  <div className="text-[10px] text-zinc-400">Marcus Vance • 2h ago</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Signed 2-year partnership</div>
                  <div className="text-[10px] text-zinc-400">Beacon Retail • Yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Right Context Backdrop */}
        {isRightContextOpenMobile && (
          <div
            onClick={() => setIsRightContextOpenMobile(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs xl:hidden"
          />
        )}
      </div>

      {/* Slide-over Assistant Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotInitialPrompt}
      />

      {/* Add Consumer Modal */}
      <AddConsumerModal
        isOpen={isAddConsumerOpen}
        onClose={() => setIsAddConsumerOpen(false)}
        onConsumerAdded={(newConsumer) => {
          setSelectedConsumerId(newConsumer.id);
          setActiveNav('consumers');
        }}
      />
    </div>
  );
};
