import type { FinancialSyncProvider } from './index';

export const orangeProvider: FinancialSyncProvider = {
  name: 'ORANGE_MONEY',
  isAvailable() { return false; },
  async getAccountBalance() { throw new Error('Orange Money API not yet connected'); },
  async getTransactions()   { throw new Error('Orange Money API not yet connected'); },
};
