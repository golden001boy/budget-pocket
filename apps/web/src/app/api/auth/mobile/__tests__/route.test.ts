import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logSensitiveAction } from '@/lib/auditLog';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: jest.fn() } } }));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
jest.mock('next-auth/jwt', () => ({ encode: jest.fn() }));
jest.mock('@/lib/auditLog', () => ({ logSensitiveAction: jest.fn() }));
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(),
  getClientIp: jest.fn(() => '203.0.113.1'),
  loginRateLimitKey: (email: string, ip: string) => `login:${email}:${ip}`,
  accountLoginRateLimitKey: (email: string) => `account:${email}`,
  LOGIN_ATTEMPT_LIMIT: 5,
  LOGIN_WINDOW_SECONDS: 900,
  ACCOUNT_LOGIN_ATTEMPT_LIMIT: 10,
}));

const mockPrisma = prisma as unknown as { user: { findUnique: jest.Mock } };
const mockRateLimit = rateLimit as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockEncode = encode as jest.Mock;
const mockLog = logSensitiveAction as jest.Mock;

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/mobile', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as any;
}

function makeRawRequest(rawBody: string) {
  return new Request('http://localhost/api/auth/mobile', { method: 'POST', body: rawBody }) as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRateLimit.mockResolvedValue({ success: true, remaining: 4 });
});

describe('POST /api/auth/mobile — audit logging (story 15.19)', () => {
  it('logs login_failure with reason rate_limited_ip and never touches the DB', async () => {
    mockRateLimit.mockResolvedValueOnce({ success: false, remaining: 0 });

    await POST(makeRequest({ email: 'demo@budget-pocket.app', password: 'whatever123' }));

    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'login_failure', reason: 'rate_limited_ip', email: 'demo@budget-pocket.app' }),
    );
  });

  it('logs login_failure with reason no_such_account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await POST(makeRequest({ email: 'ghost@budget-pocket.app', password: 'whatever123' }));

    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'login_failure', reason: 'no_such_account' }),
    );
  });

  it('logs login_failure with reason wrong_password, including the userId', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'demo@budget-pocket.app', passwordHash: 'hash' });
    mockCompare.mockResolvedValue(false);

    await POST(makeRequest({ email: 'demo@budget-pocket.app', password: 'wrongpass123' }));

    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'login_failure', reason: 'wrong_password', userId: 'u1' }),
    );
  });

  it('logs login_success on a valid login, after the token is issued', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1', email: 'demo@budget-pocket.app', passwordHash: 'hash',
      name: 'Demo', role: 'PREMIUM', currency: 'XOF', onboardingDone: true, emailVerified: new Date(),
    });
    mockCompare.mockResolvedValue(true);
    mockEncode.mockResolvedValue('jwt-token');

    const response = await POST(makeRequest({ email: 'demo@budget-pocket.app', password: 'correctpass123' }));

    expect(response.status).toBe(200);
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'login_success', userId: 'u1', email: 'demo@budget-pocket.app' }),
    );
  });
});

describe('POST /api/auth/mobile — payload size limit (story 15.30)', () => {
  it('rejects an oversized body with 413 before it reaches the DB', async () => {
    const response = await POST(makeRawRequest('x'.repeat(MAX_JSON_BODY_BYTES + 1)));

    expect(response.status).toBe(413);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/mobile — error handling (story 15.21)', () => {
  it('returns a clean 500 JSON instead of an unhandled crash when the DB throws', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Can\'t reach database server at `secret-host:5432`'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest({ email: 'demo@budget-pocket.app', password: 'whatever123' }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erreur serveur' });
    expect(JSON.stringify(body)).not.toContain('secret-host');
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
