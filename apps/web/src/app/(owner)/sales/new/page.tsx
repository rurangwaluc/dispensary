import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { customers, products } from '@dispensary/db/schema';
import { SaleForm } from '../sale-form';

export default async function NewSalePage() {
  const items = await db
    .select({
      id: products.id,
      name: products.name,
      itemType: products.itemType,
      sellingPrice: products.sellingPrice,
      quantity: products.quantity,
      unit: products.unit,
    })
    .from(products)
    .where(eq(products.status, 'ACTIVE'))
    .orderBy(asc(products.name));

  const customerList = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
    })
    .from(customers)
    .where(eq(customers.status, 'ACTIVE'))
    .orderBy(asc(customers.name));

  return (
    <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
            New sale
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Sell products or services, record paid money, and keep unpaid balance.
          </p>
        </div>

        <Link
          href="/sales"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sales
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          Add at least one product or service before making a sale.
        </div>
      ) : (
        <SaleForm items={items} customers={customerList} />
      )}
    </section>
  );
}
