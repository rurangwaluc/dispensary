'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@dispensary/db/client';
import { businessSettings } from '@dispensary/db/schema';
import { businessSettingsSchema } from '@dispensary/validators/settings';
import { requireOwner } from '@/lib/auth/session';

export type SettingsState = {
  error?: string;
  success?: string;
};

export async function updateBusinessSettingsAction(
  _previousState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireOwner();

  const parsed = businessSettingsSchema.safeParse({
    businessName: formData.get('businessName'),
    ownerName: formData.get('ownerName'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    currency: 'RWF',
    lowStockAlertQuantity: formData.get('lowStockAlertQuantity'),
    expiryAlertDays: formData.get('expiryAlertDays'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Check the settings form.',
    };
  }

  const currentSettings = await db.query.businessSettings.findFirst();

  if (!currentSettings) {
    await db.insert(businessSettings).values({
      businessName: parsed.data.businessName,
      ownerName: parsed.data.ownerName,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      currency: 'RWF',
      lowStockAlertQuantity: parsed.data.lowStockAlertQuantity,
      expiryAlertDays: parsed.data.expiryAlertDays,
    });
  } else {
    await db
      .update(businessSettings)
      .set({
        businessName: parsed.data.businessName,
        ownerName: parsed.data.ownerName,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        currency: 'RWF',
        lowStockAlertQuantity: parsed.data.lowStockAlertQuantity,
        expiryAlertDays: parsed.data.expiryAlertDays,
        updatedAt: new Date(),
      })
      .where(eq(businessSettings.id, currentSettings.id));
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');

  return {
    success: 'Business settings saved.',
  };
}
