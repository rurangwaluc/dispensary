'use server';

import { eq, inArray, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@dispensary/db/client';
import { customers, products, saleItems, sales } from '@dispensary/db/schema';
import { saleFormSchema } from '@dispensary/validators/sale';
import { requireOwner } from '@/lib/auth/session';

export type SaleState = {
  error?: string;
};

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function toMoney(value: number) {
  return value.toFixed(2);
}

export async function createSaleAction(
  _previousState: SaleState,
  formData: FormData,
): Promise<SaleState> {
  await requireOwner();

  let items: unknown = [];

  try {
    items = JSON.parse(String(formData.get('itemsJson') || '[]'));
  } catch {
    return {
      error: 'Check the selected items.',
    };
  }

  const parsed = saleFormSchema.safeParse({
    customerMode: formData.get('customerMode'),
    customerId: formData.get('customerId') || undefined,
    newCustomerName: formData.get('newCustomerName') || undefined,
    newCustomerPhone: formData.get('newCustomerPhone') || undefined,
    paymentMethod: formData.get('paymentMethod'),
    paidAmount: formData.get('paidAmount') || '0',
    notes: formData.get('notes') || undefined,
    items,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Check the sale form.',
    };
  }

  if (parsed.data.customerMode === 'EXISTING' && !parsed.data.customerId) {
    return {
      error: 'Choose an existing customer or use walk-in customer.',
    };
  }

  if (parsed.data.customerMode === 'NEW' && !cleanOptional(parsed.data.newCustomerName)) {
    return {
      error: 'Enter the new customer name.',
    };
  }

  const ids = parsed.data.items.map((item) => item.productId);
  const sellableItems = await db.select().from(products).where(inArray(products.id, ids));

  if (sellableItems.length !== ids.length) {
    return {
      error: 'One item was not found.',
    };
  }

  try {
    const lines = parsed.data.items.map((line) => {
      const item = sellableItems.find((current) => current.id === line.productId);

      if (!item || item.status !== 'ACTIVE') {
        throw new Error('One item is not available.');
      }

      if (item.itemType === 'PRODUCT' && item.quantity < line.quantity) {
        throw new Error(`${item.name} does not have enough stock.`);
      }

      const unitPrice =
        item.itemType === 'SERVICE' ? Number(line.unitPrice || 0) : Number(item.sellingPrice);

      if (item.itemType === 'SERVICE' && unitPrice <= 0) {
        throw new Error(`Enter the price for ${item.name}.`);
      }

      const lineTotal = unitPrice * line.quantity;

      return {
        item,
        quantity: line.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const paidAmount = Number(parsed.data.paidAmount);
    const balanceAmount = totalAmount - paidAmount;

    if (paidAmount < 0) {
      return {
        error: 'Paid amount cannot be below zero.',
      };
    }

    if (paidAmount > totalAmount) {
      return {
        error: 'Paid amount cannot be higher than the total.',
      };
    }

    await db.transaction(async (tx) => {
      let customerId: string | null = null;
      let customerName: string | null = null;
      let customerPhone: string | null = null;

      if (parsed.data.customerMode === 'EXISTING' && parsed.data.customerId) {
        const [customer] = await tx
          .select()
          .from(customers)
          .where(eq(customers.id, parsed.data.customerId))
          .limit(1);

        if (!customer || customer.status !== 'ACTIVE') {
          throw new Error('Selected customer was not found.');
        }

        customerId = customer.id;
        customerName = customer.name;
        customerPhone = customer.phone;
      }

      if (parsed.data.customerMode === 'NEW') {
        const [customer] = await tx
          .insert(customers)
          .values({
            name: cleanOptional(parsed.data.newCustomerName) || 'Customer',
            phone: cleanOptional(parsed.data.newCustomerPhone),
          })
          .returning({
            id: customers.id,
            name: customers.name,
            phone: customers.phone,
          });

        customerId = customer.id;
        customerName = customer.name;
        customerPhone = customer.phone;
      }

      const [sale] = await tx
        .insert(sales)
        .values({
          customerId,
          customerName,
          customerPhone,
          paymentMethod: parsed.data.paymentMethod,
          totalAmount: toMoney(totalAmount),
          paidAmount: toMoney(paidAmount),
          balanceAmount: toMoney(balanceAmount),
          notes: cleanOptional(parsed.data.notes),
        })
        .returning({ id: sales.id });

      await tx.insert(saleItems).values(
        lines.map((line) => ({
          saleId: sale.id,
          productId: line.item.id,
          itemName: line.item.name,
          itemType: line.item.itemType,
          quantity: line.quantity,
          unitPrice: toMoney(line.unitPrice),
          lineTotal: toMoney(line.lineTotal),
        })),
      );

      for (const line of lines) {
        if (line.item.itemType === 'PRODUCT') {
          await tx
            .update(products)
            .set({
              quantity: sql`${products.quantity} - ${line.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, line.item.id));
        }
      }
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sale could not be saved.',
    };
  }

  revalidatePath('/sales');
  revalidatePath('/customers');
  revalidatePath('/products');
  revalidatePath('/services');
  revalidatePath('/stock');
  revalidatePath('/dashboard');
  revalidatePath('/reports');

  redirect('/sales');
}
