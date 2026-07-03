import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// AI chat is disabled — will be activated in a future release.
export async function POST() {
  return NextResponse.json(
    { error: 'Le conseiller IA sera disponible dans une prochaine mise à jour.', code: 'FEATURE_DISABLED' },
    { status: 503 },
  );
}
