import * as SecureStore from 'expo-secure-store';
import { createBudgetPocketClient } from '@budget-pocket/api-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = createBudgetPocketClient(BASE_URL, () => {
  return SecureStore.getItem('auth_token');
});
