'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@dispensary/db/client';
import { products } from '@dispensary/db/schema';
import { productFormSchema } from '@dispensary/validators/product';
import { requireOwner } from '@/lib/auth/session';

export type ProductState = {
  error?: string;
};

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function redirectPath(itemType: 'PRODUCT' | 'SERVICE') {
  return itemType === 'SERVICE' ? '/services' : '/products';
}

function getFormValues(formData: FormData) {
  const itemType = formData.get('itemType') === 'SERVICE' ? 'SERVICE' : 'PRODUCT';

  return {
    itemType,
    name: formData.get('name'),
    category: formData.get('category'),
    unit: itemType === 'SERVICE' ? 'Service' : formData.get('unit'),
    batchNumber: undefined,
    supplierName: itemType === 'SERVICE' ? undefined : formData.get('supplierName') || undefined,
    buyingPrice: itemType === 'SERVICE' ? '0' : formData.get('buyingPrice'),
    sellingPrice: formData.get('sellingPrice') || undefined,
    quantity: itemType === 'SERVICE' ? '0' : formData.get('quantity'),
    minQuantity: itemType === 'SERVICE' ? '0' : formData.get('minQuantity'),
    expiryDate: itemType === 'SERVICE' ? undefined : formData.get('expiryDate') || undefined,
    notes: formData.get('notes') || undefined,
  };
}

export async function createProductAction(
  _previousState: ProductState,
  formData: FormData,
): Promise<ProductState> {
  await requireOwner();

  const parsed = productFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Check the form.',
    };
  }

  await db.insert(products).values({
    itemType: parsed.data.itemType,
    name: parsed.data.name,
    category: parsed.data.category,
    unit: parsed.data.unit,
    batchNumber: null,
    supplierName: cleanOptional(parsed.data.supplierName),
    buyingPrice: parsed.data.buyingPrice,
    sellingPrice:
      parsed.data.itemType === 'SERVICE'
        ? parsed.data.sellingPrice || '0'
        : parsed.data.sellingPrice || '0',
    quantity: Number(parsed.data.quantity),
    minQuantity: Number(parsed.data.minQuantity),
    expiryDate: cleanOptional(parsed.data.expiryDate),
    notes: cleanOptional(parsed.data.notes),
    status: 'ACTIVE',
  });

  revalidatePath('/products');
  revalidatePath('/services');
  revalidatePath('/stock');
  revalidatePath('/sales/new');
  redirect(redirectPath(parsed.data.itemType));
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductState,
  formData: FormData,
): Promise<ProductState> {
  await requireOwner();

  const parsed = productFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Check the form.',
    };
  }

  await db
    .update(products)
    .set({
      itemType: parsed.data.itemType,
      name: parsed.data.name,
      category: parsed.data.category,
      unit: parsed.data.unit,
      batchNumber: null,
      supplierName: cleanOptional(parsed.data.supplierName),
      buyingPrice: parsed.data.buyingPrice,
      sellingPrice:
        parsed.data.itemType === 'SERVICE'
          ? parsed.data.sellingPrice || '0'
          : parsed.data.sellingPrice || '0',
      quantity: Number(parsed.data.quantity),
      minQuantity: Number(parsed.data.minQuantity),
      expiryDate: cleanOptional(parsed.data.expiryDate),
      notes: cleanOptional(parsed.data.notes),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath('/products');
  revalidatePath('/services');
  revalidatePath('/stock');
  revalidatePath('/sales/new');
  redirect(redirectPath(parsed.data.itemType));
}

export async function archiveProductAction(formData: FormData) {
  await requireOwner();

  const productId = String(formData.get('productId') || '');

  if (!productId) {
    return;
  }

  await db
    .update(products)
    .set({
      status: 'ARCHIVED',
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath('/products');
  revalidatePath('/services');
  revalidatePath('/stock');
}
