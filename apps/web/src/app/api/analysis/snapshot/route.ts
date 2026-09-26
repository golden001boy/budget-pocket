import { NextResponse } from 'next/server';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';
import { withApiRoute } from '@/lib/apiRoute';

export const GET = withApiRoute(async (req: Request, { session }) => {
  const { searchParams } = new URL(req.url);
  const now   = new Date();
  const year  = parseInt(searchParams.get('year')  ?? String(now.getFullYear()),  10);
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10);

  const snapshot = await computeMonthlySnapshot(session.user.id, year, month);
  return NextResponse.json({ data: snapshot });
}, { name: 'analysis/snapshot:GET' });
