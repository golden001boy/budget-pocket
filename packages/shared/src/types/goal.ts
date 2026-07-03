import type { Currency } from './user';

export type GoalType =
  | 'SAVINGS' | 'DEBT_PAYOFF' | 'PURCHASE' | 'EMERGENCY_FUND'
  | 'RETIREMENT' | 'EDUCATION' | 'TRAVEL' | 'OTHER';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface GoalDTO {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline: string | null;
  status: GoalStatus;
  priority: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress extends GoalDTO {
  percentComplete: number;
  remaining: number;
  daysRemaining: number | null;
  isOnTrack: boolean;
}

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetAmount: number;
  currency?: Currency;
  deadline?: string;
  priority?: number;
  notes?: string;
}
