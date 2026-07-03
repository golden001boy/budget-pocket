import type { ForecastPoint, MonthlySnapshotDTO } from '@budget-pocket/shared';

export function projectForecast(
  snapshots: MonthlySnapshotDTO[],
  monthsAhead: number,
): ForecastPoint[] {
  if (snapshots.length < 2) return [];

  const sorted = [...snapshots].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );

  const avgIncome   = sorted.reduce((s, x) => s + x.totalIncome,   0) / sorted.length;
  const avgExpenses = sorted.reduce((s, x) => s + x.totalExpenses, 0) / sorted.length;

  // Trend: simple linear regression over last N points
  const incomeSlope   = linearSlope(sorted.map(s => s.totalIncome));
  const expenseSlope  = linearSlope(sorted.map(s => s.totalExpenses));

  const lastSnapshot  = sorted[sorted.length - 1];
  let netWorthBase    = lastSnapshot.netWorth ?? 0;
  const confidence    = sorted.length >= 6 ? 'high' : sorted.length >= 3 ? 'medium' : 'low';

  const result: ForecastPoint[] = [];
  let { year, month } = lastSnapshot;

  for (let i = 1; i <= monthsAhead; i++) {
    month++;
    if (month > 12) { month = 1; year++; }

    const projectedIncome   = Math.max(0, avgIncome   + incomeSlope   * i);
    const projectedExpenses = Math.max(0, avgExpenses + expenseSlope  * i);
    const projectedSavings  = projectedIncome - projectedExpenses;
    netWorthBase += projectedSavings;

    const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                          'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    result.push({
      month,
      year,
      label:              `${MONTH_LABELS[month - 1]} ${year}`,
      projectedIncome,
      projectedExpenses,
      projectedSavings,
      projectedNetWorth:  netWorthBase,
      confidence,
    });
  }

  return result;
}

function linearSlope(values: number[]): number {
  const n  = values.length;
  const xs = values.map((_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  const num   = xs.reduce((s, x, i) => s + (x - meanX) * (values[i] - meanY), 0);
  const den   = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  return den === 0 ? 0 : num / den;
}
