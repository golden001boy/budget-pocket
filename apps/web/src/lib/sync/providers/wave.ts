import type { FinancialSyncProvider } from './index';

export const waveProvider: FinancialSyncProvider = {
  name: 'WAVE',
  isAvailable() { return false; },
  async getAccountBalance() { throw new Error('Wave API not yet connected'); },
  async getTransactions()   { throw new Error('Wave API not yet connected'); },
};
