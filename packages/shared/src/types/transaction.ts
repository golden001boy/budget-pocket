import type { Currency } from './user';

export type ExpenseCategory =
  | 'FOOD' | 'TRANSPORT' | 'HOUSING' | 'UTILITIES' | 'HEALTH'
  | 'EDUCATION' | 'ENTERTAINMENT' | 'CLOTHING' | 'SAVINGS'
  | 'INVESTMENT' | 'INSURANCE' | 'TAXES' | 'GIFTS' | 'SUBSCRIPTIONS' | 'OTHER';

export type ExpenseType = 'FIXED' | 'CURRENT' | 'OCCASIONAL';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type SyncProvider = 'WAVE' | 'MTN_MONEY' | 'ORANGE_MONEY' | 'MANUAL';

export interface TransactionDTO {
  id: string;
  userId: string;
  accountId: string | null;
  category: ExpenseCategory;
  customCategoryId: string | null;
  type: TransactionType;
  expenseType: ExpenseType | null;
  amount: number;
  currency: Currency;
  description: string | null;
  merchant: string | null;
  date: string;
  isRecurring: boolean;
  recurringId: string | null;
  budgetId: string | null;
  tags: string[];
  receiptUrl: string | null;
  notes: string | null;
  source: SyncProvider;
  createdAt: string;
}

export interface CreateTransactionInput {
  category: ExpenseCategory;
  type: TransactionType;
  expenseType?: ExpenseType;
  amount: number;
  currency?: Currency;
  description?: string;
  merchant?: string;
  date: string;
  isRecurring?: boolean;
  budgetId?: string;
  tags?: string[];
  notes?: string;
  accountId?: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}
