import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Clock, Home, TrendingUp, PiggyBank, Calculator } from 'lucide-react-native';
import { mfetchJson } from '../../../lib/mfetch';
import { useAuth } from '../../../contexts/AuthContext';
import type { ScenarioDTO } from '@budget-pocket/shared';

const SIMULATOR_CARDS = [
  { icon: Home,       label: 'Immobilier',     desc: 'Capacité d\'emprunt, mensualités, rentabilité locative', type: 'MORTGAGE' },
  { icon: PiggyBank,  label: 'Retraite',       desc: 'Projection de votre capital retraite à 60 ans',         type: 'EARLY_RETIREMENT' },
  { icon: TrendingUp, label: 'Bourse',         desc: 'Simulateur d\'investissement progressif (DCA)',          type: 'INVESTMENT_GROWTH' },
  { icon: Calculator, label: 'Épargne',        desc: 'Intérêts composés sur votre épargne mensuelle',          type: 'SAVINGS_GOAL' },
];

export default function AdvisorScreen() {
  const { user }  = useAuth();
  const [scenarios,  setScenarios]  = useState<ScenarioDTO[]>([]);
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await mfetchJson<{ scenarios: ScenarioDTO[] }>('/api/advisor/scenarios');
      setScenarios(data.scenarios ?? []);
    } catch {
      // show cards only
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Simulateurs</Text>
        </View>

        {/* AI disabled notice */}
        <View style={styles.notice}>
          <Clock size={16} color="#60A5FA" />
          <Text style={styles.noticeText}>
            Le conseiller IA arrive bientôt. Les simulateurs ci-dessous sont disponibles maintenant.
          </Text>
        </View>

        {/* Simulator cards */}
        <Text style={styles.sectionTitle}>Simulateurs financiers</Text>
        {SIMULATOR_CARDS.map((sim) => (
          <View key={sim.type} style={styles.simCard}>
            <View style={styles.simIcon}>
              <sim.icon size={22} color="#3B82F6" />
            </View>
            <View style={styles.simBody}>
              <Text style={styles.simLabel}>{sim.label}</Text>
              <Text style={styles.simDesc}>{sim.desc}</Text>
            </View>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>Bêta</Text>
            </View>
          </View>
        ))}

        {/* Saved scenarios */}
        {!loading && scenarios.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Scénarios sauvegardés</Text>
            {scenarios.map((s) => (
              <View key={s.id} style={styles.scenCard}>
                <Text style={styles.scenName}>{s.name}</Text>
                <Text style={styles.scenType}>{s.type.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </>
        )}

        {loading && <ActivityIndicator color="#3B82F6" style={{ marginTop: 24 }} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0F172A' },
  scroll:       { padding: 20, paddingBottom: 40 },
  topBar:       { marginBottom: 16 },
  title:        { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#172554', borderRadius: 12, padding: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#1D4ED8',
  },
  noticeText:   { flex: 1, fontSize: 13, color: '#93C5FD', lineHeight: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#94A3B8', marginBottom: 12 },
  simCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 10,
  },
  simIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  simBody:     { flex: 1 },
  simLabel:    { fontSize: 15, fontWeight: '600', color: '#F8FAFC', marginBottom: 3 },
  simDesc:     { fontSize: 12, color: '#64748B', lineHeight: 16 },
  betaBadge:   { backgroundColor: '#1D4ED8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  betaText:    { fontSize: 10, fontWeight: '600', color: '#93C5FD' },
  scenCard:    { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 8 },
  scenName:    { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  scenType:    { fontSize: 12, color: '#64748B', marginTop: 3 },
});
