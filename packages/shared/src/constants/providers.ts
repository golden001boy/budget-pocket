import type { SyncProvider } from '../types/transaction';

export const SYNC_PROVIDERS: Record<
  SyncProvider,
  { label: string; logo: string; color: string; available: boolean; description: string }
> = {
  WAVE: {
    label: 'Wave',
    logo: '/logos/wave.svg',
    color: '#00B4D8',
    available: false,
    description: 'Synchronisation automatique de votre compte Wave',
  },
  MTN_MONEY: {
    label: 'MTN MoMo',
    logo: '/logos/mtn.svg',
    color: '#FFCC00',
    available: false,
    description: 'Synchronisation automatique de votre compte MTN Mobile Money',
  },
  ORANGE_MONEY: {
    label: 'Orange Money',
    logo: '/logos/orange.svg',
    color: '#FF6600',
    available: false,
    description: 'Synchronisation automatique de votre compte Orange Money',
  },
  MANUAL: {
    label: 'Compte manuel',
    logo: '/logos/manual.svg',
    color: '#6B7280',
    available: true,
    description: 'Saisie manuelle de vos transactions',
  },
};
