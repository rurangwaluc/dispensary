import { db } from '@dispensary/db/client';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
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
    <section className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
          Why these details matter
        </h2>
        <div className="mt-5 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="py-3">
            <p className="font-black text-slate-800 dark:text-slate-200">Business name</p>
            <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
              This name will appear in the system and reports.
            </p>
          </div>
          <div className="py-3">
            <p className="font-black text-slate-800 dark:text-slate-200">Low stock warning</p>
            <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
              The system will warn you when stock becomes too low.
            </p>
          </div>
          <div className="py-3">
            <p className="font-black text-slate-800 dark:text-slate-200">Expiry warning</p>
            <p className="mt-1 font-medium leading-6 text-slate-500 dark:text-slate-400">
              The system will warn you before drugs expire.
            </p>
          </div>
        </div>
      </aside>

      <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Business details
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            These details help the system show correct business information.
          </p>
        </div>

        <SettingsForm settings={safeSettings} />
      </section>
    </section>
  );
}
