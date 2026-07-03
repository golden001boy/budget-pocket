import type { Currency } from './user';
import type { SyncProvider } from './transaction';

export type SyncStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'PENDING';

export interface LinkedAccountDTO {
  id: string;
  userId: string;
  provider: SyncProvider;
  accountName: string;
  accountNumber: string | null;
  currency: Currency;
  balance: number;
  balanceAt: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkAccountInput {
  provider: SyncProvider;
  accountName: string;
  accountNumber?: string;
  currency?: Currency;
  initialBalance?: number;
}
