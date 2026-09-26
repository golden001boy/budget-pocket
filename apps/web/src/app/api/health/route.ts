import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

// Story 15.17 (Gate Phase 6 §9.2, BE-09): this endpoint is unauthenticated
// by design (used by uptime monitors before a session exists) — it must
// never leak the raw error object in its response. Doing so exposed the
// full Prisma error string (including the DB host) to anyone who called
// it. Each dependency is checked independently so one being down doesn't
// hide the state of the other, and any failure is logged server-side
// (same pattern as the Redis fail-open logging in rateLimit.ts) instead of
// being echoed back to the caller.
async function checkDb(): Promise<'connected' | 'error'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch (error) {
    console.error('[health] database check failed', error);
    return 'error';
  }
}

async function checkRedis(): Promise<'connected' | 'error'> {
  try {
    await redis.ping();
    return 'connected';
  } catch (error) {
    console.error('[health] redis check failed', error);
    return 'error';
  }
}

export async function GET() {
  const [db, redisStatus] = await Promise.all([checkDb(), checkRedis()]);
  const healthy = db === 'connected' && redisStatus === 'connected';

  return NextResponse.json(
    { status: healthy ? 'ok' : 'error', db, redis: redisStatus },
    { status: healthy ? 200 : 503 },
  );
}
