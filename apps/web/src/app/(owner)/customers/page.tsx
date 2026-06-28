import Link from 'next/link';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { Eye, Search, Users } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { customers, sales } from '@dispensary/db/schema';
import { ArchiveCustomerButton } from './archive-customer-button';

type CustomersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function money(value: number) {
  return `RWF ${value.toLocaleString('en-US')}`;
}

function niceDate(value: Date | null) {
  if (!value) {
    return 'No sale yet';
  }

  return value.toLocaleDateString();
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || '';

  const customerList = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.status, 'ACTIVE'),
        q
          ? or(
              ilike(customers.name, `%${q}%`),
              ilike(customers.phone, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(customers.createdAt));

  const saleList = await db.select().from(sales).orderBy(desc(sales.saleDate));

  const customerRows = customerList.map((customer) => {
    const customerSales = saleList.filter((sale) => sale.customerId === customer.id);
    const totalBought = customerSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const unpaidBalance = customerSales.reduce((sum, sale) => sum + Number(sale.balanceAmount), 0);
    const lastSale = customerSales[0]?.saleDate || null;

    return {
      customer,
      salesCount: customerSales.length,
      totalBought,
      unpaidBalance,
      lastSale,
    };
  });

  const totalCustomers = customerRows.length;
  const customersWithDebt = customerRows.filter((row) => row.unpaidBalance > 0).length;
  const totalUnpaid = customerRows.reduce((sum, row) => sum + row.unpaidBalance, 0);
  const totalBought = customerRows.reduce((sum, row) => sum + row.totalBought, 0);

  const summary = [
    { label: 'Customers', value: totalCustomers, helper: 'Saved customers' },
    { label: 'Total bought', value: money(totalBought), helper: 'All customer sales' },
    { label: 'Unpaid balance', value: money(totalUnpaid), helper: 'Money still owed' },
    { label: 'With debt', value: customersWithDebt, helper: 'Need follow up' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Customers
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              See saved customers, what they bought, and unpaid balances.
            </p>
          </div>
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

      {customerRows.length === 0 ? (
        <section className="border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            No customers found
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            New customers are saved when you choose “New customer” while making a sale.
          </p>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Bought</th>
                  <th className="px-4 py-3">Unpaid</th>
                  <th className="px-4 py-3">Last sale</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerRows.map((row) => (
                  <tr key={row.customer.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">{row.customer.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {row.customer.phone || 'No phone'}
                      </p>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">{money(row.totalBought)}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {row.salesCount} sale{row.salesCount === 1 ? '' : 's'}
                      </p>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <p
                        className={
                          row.unpaidBalance > 0
                            ? 'font-black text-yellow-700 dark:text-yellow-300'
                            : 'font-black text-green-700 dark:text-green-300'
                        }
                      >
                        {money(row.unpaidBalance)}
                      </p>
                    </td>

                    <td className="px-4 py-5 align-top font-black text-slate-900 dark:text-white">
                      {niceDate(row.lastSale)}
                    </td>

                    <td className="px-4 py-5 align-top">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/customers/${row.customer.id}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Open
                        </Link>
                        <ArchiveCustomerButton
                          customerId={row.customer.id}
                          customerName={row.customer.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {customerRows.map((row) => (
              <article
                key={row.customer.id}
                className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950 dark:text-white">{row.customer.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {row.customer.phone || 'No phone'}
                    </p>
                  </div>
                  <span
                    className={
                      row.unpaidBalance > 0
                        ? 'shrink-0 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-black text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200'
                        : 'shrink-0 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-black text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200'
                    }
                  >
                    {row.unpaidBalance > 0 ? 'Has debt' : 'Clear'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Bought
                    </p>
                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {money(row.totalBought)}
                    </p>
                  </div>

                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Unpaid
                    </p>
                    <p
                      className={
                        row.unpaidBalance > 0
                          ? 'mt-1 font-black text-yellow-700 dark:text-yellow-300'
                          : 'mt-1 font-black text-green-700 dark:text-green-300'
                      }
                    >
                      {money(row.unpaidBalance)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/customers/${row.customer.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open
                  </Link>
                  <div className="[&_button]:h-10 [&_button]:w-full">
                    <ArchiveCustomerButton
                      customerId={row.customer.id}
                      customerName={row.customer.name}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
