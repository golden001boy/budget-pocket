import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères').max(72),
  name: z.string().min(2, 'Minimum 2 caractères').max(50).optional(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
