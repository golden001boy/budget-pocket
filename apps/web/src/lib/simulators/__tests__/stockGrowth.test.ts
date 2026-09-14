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

  it('documents a known discrepancy: the last projectionByYear point runs a few percent below finalValue', () => {
    // finalValue compounds each month's contribution from the month it's
    // made (a proper future-value-of-annuity formula). The year-by-year
    // loop instead adds each year's contributions as one lump sum at
    // year-end (`value * (1+monthlyRate)^12 + monthlyAmount * 12`), which
    // under-compounds relative to the closed form. Not asserted as a bug
    // to fix here -- projectionByYear isn't rendered anywhere in the UI
    // yet (confirmed by search), so this has no visible impact today, but
    // a future chart built on this data would show a headline "final
    // value" that doesn't match its own chart's last point. Flagged in
    // docs/02-prd.md (story 15.29) for whoever wires up that chart.
    const result = computeStockGrowth({
      monthlyAmount: 20000, expectedAnnualReturn: 6, investmentYears: 5, initialAmount: 100000,
    });
    const lastPoint = result.projectionByYear[4].value;
    const gap = (result.finalValue - lastPoint) / result.finalValue;

    expect(lastPoint).toBeLessThan(result.finalValue);
    expect(gap).toBeGreaterThan(0.01);
    expect(gap).toBeLessThan(0.05);
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
