import Link from 'next/link';
import { Download } from 'lucide-react';
import { cleanReportDate, getDayReport, money } from '@/lib/reports/report-data';

type ReportsPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const selectedDate = cleanReportDate(params?.date);
  const report = await getDayReport(selectedDate);

  const summary = [
    { label: 'Sales', value: money(report.summary.salesTotal), helper: 'Products and services sold' },
    { label: 'Money received', value: money(report.summary.moneyReceived), helper: 'Sales paid plus debt paid' },
    { label: 'Unpaid', value: money(report.summary.creditGiven), helper: 'Money customers still owe' },
    { label: 'Expenses', value: money(report.summary.expensesTotal), helper: 'Money spent' },
    { label: 'Profit estimate', value: money(report.summary.profitEstimate), helper: 'Sales minus cost and expenses' },
    { label: 'Sales count', value: report.summary.salesCount, helper: 'Number of sales' },
    { label: 'Low stock', value: report.summary.lowStockCount, helper: 'Products needing restock' },
    {
      label: 'Expiring soon',
      value: report.summary.expiringSoonCount,
      helper: `${report.expiryWarningDays} days warning`,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Reports
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              See what came in, what went out, what sold, and what needs attention.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <form action="/reports" className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Select day
                </span>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
                />
              </label>

              <button className="h-10 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600">
                Show report
              </button>
            </form>

            <Link
              href={`/reports/download?date=${selectedDate}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          Report for {report.readableDate}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map((item) => (
          <article
            key={item.label}
            className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p
              className={
                item.label === 'Profit estimate' && report.summary.profitEstimate < 0
                  ? 'mt-3 text-xl font-black tracking-tight text-red-700 dark:text-red-300 sm:text-2xl'
                  : 'mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl'
              }
            >
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {item.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            Money received by method
          </h3>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {report.paymentRows.map((row) => (
              <div key={row.method} className="flex items-center justify-between gap-4 py-3">
                <p className="font-black text-slate-900 dark:text-white">{row.name}</p>
                <p className="font-black text-green-700 dark:text-green-300">{money(row.total)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            Expenses by category
          </h3>

          {report.expenseCategoryRows.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No expenses on this day.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {report.expenseCategoryRows.map((row) => (
                <div key={row.category} className="flex items-center justify-between gap-4 py-3">
                  <p className="font-black text-slate-900 dark:text-white">{row.category}</p>
                  <p className="font-black text-red-700 dark:text-red-300">{money(row.total)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Top products sold</h3>

          {report.productRows.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No products sold on this day.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {report.productRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{row.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Quantity sold: {row.quantity}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white">{money(row.total)}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Top services sold</h3>

          {report.serviceRows.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No services sold on this day.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {report.serviceRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{row.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Times sold: {row.quantity}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white">{money(row.total)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Products to restock</h3>
          {report.lowStock.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No low stock products.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {report.lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 py-3">
                  <p className="font-black text-slate-900 dark:text-white">{product.name}</p>
                  <p className="font-black text-yellow-700 dark:text-yellow-300">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Expiring soon</h3>
          {report.expiringSoon.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No product is expiring soon.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {report.expiringSoon.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 py-3">
                  <p className="font-black text-slate-900 dark:text-white">{product.name}</p>
                  <p className="font-black text-yellow-700 dark:text-yellow-300">
                    {product.expiryDate || 'No date'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}
