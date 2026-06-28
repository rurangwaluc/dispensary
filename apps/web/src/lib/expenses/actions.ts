'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@dispensary/db/client';
import { expenses } from '@dispensary/db/schema';
import { expenseFormSchema } from '@dispensary/validators/expense';
import { requireOwner } from '@/lib/auth/session';
import { getPaymentMethodBalance } from '@/lib/money/balance';

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export async function createExpenseAction(formData: FormData) {
  await requireOwner();

  const parsed = expenseFormSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    amount: formData.get('amount') || '0',
    paymentMethod: formData.get('paymentMethod'),
    expenseDate: formData.get('expenseDate') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Check the expense form.';
    redirect(`/expenses?error=${encodeURIComponent(message)}`);
  }

  const availableMoney = await getPaymentMethodBalance(parsed.data.paymentMethod);
  const expenseAmount = Number(parsed.data.amount);

  if (expenseAmount > availableMoney) {
    redirect(
      `/expenses?error=${encodeURIComponent(
        `Not enough money in ${parsed.data.paymentMethod.replace('_', ' ').toLowerCase()}.`,
      )}`,
    );
  }

  const expenseDate = parsed.data.expenseDate
    ? new Date(`${parsed.data.expenseDate}T12:00:00`)
    : new Date();

  await db.insert(expenses).values({
    name: parsed.data.name,
    category: parsed.data.category,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod,
    expenseDate,
    notes: cleanOptional(parsed.data.notes),
  });

  revalidatePath('/expenses');
  revalidatePath('/dashboard');

  redirect('/expenses?added=1');
}
