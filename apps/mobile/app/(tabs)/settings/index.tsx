import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell, CreditCard, LogOut, ChevronRight, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const isPremium = user?.role === 'PREMIUM' || user?.role === 'ADMIN';

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Avatar */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name ?? 'Utilisateur'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          {isPremium && <ShieldCheck size={12} color="#F59E0B" />}
          <Text style={[styles.roleText, { color: isPremium ? '#F59E0B' : '#64748B' }]}>
            {isPremium ? 'Premium' : 'Plan Gratuit'}
          </Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}><User size={16} color="#3B82F6" /></View>
          <View style={styles.infoBody}>
            <Text style={styles.infoLabel}>Devise</Text>
            <Text style={styles.infoValue}>{user?.currency ?? 'XOF'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemIcon}><Bell size={18} color="#3B82F6" /></View>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Notifications</Text>
            <Text style={styles.itemSub}>Alertes et rappels</Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemIcon}><CreditCard size={18} color="#3B82F6" /></View>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>Abonnement</Text>
            <Text style={styles.itemSub}>{isPremium ? 'Premium actif' : 'Passer à Premium'}</Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0F172A' },
  scroll:       { padding: 20 },
  profile:      { alignItems: 'center', marginBottom: 32, paddingTop: 8 },
  avatar:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:   { fontSize: 26, fontWeight: '700', color: 'white' },
  profileName:  { fontSize: 18, fontWeight: '600', color: '#F8FAFC' },
  profileEmail: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  roleBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText:     { fontSize: 12, fontWeight: '500' },
  section:      { backgroundColor: '#1E293B', borderRadius: 16, marginBottom: 24 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  infoIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  infoBody:     { flex: 1 },
  infoLabel:    { fontSize: 12, color: '#64748B' },
  infoValue:    { fontSize: 14, fontWeight: '500', color: '#F8FAFC', marginTop: 2 },
  item:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  itemIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  itemText:     { flex: 1 },
  itemLabel:    { fontSize: 14, fontWeight: '500', color: '#F8FAFC' },
  itemSub:      { fontSize: 12, color: '#64748B', marginTop: 2 },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E293B', borderRadius: 16, padding: 16 },
  logoutText:   { fontSize: 15, fontWeight: '500', color: '#EF4444' },
});
