import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

jest.mock('@/lib/prisma', () => ({ prisma: { $queryRaw: jest.fn() } }));
jest.mock('@/lib/redis', () => ({ redis: { ping: jest.fn() } }));

const mockPrisma = prisma as unknown as { $queryRaw: jest.Mock };
const mockRedis = redis as unknown as { ping: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /api/health', () => {
  it('returns 200 with both dependencies connected when both succeed', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedis.ping.mockResolvedValue('PONG');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok', db: 'connected', redis: 'connected' });
  });

  it('returns 503 without leaking the raw error when the database is unreachable', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(
      new Error('Can\'t reach database server at `secret-host.internal:5432`'),
    );
    mockRedis.ping.mockResolvedValue('PONG');

    const response = await GET();
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'error', db: 'error', redis: 'connected' });
    expect(raw).not.toContain('secret-host.internal');
    expect(console.error).toHaveBeenCalled();
  });

  it('returns 503 without leaking the raw error when Redis is unreachable', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedis.ping.mockRejectedValue(new Error('MaxRetriesPerRequestError: secret detail'));

    const response = await GET();
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'error', db: 'connected', redis: 'error' });
    expect(raw).not.toContain('secret detail');
  });

  it('reports both as failing independently when both are unreachable', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('db down'));
    mockRedis.ping.mockRejectedValue(new Error('redis down'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'error', db: 'error', redis: 'error' });
  });
});
