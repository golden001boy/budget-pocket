import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const now   = new Date();
    const year  = parseInt(searchParams.get('year')  ?? String(now.getFullYear()),  10);
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10);

    const snapshot = await computeMonthlySnapshot(session.user.id, year, month);
    return NextResponse.json({ data: snapshot });
  } catch (error) {
    // Story 15.24: same fragility class fixed across the rest of the API
    // — this route in particular (computeMonthlySnapshot) is the one
    // behind the /dashboard bottleneck investigated in stories
    // 15.13/15.16, so a DB/Redis hiccup here is not hypothetical.
    console.error('[analysis/snapshot:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
