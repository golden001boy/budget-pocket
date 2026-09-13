import React from 'react';
import { act, create } from 'react-test-renderer';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

// Lightweight probe instead of pulling in @testing-library/react-native —
// react-test-renderer (already a jest-expo dependency) is enough to render
// the provider and grab the live context value via a ref, without adding a
// new test dependency for this first component test.
function Probe({ onValue }: { onValue: (v: ReturnType<typeof useAuth>) => void }) {
  const value = useAuth();
  onValue(value);
  return null;
}

async function renderAuth() {
  let latest!: ReturnType<typeof useAuth>;
  let root!: ReturnType<typeof create>;
  await act(async () => {
    root = create(
      <AuthProvider>
        <Probe onValue={(v) => { latest = v; }} />
      </AuthProvider>,
    );
  });
  return { get current() { return latest; }, root: root! };
}

const fakeUser = {
  id: 'u1', name: 'Demo', email: 'demo@budget-pocket.app', role: 'PREMIUM',
  currency: 'XOF', onboardingDone: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('AuthProvider', () => {
  it('starts with no session when SecureStore has nothing stored', async () => {
    mockGetItemAsync.mockResolvedValue(null);

    const auth = await renderAuth();

    expect(auth.current.loading).toBe(false);
    expect(auth.current.user).toBeNull();
    expect(auth.current.token).toBeNull();
  });

  it('restores a session from SecureStore on mount', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === 'auth_token' ? 'stored-token' : JSON.stringify(fakeUser)),
    );

    const auth = await renderAuth();

    expect(auth.current.token).toBe('stored-token');
    expect(auth.current.user).toEqual(fakeUser);
  });

  it('login() stores the token/user/currency and updates state', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ token: 'new-token', user: fakeUser }), { status: 200 }),
    );

    const auth = await renderAuth();
    await act(async () => {
      await auth.current.login('demo@budget-pocket.app', 'demo1234');
    });

    expect(auth.current.token).toBe('new-token');
    expect(auth.current.user).toEqual(fakeUser);
    expect(mockSetItemAsync).toHaveBeenCalledWith('auth_token', 'new-token');
    expect(mockSetItemAsync).toHaveBeenCalledWith('auth_user', JSON.stringify(fakeUser));
    expect(mockSetItemAsync).toHaveBeenCalledWith('user_currency', 'XOF');
  });

  it('login() throws the server error message and leaves state unauthenticated', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Identifiants invalides' }), { status: 401 }),
    );

    const auth = await renderAuth();
    await expect(act(async () => {
      await auth.current.login('demo@budget-pocket.app', 'wrong');
    })).rejects.toThrow('Identifiants invalides');

    expect(auth.current.token).toBeNull();
    expect(auth.current.user).toBeNull();
    expect(mockSetItemAsync).not.toHaveBeenCalled();
  });

  it('logout() clears SecureStore and resets state', async () => {
    mockGetItemAsync.mockImplementation((key: string) =>
      Promise.resolve(key === 'auth_token' ? 'stored-token' : JSON.stringify(fakeUser)),
    );

    const auth = await renderAuth();
    expect(auth.current.token).toBe('stored-token');

    await act(async () => {
      await auth.current.logout();
    });

    expect(auth.current.token).toBeNull();
    expect(auth.current.user).toBeNull();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_user');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('user_currency');
  });
});
