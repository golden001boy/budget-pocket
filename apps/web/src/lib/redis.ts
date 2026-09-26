import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Without this, ioredis queues commands while disconnected and retries
    // them against its own reconnect backoff schedule — a schedule that
    // escalates (and never resets) for the lifetime of a client that keeps
    // failing to reconnect. On a long-running server with Redis down, this
    // made every single cache call progressively slower over time (story
    // 15.13/15.16: observed 12-16s for one cacheGet() call after the client
    // had accumulated failed reconnect attempts, vs ~0.3s on a fresh
    // client). With the offline queue disabled, a command issued while
    // disconnected rejects immediately instead of waiting on that backoff.
    enableOfflineQueue: false,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
