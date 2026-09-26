export interface StockGrowthInputs {
  monthlyAmount:        number;
  expectedAnnualReturn: number;
  investmentYears:      number;
  initialAmount?:       number;
}

export interface StockGrowthResults {
  finalValue:          number;
  totalInvested:       number;
  totalGain:           number;
  totalGainPercent:    number;
  projectionByYear:    { year: number; value: number; invested: number }[];
}

export function computeStockGrowth(inputs: StockGrowthInputs): StockGrowthResults {
  const { monthlyAmount, expectedAnnualReturn, investmentYears, initialAmount = 0 } = inputs;

  const monthlyRate  = expectedAnnualReturn / 100 / 12;
  const totalMonths  = investmentYears * 12;

  const fvInitial       = initialAmount * Math.pow(1 + monthlyRate, totalMonths);
  const fvContributions = monthlyRate === 0
    ? monthlyAmount * totalMonths
    : monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const finalValue   = fvInitial + fvContributions;
  const totalInvested = initialAmount + monthlyAmount * totalMonths;
  const totalGain    = finalValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Month-by-month, not `value * (1+monthlyRate)^12 + monthlyAmount * 12`:
  // that lump-sum update added a year's contributions in one shot at
  // year-end, undercapitalizing them relative to the closed-form annuity
  // formula above (which compounds each monthly contribution from its own
  // month) — the two diverged by ~2.5-3% by the end of a realistic
  // projection (found while writing this file's tests, story 15.29).
  // Compounding monthly here keeps the last point exactly in sync with
  // `finalValue`.
  const projectionByYear: { year: number; value: number; invested: number }[] = [];
  let value    = initialAmount;
  let invested = initialAmount;

  for (let y = 1; y <= investmentYears; y++) {
    for (let m = 0; m < 12; m++) {
      value = value * (1 + monthlyRate) + monthlyAmount;
    }
    invested += monthlyAmount * 12;
    projectionByYear.push({
      year:     y,
      value:    Math.round(value),
      invested: Math.round(invested),
    });
  }

  return {
    finalValue:       Math.round(finalValue),
    totalInvested:    Math.round(totalInvested),
    totalGain:        Math.round(totalGain),
    totalGainPercent: Math.round(totalGainPercent * 100) / 100,
    projectionByYear,
  };
}
