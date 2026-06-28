import Link from 'next/link';
import { and, asc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { products } from '@dispensary/db/schema';
import { ReceiveStockForm } from './receive-stock-form';

type ReceiveStockPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ReceiveStockPage({ searchParams }: ReceiveStockPageProps) {
  const params = await searchParams;
  const error = params?.error || '';

  const stockProducts = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      quantity: products.quantity,
      unit: products.unit,
      supplierName: products.supplierName,
          })
    .from(products)
    .where(and(eq(products.status, 'ACTIVE'), eq(products.itemType, 'PRODUCT')))
    .orderBy(asc(products.name));

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Stock
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Add stock
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Choose what came in and add it to what is left.
            </p>
          </div>

          <Link
            href="/stock"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to stock
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <ReceiveStockForm products={stockProducts} error={error} />

        <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">What this does</h3>
          <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            <p>What is left increases automatically.</p>
            <p>Supplier, cost, and expiry date are saved when provided.</p>
            <p>The owner can see what came in later.</p>
          </div>
        </aside>
      </section>
    </section>
  );
}
