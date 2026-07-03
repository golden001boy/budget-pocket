export type Role = 'FREE' | 'PREMIUM' | 'ADMIN';
export type Currency = 'XOF' | 'EUR' | 'USD' | 'GBP';

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  currency: Currency;
  timezone: string;
  onboardingDone: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  currency: Currency;
  onboardingDone: boolean;
}
