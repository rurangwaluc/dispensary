'use client';

import { useActionState } from 'react';
import { updateBusinessSettingsAction } from '@/lib/settings/actions';

type SettingsFormProps = {
  settings: {
    businessName: string;
    ownerName: string;
    phone: string;
    address: string;
    currency: string;
    lowStockAlertQuantity: string;
    expiryAlertDays: string;
  };
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, action, pending] = useActionState(updateBusinessSettingsAction, {});

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            defaultValue={settings.businessName}
            required
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ownerName" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Owner name
          </label>
          <input
            id="ownerName"
            name="ownerName"
            defaultValue={settings.ownerName}
            required
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={settings.phone}
            placeholder="+250..."
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            value="RWF"
            readOnly
            className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lowStockAlertQuantity" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Low stock alert quantity
          </label>
          <input
            id="lowStockAlertQuantity"
            name="lowStockAlertQuantity"
            type="number"
            min="1"
            defaultValue={settings.lowStockAlertQuantity}
            required
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expiryAlertDays" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Expiry alert days
          </label>
          <input
            id="expiryAlertDays"
            name="expiryAlertDays"
            type="number"
            min="1"
            defaultValue={settings.expiryAlertDays}
            required
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Business address
        </label>
        <textarea
          id="address"
          name="address"
          defaultValue={settings.address}
          rows={4}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {pending ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
