import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router  = useRouter();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [totp,     setTotp]     = useState('');
  // Story 15.32 (MFA): set once the API rejects a first attempt with
  // `mfa_required` — swaps the password field for a code field instead of
  // just showing an error, mirroring the web login form's flow.
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (mfaRequired) {
      if (!totp.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir votre code de vérification.');
        return;
      }
      setLoading(true);
      try {
        await login(email.trim(), password, totp.trim());
        router.replace('/(tabs)');
      } catch (e: unknown) {
        Alert.alert('Connexion échouée', e instanceof Error && e.message !== 'mfa_required' ? e.message : 'Code invalide');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'mfa_required') {
        setMfaRequired(true);
        return;
      }
      Alert.alert('Connexion échouée', e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / brand */}
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.appName}>Budget-Pocket</Text>
          <Text style={styles.tagline}>Gérez vos finances en toute simplicité</Text>
        </View>

        {/* Form */}
        {mfaRequired ? (
          <View style={styles.form}>
            <Text style={styles.mfaHint}>
              Saisissez le code à 6 chiffres de votre application d&apos;authentification, ou l&apos;un de vos codes de récupération.
            </Text>
            <View style={styles.field}>
              <Text style={styles.label}>Code de vérification</Text>
              <TextInput
                style={styles.input}
                value={totp}
                onChangeText={setTotp}
                autoCapitalize="characters"
                autoFocus
                placeholder="123456"
                placeholderTextColor="#475569"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>Vérifier</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setMfaRequired(false); setTotp(''); }}>
              <Text style={styles.backLink}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="vous@exemple.com"
                placeholderTextColor="#475569"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor="#475569"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>Se connecter</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.hint}>
          Créez votre compte sur budget-pocket.app
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0F172A' },
  inner:       { flex: 1, justifyContent: 'center', padding: 28 },
  header:      { alignItems: 'center', marginBottom: 40 },
  logo:        { fontSize: 56, marginBottom: 12 },
  appName:     { fontSize: 28, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  tagline:     { fontSize: 14, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  form:        { gap: 16 },
  field:       { gap: 6 },
  label:       { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  mfaHint:     { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius:    12,
    padding:         14,
    color:           '#F8FAFC',
    fontSize:        15,
    borderWidth:     1,
    borderColor:     '#334155',
  },
  btn:         { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { fontSize: 16, fontWeight: '700', color: 'white' },
  backLink:    { textAlign: 'center', color: '#3B82F6', fontSize: 13, marginTop: 4 },
  hint:        { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 32 },
});
