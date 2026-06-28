import { z } from 'zod';

const moneySchema = z
  .string()
  .trim()
  .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Enter a valid amount.');

export const saleLineItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const saleFormSchema = z.object({
  customerName: z.string().trim().max(160).optional(),
  customerPhone: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK', 'CARD']),
  paidAmount: moneySchema,
  notes: z.string().trim().max(1000).optional(),
  items: z.array(saleLineItemSchema).min(1, 'Add at least one item.'),
});

export type SaleFormInput = z.infer<typeof saleFormSchema>;
