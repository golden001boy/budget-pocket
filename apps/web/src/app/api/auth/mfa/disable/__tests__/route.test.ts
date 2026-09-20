import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { generateTotpSecret, generateRecoveryCodes } from '@/lib/mfa';
import { encryptSecret, decryptSecret } from '@/lib/mfaCrypto';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';

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
  return new Request('http://localhost/api/auth/mfa/disable', { method: 'POST', body: JSON.stringify(body) });
}

const PASSWORD = 'correct-horse-battery-staple';

// bcrypt (password hash + 10 recovery-code hashes) is inherently slow, and
// generating a fresh set for every test made this file flaky under full
// suite load — generated once and reused (overrides only swap cheap
// fields), rather than per-test.
let sharedPasswordHash: string;
let sharedSecret: string;
let sharedRecoveryCodes: { raw: string[]; hashed: string[] };

beforeAll(async () => {
  sharedPasswordHash = await bcrypt.hash(PASSWORD, 10);
  sharedSecret = generateTotpSecret();
  sharedRecoveryCodes = await generateRecoveryCodes();
}, 15000);

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'demo@budget-pocket.app',
    passwordHash: sharedPasswordHash,
    mfaEnabled: true,
    mfaSecret: encryptSecret(sharedSecret),
    mfaRecoveryCodes: sharedRecoveryCodes.hashed,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('POST /api/auth/mfa/disable', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest({ password: PASSWORD, token: '123456' }));

    expect(response.status).toBe(401);
  });

  it('rejects an invalid body with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  it('rejects with 400 when MFA is not currently enabled', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue(makeUser({ mfaEnabled: false }));

    const response = await POST(makeRequest({ password: PASSWORD, token: '123456' }));

    expect(response.status).toBe(400);
  });

  it('rejects an incorrect password before ever checking the code', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue(makeUser());

    const response = await POST(makeRequest({ password: 'wrong-password', token: '123456' }));

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  }, 10000);

  it('rejects a correct password but wrong TOTP code and wrong recovery code', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue(makeUser());

    const response = await POST(makeRequest({ password: PASSWORD, token: '000000' }));

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  }, 10000);

  it('disables MFA with the correct password and a valid TOTP code', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    const user = makeUser();
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue({});

    const response = await POST(makeRequest({ password: PASSWORD, token: authenticator.generate(decryptSecret(user.mfaSecret)) }));

    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data:  { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: [] },
    });
  }, 10000);

  it('disables MFA with the correct password and a valid recovery code instead of a TOTP code', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue(makeUser());
    mockPrisma.user.update.mockResolvedValue({});

    const response = await POST(makeRequest({ password: PASSWORD, token: sharedRecoveryCodes.raw[0] }));

    expect(response.status).toBe(200);
  }, 10000);
});
