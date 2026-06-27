import { z } from 'zod';

const moneySchema = z
  .string()
  .trim()
  .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Enter a valid amount.');

const wholeNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/, 'Enter a valid number.');

export const productFormSchema = z.object({
  itemType: z.enum(['PRODUCT', 'SERVICE']),
  name: z.string().trim().min(2, 'Name is required.').max(180),
  category: z.string().trim().min(2, 'Category is required.').max(120),
  unit: z.string().trim().min(1, 'Unit is required.').max(40),
  batchNumber: z.string().trim().max(80).optional(),
  supplierName: z.string().trim().max(160).optional(),
  buyingPrice: moneySchema,
  sellingPrice: moneySchema,
  quantity: wholeNumberSchema,
  minQuantity: wholeNumberSchema,
  expiryDate: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
