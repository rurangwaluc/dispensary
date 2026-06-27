import { Activity, AlertTriangle, Banknote, Boxes, CreditCard, LogOut, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { logoutAction } from '@/lib/auth/actions';
import { requireOwner } from '@/lib/auth/session';

const cards = [
  { label: 'Today sales', value: 'RWF 0', icon: TrendingUp, tone: 'sky' },
  { label: 'Money received', value: 'RWF 0', icon: Banknote, tone: 'green' },
  { label: 'Credit given', value: 'RWF 0', icon: CreditCard, tone: 'yellow' },
  { label: 'Low stock', value: '0 items', icon: Boxes, tone: 'sky' },
];

export default async function DashboardPage() {
  const owner = await requireOwner();

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white shadow-lg shadow-sky-500/20">D</div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Dashboard</p>
              <h1 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Welcome, {owner.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{card.label}</p>
                <card.icon className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Needs attention</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">This will show low stock, expiring drugs, and unpaid debts.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Low stock products', 'Expiring soon', 'Unpaid customers', 'Today expenses'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Next feature</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Business settings comes after authentication is complete.</p>
              </div>
            </div>
            <p className="rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
              Authentication is active when owner login, protected access, logout, theme switching, and mobile layout all pass.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}