import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface CalendarViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenCopilot }) => {
  const events = consumerStore.getEvents();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Conversations Schedule</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {events.length} Scheduled Sessions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Upcoming customer meetings, prep briefings, and background context synthesized by ace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCopilot('Prepare a comprehensive meeting briefing and customer background summary for my next customer conversation.')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
          <span>Ask ace to prep meeting</span>
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Upcoming Customer Sessions</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => onOpenCopilot(`Generate meeting prep briefing notes for ${event.title} with ${event.consumer} at ${event.company}`)}
              className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl px-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#f7f4ee] dark:bg-zinc-800 text-[#966035] dark:text-amber-300 border border-[#e6ded3] dark:border-zinc-700 flex flex-col items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{event.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    With <span className="font-semibold text-zinc-800 dark:text-zinc-200">{event.consumer}</span> ({event.company})
                  </div>
                  <div className="text-[11px] text-zinc-400 pt-0.5">
                    Participants: {event.attendees.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pl-13 sm:pl-0">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  {event.date}, {event.time}
                </span>
                <span className="text-xs font-semibold text-[#966035] dark:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <span>Prep with ace</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
