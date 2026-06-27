import Link from 'next/link';
import { Banknote, Boxes, CreditCard, LogOut, Settings, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { logoutAction } from '@/lib/auth/actions';
import { requireOwner } from '@/lib/auth/session';

const summaryCards = [
  {
    label: 'Today sales',
    value: 'RWF 0',
    helper: 'Recorded today',
    icon: TrendingUp,
  },
  {
    label: 'Money received',
    value: 'RWF 0',
    helper: 'Cash and mobile money',
    icon: Banknote,
  },
  {
    label: 'Credit given',
    value: 'RWF 0',
    helper: 'Unpaid today',
    icon: CreditCard,
  },
  {
    label: 'Low stock',
    value: '0 items',
    helper: 'Needs restocking',
    icon: Boxes,
  },
];

const attentionItems = [
  {
    label: 'Low stock products',
    value: '0',
    tone: 'text-sky-700 dark:text-sky-300',
  },
  {
    label: 'Expiring soon',
    value: '0',
    tone: 'text-yellow-700 dark:text-yellow-300',
  },
  {
    label: 'Unpaid customers',
    value: '0',
    tone: 'text-green-700 dark:text-green-300',
  },
  {
    label: 'Today expenses',
    value: 'RWF 0',
    tone: 'text-slate-700 dark:text-slate-300',
  },
];

export default async function DashboardPage() {
  const owner = await requireOwner();

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-3 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
        <header className="border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-black text-white">
                D
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  Dashboard
                </p>
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                  Welcome, {owner.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/settings"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
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

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-1 hidden text-xs font-semibold text-slate-400 dark:text-slate-500 sm:block">
                    {card.helper}
                  </p>
                </div>
                <card.icon className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" />
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {card.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                  Needs attention
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  The owner should check these before making decisions.
                </p>
              </div>
              <span className="rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200">
                Today
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attentionItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {item.label}
                  </p>
                  <p className={`text-sm font-black ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                Authentication status
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Owner access is active and protected.
              </p>
            </div>

            <div className="space-y-3">
              {['Owner login works', 'Dashboard is protected', 'Logout is active', 'Mobile layout is ready'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                      {item}
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-green-700 dark:text-green-300">
                      OK
                    </span>
                  </div>
                ),
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
