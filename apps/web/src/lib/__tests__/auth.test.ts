import { authOptions } from '../auth';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '../rateLimit';
import { generateTotpSecret, generateRecoveryCodes } from '../mfa';
import { encryptSecret } from '../mfaCrypto';
import { authenticator } from 'otplib';

jest.mock('../prisma', () => ({ prisma: { user: { findUnique: jest.fn(), update: jest.fn() } } }));
jest.mock('../rateLimit', () => ({
  rateLimit: jest.fn(),
  getClientIp: jest.fn(() => '203.0.113.1'),
  loginRateLimitKey: (email: string, ip: string) => `login:${email}:${ip}`,
  accountLoginRateLimitKey: (email: string) => `account:${email}`,
  LOGIN_ATTEMPT_LIMIT: 5,
  LOGIN_WINDOW_SECONDS: 900,
  ACCOUNT_LOGIN_ATTEMPT_LIMIT: 10,
}));
jest.mock('../auditLog', () => ({ logSensitiveAction: jest.fn() }));

const mockPrisma = prisma as unknown as { user: { findUnique: jest.Mock; update: jest.Mock } };
const mockRateLimit = rateLimit as jest.Mock;

// next-auth's CredentialsProvider() factory returns a stub `authorize: () =>
// null` at the top level — the real function we passed in lives under
// `.options.authorize` (see node_modules/next-auth/providers/credentials.js).
const credentialsProvider = authOptions.providers[0] as unknown as {
  options: { authorize: (credentials: Record<string, string>, req: any) => Promise<unknown> };
};

// Real bcrypt throughout (not mocked): lib/mfa.ts's recovery-code hashing
// also goes through bcryptjs, so mocking it module-wide would either break
// that or require juggling two different behaviors for the same function.
// Using a real hash of a known password is simpler and just as fast.
const PASSWORD = 'correct-horse-battery-staple';
let passwordHash: string;

const baseUser = () => ({
  id: 'user-1', email: 'demo@budget-pocket.app', passwordHash,
  name: 'Demo', role: 'PREMIUM', currency: 'XOF', onboardingDone: true, emailVerified: new Date(),
  mfaEnabled: false, mfaSecret: null as string | null, mfaRecoveryCodes: [] as string[],
});

beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 10);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockRateLimit.mockResolvedValue({ success: true, remaining: 4 });
});

describe('authorize() — MFA (story 15.32)', () => {
  it('logs in normally when MFA is not enabled, ignoring an absent totp', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser(), mfaEnabled: false });

    const result = await credentialsProvider.options.authorize(
      { email: 'demo@budget-pocket.app', password: PASSWORD },
      { headers: {} },
    );

    expect(result).toMatchObject({ id: 'user-1', email: 'demo@budget-pocket.app' });
  });

  it('throws MFA_REQUIRED when the account has MFA enabled and no totp was submitted', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser(), mfaEnabled: true, mfaSecret: encryptSecret('X'.repeat(16)) });

    await expect(
      credentialsProvider.options.authorize({ email: 'demo@budget-pocket.app', password: PASSWORD }, { headers: {} }),
    ).rejects.toThrow('MFA_REQUIRED');

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('throws MFA_INVALID for a wrong TOTP code and a code that matches no recovery code', async () => {
    const secret = generateTotpSecret();
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser(), mfaEnabled: true, mfaSecret: encryptSecret(secret) });

    await expect(
      credentialsProvider.options.authorize(
        { email: 'demo@budget-pocket.app', password: PASSWORD, totp: '000000' },
        { headers: {} },
      ),
    ).rejects.toThrow('MFA_INVALID');
  });

  it('logs in when the TOTP code is correct', async () => {
    const secret = generateTotpSecret();
    const validToken = authenticator.generate(secret);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser(), mfaEnabled: true, mfaSecret: encryptSecret(secret) });

    const result = await credentialsProvider.options.authorize(
      { email: 'demo@budget-pocket.app', password: PASSWORD, totp: validToken },
      { headers: {} },
    );

    expect(result).toMatchObject({ id: 'user-1' });
  });

  it('logs in with a valid recovery code and consumes it (one-time use)', async () => {
    const secret = generateTotpSecret();
    const { raw, hashed } = await generateRecoveryCodes();
    mockPrisma.user.findUnique.mockResolvedValue({
      ...baseUser(), mfaEnabled: true, mfaSecret: encryptSecret(secret), mfaRecoveryCodes: hashed,
    });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await credentialsProvider.options.authorize(
      { email: 'demo@budget-pocket.app', password: PASSWORD, totp: raw[2] },
      { headers: {} },
    );

    expect(result).toMatchObject({ id: 'user-1' });
    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.mfaRecoveryCodes).toHaveLength(9);
    expect(updateCall.data.mfaRecoveryCodes).not.toContain(hashed[2]);
  });

  it('rejects a wrong password before ever looking at MFA, same as before this story', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser(), mfaEnabled: true, mfaSecret: encryptSecret('X'.repeat(16)) });

    const result = await credentialsProvider.options.authorize(
      { email: 'demo@budget-pocket.app', password: 'totally-wrong-password' },
      { headers: {} },
    );

    expect(result).toBeNull();
  });
});
