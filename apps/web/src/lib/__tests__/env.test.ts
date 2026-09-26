import { parseServerEnv } from '../env';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@host:5432/db?sslmode=require',
  NEXTAUTH_SECRET: 'a'.repeat(32),
  NEXTAUTH_URL: 'http://localhost:3000',
  CRON_SECRET: 'b'.repeat(16),
  MFA_ENCRYPTION_KEY: 'c'.repeat(64),
};

describe('parseServerEnv', () => {
  it('accepts a minimal valid environment (only the required vars set)', () => {
    const result = parseServerEnv(validEnv);
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(result.REDIS_URL).toBeUndefined();
  });

  it('accepts optional vars when well-formed, without requiring them', () => {
    const result = parseServerEnv({
      ...validEnv,
      REDIS_URL: 'redis://localhost:6379',
      STRIPE_SECRET_KEY: 'sk_test_123',
    });
    expect(result.REDIS_URL).toBe('redis://localhost:6379');
    expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123');
  });

  it.each(['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'CRON_SECRET', 'MFA_ENCRYPTION_KEY'])(
    'rejects a missing required var: %s',
    (key) => {
      const broken = { ...validEnv };
      delete (broken as Record<string, string | undefined>)[key];
      expect(() => parseServerEnv(broken)).toThrow(new RegExp(key));
    },
  );

  it('rejects a DATABASE_URL that is not a valid URL', () => {
    expect(() => parseServerEnv({ ...validEnv, DATABASE_URL: 'not-a-url' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a NEXTAUTH_SECRET shorter than 32 characters', () => {
    expect(() => parseServerEnv({ ...validEnv, NEXTAUTH_SECRET: 'too-short' })).toThrow(/NEXTAUTH_SECRET/);
  });

  it('rejects a CRON_SECRET shorter than 16 characters', () => {
    expect(() => parseServerEnv({ ...validEnv, CRON_SECRET: 'short' })).toThrow(/CRON_SECRET/);
  });

  it('rejects an MFA_ENCRYPTION_KEY that is not exactly 64 hex characters', () => {
    expect(() => parseServerEnv({ ...validEnv, MFA_ENCRYPTION_KEY: 'not-hex' })).toThrow(/MFA_ENCRYPTION_KEY/);
    expect(() => parseServerEnv({ ...validEnv, MFA_ENCRYPTION_KEY: 'a'.repeat(63) })).toThrow(/MFA_ENCRYPTION_KEY/);
  });

  it('accepts an uppercase-hex MFA_ENCRYPTION_KEY', () => {
    const result = parseServerEnv({ ...validEnv, MFA_ENCRYPTION_KEY: 'F'.repeat(64) });
    expect(result.MFA_ENCRYPTION_KEY).toBe('F'.repeat(64));
  });

  it('treats an empty-string optional var as unset, same convention as Sentry/Resend no-op elsewhere', () => {
    const result = parseServerEnv({ ...validEnv, RESEND_API_KEY: '', NEXT_PUBLIC_SENTRY_DSN: '' });
    expect(result.RESEND_API_KEY).toBeUndefined();
    expect(result.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
  });

  it('still rejects an empty-string REDIS_URL as not a valid URL once non-empty', () => {
    expect(() => parseServerEnv({ ...validEnv, REDIS_URL: 'not-a-url' })).toThrow(/REDIS_URL/);
  });

  it('aggregates every failing field into one error instead of stopping at the first', () => {
    expect(() => parseServerEnv({ DATABASE_URL: 'not-a-url' })).toThrow(
      /DATABASE_URL[\s\S]*NEXTAUTH_SECRET[\s\S]*NEXTAUTH_URL[\s\S]*CRON_SECRET[\s\S]*MFA_ENCRYPTION_KEY/,
    );
  });
});
