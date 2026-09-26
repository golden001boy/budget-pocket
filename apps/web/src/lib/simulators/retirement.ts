export interface RetirementInputs {
  currentAge:          number;
  targetRetirementAge: number;
  currentSavings:      number;
  monthlyContribution: number;
  expectedReturnRate:  number;
  inflationRate:       number;
  targetMonthlyIncome: number;
}

export interface RetirementResults {
  yearsToRetirement:     number;
  projectedSavings:      number;
  requiredNestEgg:       number;
  monthlyIncomeAchievable: number;
  isFunded:              boolean;
  fundingGap:            number;
  projectionByYear:      { age: number; savings: number }[];
}

export function computeRetirement(inputs: RetirementInputs): RetirementResults {
  const {
    currentAge, targetRetirementAge, currentSavings,
    monthlyContribution, expectedReturnRate, inflationRate, targetMonthlyIncome,
  } = inputs;

  const yearsToRetirement = targetRetirementAge - currentAge;
  const monthlyRate       = expectedReturnRate / 100 / 12;
  const totalMonths       = yearsToRetirement * 12;

  // Future value of current savings + contributions
  const fvCurrentSavings    = currentSavings * Math.pow(1 + monthlyRate, totalMonths);
  const fvContributions     = monthlyRate === 0
    ? monthlyContribution * totalMonths
    : monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const projectedSavings = fvCurrentSavings + fvContributions;

  // Required nest egg (4% safe withdrawal rule adjusted for inflation)
  const realReturnRate   = ((1 + expectedReturnRate / 100) / (1 + inflationRate / 100) - 1) * 100;
  const safeWithdrawal   = Math.max(realReturnRate / 100, 0.04);
  const requiredNestEgg  = (targetMonthlyIncome * 12) / safeWithdrawal;
  const monthlyIncomeAchievable = (projectedSavings * safeWithdrawal) / 12;

  const isFunded   = projectedSavings >= requiredNestEgg;
  const fundingGap = Math.max(0, requiredNestEgg - projectedSavings);

  // Month-by-month, not `savings * (1+monthlyRate)^12 + monthlyContribution * 12`:
  // that lump-sum update added a year's contributions in one shot at
  // year-end, undercapitalizing them relative to the closed-form annuity
  // formula above (which compounds each monthly contribution from its own
  // month) — the two diverged by ~2.5-3% by the end of a realistic
  // projection (found while writing this file's tests, story 15.29).
  // Compounding monthly here keeps the last point exactly in sync with
  // `projectedSavings`.
  const projectionByYear: { age: number; savings: number }[] = [];
  let savings = currentSavings;
  for (let y = 0; y <= yearsToRetirement; y++) {
    projectionByYear.push({ age: currentAge + y, savings: Math.round(savings) });
    for (let m = 0; m < 12; m++) {
      savings = savings * (1 + monthlyRate) + monthlyContribution;
    }
  }

  return {
    yearsToRetirement,
    projectedSavings:       Math.round(projectedSavings),
    requiredNestEgg:        Math.round(requiredNestEgg),
    monthlyIncomeAchievable: Math.round(monthlyIncomeAchievable),
    isFunded,
    fundingGap:             Math.round(fundingGap),
    projectionByYear,
  };
}
