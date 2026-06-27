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
    <main className="auth-shell min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white">
              D
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-950 dark:text-white">
                Dispensary
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Owner management system
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
                Private access
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Owner sign in
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Access the dispensary dashboard for sales, stock, debts, expenses, and reports.
              </p>
            </div>

            <div className="business-card rounded-2xl p-5 sm:p-6">
              <LoginForm />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-500 dark:text-slate-500">
              <span className="rounded-xl border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-950">
                Sales
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-950">
                Stock
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-950">
                Reports
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
