import type { SyncProvider } from '@budget-pocket/shared';

export interface FinancialSyncProvider {
  name: SyncProvider;
  isAvailable(): boolean;
  getAccountBalance(accountId: string): Promise<number>;
  getTransactions(accountId: string, since: Date): Promise<RawTransaction[]>;
}

export interface RawTransaction {
  externalId:  string;
  amount:      number;
  type:        'INCOME' | 'EXPENSE';
  description: string;
  date:        Date;
  merchant?:   string;
}
