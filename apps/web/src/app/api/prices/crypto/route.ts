import { NextResponse } from 'next/server';
import { fetchCryptoPrices, getCoingeckoId } from '@/lib/market-data/coingecko';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickers = (searchParams.get('ids') ?? 'bitcoin,ethereum,solana,cardano').split(',');

  const coinIds = tickers
    .map(t => getCoingeckoId(t) ?? t.toLowerCase())
    .filter(Boolean);

  try {
    const prices = await fetchCryptoPrices(coinIds);
    return NextResponse.json({ data: prices });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
