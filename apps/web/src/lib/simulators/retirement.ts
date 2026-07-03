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

  const projectionByYear: { age: number; savings: number }[] = [];
  let savings = currentSavings;
  for (let y = 0; y <= yearsToRetirement; y++) {
    projectionByYear.push({ age: currentAge + y, savings: Math.round(savings) });
    savings = savings * Math.pow(1 + monthlyRate, 12) + monthlyContribution * 12;
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
