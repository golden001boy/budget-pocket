import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    SplashScreen.hideAsync();

    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/add-transaction"
          options={{
            presentation: 'modal', title: 'Nouvelle transaction',
            headerShown: true,
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
          }}
        />
        <Stack.Screen
          name="modals/add-account"
          options={{
            presentation: 'modal', title: 'Ajouter un compte',
            headerShown: true,
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
