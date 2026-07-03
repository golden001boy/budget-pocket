import type { FinancialSyncProvider } from './index';

export const manualProvider: FinancialSyncProvider = {
  name: 'MANUAL',
  isAvailable() { return true; },
  async getAccountBalance() { return 0; },
  async getTransactions()   { return []; },
};
