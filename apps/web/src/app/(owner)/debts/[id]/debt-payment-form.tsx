'use client';

import { useActionState } from 'react';
import { recordDebtPaymentAction } from '@/lib/debts/actions';

type DebtPaymentFormProps = {
  saleId: string;
  balanceAmount: string;
};

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

export function DebtPaymentForm({ saleId, balanceAmount }: DebtPaymentFormProps) {
  const [state, action, pending] = useActionState(recordDebtPaymentAction, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="saleId" value={saleId} />

      <div className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Unpaid amount
        </p>
        <p className="mt-2 text-2xl font-black text-yellow-700 dark:text-yellow-300">
          {money(balanceAmount)}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Amount paid now
        </label>
        <input
          id="amount"
          name="amount"
          inputMode="decimal"
          placeholder="Example: 500"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="paymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
        >
          <option value="CASH">Cash</option>
          <option value="MOBILE_MONEY">Mobile money</option>
          <option value="BANK">Bank</option>
          <option value="CARD">Card</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Optional"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
        />
      </div>

      {state.error ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
          {state.success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? 'Saving...' : 'Save payment'}
      </button>
    </form>
  );
}
