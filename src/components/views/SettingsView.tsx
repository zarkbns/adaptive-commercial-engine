import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  CheckmarkCircle02Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';
import { UserSession } from '../../services/authService';

interface SettingsViewProps {
  session?: UserSession;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ session }) => {
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState(session?.name || 'Alex Morgan');
  const [userEmail, setUserEmail] = useState(session?.email || 'alex.morgan@company.com');
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your salesperson profile, notification preferences, and workspace settings.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-zinc-900">Profile & Preferences</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">Your Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#966035]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">Email Address</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#966035]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#966035]"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">Daily Follow-Up Reminders</label>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notifications ? 'bg-[#966035]' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                    notifications ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-xs text-zinc-700">{notifications ? 'Enabled (Morning reminder at 8:30 AM)' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-100">
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
