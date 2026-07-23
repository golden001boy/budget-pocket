import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Small denylist of the most commonly breached/guessed passwords (story
// 15.8, auth hardening). Deliberately not a full complexity rule
// (uppercase/digit/symbol requirements) — NIST 800-63B recommends against
// those, since they mostly push users toward predictable substitutions
// ("Password1!") without meaningfully raising guess difficulty. Rejecting
// known-common passwords outright is the higher-value check.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789',
  '1234567890', 'qwertyuiop', 'azertyuiop', 'letmein123', 'admin1234',
  'welcome123', 'iloveyou1', 'abc123456', 'motdepasse', 'passwordd',
]);

// Shared by registerSchema and resetPasswordSchema (story 15.11) so a
// password set via reset can't be weaker than one set at signup.
export const passwordSchema = z.string()
  .min(10, 'Minimum 10 caractères')
  .max(72)
  .refine(pw => !COMMON_PASSWORDS.has(pw.toLowerCase()), 'Mot de passe trop courant, choisissez-en un autre');

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  name: z.string().min(2, 'Minimum 2 caractères').max(50).optional(),
  currency: z.enum(['XOF', 'EUR', 'USD', 'GBP']).default('XOF'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Jeton requis'),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Jeton requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
