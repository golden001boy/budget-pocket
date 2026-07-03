import type { ApiError } from '@budget-pocket/shared';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: ApiError['code'],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function createApiClient(baseUrl: string, getToken?: () => string | null) {
  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getToken?.();
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Network error' }));
      throw new ApiClientError(
        err.error ?? 'Unknown error',
        res.status,
        err.code,
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  return { request };
}
