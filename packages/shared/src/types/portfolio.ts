import type { Currency } from './user';

export type AssetClass =
  | 'STOCK_BRVM' | 'STOCK_INTL' | 'CRYPTO' | 'REAL_ESTATE' | 'BOND' | 'SAVINGS_ACCOUNT' | 'OTHER';

export interface PortfolioItemDTO {
  id: string;
  userId: string;
  assetClass: AssetClass;
  ticker: string;
  name: string;
  exchange: string | null;
  quantity: number;
  averageCost: number;
  currency: Currency;
  purchaseDate: string;
  notes: string | null;
  currentPrice: number | null;
  priceUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItemWithPnL extends PortfolioItemDTO {
  currentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  riskScore: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  weightedRisk: number;
  byAssetClass: Record<AssetClass, { value: number; percent: number; count: number }>;
}

export interface AddPortfolioItemInput {
  assetClass: AssetClass;
  ticker: string;
  name: string;
  exchange?: string;
  quantity: number;
  averageCost: number;
  currency?: Currency;
  purchaseDate: string;
  notes?: string;
}
