'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/auth/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="owner@dispensary.local"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter owner password"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
        />
      </div>

      {state.error ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
