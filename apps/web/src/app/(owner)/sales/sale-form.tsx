'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { createSaleAction } from '@/lib/sales/actions';

type SellableItem = {
  id: string;
  name: string;
  itemType: 'PRODUCT' | 'SERVICE';
  sellingPrice: string;
  quantity: number;
  unit: string;
};

type SaleRow = {
  productId: string;
  quantity: number;
  searchText: string;
};

type SaleFormProps = {
  items: SellableItem[];
};

function money(value: number) {
  return `RWF ${value.toLocaleString('en-US')}`;
}

function itemLabel(item: SellableItem) {
  if (item.itemType === 'SERVICE') {
    return `${item.name} · Service · RWF ${Number(item.sellingPrice).toLocaleString('en-US')}`;
  }

  return `${item.name} · ${item.quantity} ${item.unit} · RWF ${Number(item.sellingPrice).toLocaleString('en-US')}`;
}

function findItem(items: SellableItem[], productId: string) {
  return items.find((item) => item.id === productId);
}

export function SaleForm({ items }: SaleFormProps) {
  const [state, action, pending] = useActionState(createSaleAction, {});
  const firstItem = items[0];

  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);
  const [rows, setRows] = useState<SaleRow[]>([
    {
      productId: firstItem?.id || '',
      quantity: 1,
      searchText: firstItem ? itemLabel(firstItem) : '',
    },
  ]);
  const [paidAmount, setPaidAmount] = useState('0');

  const selectedRows = rows.map((row) => ({
    productId: row.productId,
    quantity: row.quantity,
  }));

  const total = useMemo(() => {
    return rows.reduce((sum, row) => {
      const item = findItem(items, row.productId);
      return sum + Number(item?.sellingPrice || 0) * row.quantity;
    }, 0);
  }, [items, rows]);

  const paid = Number(paidAmount || 0);
  const balance = Math.max(total - paid, 0);

  function updateRow(index: number, nextRow: SaleRow) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        productId: firstItem?.id || '',
        quantity: 1,
        searchText: firstItem ? itemLabel(firstItem) : '',
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function filteredItems(searchText: string) {
    const cleanSearch = searchText.trim().toLowerCase();

    if (!cleanSearch) {
      return items.slice(0, 8);
    }

    return items
      .filter((item) => {
        const searchable = `${item.name} ${item.itemType} ${item.unit}`.toLowerCase();
        return searchable.includes(cleanSearch);
      })
      .slice(0, 8);
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="itemsJson" value={JSON.stringify(selectedRows)} />

      <section className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-slate-950 dark:text-white">Items sold</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Search and choose the product or service sold.
            </p>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Plus className="h-4 w-4" />
            Add line
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const selected = findItem(items, row.productId);
            const isProduct = selected?.itemType === 'PRODUCT';
            const matches = filteredItems(row.searchText);

            return (
              <div
                key={`${row.productId}-${index}`}
                className="grid gap-2 border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_140px_120px_44px]"
              >
                <div className="relative">
                  <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Search item
                  </label>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={row.searchText}
                      onFocus={() => setOpenRowIndex(index)}
                      onChange={(event) => {
                        updateRow(index, {
                          ...row,
                          productId: '',
                          searchText: event.target.value,
                        });
                        setOpenRowIndex(index);
                      }}
                      placeholder="Type product or service name"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-black text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
                    />
                  </div>

                  {openRowIndex === index ? (
                    <div className="absolute left-0 right-0 top-[72px] z-30 max-h-64 overflow-y-auto border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                      {matches.length > 0 ? (
                        matches.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateRow(index, {
                                ...row,
                                productId: item.id,
                                searchText: itemLabel(item),
                              });
                              setOpenRowIndex(null);
                            }}
                            className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                          >
                            <span>
                              <span className="block text-sm font-black text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                              <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
                                {item.itemType === 'SERVICE' ? 'Service' : `${item.quantity} ${item.unit} available`}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-black text-slate-900 dark:text-white">
                              {money(Number(item.sellingPrice))}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                          No item found.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(event) =>
                      updateRow(index, {
                        ...row,
                        quantity: Math.max(1, Number(event.target.value || 1)),
                      })
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
                  />
                  {isProduct ? (
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      Available: {selected.quantity} {selected.unit}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Total
                  </label>
                  <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                    {money(Number(selected?.sellingPrice || 0) * row.quantity)}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length === 1}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="customerName" className="text-sm font-black text-slate-800 dark:text-slate-200">
              Customer name
            </label>
            <input
              id="customerName"
              name="customerName"
              placeholder="Optional"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customerPhone" className="text-sm font-black text-slate-800 dark:text-slate-200">
              Customer phone
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              placeholder="Optional"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="paymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
              Payment method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
            >
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile money</option>
              <option value="BANK">Bank</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="paidAmount" className="text-sm font-black text-slate-800 dark:text-slate-200">
              Paid now
            </label>
            <input
              id="paidAmount"
              name="paidAmount"
              inputMode="decimal"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="notes" className="text-sm font-black text-slate-800 dark:text-slate-200">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Optional"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
            />
          </div>
        </div>

        <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-black text-slate-950 dark:text-white">Sale total</h3>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total</span>
              <span className="text-lg font-black text-slate-950 dark:text-white">{money(total)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Paid now</span>
              <span className="text-lg font-black text-green-700 dark:text-green-300">{money(paid || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Unpaid</span>
              <span className="text-lg font-black text-yellow-700 dark:text-yellow-300">{money(balance)}</span>
            </div>
          </div>

          {state.error ? (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
              {state.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            <button
              type="submit"
              disabled={pending || items.length === 0}
              className="h-11 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? 'Saving...' : 'Save sale'}
            </button>
            <Link
              href="/sales"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              Back to sales
            </Link>
          </div>
        </aside>
      </section>
    </form>
  );
}
