import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  CallIcon,
  PlusSignIcon,
  Clock01Icon,
  UserGroup02Icon,
} from '@hugeicons/core-free-icons';
import { consumerStore } from '../../services/consumerService';

interface CalendarViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenCopilot }) => {
  const events = consumerStore.getEvents();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Calendar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              {events.length} Scheduled Meetings
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Review your upcoming client calls, executive reviews, and contract negotiation meetings.
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900">Upcoming Schedule</h2>
        <div className="divide-y divide-zinc-100">
          {events.map((event) => (
            <div key={event.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f7f4ee] text-[#966035] border border-[#e6ded3] flex flex-col items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-zinc-900">{event.title}</div>
                  <div className="text-xs text-zinc-500">
                    With <span className="font-semibold text-zinc-800">{event.consumer}</span> ({event.company})
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-zinc-400 pt-1">
                    <span>Attendees: {event.attendees.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800">
                  {event.date}, {event.time}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">{event.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
