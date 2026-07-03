import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function mfetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Cookie: `next-auth.session-token=${token}` } : {}),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
}

export async function mfetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await mfetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
