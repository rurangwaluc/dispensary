'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Stethoscope,
  Users,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';

const moduleGroups = [
  {
    title: 'Home',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Work',
    items: [
      {
        label: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
      },
      {
        label: 'Products',
        href: '/products',
        icon: Package,
      },
      {
        label: 'Services',
        href: '/services',
        icon: Stethoscope,
      },
      {
        label: 'Stock',
        href: '/stock',
        icon: Boxes,
      },
    ],
  },
  {
    title: 'Money',
    items: [
      {
        label: 'Debts',
        href: '/debts',
        icon: CreditCard,
      },
      {
        label: 'Customers',
        href: '/customers',
        icon: Users,
      },
      {
        label: 'Expenses',
        href: '/expenses',
        icon: WalletCards,
      },
      {
        label: 'Reports',
        href: '/reports',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

export function ModuleMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <ClipboardList className="h-4 w-4" />
        <span className="hidden sm:inline">Menu</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close modules menu"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[360px]">
            <div className="mb-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                Menu
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Choose where you want to go.
              </p>
            </div>

            <div className="space-y-4">
              {moduleGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    {group.title}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch
                          onClick={() => setIsOpen(false)}
                          className={
                            isActive
                              ? 'flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-black text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200'
                              : 'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                          }
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
