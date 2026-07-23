import { rateLimit, getClientIp, loginRateLimitKey, accountLoginRateLimitKey, ACCOUNT_LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_LIMIT } from '../rateLimit';
import { redis } from '../redis';

jest.mock('../redis', () => ({
  redis: { incr: jest.fn(), expire: jest.fn(), ttl: jest.fn() },
}));

const mockRedis = redis as unknown as { incr: jest.Mock; expire: jest.Mock; ttl: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('rateLimit', () => {
  it('allows the request while under the limit', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(900);

    const result = await rateLimit('test-key', 5, 900);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:test-key', 900);
  });

  it('only sets the expiry on the first increment, not subsequent ones', async () => {
    mockRedis.incr.mockResolvedValue(3);
    mockRedis.ttl.mockResolvedValue(600);

    await rateLimit('test-key', 5, 900);

    expect(mockRedis.expire).not.toHaveBeenCalled();
  });

  it('blocks the request once the count exceeds the limit', async () => {
    mockRedis.incr.mockResolvedValue(6);
    mockRedis.ttl.mockResolvedValue(300);

    const result = await rateLimit('test-key', 5, 900);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('fails open when Redis is unreachable', async () => {
    mockRedis.incr.mockRejectedValue(new Error('connection refused'));

    const result = await rateLimit('test-key', 5, 900);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(5);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('getClientIp', () => {
  it('reads the first address from x-forwarded-for (Headers instance)', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.1, 70.41.3.18' });
    expect(getClientIp(headers)).toBe('203.0.113.1');
  });

  it('reads x-forwarded-for from a plain object (NextAuth authorize() request shape)', () => {
    expect(getClientIp({ 'x-forwarded-for': '198.51.100.5' })).toBe('198.51.100.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    expect(getClientIp({ 'x-real-ip': '192.0.2.9' })).toBe('192.0.2.9');
  });

  it('returns "unknown" when no IP header or headers object is present', () => {
    expect(getClientIp(undefined)).toBe('unknown');
    expect(getClientIp({})).toBe('unknown');
  });
});

describe('accountLoginRateLimitKey', () => {
  it('normalizes email casing/whitespace the same way loginRateLimitKey does', () => {
    expect(accountLoginRateLimitKey(' Demo@Budget-Pocket.App '))
      .toBe(accountLoginRateLimitKey('demo@budget-pocket.app'));
  });

  it('does not incorporate an IP, unlike loginRateLimitKey (story 15.8: catches brute force spread across IPs)', () => {
    const account = accountLoginRateLimitKey('demo@budget-pocket.app');
    const perIpA  = loginRateLimitKey('demo@budget-pocket.app', '203.0.113.1');
    const perIpB  = loginRateLimitKey('demo@budget-pocket.app', '203.0.113.2');
    expect(account).not.toBe(perIpA);
    expect(account).not.toBe(perIpB);
  });

  it('is set higher than the per-IP limit so a single-IP login mistake never trips it first', () => {
    expect(ACCOUNT_LOGIN_ATTEMPT_LIMIT).toBeGreaterThan(LOGIN_ATTEMPT_LIMIT);
  });
});

describe('loginRateLimitKey', () => {
  it('normalizes email casing/whitespace so the same account always maps to one key', () => {
    expect(loginRateLimitKey(' Demo@Budget-Pocket.App ', '203.0.113.1'))
      .toBe(loginRateLimitKey('demo@budget-pocket.app', '203.0.113.1'));
  });

  it('combines email and IP so the same account from a different IP is a distinct bucket', () => {
    const a = loginRateLimitKey('demo@budget-pocket.app', '203.0.113.1');
    const b = loginRateLimitKey('demo@budget-pocket.app', '203.0.113.2');
    expect(a).not.toBe(b);
  });
});
