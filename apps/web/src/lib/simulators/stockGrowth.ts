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

  const projectionByYear: { year: number; value: number; invested: number }[] = [];
  let value    = initialAmount;
  let invested = initialAmount;

  for (let y = 1; y <= investmentYears; y++) {
    value    = value * Math.pow(1 + monthlyRate, 12) + monthlyAmount * 12;
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
