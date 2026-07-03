import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Plus, Wallet } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mfetchJson } from '../../lib/mfetch';
import type { MonthlySnapshotDTO } from '@budget-pocket/shared';

const fmt = (n: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

export default function DashboardScreen() {
  const router      = useRouter();
  const { user }    = useAuth();
  const [snapshot,  setSnapshot]  = useState<MonthlySnapshotDTO | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await mfetchJson<{ data: MonthlySnapshotDTO }>('/api/analysis/snapshot');
      setSnapshot(res.data);
    } catch {
      // show stale data if any
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currency = user?.currency ?? 'XOF';
  const income   = snapshot?.totalIncome   ?? 0;
  const expenses = snapshot?.totalExpenses ?? 0;
  const savings  = income - expenses;
  const rate     = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#3B82F6" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0] ?? ''} 👋</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* KPI Cards */}
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { borderLeftColor: '#22C55E' }]}>
                <TrendingUp size={16} color="#22C55E" />
                <Text style={styles.kpiLabel}>Revenus</Text>
                <Text style={[styles.kpiValue, { color: '#22C55E' }]}>{fmt(income, currency)}</Text>
              </View>
              <View style={[styles.kpiCard, { borderLeftColor: '#EF4444' }]}>
                <TrendingDown size={16} color="#EF4444" />
                <Text style={styles.kpiLabel}>Dépenses</Text>
                <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{fmt(expenses, currency)}</Text>
              </View>
            </View>

            {/* Savings rate */}
            <View style={styles.savingsCard}>
              <View style={styles.savingsRow}>
                <Wallet size={18} color="#3B82F6" />
                <Text style={styles.savingsLabel}>Épargne du mois</Text>
                <Text style={[styles.savingsValue, { color: savings >= 0 ? '#22C55E' : '#EF4444' }]}>
                  {fmt(savings, currency)}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${Math.min(Math.max(rate, 0), 100)}%`, backgroundColor: rate >= 20 ? '#22C55E' : rate >= 10 ? '#F59E0B' : '#EF4444' }]} />
              </View>
              <Text style={styles.rateText}>Taux d&apos;épargne : {rate}%</Text>
            </View>

            {/* Quick actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/modals/add-transaction')}>
                  <Plus size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Top categories */}
            {snapshot && snapshot.categoryBreakdown && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top catégories</Text>
                {Object.entries(snapshot.categoryBreakdown)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([cat, amount]) => (
                    <View key={cat} style={styles.catRow}>
                      <Text style={styles.catName}>{cat.replace(/_/g, ' ').toLowerCase()}</Text>
                      <Text style={styles.catAmount}>{fmt(amount as number, currency)}</Text>
                    </View>
                  ))
                }
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0F172A' },
  scroll:       { padding: 20 },
  header:       { marginBottom: 24 },
  greeting:     { fontSize: 24, fontWeight: '700', color: '#F8FAFC' },
  subtitle:     { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  kpiRow:       { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard:      { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 16, borderLeftWidth: 3, gap: 6 },
  kpiLabel:     { fontSize: 12, color: '#94A3B8' },
  kpiValue:     { fontSize: 16, fontWeight: '700' },
  savingsCard:  { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 16 },
  savingsRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  savingsLabel: { flex: 1, fontSize: 14, color: '#CBD5E1' },
  savingsValue: { fontSize: 16, fontWeight: '700' },
  progressBg:   { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 6 },
  progressBar:  { height: 6, borderRadius: 3 },
  rateText:     { fontSize: 11, color: '#64748B' },
  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  actionsRow:   { flexDirection: 'row', gap: 12 },
  actionBtn:    { alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, flex: 1, gap: 8 },
  actionText:   { fontSize: 12, color: '#94A3B8' },
  catRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  catName:      { fontSize: 13, color: '#CBD5E1', textTransform: 'capitalize' },
  catAmount:    { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
});
