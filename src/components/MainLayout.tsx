import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  SlidersHorizontalIcon,
  Location01Icon,
  Calendar01Icon,
  Link01Icon,
  Settings01Icon,
  PlusSignIcon,
  Mail01Icon,
  StarIcon,
  Clock01Icon,
  Navigation01Icon,
  File01Icon,
  UserIcon,
  ArrowUpRight01Icon,
  Briefcase01Icon,
  Mic01Icon,
  ArrowUp01Icon,
  Layout01Icon,
} from '@hugeicons/core-free-icons';
import { HydraTierMetrics } from '../services/hydradb/types';
import { AgentExecutionLog } from '../services/ace/types';

interface MainLayoutProps {
  metrics?: HydraTierMetrics;
  logs?: AgentExecutionLog[];
  onRefreshMetrics?: () => void;
  onBackToLanding?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onBackToLanding }) => {
  // Navigation & interaction states
  const [activeNav, setActiveNav] = useState<'mail' | 'star' | 'clock' | 'sent' | 'file'>('mail');
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-zinc-800 font-sans antialiased p-3 sm:p-5 lg:p-6 flex flex-col justify-between selection:bg-zinc-200">
      {/* 1. TOP BAR */}
      <header className="w-full mb-4 flex items-center justify-between gap-4">
        {/* Left Side: Brand Icon Box + Search Bar Pill */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          {/* Top Left Brand Box (Diamond/Quad glyph) */}
          <button
            type="button"
            onClick={onBackToLanding}
            title="Landing / Home"
            className="w-12 h-12 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-900 shadow-xs hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
          >
            <div className="grid grid-cols-2 gap-1 p-1 transform rotate-45 scale-90">
              <div className="w-2 h-2 rounded-[2px] bg-zinc-800" />
              <div className="w-2 h-2 rounded-[2px] bg-zinc-800" />
              <div className="w-2 h-2 rounded-[2px] bg-zinc-800" />
              <div className="w-2 h-2 rounded-[2px] bg-zinc-800" />
            </div>
          </button>

          {/* Search Pill */}
          <div className="flex-1 h-11 bg-white rounded-full border border-zinc-200/80 px-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 flex-1">
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder=""
                className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none placeholder:text-zinc-300"
              />
              {/* Subtle line skeleton indicator inside search when empty */}
              {!searchQuery && (
                <div className="h-2 w-24 bg-zinc-200/80 rounded-full shrink-0 pointer-events-none" />
              )}
            </div>
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <HugeiconsIcon icon={SlidersHorizontalIcon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Side: 5 Action Circular Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Link01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="w-10 h-10 sm:w-14 sm:h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 stroke-2" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 4-COLUMN WORKSPACE */}
      <div className="flex-1 flex gap-4 lg:gap-5 w-full items-stretch overflow-hidden">
        {/* COLUMN 1: LEFT VERTICAL NAVIGATION RAIL */}
        <aside className="w-12 sm:w-14 shrink-0 flex flex-col items-center justify-between py-2 bg-transparent">
          {/* Top Stack of 5 Navigation Icons */}
          <div className="flex flex-col items-center space-y-3.5 w-full">
            {/* 1. Mail / Inbox (Black active circle) */}
            <button
              type="button"
              onClick={() => setActiveNav('mail')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'mail'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
            </button>

            {/* 2. Star */}
            <button
              type="button"
              onClick={() => setActiveNav('star')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'star'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
            </button>

            {/* 3. Clock */}
            <button
              type="button"
              onClick={() => setActiveNav('clock')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'clock'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
            </button>

            {/* 4. Sent / Paper Airplane */}
            <button
              type="button"
              onClick={() => setActiveNav('sent')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'sent'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={Navigation01Icon} className="h-4 w-4 transform rotate-45" />
            </button>

            {/* 5. Document / File */}
            <button
              type="button"
              onClick={() => setActiveNav('file')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'file'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50'
              }`}
            >
              <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom: Profile Icon */}
          <div className="w-full flex justify-center pt-4">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
            >
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* COLUMN 2: LEFT CARDS STACK */}
        <section className="hidden md:flex w-72 lg:w-80 shrink-0 flex-col gap-3.5 overflow-y-auto pr-0.5">
          {/* Card 1: Top Featured Image Card */}
          <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
            {/* Header: Avatar circle + 2 lines */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200/90 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 bg-zinc-200/90 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
              </div>
            </div>

            {/* Image Placeholder with Sun & Mountain Graphic */}
            <div className="w-full h-36 rounded-2xl bg-zinc-100/90 border border-zinc-200/60 relative overflow-hidden flex items-end justify-center p-3">
              {/* Sun circle */}
              <div className="absolute top-4 left-5 w-6 h-6 rounded-full bg-zinc-200/80" />

              {/* Mountains landscape outline */}
              <svg className="w-full h-20 text-zinc-200/90" viewBox="0 0 200 80" fill="currentColor">
                <polygon points="20,80 80,30 140,80" />
                <polygon points="90,80 150,20 210,80" />
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200/90 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 bg-zinc-200/90 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
              </div>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full w-full" />
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200/90 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 bg-zinc-200/90 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
              </div>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full w-full" />
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200/90 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 bg-zinc-200/90 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200/90 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 bg-zinc-200/90 rounded-full w-3/4" />
                <div className="h-2 bg-zinc-100 rounded-full w-1/2" />
              </div>
            </div>
          </div>
        </section>

        {/* COLUMN 3: CENTER MAIN WORKSPACE HERO CARD */}
        <main className="flex-1 min-w-0 bg-white rounded-[32px] border border-zinc-200/80 shadow-xs flex flex-col justify-between p-6 sm:p-8 relative">
          {/* Upper Section: Centered Avatar and Skeleton Lines */}
          <div className="w-full flex-1 flex flex-col items-center justify-center pt-8 pb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-200/90 mb-5" />
            <div className="h-3 bg-zinc-200/90 rounded-full w-40 sm:w-48 mb-2.5" />
            <div className="h-2.5 bg-zinc-100 rounded-full w-28 sm:w-36" />
          </div>

          {/* Lower Section: Divider and Bottom Input Bar */}
          <div className="w-full pt-4 border-t border-zinc-100">
            <div className="w-full bg-[#f4f5f7] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
              {/* Left Side: 2 Small Pill Chips / Tags */}
              <div className="flex items-center space-x-2 pl-2">
                <div className="h-4 w-7 rounded-full bg-zinc-200/80" />
                <div className="h-4 w-7 rounded-full bg-zinc-200/80" />
              </div>

              {/* Center Input Area */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder=""
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-800 focus:outline-none px-2"
              />

              {/* Right Side: Microphone + Black Circle Up Arrow Button */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Mic01Icon} className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 stroke-2" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* COLUMN 4: RIGHT 3-CARD STACK */}
        <section className="hidden xl:flex w-72 lg:w-80 shrink-0 flex-col gap-4 overflow-y-auto pl-0.5">
          {/* Card 1: Top 2-Square Grid Card */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
            {/* Header: 4-square grid + arrow up-right */}
            <div className="flex items-center justify-between">
              <HugeiconsIcon icon={Layout01Icon} className="h-4 w-4 text-zinc-700" />
              <button type="button" className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Two Side-by-Side Square Preview Blocks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="w-full h-24 rounded-2xl bg-zinc-100 border border-zinc-200/50" />
                <div className="h-2 bg-zinc-200/90 rounded-full w-4/5" />
                <div className="h-1.5 bg-zinc-100 rounded-full w-3/5" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 rounded-2xl bg-zinc-100 border border-zinc-200/50" />
                <div className="h-2 bg-zinc-200/90 rounded-full w-4/5" />
                <div className="h-1.5 bg-zinc-100 rounded-full w-3/5" />
              </div>
            </div>

            {/* Bottom Right Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>

          {/* Card 2: Middle Calendar / Banner Card */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5 hover:shadow-sm transition-shadow">
            {/* Header: Calendar Icon */}
            <div className="flex items-center justify-between">
              <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-zinc-700" />
            </div>

            {/* Subtitle skeleton line */}
            <div className="h-2 bg-zinc-200/90 rounded-full w-1/3" />

            {/* Wide Rectangular Placeholder Block */}
            <div className="w-full h-16 rounded-2xl bg-zinc-100 border border-zinc-200/50" />

            {/* Bottom Row: Line on Left + 3 Avatar Circles on Right */}
            <div className="flex items-center justify-between pt-1">
              <div className="h-2 bg-zinc-200/90 rounded-full w-1/4" />
              <div className="flex space-x-1.5">
                <div className="w-4 h-4 rounded-full bg-zinc-200" />
                <div className="w-4 h-4 rounded-full bg-zinc-200" />
                <div className="w-4 h-4 rounded-full bg-zinc-200" />
              </div>
            </div>

            {/* Bottom Right Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>

          {/* Card 3: Bottom Briefcase & Toggle Controls Card */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
            {/* Header: Briefcase Icon + Plus Icon */}
            <div className="flex items-center justify-between">
              <HugeiconsIcon icon={Briefcase01Icon} className="h-4 w-4 text-zinc-700" />
              <button type="button" className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
                <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Row 1: Toggle + Line Skeleton on Left, Pill Button on Right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setToggle1(!toggle1)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    toggle1 ? 'bg-zinc-300' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      toggle1 ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <div className="h-2 bg-zinc-200/90 rounded-full w-16" />
              </div>
              <div className="h-6 w-12 rounded-lg bg-zinc-100 border border-zinc-200/60" />
            </div>

            {/* Row 2: Toggle + Line Skeleton on Left, Pill Button on Right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setToggle2(!toggle2)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    toggle2 ? 'bg-zinc-300' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      toggle2 ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <div className="h-2 bg-zinc-200/90 rounded-full w-16" />
              </div>
              <div className="h-6 w-12 rounded-lg bg-zinc-100 border border-zinc-200/60" />
            </div>

            {/* Bottom Right Pagination Dots */}
            <div className="flex justify-end space-x-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
