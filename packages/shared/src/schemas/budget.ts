import { z } from 'zod';

const EXPENSE_CATEGORIES = [
  'FOOD', 'TRANSPORT', 'HOUSING', 'UTILITIES', 'HEALTH',
  'EDUCATION', 'ENTERTAINMENT', 'CLOTHING', 'SAVINGS',
  'INVESTMENT', 'INSURANCE', 'TAXES', 'GIFTS', 'SUBSCRIPTIONS', 'OTHER',
] as const;

export const createBudgetSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  alertAt: z.number().min(0).max(100).default(80),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
