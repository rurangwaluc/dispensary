'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@dispensary/db/client';
import { moneyTransfers } from '@dispensary/db/schema';
import { moneyTransferSchema } from '@dispensary/validators/money';
import { requireOwner } from '@/lib/auth/session';
import { getPaymentMethodBalance, paymentName } from './balance';

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

export async function moveMoneyAction(formData: FormData) {
  await requireOwner();

  const parsed = moneyTransferSchema.safeParse({
    fromPaymentMethod: formData.get('fromPaymentMethod'),
    toPaymentMethod: formData.get('toPaymentMethod'),
    amount: formData.get('amount') || '0',
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Check the money movement form.';
    redirect(`/money?error=${encodeURIComponent(message)}`);
  }

  if (parsed.data.fromPaymentMethod === parsed.data.toPaymentMethod) {
    redirect('/money?error=Choose two different places for the money.');
  }

  const amount = Number(parsed.data.amount);
  const availableMoney = await getPaymentMethodBalance(parsed.data.fromPaymentMethod);

  if (amount <= 0) {
    redirect('/money?error=Amount must be above zero.');
  }

  if (amount > availableMoney) {
    redirect(
      `/money?error=${encodeURIComponent(
        `Not enough money in ${paymentName(parsed.data.fromPaymentMethod)}.`,
      )}`,
    );
  }

  await db.insert(moneyTransfers).values({
    fromPaymentMethod: parsed.data.fromPaymentMethod,
    toPaymentMethod: parsed.data.toPaymentMethod,
    amount: parsed.data.amount,
    notes: cleanOptional(parsed.data.notes),
  });

  revalidatePath('/money');
  revalidatePath('/dashboard');

  redirect('/money?moved=1');
}
