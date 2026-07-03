// Types
export * from './types/api';
export * from './types/user';
export * from './types/transaction';
export * from './types/budget';
export * from './types/goal';
export * from './types/portfolio';
export * from './types/analysis';
export * from './types/advisor';
export * from './types/alerts';
export * from './types/accounts';

// Schemas (export Zod schemas + inferred Input types — avoid re-exporting names already in types/)
export { loginSchema, registerSchema } from './schemas/auth';
export type { LoginInput, RegisterInput } from './schemas/auth';
export { createTransactionSchema, updateTransactionSchema } from './schemas/transaction';
export { createBudgetSchema, updateBudgetSchema } from './schemas/budget';
export { createGoalSchema, updateGoalSchema } from './schemas/goal';
export { addPortfolioItemSchema, updatePortfolioItemSchema } from './schemas/portfolio';
export { linkAccountSchema, updateAccountSchema } from './schemas/account';
export { createScenarioSchema } from './schemas/scenario';
export type { CreateScenarioInput } from './schemas/scenario';
export { retirementPlanSchema } from './schemas/retirement';
export type { RetirementPlanInput } from './schemas/retirement';

// Constants
export * from './constants/categories';
export * from './constants/currencies';
export * from './constants/providers';
export * from './constants/investments';
export * from './constants/theme';
export * from './constants/limits';
