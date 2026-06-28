import Link from 'next/link';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { Edit, Plus, Search } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { businessSettings, products } from '@dispensary/db/schema';
import { HideItemButton } from './hide-item-button';

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    take?: string;
  }>;
};

const PAGE_SIZE = 10;

function money(value: string) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function buildLoadMoreHref(q: string, selectedType: string, nextTake: number) {
  const params = new URLSearchParams();

  if (q) {
    params.set('q', q);
  }

  if (selectedType) {
    params.set('type', selectedType);
  }

  params.set('take', String(nextTake));

  return `/products?${params.toString()}`;
}

function filterLink(type: string | null) {
  if (!type) {
    return '/products';
  }

  return `/products?type=${type}`;
}

function getStockLabel(quantity: number, minQuantity: number) {
  if (quantity <= 0) {
    return {
      text: 'Out of stock',
      className:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
    };
  }

  if (quantity <= minQuantity) {
    return {
      text: 'Low stock',
      className:
        'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200',
    };
  }

  return {
    text: 'Enough',
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200',
  };
}

function getExpiryLabel(expiryDate: string | null, warningDays: number) {
  if (!expiryDate) {
    return {
      text: 'No date',
      className:
        'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
      isSoon: false,
    };
  }

  const today = new Date();
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);

  if (daysLeft < 0) {
    return {
      text: 'Expired',
      className:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
      isSoon: false,
    };
  }

  if (daysLeft <= warningDays) {
    return {
      text: 'Expiring soon',
      className:
        'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200',
      isSoon: true,
    };
  }

  return {
    text: 'Good',
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200',
    isSoon: false,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || '';
  const selectedType = params?.type === 'PRODUCT' || params?.type === 'SERVICE' ? params.type : '';
  const take = Math.max(PAGE_SIZE, Number(params?.take || PAGE_SIZE));

  const settings = await db.select().from(businessSettings).limit(1);
  const expiryWarningDays = Number(settings[0]?.expiryAlertDays || 60);

  const allActiveItems = await db.select().from(products).where(eq(products.status, 'ACTIVE'));

  const filteredItems = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, 'ACTIVE'),
        selectedType ? eq(products.itemType, selectedType) : undefined,
        q
          ? or(
              ilike(products.name, `%${q}%`),
              ilike(products.category, `%${q}%`),
              ilike(products.batchNumber, `%${q}%`),
              ilike(products.supplierName, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(products.createdAt));

  const visibleItems = filteredItems.slice(0, take);
  const hasMore = filteredItems.length > visibleItems.length;

  const productCount = allActiveItems.filter((item) => item.itemType === 'PRODUCT').length;
  const serviceCount = allActiveItems.filter((item) => item.itemType === 'SERVICE').length;
  const lowStockCount = allActiveItems.filter(
    (item) => item.itemType === 'PRODUCT' && item.quantity <= item.minQuantity,
  ).length;
  const expiringSoonCount = allActiveItems.filter(
    (item) => item.itemType === 'PRODUCT' && getExpiryLabel(item.expiryDate, expiryWarningDays).isSoon,
  ).length;

  const summary = [
    { label: 'Products', value: productCount, helper: 'Drugs and stock' },
    { label: 'Services', value: serviceCount, helper: 'No stock needed' },
    { label: 'Low stock', value: lowStockCount, helper: 'Need restock' },
    { label: 'Expiring soon', value: expiringSoonCount, helper: `${expiryWarningDays} days warning` },
  ];

  const filters = [
    { label: 'All', href: filterLink(null), active: !selectedType },
    { label: 'Products', href: filterLink('PRODUCT'), active: selectedType === 'PRODUCT' },
    { label: 'Services', href: filterLink('SERVICE'), active: selectedType === 'SERVICE' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Products and services
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Manage drugs, services, prices, stock, suppliers, and expiry dates.
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            Add item
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
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {item.helper}
            </p>
          </article>
        ))}
      </section>

      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className={
                filter.active
                  ? 'inline-flex h-9 items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-4 text-xs font-black text-sky-800 dark:border-sky-500 dark:bg-sky-500 dark:text-white'
                  : 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200'
              }
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="type" value={selectedType} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, category, batch, or supplier"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
            />
          </div>
          <button className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200">
            Search
          </button>
        </form>
      </div>

      {visibleItems.length === 0 ? (
        <section className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              No items found
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Add a product or service, or change your search.
            </p>
            <Link
              href="/products/new"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" />
              Add item
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock / date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleItems.map((item) => {
                  const stockLabel = getStockLabel(item.quantity, item.minQuantity);
                  const expiryLabel = getExpiryLabel(item.expiryDate, expiryWarningDays);
                  const isService = item.itemType === 'SERVICE';

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                      <td className="px-4 py-5 align-top">
                        <p className="font-black text-slate-900 dark:text-white">{item.name}</p>
                        <div className="mt-1 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <p>{item.category}</p>
                          {!isService ? (
                            <p>
                              {item.batchNumber ? `Batch ${item.batchNumber}` : 'No batch number'}
                              {item.supplierName ? ` · ${item.supplierName}` : ''}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-5 align-top">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                          {isService ? 'Service' : 'Product'}
                        </span>
                      </td>

                      <td className="px-4 py-5 align-top">
                        <p className="font-black text-slate-900 dark:text-white">
                          {money(item.sellingPrice)}
                        </p>
                        {!isService ? (
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Bought: {money(item.buyingPrice)}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-5 align-top">
                        {isService ? (
                          <p className="font-black text-slate-900 dark:text-white">No stock needed</p>
                        ) : (
                          <>
                            <p className="font-black text-slate-900 dark:text-white">
                              {item.quantity} {item.unit}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-black ${stockLabel.className}`}>
                                {stockLabel.text}
                              </span>
                              <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-black ${expiryLabel.className}`}>
                                {expiryLabel.text}
                              </span>
                            </div>
                          </>
                        )}
                      </td>

                      <td className="px-4 py-5 align-top">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/products/${item.id}/edit`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <HideItemButton itemId={item.id} itemName={item.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visibleItems.map((item) => {
              const stockLabel = getStockLabel(item.quantity, item.minQuantity);
              const expiryLabel = getExpiryLabel(item.expiryDate, expiryWarningDays);
              const isService = item.itemType === 'SERVICE';

              return (
                <article
                  key={item.id}
                  className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950 dark:text-white">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      {isService ? 'Service' : 'Product'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Price
                      </p>
                      <p className="mt-1 font-black text-slate-900 dark:text-white">
                        {money(item.sellingPrice)}
                      </p>
                    </div>

                    <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                        {isService ? 'Stock' : 'Quantity'}
                      </p>
                      <p className="mt-1 font-black text-slate-900 dark:text-white">
                        {isService ? 'Not needed' : `${item.quantity} ${item.unit}`}
                      </p>
                    </div>

                    {!isService ? (
                      <>
                        <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Stock
                          </p>
                          <span className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-black ${stockLabel.className}`}>
                            {stockLabel.text}
                          </span>
                        </div>

                        <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Date
                          </p>
                          <span className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-black ${expiryLabel.className}`}>
                            {expiryLabel.text}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/products/${item.id}/edit`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <div className="[&_button]:h-10 [&_button]:w-full">
                      <HideItemButton itemId={item.id} itemName={item.name} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {visibleItems.length} of {filteredItems.length}
            </p>

            {hasMore ? (
              <Link
                href={buildLoadMoreHref(q, selectedType, take + PAGE_SIZE)}
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
