import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentOwner } from '@/lib/auth/session';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const owner = await getCurrentOwner();

  if (owner) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white shadow-lg shadow-sky-500/25">
              D
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Dispensary</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Owner control system</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 dark:border-green-900/70 dark:bg-green-950/40 dark:text-green-300">
              Stock • Sales • Debts • Reports
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Know what matters before thinking twice.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Sign in to control today’s sales, money received, unpaid balances, low stock, expiring drugs, expenses, and reports.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {['Today sales', 'Low stock', 'Debts', 'Expenses', 'Profit', 'Reports'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/88 dark:shadow-black/20 sm:p-7">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Owner login</h2>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                This system is private. Only the owner account can access the dashboard.
              </p>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}