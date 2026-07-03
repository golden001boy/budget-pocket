import type { ApiResponse, PortfolioItemDTO, PortfolioSummary } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export function createPortfolioClient(client: ReturnType<typeof createApiClient>) {
  return {
    list() {
      return client.request<ApiResponse<PortfolioItemDTO[]>>('/api/portfolio');
    },
    summary() {
      return client.request<ApiResponse<PortfolioSummary>>('/api/portfolio?summary=true');
    },
    create(data: unknown) {
      return client.request<ApiResponse<PortfolioItemDTO>>('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: unknown) {
      return client.request<ApiResponse<PortfolioItemDTO>>(`/api/portfolio/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    remove(id: string) {
      return client.request<void>(`/api/portfolio/${id}`, { method: 'DELETE' });
    },
  };
}
