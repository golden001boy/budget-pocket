import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { generateTotpSecret } from '@/lib/mfa';
import { encryptSecret } from '@/lib/mfaCrypto';
import { authenticator } from 'otplib';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn(), update: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));
jest.mock('@/lib/auditLog', () => ({ logSensitiveAction: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/mfa/enable', { method: 'POST', body: JSON.stringify(body) });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('POST /api/auth/mfa/enable', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest({ token: '123456' }));

    expect(response.status).toBe(401);
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it('rejects with 400 when no setup is pending', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', mfaSecret: null, mfaEnabled: false });

    const response = await POST(makeRequest({ token: '123456' }));

    expect(response.status).toBe(400);
  });

  it('rejects with 400 when MFA is already enabled', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', mfaSecret: encryptSecret('X'.repeat(16)), mfaEnabled: true });

    const response = await POST(makeRequest({ token: '123456' }));

    expect(response.status).toBe(400);
  });

  it('rejects an incorrect TOTP code with 400, without enabling MFA', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const secret = generateTotpSecret();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', mfaSecret: encryptSecret(secret), mfaEnabled: false });

    const response = await POST(makeRequest({ token: '000000' }));

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('enables MFA and returns recovery codes when the code is correct', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1', email: 'demo@budget-pocket.app' } });
    const secret = generateTotpSecret();
    const validToken = authenticator.generate(secret);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1', email: 'demo@budget-pocket.app', mfaSecret: encryptSecret(secret), mfaEnabled: false,
    });
    mockPrisma.user.update.mockResolvedValue({});

    const response = await POST(makeRequest({ token: validToken }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.recoveryCodes).toHaveLength(10);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' }, data: expect.objectContaining({ mfaEnabled: true }) }),
    );
    // The 10 hashed codes stored must not equal the raw codes returned.
    const storedHashes = mockPrisma.user.update.mock.calls[0][0].data.mfaRecoveryCodes;
    expect(storedHashes).toHaveLength(10);
    body.data.recoveryCodes.forEach((code: string) => expect(storedHashes).not.toContain(code));
  });
});
