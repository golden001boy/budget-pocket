import * as SecureStore from 'expo-secure-store';

export const storage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async del(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const AUTH_TOKEN_KEY    = 'auth_token';
export const USER_CURRENCY_KEY = 'user_currency';
