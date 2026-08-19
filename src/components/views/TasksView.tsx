import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  PlusSignIcon,
  Search01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  BookOpen01Icon,
  TimeQuarter02Icon,
} from '@hugeicons/core-free-icons';
import { TaskItem, consumerStore } from '../../services/consumerService';

interface TasksViewProps {
  onOpenCopilot: (promptText?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenCopilot }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => consumerStore.getTasks());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRelated, setNewTaskRelated] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = (id: string) => {
    consumerStore.toggleTask(id);
    setTasks(consumerStore.getTasks());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    consumerStore.addTask({
      title: newTaskTitle.trim(),
      relatedTo: newTaskRelated.trim() || 'General Customer Context',
      dueDate: 'Today',
      priority: 'High',
      type: 'Call',
    });
    setTasks(consumerStore.getTasks());
    setNewTaskTitle('');
    setNewTaskRelated('');
    setShowAddForm(false);
  };

  const activeItems = tasks.filter((t) => !t.completed);
  const resolvedItems = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Customer Action Context</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] dark:bg-zinc-800 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700">
              {activeItems.length} Active Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Follow-ups, research questions, and key relationship touchpoints recommended by ace from customer conversations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenCopilot('What customer action items should I prioritize today based on recent conversations?')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#f7f4ee] dark:bg-zinc-800 hover:bg-[#ede4d8] dark:hover:bg-zinc-700 text-[#7a4d29] dark:text-amber-200 border border-[#e6ded3] dark:border-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-[#966035] dark:text-amber-300" />
            <span>Ask ace</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            <span>Record Context Item</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddTask}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 animate-fadeIn"
        >
          <div className="text-xs font-bold text-zinc-900 dark:text-white">Record New Customer Context Item</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Verify deployment complexity concerns with solutions team"
              className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-[#966035]"
            />
            <input
              type="text"
              value={newTaskRelated}
              onChange={(e) => setNewTaskRelated(e.target.value)}
              placeholder="Related Customer or Account (e.g. Apex Global Logistics)"
              className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-[#966035]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Active Items */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Active Relationship Actions</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className="py-3.5 flex items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-2xl px-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <button
                  type="button"
                  className="w-5 h-5 rounded-md border border-zinc-300 dark:border-zinc-600 hover:border-[#966035] flex items-center justify-center mt-0.5 shrink-0 transition-colors"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-[#966035] transition-colors">{item.title}</div>
                  <div className="text-[11px] text-zinc-500">{item.relatedTo} • Due: {item.dueDate}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCopilot(`What background context does ace have for: "${item.title}" related to ${item.relatedTo}?`);
                }}
                className="text-xs font-semibold text-[#966035] hover:text-[#7a4d29] dark:text-amber-300 shrink-0"
              >
                Ask ace
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
