import { z } from 'zod';

const EXPENSE_CATEGORIES = [
  'FOOD', 'TRANSPORT', 'HOUSING', 'UTILITIES', 'HEALTH',
  'EDUCATION', 'ENTERTAINMENT', 'CLOTHING', 'SAVINGS',
  'INVESTMENT', 'INSURANCE', 'TAXES', 'GIFTS', 'SUBSCRIPTIONS', 'OTHER',
] as const;

export const createTransactionSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  expenseType: z.enum(['FIXED', 'CURRENT', 'OCCASIONAL']).optional(),
  amount: z.number().positive('Le montant doit être positif'),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
  description: z.string().max(255).optional(),
  merchant: z.string().max(100).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  isRecurring: z.boolean().default(false),
  budgetId: z.string().cuid().optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  notes: z.string().max(1000).optional(),
  accountId: z.string().cuid().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
