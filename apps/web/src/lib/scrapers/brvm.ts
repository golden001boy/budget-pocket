import { cacheGetOrSet, CACHE_TTL } from '../cache';

export interface BRVMQuote {
  ticker:    string;
  name:      string;
  price:     number;
  change:    number;
  volume:    number;
  currency:  'XOF';
  updatedAt: string;
}

export async function fetchBRVMPrices(): Promise<BRVMQuote[]> {
  const today = new Date().toISOString().split('T')[0];
  const key   = `brvm:prices:${today}`;

  return cacheGetOrSet(key, async () => {
    try {
      const res = await fetch('https://www.brvm.org/fr/cours-actions/0/action', {
        headers: { 'User-Agent': 'Mozilla/5.0 Budget-Pocket/1.0' },
        next:    { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`BRVM fetch error: ${res.status}`);

      const html = await res.text();
      return parseBRVMHtml(html);
    } catch {
      // Return empty array on scrape failure — caller should handle gracefully
      return [];
    }
  }, CACHE_TTL.BRVM_PRICES);
}

function parseBRVMHtml(html: string): BRVMQuote[] {
  const quotes: BRVMQuote[] = [];
  // Parse table rows — BRVM HTML table: ticker | name | last | change | volume
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const rows = html.match(rowRegex) ?? [];

  for (const row of rows) {
    const cells = Array.from(row.matchAll(cellRegex)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (cells.length < 5) continue;

    const price  = parseFloat(cells[2].replace(/\s/g, '').replace(',', '.'));
    const change = parseFloat(cells[3].replace(',', '.').replace('%', ''));
    const volume = parseInt(cells[4].replace(/\s/g, ''), 10);

    if (!isNaN(price) && cells[0] && cells[0].length <= 10) {
      quotes.push({
        ticker:    cells[0].toUpperCase(),
        name:      cells[1],
        price:     isNaN(price)  ? 0 : price,
        change:    isNaN(change) ? 0 : change,
        volume:    isNaN(volume) ? 0 : volume,
        currency:  'XOF',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return quotes;
}
