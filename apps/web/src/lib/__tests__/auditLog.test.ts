import { logSensitiveAction } from '../auditLog';

describe('logSensitiveAction', () => {
  it('logs a single structured JSON line with the action and provided fields', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logSensitiveAction({ action: 'login_success', userId: 'u1', email: 'demo@budget-pocket.app', ip: '203.0.113.1' });

    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged).toMatchObject({
      type: 'audit',
      action: 'login_success',
      userId: 'u1',
      email: 'demo@budget-pocket.app',
      ip: '203.0.113.1',
      reason: null,
    });
    expect(typeof logged.at).toBe('string');
    expect(new Date(logged.at).toString()).not.toBe('Invalid Date');

    spy.mockRestore();
  });

  it('fills in null for every optional field left out, rather than omitting the key', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logSensitiveAction({ action: 'password_reset_completed' });

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.userId).toBeNull();
    expect(logged.email).toBeNull();
    expect(logged.ip).toBeNull();
    expect(logged.reason).toBeNull();

    spy.mockRestore();
  });
});
