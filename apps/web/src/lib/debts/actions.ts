'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@dispensary/db/client';
import { debtPayments, sales } from '@dispensary/db/schema';
import { debtPaymentSchema } from '@dispensary/validators/debt';
import { requireOwner } from '@/lib/auth/session';

export type DebtPaymentState = {
  error?: string;
  success?: string;
};

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function toMoney(value: number) {
  return value.toFixed(2);
}

export async function recordDebtPaymentAction(
  _previousState: DebtPaymentState,
  formData: FormData,
): Promise<DebtPaymentState> {
  await requireOwner();

  const parsed = debtPaymentSchema.safeParse({
    saleId: formData.get('saleId'),
    paymentMethod: formData.get('paymentMethod'),
    amount: formData.get('amount') || '0',
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Check the payment form.',
    };
  }

  const amount = Number(parsed.data.amount);

  if (amount <= 0) {
    return {
      error: 'Payment amount must be above zero.',
    };
  }

  const [sale] = await db.select().from(sales).where(eq(sales.id, parsed.data.saleId)).limit(1);

  if (!sale) {
    return {
      error: 'Debt was not found.',
    };
  }

  const currentBalance = Number(sale.balanceAmount);

  if (currentBalance <= 0) {
    return {
      error: 'This debt is already cleared.',
    };
  }

  if (amount > currentBalance) {
    return {
      error: 'Payment cannot be higher than the unpaid amount.',
    };
  }

  const nextPaid = Number(sale.paidAmount) + amount;
  const nextBalance = currentBalance - amount;

  await db.transaction(async (tx) => {
    await tx.insert(debtPayments).values({
      saleId: sale.id,
      paymentMethod: parsed.data.paymentMethod,
      amount: toMoney(amount),
      notes: cleanOptional(parsed.data.notes),
    });

    await tx
      .update(sales)
      .set({
        paidAmount: toMoney(nextPaid),
        balanceAmount: toMoney(nextBalance),
        updatedAt: new Date(),
      })
      .where(eq(sales.id, sale.id));
  });

  revalidatePath('/debts');
  revalidatePath(`/debts/${sale.id}`);
  revalidatePath('/sales');
  revalidatePath('/customers');
  revalidatePath('/dashboard');

  return {
    success: 'Payment saved.',
  };
}
