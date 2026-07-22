// Regression coverage for the schemas wired into /api/auth/mobile and
// /api/goals/[id] in story 15.2 — they existed in @budget-pocket/shared
// unused before that story; this locks in the validation behavior those
// routes now depend on.
import { loginSchema, updateGoalSchema } from '@budget-pocket/shared';

describe('loginSchema', () => {
  it('accepts a well-formed email/password pair', () => {
    const result = loginSchema.safeParse({ email: 'demo@budget-pocket.app', password: 'demo1234' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'demo1234' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'demo@budget-pocket.app', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing password field entirely', () => {
    const result = loginSchema.safeParse({ email: 'demo@budget-pocket.app' });
    expect(result.success).toBe(false);
  });
});

describe('updateGoalSchema', () => {
  it('accepts a partial update with a single field', () => {
    const result = updateGoalSchema.safeParse({ currentAmount: 150000 });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (no-op update)', () => {
    const result = updateGoalSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects a negative targetAmount', () => {
    const result = updateGoalSchema.safeParse({ targetAmount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status value', () => {
    const result = updateGoalSchema.safeParse({ status: 'NOT_A_REAL_STATUS' });
    expect(result.success).toBe(false);
  });

  it('strips unknown fields rather than erroring, so a client cannot inject arbitrary columns', () => {
    const result = updateGoalSchema.safeParse({ currentAmount: 1000, userId: 'someone-elses-id' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('userId');
    }
  });
});
