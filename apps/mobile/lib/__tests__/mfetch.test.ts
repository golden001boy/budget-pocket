import { mfetch, mfetchJson } from '../mfetch';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn() }));

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('mfetch', () => {
  it('sends the stored token as a next-auth session cookie, not an Authorization header', async () => {
    mockGetItemAsync.mockResolvedValue('the-stored-token');
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}'));

    await mfetch('/api/accounts');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Cookie).toBe('next-auth.session-token=the-stored-token');
  });

  it('omits the Cookie header entirely when no token is stored', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}'));

    await mfetch('/api/accounts');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Cookie).toBeUndefined();
  });

  it('lets caller-supplied headers override the defaults', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}'));

    await mfetch('/api/accounts', { headers: { 'Content-Type': 'text/plain' } });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers['Content-Type']).toBe('text/plain');
  });
});

describe('mfetchJson', () => {
  it('returns the parsed body on a successful response', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 'a1' }] }), { status: 200 }),
    );

    const result = await mfetchJson<{ data: unknown[] }>('/api/accounts');

    expect(result).toEqual({ data: [{ id: 'a1' }] });
  });

  it('throws with the server-provided error message on a non-ok response', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
    );

    await expect(mfetchJson('/api/accounts')).rejects.toThrow('Non autorisé');
  });

  it('falls back to a generic HTTP-status message when the error body has no `error` field', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}', { status: 500 }));

    await expect(mfetchJson('/api/accounts')).rejects.toThrow('HTTP 500');
  });

  it('falls back to a generic network-error message when the error body is not even JSON', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(new Response('not json', { status: 500 }));

    await expect(mfetchJson('/api/accounts')).rejects.toThrow('Erreur réseau');
  });
});
