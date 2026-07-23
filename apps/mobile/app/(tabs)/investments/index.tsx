import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { mfetchJson } from '../../../lib/mfetch';
import { useAuth } from '../../../contexts/AuthContext';
import type { PortfolioItemDTO } from '@budget-pocket/shared';

const fmt = (n: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function InvestmentsScreen() {
  const { user }  = useAuth();
  const [items,      setItems]     = useState<PortfolioItemDTO[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await mfetchJson<{ data: PortfolioItemDTO[] }>('/api/portfolio');
      setItems(data.data ?? []);
    } catch {
      // stale
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currency = user?.currency ?? 'XOF';

  const totalValue = items.reduce((sum, i) => sum + i.quantity * (i.currentPrice ?? i.averageCost), 0);
  const totalCost  = items.reduce((sum, i) => sum + i.quantity * i.averageCost, 0);
  const totalPnl   = totalValue - totalCost;
  const totalPct   = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  function classLabel(cls: string) {
    const map: Record<string, string> = {
      BRVM: 'BRVM', CRYPTO: 'Crypto', INTL_STOCK: 'Actions', BOND: 'Obligations', REAL_ESTATE: 'Immobilier', COMMODITY: 'Matières 1ères',
    };
    return map[cls] ?? cls;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#3B82F6" />}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Portefeuille</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#3B82F6" style={{ marginTop: 60 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <TrendingUp size={40} color="#334155" />
            <Text style={styles.emptyTitle}>Portefeuille vide</Text>
            <Text style={styles.emptyText}>Ajoutez vos positions sur budget-pocket.app</Text>
          </View>
        ) : (
          <>
            {/* Total card */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Valeur totale</Text>
              <Text style={styles.totalValue}>{fmt(totalValue, currency)}</Text>
              <View style={styles.pnlRow}>
                {totalPnl >= 0
                  ? <TrendingUp size={14} color="#22C55E" />
                  : totalPnl < 0
                    ? <TrendingDown size={14} color="#EF4444" />
                    : <Minus size={14} color="#64748B" />
                }
                <Text style={[styles.pnlText, { color: totalPnl >= 0 ? '#22C55E' : totalPnl < 0 ? '#EF4444' : '#64748B' }]}>
                  {fmt(totalPnl, currency)} ({fmtPct(totalPct)})
                </Text>
              </View>
            </View>

            {/* Positions */}
            {items.map((item) => {
              const cost  = item.quantity * item.averageCost;
              const value = item.quantity * (item.currentPrice ?? item.averageCost);
              const pnl   = value - cost;
              const pct   = cost > 0 ? (pnl / cost) * 100 : 0;
              const color = pnl > 0 ? '#22C55E' : pnl < 0 ? '#EF4444' : '#94A3B8';

              return (
                <View key={item.id} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.ticker}>{item.ticker}</Text>
                    <Text style={styles.rowSub}>{classLabel(item.assetClass)} · {item.quantity} unités</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.rowValue}>{fmt(value, currency)}</Text>
                    <Text style={[styles.rowPct, { color }]}>{fmtPct(pct)}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0F172A' },
  scroll:      { padding: 20 },
  topBar:      { marginBottom: 20 },
  title:       { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  empty:       { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '600', color: '#F8FAFC' },
  emptyText:   { fontSize: 14, color: '#64748B', textAlign: 'center' },
  totalCard:   { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20 },
  totalLabel:  { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  totalValue:  { fontSize: 28, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  pnlRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pnlText:     { fontSize: 14, fontWeight: '500' },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 10 },
  rowLeft:     { flex: 1 },
  ticker:      { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  rowSub:      { fontSize: 12, color: '#64748B', marginTop: 2 },
  rowRight:    { alignItems: 'flex-end' },
  rowValue:    { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  rowPct:      { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
