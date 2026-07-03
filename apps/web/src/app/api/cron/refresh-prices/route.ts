import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoPrices } from '@/lib/market-data/coingecko';
import { fetchBRVMPrices } from '@/lib/scrapers/brvm';
import { CRYPTO_COINGECKO_IDS } from '@budget-pocket/shared';

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coinIds = Object.values(CRYPTO_COINGECKO_IDS);

  const [crypto, brvm] = await Promise.allSettled([
    fetchCryptoPrices(coinIds),
    fetchBRVMPrices(),
  ]);

  return NextResponse.json({
    crypto: crypto.status === 'fulfilled' ? `${Object.keys(crypto.value).length} tokens` : 'error',
    brvm:   brvm.status  === 'fulfilled' ? `${brvm.value.length} tickers`               : 'error',
  });
}
