import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { debtPayments, saleItems, sales } from '@dispensary/db/schema';
import { DebtPaymentForm } from './debt-payment-form';

type DebtDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    take?: string;
  }>;
};

const PAGE_SIZE = 10;

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

function buildLoadMoreHref(saleId: string, nextTake: number) {
  return `/debts/${saleId}?take=${nextTake}`;
}

export default async function DebtDetailPage({
  params,
  searchParams,
}: DebtDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const take = Math.max(PAGE_SIZE, Number(query?.take || PAGE_SIZE));

  const [sale] = await db.select().from(sales).where(eq(sales.id, id)).limit(1);

  if (!sale) {
    notFound();
  }

  const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id));

  const payments = await db
    .select()
    .from(debtPayments)
    .where(eq(debtPayments.saleId, sale.id))
    .orderBy(desc(debtPayments.paidAt));

  const visiblePayments = payments.slice(0, take);
  const hasMorePayments = payments.length > visiblePayments.length;

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Debt details
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              {sale.customerName || 'Walk-in customer'}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              {sale.customerPhone || 'No phone'} · {sale.saleDate.toLocaleDateString()}
            </p>
          </div>

          <Link
            href="/debts"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to debts
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Sale items</h3>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">
                      {item.itemName} x{item.quantity}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {paymentName(sale.paymentMethod)}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white">
                    {money(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Payment history
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Later payments recorded for this debt.
                </p>
              </div>
            </div>

            {visiblePayments.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                No later payment recorded yet.
              </p>
            ) : (
              <>
                <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {visiblePayments.map((payment) => (
                    <div key={payment.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">
                            {money(payment.amount)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {paymentName(payment.paymentMethod)} ·{' '}
                            {payment.paidAt.toLocaleDateString()}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-black text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
                          Paid
                        </span>
                      </div>

                      {payment.notes ? (
                        <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                          {payment.notes}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col items-center gap-2 border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Showing {visiblePayments.length} of {payments.length}
                  </p>

                  {hasMorePayments ? (
                    <Link
                      href={buildLoadMoreHref(sale.id, take + PAGE_SIZE)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                    >
                      Load more
                    </Link>
                  ) : null}
                </div>
              </>
            )}
          </article>
        </div>

        <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Record payment</h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Save money paid later by the customer.
          </p>

          <div className="mt-4">
            {Number(sale.balanceAmount) > 0 ? (
              <DebtPaymentForm saleId={sale.id} balanceAmount={sale.balanceAmount} />
            ) : (
              <div className="border border-green-200 bg-green-50 p-4 text-sm font-black text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
                This debt is fully paid.
              </div>
            )}
          </div>
        </aside>
      </section>
    </section>
  );
}
