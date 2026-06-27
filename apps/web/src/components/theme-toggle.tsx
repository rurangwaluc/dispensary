'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
      }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
