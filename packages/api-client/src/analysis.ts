import type { ApiResponse, MonthlySnapshotDTO, ForecastPoint } from '@budget-pocket/shared';
import type { createApiClient } from './client';

export function createAnalysisClient(client: ReturnType<typeof createApiClient>) {
  return {
    snapshot(year: number, month: number) {
      return client.request<ApiResponse<MonthlySnapshotDTO>>(`/api/analysis/snapshot?year=${year}&month=${month}`);
    },
    forecast(months: number = 6) {
      return client.request<ApiResponse<ForecastPoint[]>>(`/api/analysis/forecast?months=${months}`);
    },
  };
}
