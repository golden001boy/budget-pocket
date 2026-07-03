import type { ApiResponse, BudgetDTO } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export function createBudgetsClient(client: ReturnType<typeof createApiClient>) {
  return {
    list(year: number, month: number) {
      return client.request<ApiResponse<BudgetDTO[]>>(`/api/budgets?year=${year}&month=${month}`);
    },
    create(data: unknown) {
      return client.request<ApiResponse<BudgetDTO>>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: unknown) {
      return client.request<ApiResponse<BudgetDTO>>(`/api/budgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    remove(id: string) {
      return client.request<void>(`/api/budgets/${id}`, { method: 'DELETE' });
    },
  };
}
