import type { FinancialSyncProvider } from './index';

export const mtnProvider: FinancialSyncProvider = {
  name: 'MTN_MONEY',
  isAvailable() { return false; },
  async getAccountBalance() { throw new Error('MTN MoMo API not yet connected'); },
  async getTransactions()   { throw new Error('MTN MoMo API not yet connected'); },
};
