import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  PlusSignIcon,
  Search01Icon,
  Calendar01Icon,
  CallIcon,
  Mail01Icon,
  File01Icon,
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
      relatedTo: newTaskRelated.trim() || 'General Task',
      dueDate: 'Today',
      priority: 'High',
      type: 'Call',
    });
    setTasks(consumerStore.getTasks());
    setNewTaskTitle('');
    setNewTaskRelated('');
    setShowAddForm(false);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Tasks</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f7f4ee] text-[#7a4d29] border border-[#e6ded3]">
              {pendingTasks.length} Pending
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Keep track of your daily follow-up calls, proposal emails, customer meetings, and deal checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-white rounded-3xl p-5 border border-[#e6ded3] shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Create New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task description (e.g., Call Sarah to review price terms)"
              className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-[#966035]"
              required
            />
            <input
              type="text"
              value={newTaskRelated}
              onChange={(e) => setNewTaskRelated(e.target.value)}
              placeholder="Related Consumer or Account name"
              className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-[#966035]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900">Today's Action Items</h2>
        <div className="divide-y divide-zinc-100">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="py-3.5 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  className="w-5 h-5 rounded-md border border-zinc-300 hover:border-[#966035] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  {task.completed && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-[#966035]" />}
                </button>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-[#966035] transition-colors truncate">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {task.relatedTo} • Due: {task.dueDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-400">Completed</h3>
            <div className="divide-y divide-zinc-100">
              {completedTasks.map((task) => (
                <div key={task.id} className="py-2 flex items-center justify-between opacity-60">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(task.id)}
                      className="w-5 h-5 rounded-md bg-[#f7f4ee] border border-[#e6ded3] flex items-center justify-center text-[#966035] cursor-pointer shrink-0"
                    >
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
                    </button>
                    <span className="text-xs line-through text-zinc-500">{task.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{task.relatedTo}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
