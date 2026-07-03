import type { ApiResponse, AlertDTO } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export function createAlertsClient(client: ReturnType<typeof createApiClient>) {
  return {
    list(unreadOnly?: boolean) {
      return client.request<ApiResponse<AlertDTO[]>>(`/api/alerts${unreadOnly ? '?unread=true' : ''}`);
    },
    markRead(id: string) {
      return client.request<ApiResponse<AlertDTO>>(`/api/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      });
    },
    dismiss(id: string) {
      return client.request<ApiResponse<AlertDTO>>(`/api/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isDismissed: true }),
      });
    },
  };
}
