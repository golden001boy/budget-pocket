import { z } from 'zod';

export const realEstateScenarioSchema = z.object({
  type: z.literal('REAL_ESTATE'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  inputs: z.object({
    propertyPrice: z.number().positive(),
    downPayment: z.number().min(0),
    interestRate: z.number().min(0).max(100),
    loanTermYears: z.number().int().min(1).max(30),
    monthlyRent: z.number().min(0).optional(),
  }),
});

export const retirementScenarioSchema = z.object({
  type: z.literal('EARLY_RETIREMENT'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  inputs: z.object({
    currentAge: z.number().int().min(18).max(80),
    targetRetirementAge: z.number().int().min(30).max(80),
    currentSavings: z.number().min(0),
    monthlyContribution: z.number().min(0),
    expectedReturnRate: z.number().min(0).max(50),
    inflationRate: z.number().min(0).max(30).default(3),
    targetMonthlyIncome: z.number().positive(),
  }),
});

export const stockInvestmentScenarioSchema = z.object({
  type: z.literal('STOCK_INVESTMENT'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  inputs: z.object({
    monthlyAmount: z.number().positive(),
    expectedAnnualReturn: z.number().min(0).max(100),
    investmentYears: z.number().int().min(1).max(50),
    initialAmount: z.number().min(0).default(0),
  }),
});

export const createScenarioSchema = z.discriminatedUnion('type', [
  realEstateScenarioSchema,
  retirementScenarioSchema,
  stockInvestmentScenarioSchema,
]);

export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
