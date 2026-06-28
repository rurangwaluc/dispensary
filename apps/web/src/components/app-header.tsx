'use client';

import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';
import { ModuleMenu } from './module-menu';
import { ThemeToggle } from './theme-toggle';

function getPageName(pathname: string) {
  if (pathname === '/dashboard') {
    return { eyebrow: 'Dashboard', title: 'Welcome' };
  }

  if (pathname === '/settings') {
    return { eyebrow: 'Settings', title: 'Business settings' };
  }

  if (pathname === '/products/new') {
    return { eyebrow: 'Products', title: 'Add product or service' };
  }

  if (pathname.startsWith('/products/') && pathname.endsWith('/edit')) {
    return { eyebrow: 'Products', title: 'Edit product or service' };
  }

  if (pathname === '/products') {
    return { eyebrow: 'Products', title: 'Products and services' };
  }

  if (pathname === '/sales/new') {
    return { eyebrow: 'Sales', title: 'New sale' };
  }

  if (pathname === '/sales') {
    return { eyebrow: 'Sales', title: 'Sales' };
  }

  if (pathname === '/stock/receive') {
    return { eyebrow: 'Stock', title: 'Add stock' };
  }

  if (pathname === '/stock') {
    return { eyebrow: 'Stock', title: 'Stock' };
  }

  if (pathname?.startsWith('/debts/') && pathname !== '/debts') {
    return { eyebrow: 'Debts', title: 'Debt details' };
  }

  if (pathname === '/debts') {
    return { eyebrow: 'Debts', title: 'Debts' };
  }

  if (pathname?.startsWith('/customers/') && pathname !== '/customers') {
    return { eyebrow: 'Customers', title: 'Customer details' };
  }

  if (pathname === '/customers') {
    return { eyebrow: 'Customers', title: 'Customers' };
  }

  if (pathname === '/expenses') {
    return { eyebrow: 'Expenses', title: 'Expenses' };
  }

  if (pathname === '/reports') {
    return { eyebrow: 'Reports', title: 'Reports' };
  }

  return { eyebrow: 'Menu', title: 'Owner system' };
}

type AppHeaderProps = {
  ownerName: string;
};

export function AppHeader({ ownerName }: AppHeaderProps) {
  const pathname = usePathname();
  const page = getPageName(pathname);
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
