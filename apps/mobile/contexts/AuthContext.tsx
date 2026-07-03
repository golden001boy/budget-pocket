import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY, USER_CURRENCY_KEY } from '../lib/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface MobileUser {
  id:             string;
  name:           string | null;
  email:          string;
  role:           string;
  currency:       string;
  onboardingDone: boolean;
}

interface AuthState {
  user:    MobileUser | null;
  token:   string | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user:    null,
  token:   null,
  loading: true,
  login:   async () => {},
  logout:  async () => {},
});

const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<MobileUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/auth/mobile`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(err.error ?? 'Connexion échouée');
    }

    const { token: newToken, user: newUser } = await res.json();
    await Promise.all([
      SecureStore.setItemAsync(AUTH_TOKEN_KEY, newToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
      SecureStore.setItemAsync(USER_CURRENCY_KEY, newUser.currency),
    ]);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(USER_CURRENCY_KEY),
    ]);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
