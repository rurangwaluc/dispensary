import { z } from 'zod';

const moneyPattern = /^[0-9]+(\.[0-9]{1,2})?$/;

const moneySchema = z
  .string()
  .trim()
  .regex(moneyPattern, 'Enter a valid amount.');

const optionalMoneySchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || moneyPattern.test(value), 'Enter a valid amount.');

const wholeNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/, 'Enter a valid number.');

export const productFormSchema = z
  .object({
    itemType: z.enum(['PRODUCT', 'SERVICE']),
    name: z.string().trim().min(2, 'Name is required.').max(180),
    category: z.string().trim().min(2, 'Category is required.').max(120),
    unit: z.string().trim().min(1, 'Unit is required.').max(40),
    batchNumber: z.string().trim().max(80).optional(),
    supplierName: z.string().trim().max(160).optional(),
    buyingPrice: moneySchema,
    sellingPrice: optionalMoneySchema,
    quantity: wholeNumberSchema,
    minQuantity: wholeNumberSchema,
    expiryDate: z.string().trim().optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, context) => {
    if (data.itemType === 'PRODUCT' && !data.sellingPrice) {
      context.addIssue({
        code: 'custom',
        path: ['sellingPrice'],
        message: 'Selling price is required.',
      });
    }
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;
