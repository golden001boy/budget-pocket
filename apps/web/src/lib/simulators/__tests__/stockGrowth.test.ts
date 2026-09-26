import { computeStockGrowth } from '../stockGrowth';

describe('computeStockGrowth', () => {
  it('sums contributions with no growth when the return rate is zero', () => {
    const result = computeStockGrowth({
      monthlyAmount: 50000, expectedAnnualReturn: 0, investmentYears: 10, initialAmount: 200000,
    });

    expect(result.finalValue).toBe(200000 + 50000 * 120);
    expect(result.totalInvested).toBe(200000 + 50000 * 120);
    expect(result.totalGain).toBe(0);
    expect(result.totalGainPercent).toBe(0);
  });

  it('defaults initialAmount to 0 when omitted', () => {
    const withDefault = computeStockGrowth({ monthlyAmount: 10000, expectedAnnualReturn: 0, investmentYears: 5 });
    const withExplicitZero = computeStockGrowth({ monthlyAmount: 10000, expectedAnnualReturn: 0, investmentYears: 5, initialAmount: 0 });

    expect(withDefault).toEqual(withExplicitZero);
  });

  it('produces a positive gain when the return rate is positive', () => {
    const result = computeStockGrowth({
      monthlyAmount: 100000, expectedAnnualReturn: 8, investmentYears: 20,
    });

    expect(result.finalValue).toBeGreaterThan(result.totalInvested);
    expect(result.totalGain).toBeGreaterThan(0);
    expect(result.totalGainPercent).toBeGreaterThan(0);
  });

  it('grows a positive return faster over more years (compounding, not linear)', () => {
    const tenYears = computeStockGrowth({ monthlyAmount: 50000, expectedAnnualReturn: 7, investmentYears: 10 });
    const twentyYears = computeStockGrowth({ monthlyAmount: 50000, expectedAnnualReturn: 7, investmentYears: 20 });

    // Twice the years should more than double the final value under
    // compounding (linear growth would only exactly double it).
    expect(twentyYears.finalValue).toBeGreaterThan(tenYears.finalValue * 2);
  });

  it('produces a yearly projection of exactly investmentYears points', () => {
    const result = computeStockGrowth({
      monthlyAmount: 20000, expectedAnnualReturn: 6, investmentYears: 5, initialAmount: 100000,
    });

    expect(result.projectionByYear).toHaveLength(5);
    expect(result.projectionByYear[4].invested).toBe(result.totalInvested);
  });

  it('keeps the last projectionByYear point in sync with finalValue (story 15.31 fix)', () => {
    // Previously off by ~2.5-3% (story 15.29 finding, documented in
    // 03-architecture.md §13): finalValue compounds each month's
    // contribution from the month it's made, but the year-by-year loop
    // used to add a full year of contributions as one lump sum at
    // year-end, under-compounding relative to the closed form. Fixed by
    // compounding month-by-month inside the loop too (see the comment in
    // stockGrowth.ts) — the two numbers now agree exactly, not just
    // approximately, since they run the identical recurrence.
    const result = computeStockGrowth({
      monthlyAmount: 20000, expectedAnnualReturn: 6, investmentYears: 5, initialAmount: 100000,
    });
    const lastPoint = result.projectionByYear[4].value;

    expect(lastPoint).toBe(result.finalValue);
  });

  it('keeps invested amounts monotonically increasing year over year', () => {
    const result = computeStockGrowth({
      monthlyAmount: 30000, expectedAnnualReturn: 5, investmentYears: 8, initialAmount: 50000,
    });

    for (let i = 1; i < result.projectionByYear.length; i++) {
      expect(result.projectionByYear[i].invested).toBeGreaterThan(result.projectionByYear[i - 1].invested);
    }
  });

  it('returns a zero gain percentage rather than dividing by zero when nothing is invested', () => {
    const result = computeStockGrowth({ monthlyAmount: 0, expectedAnnualReturn: 8, investmentYears: 10, initialAmount: 0 });

    expect(result.totalInvested).toBe(0);
    expect(result.totalGainPercent).toBe(0);
  });
});
