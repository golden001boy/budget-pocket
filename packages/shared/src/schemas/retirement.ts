import { z } from 'zod';

export const retirementPlanSchema = z.object({
  currentAge: z.number().int().min(18).max(80),
  targetRetirementAge: z.number().int().min(30).max(80),
  currentSavings: z.number().min(0),
  monthlyContribution: z.number().min(0),
  expectedReturnRate: z.number().min(0).max(50),
  inflationRate: z.number().min(0).max(30).default(3),
  targetMonthlyIncome: z.number().positive(),
  notes: z.string().max(500).optional(),
}).refine(d => d.targetRetirementAge > d.currentAge, {
  message: 'L\'âge de retraite doit être supérieur à l\'âge actuel',
  path: ['targetRetirementAge'],
});

export type RetirementPlanInput = z.infer<typeof retirementPlanSchema>;
