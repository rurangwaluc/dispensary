'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { createProductAction, updateProductAction } from '@/lib/products/actions';

type ProductFormProps = {
  product?: {
    id: string;
    itemType: 'PRODUCT' | 'SERVICE';
    name: string;
    category: string;
    unit: string;
    batchNumber: string | null;
    supplierName: string | null;
    buyingPrice: string;
    sellingPrice: string;
    quantity: number;
    minQuantity: number;
    expiryDate: string | null;
    notes: string | null;
  };
};

const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950';

const selectedChoiceClass =
  'cursor-pointer rounded-lg border border-sky-400 bg-sky-500 px-4 py-4 text-sm font-black text-white shadow-sm dark:border-sky-300 dark:bg-sky-500 dark:text-white';

const normalChoiceClass =
  'cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200';

export function ProductForm({ product }: ProductFormProps) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [itemType, setItemType] = useState<'PRODUCT' | 'SERVICE'>(product?.itemType || 'PRODUCT');

  const isService = itemType === 'SERVICE';

  return (
    <form action={formAction} className="space-y-5">
      <div className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">
          What are you adding?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className={itemType === 'PRODUCT' ? selectedChoiceClass : normalChoiceClass}>
            <input
              type="radio"
              name="itemType"
              value="PRODUCT"
              checked={itemType === 'PRODUCT'}
              onChange={() => setItemType('PRODUCT')}
              className="sr-only"
            />
            <span className="block">Product / drug</span>
            <span
              className={
                itemType === 'PRODUCT'
                  ? 'mt-1 block text-xs font-bold text-sky-100'
                  : 'mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400'
              }
            >
              Has stock and expiry date
            </span>
          </label>

          <label className={itemType === 'SERVICE' ? selectedChoiceClass : normalChoiceClass}>
            <input
              type="radio"
              name="itemType"
              value="SERVICE"
              checked={itemType === 'SERVICE'}
              onChange={() => setItemType('SERVICE')}
              className="sr-only"
            />
            <span className="block">Service</span>
            <span
              className={
                itemType === 'SERVICE'
                  ? 'mt-1 block text-xs font-bold text-sky-100'
                  : 'mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400'
              }
            >
              No stock needed
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-black text-slate-800 dark:text-slate-200">
            {isService ? 'Service name' : 'Product name'}
          </label>
          <input
            id="name"
            name="name"
            defaultValue={product?.name || ''}
            placeholder={isService ? 'Example: Injection service' : 'Example: Paracetamol 500mg'}
            required
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-black text-slate-800 dark:text-slate-200">
            Category
          </label>
          <input
            id="category"
            name="category"
            defaultValue={product?.category || ''}
            placeholder={isService ? 'Example: Treatment service' : 'Example: Pain medicine'}
            required
            className={inputClass}
          />
        </div>

        {isService ? (
          <>
            <input type="hidden" name="unit" value="Service" />
            <input type="hidden" name="buyingPrice" value="0" />
            <input type="hidden" name="quantity" value="0" />
            <input type="hidden" name="minQuantity" value="0" />
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Unit
              </label>
              <input
                id="unit"
                name="unit"
                defaultValue={product?.unit || ''}
                placeholder="Tablet, bottle, box..."
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="batchNumber" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Batch number
              </label>
              <input
                id="batchNumber"
                name="batchNumber"
                defaultValue={product?.batchNumber || ''}
                placeholder="Optional"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="buyingPrice" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Buying price
              </label>
              <input
                id="buyingPrice"
                name="buyingPrice"
                inputMode="decimal"
                defaultValue={product?.buyingPrice || '0'}
                required
                className={inputClass}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label htmlFor="sellingPrice" className="text-sm font-black text-slate-800 dark:text-slate-200">
            {isService ? 'Service price' : 'Selling price'}
          </label>
          <input
            id="sellingPrice"
            name="sellingPrice"
            inputMode="decimal"
            defaultValue={product?.sellingPrice || '0'}
            required
            className={inputClass}
          />
        </div>

        {!isService ? (
          <>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Quantity now
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={product?.quantity ?? 0}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="minQuantity" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Warn me when quantity reaches
              </label>
              <input
                id="minQuantity"
                name="minQuantity"
                type="number"
                min="0"
                defaultValue={product?.minQuantity ?? 5}
                required
                className={inputClass}
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
                defaultValue={product?.expiryDate || ''}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplierName" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Supplier name
              </label>
              <input
                id="supplierName"
                name="supplierName"
                defaultValue={product?.supplierName || ''}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-black text-slate-800 dark:text-slate-200">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={product?.notes || ''}
          rows={4}
          placeholder="Optional"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
        />
      </div>

      {state.error ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
        >
          Back to list
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Saving...' : product ? 'Save changes' : isService ? 'Save service' : 'Save product'}
        </button>
      </div>
    </form>
  );
}
