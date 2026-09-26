import { projectForecast } from '../forecast';
import type { MonthlySnapshotDTO } from '@budget-pocket/shared';

function snapshot(overrides: Partial<MonthlySnapshotDTO>): MonthlySnapshotDTO {
  return {
    id: 's1', userId: 'user-1', year: 2026, month: 1,
    totalIncome: 500000, totalExpenses: 300000, totalSavings: 200000,
    savingsRate: 40, netWorth: 1000000, categoryBreakdown: {},
    computedAt: '2026-01-31T00:00:00.000Z',
    ...overrides,
  };
}

describe('projectForecast', () => {
  it('returns an empty array with fewer than 2 snapshots', () => {
    expect(projectForecast([], 6)).toEqual([]);
    expect(projectForecast([snapshot({})], 6)).toEqual([]);
  });

  it('returns exactly monthsAhead points', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1 }),
      snapshot({ year: 2026, month: 2 }),
    ];

    expect(projectForecast(snapshots, 6)).toHaveLength(6);
  });

  it('projects flat averages (zero trend) when income/expenses are constant', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1, totalIncome: 500000, totalExpenses: 300000 }),
      snapshot({ year: 2026, month: 2, totalIncome: 500000, totalExpenses: 300000 }),
      snapshot({ year: 2026, month: 3, totalIncome: 500000, totalExpenses: 300000 }),
    ];

    const [first] = projectForecast(snapshots, 1);

    expect(first.projectedIncome).toBeCloseTo(500000);
    expect(first.projectedExpenses).toBeCloseTo(300000);
    expect(first.projectedSavings).toBeCloseTo(200000);
  });

  it('extrapolates a rising income trend forward, not just the average', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1, totalIncome: 400000, totalExpenses: 0 }),
      snapshot({ year: 2026, month: 2, totalIncome: 500000, totalExpenses: 0 }),
      snapshot({ year: 2026, month: 3, totalIncome: 600000, totalExpenses: 0 }),
    ];

    const points = projectForecast(snapshots, 2);

    // Trend is +100000/month; projections should keep climbing, not flatten
    // at the 500000 average.
    expect(points[0].projectedIncome).toBeGreaterThan(500000);
    expect(points[1].projectedIncome).toBeGreaterThan(points[0].projectedIncome);
  });

  it('never projects negative income or expenses even on a sharply falling trend', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1, totalIncome: 300000, totalExpenses: 0 }),
      snapshot({ year: 2026, month: 2, totalIncome: 150000, totalExpenses: 0 }),
      snapshot({ year: 2026, month: 3, totalIncome: 10000, totalExpenses: 0 }),
    ];

    const points = projectForecast(snapshots, 6);

    expect(points.every(p => p.projectedIncome >= 0)).toBe(true);
  });

  it('accumulates projected savings into a running net worth across months', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1, totalIncome: 500000, totalExpenses: 300000, netWorth: 1000000 }),
      snapshot({ year: 2026, month: 2, totalIncome: 500000, totalExpenses: 300000, netWorth: 1200000 }),
    ];

    const points = projectForecast(snapshots, 3);

    // Flat +200000/month savings on top of the last known net worth (1,200,000).
    expect(points[0].projectedNetWorth).toBeCloseTo(1400000);
    expect(points[1].projectedNetWorth).toBeCloseTo(1600000);
    expect(points[2].projectedNetWorth).toBeCloseTo(1800000);
  });

  it('treats a missing netWorth on the last snapshot as 0, not a crash', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 1, netWorth: null }),
      snapshot({ year: 2026, month: 2, netWorth: null, totalIncome: 100000, totalExpenses: 50000 }),
    ];

    const [first] = projectForecast(snapshots, 1);

    expect(first.projectedNetWorth).toBeCloseTo(first.projectedSavings);
  });

  it('rolls month over into the next year past December', () => {
    const snapshots = [
      snapshot({ year: 2025, month: 11 }),
      snapshot({ year: 2025, month: 12 }),
    ];

    const points = projectForecast(snapshots, 2);

    expect(points[0]).toMatchObject({ month: 1, year: 2026 });
    expect(points[1]).toMatchObject({ month: 2, year: 2026 });
  });

  it('sorts unordered input chronologically before projecting from the actual latest month', () => {
    const snapshots = [
      snapshot({ year: 2026, month: 3, netWorth: 300 }),
      snapshot({ year: 2026, month: 1, netWorth: 100 }),
      snapshot({ year: 2026, month: 2, netWorth: 200 }),
    ];

    const [first] = projectForecast(snapshots, 1);

    // Should continue from month 3 (the real latest), not month 1 (array order).
    expect(first.month).toBe(4);
  });

  it('reports confidence based on how many months of history are available', () => {
    const twoMonths = [snapshot({ month: 1 }), snapshot({ month: 2 })];
    const threeMonths = [snapshot({ month: 1 }), snapshot({ month: 2 }), snapshot({ month: 3 })];
    const sixMonths = Array.from({ length: 6 }, (_, i) => snapshot({ month: i + 1 }));

    expect(projectForecast(twoMonths, 1)[0].confidence).toBe('low');
    expect(projectForecast(threeMonths, 1)[0].confidence).toBe('medium');
    expect(projectForecast(sixMonths, 1)[0].confidence).toBe('high');
  });
});
