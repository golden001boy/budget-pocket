export type ScenarioType =
  | 'REAL_ESTATE' | 'EARLY_RETIREMENT' | 'STOCK_INVESTMENT'
  | 'BUSINESS_CREATION' | 'EDUCATION_FUND' | 'CUSTOM';

export interface AIMessageDTO {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIConversationDTO {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: AIMessageDTO[];
}

export interface ScenarioDTO {
  id: string;
  userId: string;
  type: ScenarioType;
  name: string;
  description: string | null;
  inputs: Record<string, unknown>;
  results: Record<string, unknown> | null;
  computedAt: string | null;
  createdAt: string;
}

export interface RealEstateInputs {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent?: number;
}

export interface RetirementInputs {
  currentAge: number;
  targetRetirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  inflationRate: number;
  targetMonthlyIncome: number;
}

export interface StockInvestmentInputs {
  monthlyAmount: number;
  expectedAnnualReturn: number;
  investmentYears: number;
  initialAmount?: number;
}
