import Link from 'next/link';
import { desc, ilike, or } from 'drizzle-orm';
import { Eye, Search } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { saleItems, sales } from '@dispensary/db/schema';

type DebtsPageProps = {
  searchParams?: Promise<{
    q?: string;
    take?: string;
  }>;
};

const PAGE_SIZE = 10;

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function buildLoadMoreHref(q: string, nextTake: number) {
  const params = new URLSearchParams();

  if (q) {
    params.set('q', q);
  }

  params.set('take', String(nextTake));

  return `/debts?${params.toString()}`;
}

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || '';
  const take = Math.max(PAGE_SIZE, Number(params?.take || PAGE_SIZE));

  const saleList = await db
    .select()
    .from(sales)
    .where(
      q
        ? or(
            ilike(sales.customerName, `%${q}%`),
            ilike(sales.customerPhone, `%${q}%`),
          )
        : undefined,
    )
    .orderBy(desc(sales.saleDate));

  const unpaidSales = saleList.filter((sale) => Number(sale.balanceAmount) > 0);
  const visibleSales = unpaidSales.slice(0, take);
  const hasMore = unpaidSales.length > visibleSales.length;

  const visibleSaleIds = visibleSales.map((sale) => sale.id);

  const itemList =
    visibleSaleIds.length > 0
      ? await db.select().from(saleItems)
      : [];

  const totalDebt = unpaidSales.reduce((sum, sale) => sum + Number(sale.balanceAmount), 0);
  const totalPaid = unpaidSales.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
  const walkInDebts = unpaidSales.filter((sale) => !sale.customerId).length;

  const summary = [
    { label: 'Unpaid money', value: money(totalDebt), helper: 'Still owed' },
    { label: 'Debt sales', value: unpaidSales.length, helper: 'Sales not cleared' },
    { label: 'Already paid', value: money(totalPaid), helper: 'Paid on these debts' },
    { label: 'Walk-in debts', value: walkInDebts, helper: 'No saved customer' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
          Debts
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          See unpaid sales and record money paid later.
        </p>
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

      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search customer name or phone"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
            />
          </div>
          <button className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200">
            Search
          </button>
        </form>
      </div>

      {visibleSales.length === 0 ? (
        <section className="border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            No unpaid sales
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Debts will appear here when a sale is not fully paid.
          </p>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Sale</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Unpaid</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleSales.map((sale) => {
                  const items = itemList.filter((item) => item.saleId === sale.id);
                  const names = items.map((item) => `${item.itemName} x${item.quantity}`).join(', ');

                  return (
                    <tr key={sale.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                      <td className="px-4 py-5 align-top">
                        <p className="font-black text-slate-900 dark:text-white">
                          {sale.customerName || 'Walk-in customer'}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {sale.customerPhone || 'No phone'}
                        </p>
                      </td>

                      <td className="px-4 py-5 align-top">
                        <p className="font-black text-slate-900 dark:text-white">
                          {sale.saleDate.toLocaleDateString()}
                        </p>
                        <p className="mt-1 max-w-md text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {names}
                        </p>
                      </td>

                      <td className="px-4 py-5 align-top font-black text-slate-900 dark:text-white">
                        {money(sale.totalAmount)}
                      </td>

                      <td className="px-4 py-5 align-top font-black text-green-700 dark:text-green-300">
                        {money(sale.paidAmount)}
                      </td>

                      <td className="px-4 py-5 align-top font-black text-yellow-700 dark:text-yellow-300">
                        {money(sale.balanceAmount)}
                      </td>

                      <td className="px-4 py-5 align-top">
                        <div className="flex justify-end">
                          <Link
                            href={`/debts/${sale.id}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visibleSales.map((sale) => {
              const items = itemList.filter((item) => item.saleId === sale.id);
              const names = items.map((item) => `${item.itemName} x${item.quantity}`).join(', ');

              return (
                <article
                  key={sale.id}
                  className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950 dark:text-white">
                        {sale.customerName || 'Walk-in customer'}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {sale.customerPhone || 'No phone'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-black text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
                      Unpaid
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {names || 'Sale items'}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                        {money(sale.totalAmount)}
                      </p>
                    </div>

                    <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Paid
                      </p>
                      <p className="mt-1 text-xs font-black text-green-700 dark:text-green-300">
                        {money(sale.paidAmount)}
                      </p>
                    </div>

                    <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Unpaid
                      </p>
                      <p className="mt-1 text-xs font-black text-yellow-700 dark:text-yellow-300">
                        {money(sale.balanceAmount)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/debts/${sale.id}`}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {visibleSales.length} of {unpaidSales.length}
            </p>

            {hasMore ? (
              <Link
                href={buildLoadMoreHref(q, take + PAGE_SIZE)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
              >
                Load more
              </Link>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
