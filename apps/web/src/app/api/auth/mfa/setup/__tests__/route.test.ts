import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn(), update: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest() {
  return new Request('http://localhost/api/auth/mfa/setup', { method: 'POST' });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
});

describe('POST /api/auth/mfa/setup', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
  });

  it('rejects with 429 once the mutation rate limit is hit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest());

    expect(response.status).toBe(429);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects with 400 when MFA is already enabled', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'demo@budget-pocket.app', mfaEnabled: true });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('generates and stores an encrypted secret, returning it plus a QR code data URL', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'demo@budget-pocket.app', mfaEnabled: false });
    mockPrisma.user.update.mockResolvedValue({});

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.secret).toMatch(/^[A-Z2-7]+$/);
    expect(body.data.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);

    // Stored value must not be the plaintext secret (encrypted at rest).
    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.data.mfaSecret).not.toBe(body.data.secret);
    expect(updateCall.where).toEqual({ id: 'user-1' });
  });
});
