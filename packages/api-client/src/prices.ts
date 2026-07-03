import type { ApiResponse } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export interface CryptoPriceData {
  [coinId: string]: { usd: number; eur: number; xof: number; usd_24h_change?: number };
}

export interface BRVMQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  currency: 'XOF';
  updatedAt: string;
}

export function createPricesClient(client: ReturnType<typeof createApiClient>) {
  return {
    crypto(ids: string[]) {
      return client.request<ApiResponse<CryptoPriceData>>(`/api/prices/crypto?ids=${ids.join(',')}`);
    },
    brvm() {
      return client.request<ApiResponse<BRVMQuote[]>>('/api/prices/brvm');
    },
  };
}
