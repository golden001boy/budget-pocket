export const FREE_TIER_LIMITS = {
  maxTransactionsPerMonth: 50,
  maxGoals:               3,
  maxPortfolioItems:      5,
  maxLinkedAccounts:      1,
  aiMessagesPerDay:       0,
  scenariosTotal:         0,
  forecastMonths:         3,
} as const;

export const PREMIUM_TIER_LIMITS = {
  maxTransactionsPerMonth: Infinity,
  maxGoals:               Infinity,
  maxPortfolioItems:      Infinity,
  maxLinkedAccounts:      Infinity,
  aiMessagesPerDay:       50,
  scenariosTotal:         Infinity,
  forecastMonths:         12,
} as const;

export const PREMIUM_FEATURES = [
  'Transactions illimitées',
  'Objectifs illimités',
  'Portefeuille illimité',
  'Conseiller IA (50 messages/jour)',
  'Simulateurs financiers',
  'Prévisions sur 12 mois',
  'Comptes multiples',
] as const;
