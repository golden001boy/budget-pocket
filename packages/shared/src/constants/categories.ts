import type { ExpenseCategory, ExpenseType } from '../types/transaction';

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; defaultType: ExpenseType }
> = {
  FOOD:          { label: 'Alimentation',   icon: '🛒', color: '#22C55E', defaultType: 'CURRENT'    },
  TRANSPORT:     { label: 'Transport',       icon: '🚗', color: '#3B82F6', defaultType: 'CURRENT'    },
  HOUSING:       { label: 'Logement',        icon: '🏠', color: '#8B5CF6', defaultType: 'FIXED'      },
  UTILITIES:     { label: 'Services publics',icon: '💡', color: '#F59E0B', defaultType: 'FIXED'      },
  HEALTH:        { label: 'Santé',           icon: '🏥', color: '#EF4444', defaultType: 'OCCASIONAL' },
  EDUCATION:     { label: 'Éducation',       icon: '📚', color: '#0EA5E9', defaultType: 'FIXED'      },
  ENTERTAINMENT: { label: 'Loisirs',         icon: '🎬', color: '#EC4899', defaultType: 'OCCASIONAL' },
  CLOTHING:      { label: 'Habillement',     icon: '👔', color: '#F97316', defaultType: 'OCCASIONAL' },
  SAVINGS:       { label: 'Épargne',         icon: '💰', color: '#10B981', defaultType: 'FIXED'      },
  INVESTMENT:    { label: 'Investissement',  icon: '📈', color: '#6366F1', defaultType: 'FIXED'      },
  INSURANCE:     { label: 'Assurances',      icon: '🛡️', color: '#14B8A6', defaultType: 'FIXED'      },
  TAXES:         { label: 'Impôts & taxes',  icon: '🧾', color: '#64748B', defaultType: 'OCCASIONAL' },
  GIFTS:         { label: 'Cadeaux',         icon: '🎁', color: '#F472B6', defaultType: 'OCCASIONAL' },
  SUBSCRIPTIONS: { label: 'Abonnements',     icon: '📱', color: '#A855F7', defaultType: 'FIXED'      },
  OTHER:         { label: 'Autres',          icon: '📦', color: '#6B7280', defaultType: 'CURRENT'    },
};

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  FIXED:      'Fixe',
  CURRENT:    'Courante',
  OCCASIONAL: 'Occasionnelle',
};
