'use client';

import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';
import { ModuleMenu } from './module-menu';
import { ThemeToggle } from './theme-toggle';

const pageNames: Record<string, { eyebrow: string; title: string }> = {
  '/dashboard': { eyebrow: 'Dashboard', title: 'Welcome' },
  '/settings': { eyebrow: 'Settings', title: 'Business settings' },
  '/sales': { eyebrow: 'Sales', title: 'Sales' },
  '/products': { eyebrow: 'Products', title: 'Products and drugs' },
  '/services': { eyebrow: 'Services', title: 'Services' },
  '/stock': { eyebrow: 'Stock', title: 'Stock' },
  '/debts': { eyebrow: 'Debts', title: 'Debts' },
  '/customers': { eyebrow: 'Customers', title: 'Customers' },
  '/expenses': { eyebrow: 'Expenses', title: 'Expenses' },
  '/reports': { eyebrow: 'Reports', title: 'Reports' },
};

type AppHeaderProps = {
  ownerName: string;
};

export function AppHeader({ ownerName }: AppHeaderProps) {
  const pathname = usePathname();
  const page = pageNames[pathname] || pageNames['/dashboard'];
  const title = pathname === '/dashboard' ? `${page.title}, ${ownerName}` : page.title;

  return (
    <header className="border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-black text-white">
            D
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
              {page.eyebrow}
            </p>
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <ModuleMenu />
          <ThemeToggle />
          <form action={logoutAction}>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
