import type { ExpenseCategory } from './transaction';

export interface MonthlySnapshotDTO {
  id: string;
  userId: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  netWorth: number | null;
  categoryBreakdown: Partial<Record<ExpenseCategory, number>>;
  computedAt: string;
}

export interface ForecastPoint {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  projectedNetWorth: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    bankAccounts: number;
    investments: number;
    realEstate: number;
    other: number;
  };
}
