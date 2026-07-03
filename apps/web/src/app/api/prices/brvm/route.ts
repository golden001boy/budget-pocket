import { NextResponse } from 'next/server';
import { fetchBRVMPrices } from '@/lib/scrapers/brvm';

export async function GET() {
  try {
    const quotes = await fetchBRVMPrices();
    return NextResponse.json({ data: quotes });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
