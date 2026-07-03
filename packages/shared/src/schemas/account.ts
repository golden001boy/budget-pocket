import { z } from 'zod';

export const linkAccountSchema = z.object({
  provider: z.enum(['WAVE', 'MTN_MONEY', 'ORANGE_MONEY', 'MANUAL']),
  accountName: z.string().min(1).max(100),
  accountNumber: z.string().max(20).optional(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
  initialBalance: z.number().min(0).default(0),
});

export const updateAccountSchema = linkAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type LinkAccountInput = z.infer<typeof linkAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
