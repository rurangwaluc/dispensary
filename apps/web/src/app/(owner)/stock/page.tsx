import Link from 'next/link';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { Edit, Search } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { businessSettings, products } from '@dispensary/db/schema';

type StockPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    take?: string;
  }>;
};

const PAGE_SIZE = 10;

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function buildLoadMoreHref(q: string, status: string, nextTake: number) {
  const params = new URLSearchParams();

  if (q) {
    params.set('q', q);
  }

  if (status) {
    params.set('status', status);
  }

  params.set('take', String(nextTake));

  return `/stock?${params.toString()}`;
}

function filterHref(status: string | null) {
  if (!status) {
    return '/stock';
  }

  return `/stock?status=${status}`;
}

function getStockState(quantity: number, minQuantity: number) {
  if (quantity <= 0) {
    return {
      key: 'OUT',
      text: 'Out of stock',
      className:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
    };
  }

  if (quantity <= minQuantity) {
    return {
      key: 'LOW',
      text: 'Low stock',
      className:
        'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200',
    };
  }

  return {
    key: 'GOOD',
    text: 'Enough',
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200',
  };
}

function getExpiryState(expiryDate: string | null, warningDays: number) {
  if (!expiryDate) {
    return {
      key: 'NO_DATE',
      text: 'No date',
      className:
        'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
    };
  }

  const today = new Date();
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);

  if (daysLeft < 0) {
    return {
      key: 'EXPIRED',
      text: 'Expired',
      className:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
    };
  }

  if (daysLeft <= warningDays) {
    return {
      key: 'EXPIRING',
      text: 'Expiring soon',
      className:
        'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200',
    };
  }

  return {
    key: 'GOOD',
    text: 'Good',
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200',
  };
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || '';
  const selectedStatus = ['OUT', 'LOW', 'EXPIRING', 'EXPIRED'].includes(params?.status || '')
    ? params?.status || ''
    : '';
  const take = Math.max(PAGE_SIZE, Number(params?.take || PAGE_SIZE));

  const settings = await db.select().from(businessSettings).limit(1);
  const expiryWarningDays = Number(settings[0]?.expiryAlertDays || 60);

  const productList = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, 'ACTIVE'),
        eq(products.itemType, 'PRODUCT'),
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

  const rows = productList.map((product) => {
    const stockState = getStockState(product.quantity, product.minQuantity);
    const expiryState = getExpiryState(product.expiryDate, expiryWarningDays);

    return {
      product,
      stockState,
      expiryState,
    };
  });

  const filteredRows = rows.filter((row) => {
    if (!selectedStatus) {
      return true;
    }

    if (selectedStatus === 'OUT') {
      return row.stockState.key === 'OUT';
    }

    if (selectedStatus === 'LOW') {
      return row.stockState.key === 'LOW';
    }

    if (selectedStatus === 'EXPIRING') {
      return row.expiryState.key === 'EXPIRING';
    }

    if (selectedStatus === 'EXPIRED') {
      return row.expiryState.key === 'EXPIRED';
    }

    return true;
  });

  const visibleRows = filteredRows.slice(0, take);
  const hasMore = filteredRows.length > visibleRows.length;

  const outOfStock = rows.filter((row) => row.stockState.key === 'OUT').length;
  const lowStock = rows.filter((row) => row.stockState.key === 'LOW').length;
  const expiringSoon = rows.filter((row) => row.expiryState.key === 'EXPIRING').length;
  const expired = rows.filter((row) => row.expiryState.key === 'EXPIRED').length;

  const summary = [
    { label: 'Products', value: rows.length, helper: 'Stock items' },
    { label: 'Out of stock', value: outOfStock, helper: 'Cannot sell' },
    { label: 'Low stock', value: lowStock, helper: 'Need restock' },
    { label: 'Expiring soon', value: expiringSoon, helper: `${expiryWarningDays} days warning` },
  ];

  const filters = [
    { label: 'All', value: '', active: !selectedStatus },
    { label: 'Out of stock', value: 'OUT', active: selectedStatus === 'OUT' },
    { label: 'Low stock', value: 'LOW', active: selectedStatus === 'LOW' },
    { label: 'Expiring soon', value: 'EXPIRING', active: selectedStatus === 'EXPIRING' },
    { label: 'Expired', value: 'EXPIRED', active: selectedStatus === 'EXPIRED' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Stock
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              See products that are low, out of stock, expired, or expiring soon.
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
          >
            Add product
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

      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filterHref(filter.value || null)}
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
          <input type="hidden" name="status" value={selectedStatus} />
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

      {visibleRows.length === 0 ? (
        <section className="border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            No stock found
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Add products or change your search.
          </p>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleRows.map((row) => (
                  <tr key={row.product.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">{row.product.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {row.product.category}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {row.product.batchNumber ? `Batch ${row.product.batchNumber}` : 'No batch number'}
                        {row.product.supplierName ? ` · ${row.product.supplierName}` : ''}
                      </p>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {row.product.quantity} {row.product.unit}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Minimum: {row.product.minQuantity}
                      </p>
                      <span className={`mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-black ${row.stockState.className}`}>
                        {row.stockState.text}
                      </span>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {row.product.expiryDate || 'No date'}
                      </p>
                      <span className={`mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-black ${row.expiryState.className}`}>
                        {row.expiryState.text}
                      </span>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <p className="font-black text-slate-900 dark:text-white">
                        {money(Number(row.product.sellingPrice) * row.product.quantity)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Sale value
                      </p>
                    </td>

                    <td className="px-4 py-5 align-top">
                      <div className="flex justify-end">
                        <Link
                          href={`/products/${row.product.id}/edit`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visibleRows.map((row) => (
              <article
                key={row.product.id}
                className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950 dark:text-white">{row.product.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {row.product.category}
                    </p>
                  </div>

                  <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-black ${row.stockState.className}`}>
                    {row.stockState.text}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Quantity
                    </p>
                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {row.product.quantity} {row.product.unit}
                    </p>
                  </div>

                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Expiry
                    </p>
                    <span className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-black ${row.expiryState.className}`}>
                      {row.expiryState.text}
                    </span>
                  </div>

                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Sale value
                    </p>
                    <p className="mt-1 font-black text-slate-900 dark:text-white">
                      {money(Number(row.product.sellingPrice) * row.product.quantity)}
                    </p>
                  </div>

                  <div className="border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Supplier
                    </p>
                    <p className="mt-1 truncate font-black text-slate-900 dark:text-white">
                      {row.product.supplierName || 'Not saved'}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/products/${row.product.id}/edit`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit stock
                </Link>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {visibleRows.length} of {filteredRows.length}
            </p>

            {hasMore ? (
              <Link
                href={buildLoadMoreHref(q, selectedStatus, take + PAGE_SIZE)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
              >
                Load more
              </Link>
            ) : null}
          </div>
        </>
      )}

      {expired > 0 ? (
        <p className="text-xs font-bold text-red-600 dark:text-red-300">
          {expired} expired product{expired === 1 ? '' : 's'} need attention.
        </p>
      ) : null}
    </section>
  );
}
