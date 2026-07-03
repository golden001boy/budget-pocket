import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['SAVINGS', 'DEBT_PAYOFF', 'PURCHASE', 'EMERGENCY_FUND', 'RETIREMENT', 'EDUCATION', 'TRAVEL', 'OTHER']),
  targetAmount: z.number().positive(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
  deadline: z.string().optional(),
  priority: z.number().int().min(1).max(10).default(5),
  notes: z.string().max(500).optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  currentAmount: z.number().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
