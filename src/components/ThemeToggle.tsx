import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, Moon01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
        isDark
          ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700 shadow-xs'
          : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <HugeiconsIcon
        icon={isDark ? Sun01Icon : Moon01Icon}
        className={`h-3.5 w-3.5 ${isDark ? 'text-amber-300' : 'text-zinc-500'}`}
      />
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
};
