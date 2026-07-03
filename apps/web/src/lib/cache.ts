import { redis } from './redis';

export const CACHE_TTL = {
  CRYPTO_PRICES:    60 * 60,
  BRVM_PRICES:      60 * 60 * 4,
  INTL_PRICES:      60 * 60,
  MONTHLY_SNAPSHOT: 60 * 60 * 6,
  FORECAST:         60 * 60 * 12,
  AI_CONTEXT:       60 * 15,
  PORTFOLIO_VALUE:  60 * 30,
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache failure is non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Cache failure is non-fatal
  }
}

export async function cacheGetOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const value = await fn();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
