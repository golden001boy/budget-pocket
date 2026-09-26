import { computeRealEstate } from '../realEstate';

describe('computeRealEstate', () => {
  it('computes the standard amortized monthly payment formula', () => {
    // 100,000 loan, 6%/year (0.5%/month), 20 years (240 months) — a
    // textbook mortgage payment calculation, verified independently:
    // M = P * r(1+r)^n / ((1+r)^n - 1)
    const result = computeRealEstate({
      propertyPrice: 120000, downPayment: 20000, interestRate: 6, loanTermYears: 20,
    });

    const P = 100000, r = 0.06 / 12, n = 240;
    const expectedPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    expect(result.loanAmount).toBe(100000);
    expect(result.monthlyPayment).toBe(Math.round(expectedPayment));
  });

  it('splits an interest-free loan evenly across the term, with zero interest', () => {
    const result = computeRealEstate({
      propertyPrice: 120000, downPayment: 20000, interestRate: 0, loanTermYears: 10,
    });

    expect(result.monthlyPayment).toBe(Math.round(100000 / 120));
    expect(result.totalInterest).toBe(0);
  });

  it('keeps totalPaid and totalInterest internally consistent with monthlyPayment', () => {
    const result = computeRealEstate({
      propertyPrice: 200000, downPayment: 40000, interestRate: 4.5, loanTermYears: 15,
    });

    expect(result.totalPaid).toBeCloseTo(result.monthlyPayment * 15 * 12, -1);
    expect(result.totalInterest).toBeCloseTo(result.totalPaid - result.loanAmount, -1);
  });

  it('leaves breakEvenMonths and annualROI null when no rental income is given', () => {
    const result = computeRealEstate({
      propertyPrice: 120000, downPayment: 20000, interestRate: 5, loanTermYears: 20,
    });

    expect(result.breakEvenMonths).toBeNull();
    expect(result.annualROI).toBeNull();
  });

  it('computes a positive annualROI when rent covers more than the mortgage payment', () => {
    const result = computeRealEstate({
      propertyPrice: 100000, downPayment: 20000, interestRate: 5, loanTermYears: 20, monthlyRent: 1000,
    });

    expect(result.annualROI).not.toBeNull();
    expect(result.annualROI!).toBeGreaterThan(0);
    expect(result.breakEvenMonths).not.toBeNull();
    expect(result.breakEvenMonths!).toBeGreaterThan(0);
  });

  it('produces an amortization table capped at 12 rows even for a 30-year loan', () => {
    const result = computeRealEstate({
      propertyPrice: 300000, downPayment: 60000, interestRate: 5, loanTermYears: 30,
    });

    expect(result.amortizationTable).toHaveLength(12);
    expect(result.amortizationTable[0].month).toBe(1);
    expect(result.amortizationTable[11].month).toBe(12);
  });

  it('keeps each amortization row internally consistent (principal + interest = payment) and the balance strictly decreasing', () => {
    const result = computeRealEstate({
      propertyPrice: 300000, downPayment: 60000, interestRate: 5, loanTermYears: 30,
    });

    let previousBalance = result.loanAmount;
    for (const row of result.amortizationTable) {
      // principal/interest/payment are each rounded independently from
      // unrounded figures that sum exactly, so their rounded sum can be
      // off by 1 from the rounded payment -- not a bug, just compounding
      // rounding, hence the tolerance instead of an exact match.
      expect(Math.abs(row.principal + row.interest - row.payment)).toBeLessThanOrEqual(1);
      expect(row.balance).toBeLessThan(previousBalance);
      expect(row.balance).toBeGreaterThanOrEqual(0);
      previousBalance = row.balance;
    }
  });
});
