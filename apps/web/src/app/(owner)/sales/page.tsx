import Link from 'next/link';
import { desc, inArray } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { saleItems, sales } from '@dispensary/db/schema';

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function paymentName(value: string) {
  const names: Record<string, string> = {
    CASH: 'Cash',
    MOBILE_MONEY: 'Mobile money',
    BANK: 'Bank',
    CARD: 'Card',
  };

  return names[value] || value;
}

export default async function SalesPage() {
  const saleList = await db.select().from(sales).orderBy(desc(sales.saleDate)).limit(100);
  const saleIds = saleList.map((sale) => sale.id);

  const itemList =
    saleIds.length > 0
      ? await db.select().from(saleItems).where(inArray(saleItems.saleId, saleIds))
      : [];

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const todaySales = saleList.filter((sale) => sale.saleDate.toISOString().slice(0, 10) === todayKey);
  const totalToday = todaySales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const receivedToday = todaySales.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
  const creditToday = todaySales.reduce((sum, sale) => sum + Number(sale.balanceAmount), 0);

  const summary = [
    { label: 'Today sales', value: money(totalToday), helper: 'Total sold today' },
    { label: 'Money received', value: money(receivedToday), helper: 'Paid today' },
    { label: 'Credit given', value: money(creditToday), helper: 'Unpaid today' },
    { label: 'Sales count', value: todaySales.length, helper: 'Sales today' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Sales
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Record products, services, paid money, and unpaid balances.
            </p>
          </div>

          <Link
            href="/sales/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            New sale
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <article
            key={item.label}
            className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {item.helper}
            </p>
          </article>
        ))}
      </section>

      {saleList.length === 0 ? (
        <section className="border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            No sales yet
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Start by recording the first sale.
          </p>
          <Link
            href="/sales/new"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            New sale
          </Link>
        </section>
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Sale</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Unpaid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {saleList.map((sale) => {
                const items = itemList.filter((item) => item.saleId === sale.id);
                const names = items.map((item) => `${item.itemName} x${item.quantity}`).join(', ');

                return (
                  <tr key={sale.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                    <td className="px-4 py-4 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {sale.saleDate.toLocaleDateString()}
                      </p>
                      <p className="mt-1 max-w-md text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {names}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {sale.customerName || 'Walk-in customer'}
                      </p>
                      {sale.customerPhone ? (
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {sale.customerPhone}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {paymentName(sale.paymentMethod)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-green-700 dark:text-green-300">
                        Paid: {money(sale.paidAmount)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top font-black text-slate-900 dark:text-white">
                      {money(sale.totalAmount)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={
                          Number(sale.balanceAmount) > 0
                            ? 'font-black text-yellow-700 dark:text-yellow-300'
                            : 'font-black text-green-700 dark:text-green-300'
                        }
                      >
                        {money(sale.balanceAmount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
