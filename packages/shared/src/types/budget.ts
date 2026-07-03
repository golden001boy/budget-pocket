import type { Currency } from './user';
import type { ExpenseCategory } from './transaction';

export interface BudgetDTO {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  month: number;
  year: number;
  spent: number;
  alertAt: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithProgress extends BudgetDTO {
  percentUsed: number;
  remaining: number;
  isOverBudget: boolean;
  isAlerted: boolean;
}

export interface CreateBudgetInput {
  category: ExpenseCategory;
  amount: number;
  currency?: Currency;
  month: number;
  year: number;
  alertAt?: number;
}
