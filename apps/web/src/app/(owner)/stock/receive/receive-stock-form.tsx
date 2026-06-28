'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Search } from 'lucide-react';
import { receiveStockAction } from '@/lib/stock/actions';

type ProductOption = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  supplierName: string | null;
};

type ReceiveStockFormProps = {
  products: ProductOption[];
  error?: string;
};

export function ReceiveStockForm({ products, error }: ReceiveStockFormProps) {
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products.slice(0, 8);
    }

    return products
      .filter((product) => {
        const target = [
          product.name,
          product.category,
          product.supplierName || '',
        ]
          .join(' ')
          .toLowerCase();

        return target.includes(search);
      })
      .slice(0, 8);
  }, [productSearch, products]);

  return (
    <form
      action={receiveStockAction}
      className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
    >
      <input type="hidden" name="productId" value={selectedProductId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="productSearch" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Product
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-slate-400" />

            <input
              id="productSearch"
              value={productSearch}
              onChange={(event) => {
                setProductSearch(event.target.value);
                setSelectedProductId('');
                setIsProductSearchOpen(true);
              }}
              onFocus={() => setIsProductSearchOpen(true)}
              placeholder="Search product name, category, or supplier"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
            />

            {isProductSearchOpen ? (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                    No product found.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setProductSearch(product.name);
                          setIsProductSearchOpen(false);
                        }}
                        className="grid w-full gap-1 rounded-lg px-3 py-3 text-left transition hover:bg-sky-50 dark:hover:bg-slate-800"
                      >
                        <span className="font-black text-slate-950 dark:text-white">
                          {product.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {product.category} · Current: {product.quantity} {product.unit}
                          {product.supplierName ? ` · ${product.supplierName}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {selectedProduct ? (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Chosen: {selectedProduct.name} · Current stock: {selectedProduct.quantity}{' '}
                {selectedProduct.unit}
              </span>
            </div>
          ) : (
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Search and choose the product you are adding stock to.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="quantityReceived" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Quantity added
          </label>
          <input
            id="quantityReceived"
            name="quantityReceived"
            type="number"
            min="1"
            required
            placeholder="Example: 50"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="buyingPrice" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Cost each
          </label>
          <input
            id="buyingPrice"
            name="buyingPrice"
            inputMode="decimal"
            required
            placeholder="Example: 800"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplierName" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Supplier
          </label>
          <input
            id="supplierName"
            name="supplierName"
            placeholder="Supplier name"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expiryDate" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Expiry date
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Optional"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-sky-950"
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Link
          href="/stock"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
        >
          Cancel
        </Link>
        <button
          disabled={!selectedProductId}
          className="h-11 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save stock
        </button>
      </div>
    </form>
  );
}
