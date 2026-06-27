import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { logoutAction } from '@/lib/auth/actions';
import { requireOwner } from '@/lib/auth/session';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  await requireOwner();

  const settings = await db.query.businessSettings.findFirst();

  const safeSettings = {
    businessName: settings?.businessName || 'Dispensary Manager',
    ownerName: settings?.ownerName || 'Owner',
    phone: settings?.phone || '',
    address: settings?.address || '',
    currency: settings?.currency || 'RWF',
    lowStockAlertQuantity: settings?.lowStockAlertQuantity || '5',
    expiryAlertDays: settings?.expiryAlertDays || '60',
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-3 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-5">
        <header className="border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-black text-white">
                D
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Settings
                </p>
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                  Business settings
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <form action={logoutAction}>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
              What these settings control
            </h2>
            <div className="mt-5 divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <div className="py-3">
                <p className="font-black text-slate-800 dark:text-slate-200">Dashboard labels</p>
                <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
                  Business and owner identity across the system.
                </p>
              </div>
              <div className="py-3">
                <p className="font-black text-slate-800 dark:text-slate-200">Stock warnings</p>
                <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
                  When a product should be shown as low stock.
                </p>
              </div>
              <div className="py-3">
                <p className="font-black text-slate-800 dark:text-slate-200">Expiry warnings</p>
                <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
                  How early drugs should appear as expiring soon.
                </p>
              </div>
            </div>
          </aside>

          <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                Main business details
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Keep this simple. These details will support reports and alerts later.
              </p>
            </div>

            <SettingsForm settings={safeSettings} />
          </section>
        </section>
      </div>
    </main>
  );
}
