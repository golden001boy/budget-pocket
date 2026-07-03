import type { Currency } from '../types/user';

export const CURRENCIES: Record<Currency, { symbol: string; name: string; locale: string; toXOF: number }> = {
  XOF: { symbol: 'FCFA', name: 'Franc CFA',        locale: 'fr-CI', toXOF: 1       },
  EUR: { symbol: '€',    name: 'Euro',              locale: 'fr-FR', toXOF: 655.957 },
  USD: { symbol: '$',    name: 'Dollar américain',  locale: 'en-US', toXOF: 600     },
  GBP: { symbol: '£',    name: 'Livre sterling',    locale: 'en-GB', toXOF: 770     },
};

export function formatCurrency(amount: number, currency: Currency = 'XOF'): string {
  const { locale, symbol } = CURRENCIES[currency];
  if (currency === 'XOF') {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)} ${symbol}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function convertToXOF(amount: number, fromCurrency: Currency): number {
  return amount * CURRENCIES[fromCurrency].toXOF;
}
