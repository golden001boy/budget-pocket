export interface RealEstateInputs {
  propertyPrice:  number;
  downPayment:    number;
  interestRate:   number;
  loanTermYears:  number;
  monthlyRent?:   number;
}

export interface RealEstateResults {
  loanAmount:         number;
  monthlyPayment:     number;
  totalPaid:          number;
  totalInterest:      number;
  breakEvenMonths:    number | null;
  annualROI:          number | null;
  amortizationTable:  AmortizationRow[];
}

export interface AmortizationRow {
  month:        number;
  payment:      number;
  principal:    number;
  interest:     number;
  balance:      number;
}

export function computeRealEstate(inputs: RealEstateInputs): RealEstateResults {
  const { propertyPrice, downPayment, interestRate, loanTermYears, monthlyRent } = inputs;

  const loanAmount       = propertyPrice - downPayment;
  const monthlyRate      = interestRate / 100 / 12;
  const totalMonths      = loanTermYears * 12;

  const monthlyPayment = monthlyRate === 0
    ? loanAmount / totalMonths
    : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths))
      / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalPaid    = monthlyPayment * totalMonths;
  const totalInterest = totalPaid - loanAmount;

  const breakEvenMonths = monthlyRent && monthlyRent > 0
    ? Math.ceil(downPayment / (monthlyRent - monthlyPayment))
    : null;

  const annualROI = monthlyRent && monthlyRent > 0
    ? ((monthlyRent * 12 - monthlyPayment * 12) / propertyPrice) * 100
    : null;

  const amortizationTable: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= Math.min(totalMonths, 12); month++) {
    const interest  = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
    amortizationTable.push({
      month,
      payment:   Math.round(monthlyPayment),
      principal: Math.round(principal),
      interest:  Math.round(interest),
      balance:   Math.max(0, Math.round(balance)),
    });
  }

  return {
    loanAmount:        Math.round(loanAmount),
    monthlyPayment:    Math.round(monthlyPayment),
    totalPaid:         Math.round(totalPaid),
    totalInterest:     Math.round(totalInterest),
    breakEvenMonths,
    annualROI:         annualROI ? Math.round(annualROI * 100) / 100 : null,
    amortizationTable,
  };
}
