import type { AssetClass } from '../types/portfolio';

export const BRVM_TICKERS = [
  { ticker: 'SNTS', name: 'Sonatel',                 exchange: 'BRVM', sector: 'Télécommunications' },
  { ticker: 'ECOC', name: 'Ecobank Côte d\'Ivoire',  exchange: 'BRVM', sector: 'Banque'             },
  { ticker: 'BOAB', name: 'Bank of Africa Bénin',    exchange: 'BRVM', sector: 'Banque'             },
  { ticker: 'BICC', name: 'BICICI',                   exchange: 'BRVM', sector: 'Banque'             },
  { ticker: 'SGBC', name: 'Société Générale CI',      exchange: 'BRVM', sector: 'Banque'             },
  { ticker: 'SIBC', name: 'SIB',                      exchange: 'BRVM', sector: 'Banque'             },
  { ticker: 'ONTBF', name: 'ONATEL Burkina',          exchange: 'BRVM', sector: 'Télécommunications' },
  { ticker: 'PALC', name: 'Palm CI',                  exchange: 'BRVM', sector: 'Agro-industrie'     },
  { ticker: 'SVOC', name: 'SAPH',                     exchange: 'BRVM', sector: 'Agro-industrie'     },
  { ticker: 'TTLC', name: 'Total Côte d\'Ivoire',     exchange: 'BRVM', sector: 'Distribution'       },
] as const;

export const CRYPTO_COINGECKO_IDS: Record<string, string> = {
  BTC:  'bitcoin',
  ETH:  'ethereum',
  SOL:  'solana',
  ADA:  'cardano',
  BNB:  'binancecoin',
  USDT: 'tether',
  XRP:  'ripple',
  MATIC: 'matic-network',
};

export const INTL_INDICES = [
  { symbol: '^FCHI',  name: 'CAC 40',           exchange: 'Euronext Paris', currency: 'EUR' },
  { symbol: '^IXIC',  name: 'NASDAQ Composite', exchange: 'NASDAQ',         currency: 'USD' },
  { symbol: '^GSPC',  name: 'S&P 500',          exchange: 'NYSE',           currency: 'USD' },
  { symbol: '^DJI',   name: 'Dow Jones',         exchange: 'NYSE',           currency: 'USD' },
] as const;

export const ASSET_RISK_SCORES: Record<AssetClass, number> = {
  CRYPTO:          9,
  STOCK_BRVM:      6,
  STOCK_INTL:      5,
  REAL_ESTATE:     4,
  BOND:            3,
  SAVINGS_ACCOUNT: 1,
  OTHER:           5,
};

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  STOCK_BRVM:      'Actions BRVM',
  STOCK_INTL:      'Marchés internationaux',
  CRYPTO:          'Crypto-actifs',
  REAL_ESTATE:     'Immobilier',
  BOND:            'Obligations',
  SAVINGS_ACCOUNT: 'Épargne',
  OTHER:           'Autres',
};
