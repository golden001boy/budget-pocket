import { GET } from '../route';
import { getServerSession } from 'next-auth';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/analytics/snapshot', () => ({ computeMonthlySnapshot: jest.fn() }));

const mockGetSession = getServerSession as jest.Mock;
const mockCompute = computeMonthlySnapshot as jest.Mock;

function makeRequest(url: string) {
  return new Request(url);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/analysis/snapshot', () => {
  it('rejects an unauthenticated request with 401', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(makeRequest('http://localhost/api/analysis/snapshot'));

    expect(response.status).toBe(401);
    expect(mockCompute).not.toHaveBeenCalled();
  });

  it('defaults to the current year/month and scopes to the current user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCompute.mockResolvedValue({ totalIncome: 100 });

    const response = await GET(makeRequest('http://localhost/api/analysis/snapshot'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockCompute).toHaveBeenCalledWith('user-1', expect.any(Number), expect.any(Number));
    expect(body).toEqual({ data: { totalIncome: 100 } });
  });

  it('uses year/month from query params when provided', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCompute.mockResolvedValue({});

    await GET(makeRequest('http://localhost/api/analysis/snapshot?year=2025&month=6'));

    expect(mockCompute).toHaveBeenCalledWith('user-1', 2025, 6);
  });

  it('returns a clean 500 JSON instead of crashing when the snapshot computation throws (story 15.24)', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockCompute.mockRejectedValue(new Error('Can\'t reach database server'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(makeRequest('http://localhost/api/analysis/snapshot'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erreur serveur' });

    errorSpy.mockRestore();
  });
});
