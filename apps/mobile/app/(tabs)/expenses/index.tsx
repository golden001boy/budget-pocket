import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { mfetchJson } from '../../../lib/mfetch';
import { useAuth } from '../../../contexts/AuthContext';
import { EXPENSE_CATEGORIES } from '@budget-pocket/shared';
import type { TransactionDTO } from '@budget-pocket/shared';

const fmt = (n: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

export default function ExpensesScreen() {
  const router    = useRouter();
  const { user }  = useAuth();
  const [txs,        setTxs]      = useState<TransactionDTO[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await mfetchJson<{ transactions: TransactionDTO[]; total: number }>('/api/transactions?limit=50');
      setTxs(data.transactions);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currency = user?.currency ?? 'XOF';

  function renderItem({ item }: { item: TransactionDTO }) {
    const catMeta = EXPENSE_CATEGORIES[item.category as keyof typeof EXPENSE_CATEGORIES];
    const isIncome = item.type === 'INCOME';
    return (
      <View style={styles.item}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>{catMeta?.icon ?? '💰'}</Text>
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemLabel}>{item.description || catMeta?.label || item.category}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <Text style={[styles.itemAmount, { color: isIncome ? '#22C55E' : '#F8FAFC' }]}>
          {isIncome ? '+' : '-'}{fmt(item.amount, currency)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3B82F6" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#3B82F6" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptyText}>Appuyez sur + pour ajouter votre première dépense</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-transaction')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0F172A' },
  topBar:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:       { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  list:        { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 80 },
  item:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  itemIcon:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  itemEmoji:   { fontSize: 20 },
  itemBody:    { flex: 1 },
  itemLabel:   { fontSize: 14, fontWeight: '500', color: '#F8FAFC' },
  itemDate:    { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemAmount:  { fontSize: 15, fontWeight: '600' },
  separator:   { height: 1, backgroundColor: '#1E293B' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle:  { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 8 },
  emptyText:   { fontSize: 14, color: '#64748B', textAlign: 'center' },
  fab: {
    position:        'absolute',
    bottom:          24,
    right:           24,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#3B82F6',
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       5,
  },
});
