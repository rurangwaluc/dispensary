import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq, inArray } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { customers, saleItems, sales } from '@dispensary/db/schema';

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer || customer.status !== 'ACTIVE') {
    notFound();
  }

  const saleList = await db
    .select()
    .from(sales)
    .where(eq(sales.customerId, customer.id))
    .orderBy(desc(sales.saleDate));

  const saleIds = saleList.map((sale) => sale.id);

  const itemList =
    saleIds.length > 0
      ? await db.select().from(saleItems).where(inArray(saleItems.saleId, saleIds))
      : [];

  const totalBought = saleList.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const totalPaid = saleList.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
  const unpaidBalance = saleList.reduce((sum, sale) => sum + Number(sale.balanceAmount), 0);

  const summary = [
    { label: 'Total bought', value: money(totalBought), helper: 'All purchases' },
    { label: 'Paid', value: money(totalPaid), helper: 'Money received' },
    { label: 'Unpaid', value: money(unpaidBalance), helper: 'Still owed' },
    { label: 'Sales', value: saleList.length, helper: 'Total sales' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Customer
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              {customer.name}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              {customer.phone || 'No phone number saved'}
            </p>
          </div>

          <Link
            href="/customers"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
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
            This customer has not bought anything yet.
          </p>
        </section>
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Sale</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
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

                    <td className="px-4 py-4 align-top font-black text-slate-900 dark:text-white">
                      {paymentName(sale.paymentMethod)}
                    </td>

                    <td className="px-4 py-4 align-top font-black text-slate-900 dark:text-white">
                      {money(sale.totalAmount)}
                    </td>

                    <td className="px-4 py-4 align-top font-black text-green-700 dark:text-green-300">
                      {money(sale.paidAmount)}
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
