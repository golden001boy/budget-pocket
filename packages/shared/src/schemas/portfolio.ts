import { z } from 'zod';

export const addPortfolioItemSchema = z.object({
  assetClass: z.enum(['STOCK_BRVM', 'STOCK_INTL', 'CRYPTO', 'REAL_ESTATE', 'BOND', 'SAVINGS_ACCOUNT', 'OTHER']),
  ticker: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  exchange: z.string().max(50).optional(),
  quantity: z.number().positive(),
  averageCost: z.number().positive(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional(),
});

export const updatePortfolioItemSchema = addPortfolioItemSchema.partial();

export type AddPortfolioItemInput = z.infer<typeof addPortfolioItemSchema>;
export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>;
