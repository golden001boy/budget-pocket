import type { ApiResponse, TransactionDTO } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export function createTransactionsClient(client: ReturnType<typeof createApiClient>) {
  return {
    list(params?: { page?: number; pageSize?: number; category?: string; type?: string; from?: string; to?: string }) {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return client.request<ApiResponse<TransactionDTO[]>>(`/api/transactions${query ? `?${query}` : ''}`);
    },
    get(id: string) {
      return client.request<ApiResponse<TransactionDTO>>(`/api/transactions/${id}`);
    },
    create(data: unknown) {
      return client.request<ApiResponse<TransactionDTO>>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: unknown) {
      return client.request<ApiResponse<TransactionDTO>>(`/api/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    remove(id: string) {
      return client.request<void>(`/api/transactions/${id}`, { method: 'DELETE' });
    },
  };
}
