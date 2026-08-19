import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Settings01Icon,
  Sun01Icon,
  Moon01Icon,
  Layers01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { UserSession } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

interface SettingsViewProps {
  session?: UserSession;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ session }) => {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState(session?.name || 'Alex Morgan');
  const [userEmail, setUserEmail] = useState(session?.email || 'alex.morgan@company.com');
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');

  // Live HydraDB Substrate Health State
  const [hydraStatus, setHydraStatus] = useState<any>(null);
  const [isCheckingHydra, setIsCheckingHydra] = useState(false);

  const checkHydraHealth = async () => {
    setIsCheckingHydra(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHydraStatus(data);
      } else {
        setHydraStatus({ status: 'error', error: 'HTTP ' + res.status });
      }
    } catch (e: any) {
      setHydraStatus({ status: 'error', error: e.message });
    } finally {
      setIsCheckingHydra(false);
    }
  };

  useEffect(() => {
    checkHydraHealth();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Settings & Substrate</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account profile, theme, and inspect the HydraDB persistent graph connection.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {/* HydraDB Graph Substrate Health Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] dark:bg-zinc-800 text-[#966035] dark:text-amber-300 border border-[#e6ded3] dark:border-zinc-700 flex items-center justify-center">
              <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">HydraDB Persistent Graph Memory</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Authoritative customer memory substrate</p>
            </div>
          </div>

          <button
            type="button"
            onClick={checkHydraHealth}
            disabled={isCheckingHydra}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`h-3 w-3 ${isCheckingHydra ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-medium">Substrate Status</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hydraStatus?.hydraConfig?.upstreamReachable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{hydraStatus?.hydraConfig?.upstreamReachable ? 'Connected & Ready' : 'Connecting / Standalone'}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-medium">Graph Namespace</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
              {hydraStatus?.hydraConfig?.namespace || 'default'}
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-medium">Query Protocol</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
              OpenCypher REST
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Preferences Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Profile & Preferences</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Your Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#966035]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#966035]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Theme / Appearance</label>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#f7f4ee] border-[#966035] text-[#7a4d29] shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <HugeiconsIcon icon={Sun01Icon} className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-[#966035] text-amber-300 shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <HugeiconsIcon icon={Moon01Icon} className="h-3.5 w-3.5 text-amber-300" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#966035]"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Daily Follow-Up Reminders</label>
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notifications ? 'bg-[#966035]' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                    notifications ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">{notifications ? 'Enabled (Morning reminder at 8:30 AM)' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
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
