import { computeRetirement } from '../retirement';

describe('computeRetirement', () => {
  it('computes yearsToRetirement as the simple age difference', () => {
    const result = computeRetirement({
      currentAge: 30, targetRetirementAge: 65, currentSavings: 0,
      monthlyContribution: 100000, expectedReturnRate: 6, inflationRate: 2,
      targetMonthlyIncome: 500000,
    });

    expect(result.yearsToRetirement).toBe(35);
  });

  it('sums contributions with no growth when the return rate is zero', () => {
    const result = computeRetirement({
      currentAge: 50, targetRetirementAge: 60, currentSavings: 100000,
      monthlyContribution: 10000, expectedReturnRate: 0, inflationRate: 0,
      targetMonthlyIncome: 200000,
    });

    // 10 years = 120 months of contributions, no growth on the starting
    // capital either.
    expect(result.projectedSavings).toBe(100000 + 10000 * 120);
  });

  it('grows projected savings with a positive return rate beyond the simple sum', () => {
    const withGrowth = computeRetirement({
      currentAge: 30, targetRetirementAge: 60, currentSavings: 1000000,
      monthlyContribution: 50000, expectedReturnRate: 7, inflationRate: 2,
      targetMonthlyIncome: 1000000,
    });
    const noGrowth = computeRetirement({
      currentAge: 30, targetRetirementAge: 60, currentSavings: 1000000,
      monthlyContribution: 50000, expectedReturnRate: 0, inflationRate: 2,
      targetMonthlyIncome: 1000000,
    });

    expect(withGrowth.projectedSavings).toBeGreaterThan(noGrowth.projectedSavings);
  });

  it('keeps isFunded/fundingGap consistent with projectedSavings vs. requiredNestEgg', () => {
    const result = computeRetirement({
      currentAge: 30, targetRetirementAge: 65, currentSavings: 0,
      monthlyContribution: 50000, expectedReturnRate: 7, inflationRate: 2,
      targetMonthlyIncome: 300000,
    });

    expect(result.isFunded).toBe(result.projectedSavings >= result.requiredNestEgg);
    if (result.isFunded) {
      expect(result.fundingGap).toBe(0);
    } else {
      expect(result.fundingGap).toBe(result.requiredNestEgg - result.projectedSavings);
    }
  });

  it('never lets fundingGap go negative when savings exceed the required nest egg', () => {
    const result = computeRetirement({
      currentAge: 25, targetRetirementAge: 65, currentSavings: 5000000,
      monthlyContribution: 500000, expectedReturnRate: 8, inflationRate: 2,
      targetMonthlyIncome: 200000,
    });

    expect(result.isFunded).toBe(true);
    expect(result.fundingGap).toBe(0);
  });

  it('produces a yearly projection starting at currentSavings and spanning yearsToRetirement + 1 points', () => {
    const result = computeRetirement({
      currentAge: 40, targetRetirementAge: 45, currentSavings: 200000,
      monthlyContribution: 20000, expectedReturnRate: 5, inflationRate: 2,
      targetMonthlyIncome: 300000,
    });

    expect(result.projectionByYear).toHaveLength(6); // 5 years + the starting point
    expect(result.projectionByYear[0]).toEqual({ age: 40, savings: 200000 });
    expect(result.projectionByYear[5].age).toBe(45);
    // Should be monotonically increasing with positive contributions.
    for (let i = 1; i < result.projectionByYear.length; i++) {
      expect(result.projectionByYear[i].savings).toBeGreaterThan(result.projectionByYear[i - 1].savings);
    }
  });

  it('keeps the last projectionByYear point in sync with projectedSavings (story 15.31 fix)', () => {
    // Previously off by ~2.5-3% (story 15.29 finding, documented in
    // 03-architecture.md §13): projectedSavings compounds each month's
    // contribution from the month it's made, but the year-by-year loop
    // used to add a full year of contributions as one lump sum at
    // year-end, under-compounding relative to the closed form. Fixed by
    // compounding month-by-month inside the loop too (see the comment in
    // retirement.ts) — the two numbers now agree exactly, not just
    // approximately, since they run the identical recurrence.
    const result = computeRetirement({
      currentAge: 30, targetRetirementAge: 65, currentSavings: 1000000,
      monthlyContribution: 50000, expectedReturnRate: 7, inflationRate: 2,
      targetMonthlyIncome: 1000000,
    });
    const lastPoint = result.projectionByYear[result.projectionByYear.length - 1].savings;

    expect(lastPoint).toBe(result.projectedSavings);
  });

  it('floors the safe withdrawal rate at 4% when the real (inflation-adjusted) return is lower', () => {
    // Return rate below inflation -> negative/near-zero real return ->
    // should still use the 4% floor, not a near-zero or negative rate
    // (which would make requiredNestEgg absurdly large or negative).
    const result = computeRetirement({
      currentAge: 30, targetRetirementAge: 65, currentSavings: 0,
      monthlyContribution: 50000, expectedReturnRate: 1, inflationRate: 5,
      targetMonthlyIncome: 300000,
    });

    // requiredNestEgg = (targetMonthlyIncome * 12) / 0.04 when floored.
    expect(result.requiredNestEgg).toBe(Math.round((300000 * 12) / 0.04));
  });
});
