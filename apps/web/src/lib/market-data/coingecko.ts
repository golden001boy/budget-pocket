import { cacheGetOrSet, CACHE_TTL } from '../cache';
import { CRYPTO_COINGECKO_IDS } from '@budget-pocket/shared';

const EUR_TO_XOF = 655.957; // CFA is pegged to EUR

export interface CryptoPrices {
  [coinId: string]: {
    usd:             number;
    eur:             number;
    xof:             number;
    usd_24h_change?: number;
  };
}

export async function fetchCryptoPrices(coinIds: string[]): Promise<CryptoPrices> {
  const ids = coinIds.join(',');
  const key = `crypto:prices:v1:${ids}`;

  return cacheGetOrSet(key, async () => {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur&include_24hr_change=true`,
      {
        headers: process.env.COINGECKO_API_KEY
          ? { 'x-cg-api-key': process.env.COINGECKO_API_KEY }
          : {},
        next: { revalidate: 0 },
      },
    );
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    const data = (await res.json()) as Record<string, { usd: number; eur: number; usd_24h_change?: number }>;

    const result: CryptoPrices = {};
    for (const [id, prices] of Object.entries(data)) {
      result[id] = {
        usd:             prices.usd,
        eur:             prices.eur,
        xof:             Math.round(prices.eur * EUR_TO_XOF),
        usd_24h_change:  prices.usd_24h_change,
      };
    }
    return result;
  }, CACHE_TTL.CRYPTO_PRICES);
}

export function getCoingeckoId(ticker: string): string | undefined {
  return CRYPTO_COINGECKO_IDS[ticker.toUpperCase()];
}
