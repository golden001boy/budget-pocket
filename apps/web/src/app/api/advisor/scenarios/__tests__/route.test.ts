import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { checkMutationRateLimit } from '@/lib/rateLimit';
import { MAX_JSON_BODY_BYTES } from '@/lib/requestBody';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: { scenario: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() } },
}));
jest.mock('@/lib/rateLimit', () => ({ checkMutationRateLimit: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as unknown as {
  scenario: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
};
const mockCheckMutationRateLimit = checkMutationRateLimit as jest.Mock;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/advisor/scenarios', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/advisor/scenarios'));

    expect(response.status).toBe(401);
    expect(mockPrisma.scenario.findMany).not.toHaveBeenCalled();
  });

  it('paginates results and scopes the query to the current user (story 15.18)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.scenario.findMany.mockResolvedValue([{ id: 's1' }]);
    mockPrisma.scenario.count.mockResolvedValue(1);

    const response = await GET(makeRequest('http://localhost/api/advisor/scenarios?page=2&pageSize=10'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.scenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' }, skip: 10, take: 10 }),
    );
    expect(body).toEqual({
      data: [{ id: 's1' }],
      meta: { total: 1, page: 2, pageSize: 10, totalPages: 1 },
    });
  });

  it('never lets pageSize exceed the shared MAX_PAGE_SIZE cap', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrisma.scenario.findMany.mockResolvedValue([]);
    mockPrisma.scenario.count.mockResolvedValue(0);

    await GET(makeRequest('http://localhost/api/advisor/scenarios?pageSize=99999'));

    expect(mockPrisma.scenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });
});

describe('POST /api/advisor/scenarios (story 15.23: validation + resilience)', () => {
  it('rejects an unauthenticated request with 401, before any rate-limit or DB call', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'CUSTOM', name: 'Test' }),
    }));

    expect(response.status).toBe(401);
    expect(mockCheckMutationRateLimit).not.toHaveBeenCalled();
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid type with 400, without writing anything', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'NOT_A_REAL_TYPE', name: 'Test' }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('rejects a non-string name with 400', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'CUSTOM', name: { nested: 'object' } }),
    }));

    expect(response.status).toBe(400);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413 before it reaches validation (story 15.30)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: 'x'.repeat(MAX_JSON_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('falls back to CUSTOM when type is omitted, same as before this story', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
    mockPrisma.scenario.create.mockResolvedValue({ id: 's1', type: 'CUSTOM' });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ name: 'Sans type' }),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.scenario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'CUSTOM' }) }),
    );
  });

  it('returns a clean 500 JSON instead of crashing when Prisma throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
    mockPrisma.scenario.create.mockRejectedValue(new Error('Can\'t reach database server at `secret-host:5432`'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'CUSTOM', name: 'Test' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erreur serveur' });
    expect(JSON.stringify(body)).not.toContain('secret-host');

    errorSpy.mockRestore();
  });

  it('rejects with 429 once the per-user mutation limit is hit, without writing anything', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, resetAt: 0 });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'CUSTOM', name: 'Test' }),
    }));

    expect(response.status).toBe(429);
    expect(mockCheckMutationRateLimit).toHaveBeenCalledWith('user-1');
    expect(mockPrisma.scenario.create).not.toHaveBeenCalled();
  });

  it('creates the scenario when under the limit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckMutationRateLimit.mockResolvedValue({ success: true, limit: 60, remaining: 59, resetAt: 0 });
    mockPrisma.scenario.create.mockResolvedValue({ id: 's1', type: 'CUSTOM', name: 'Test' });

    const response = await POST(makeRequest('http://localhost/api/advisor/scenarios', {
      method: 'POST',
      body: JSON.stringify({ type: 'CUSTOM', name: 'Test' }),
    }));

    expect(response.status).toBe(201);
    expect(mockPrisma.scenario.create).toHaveBeenCalled();
  });
});
