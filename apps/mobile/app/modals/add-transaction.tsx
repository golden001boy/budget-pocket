import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { EXPENSE_CATEGORIES } from '@budget-pocket/shared';
import { mfetch } from '../../lib/mfetch';

const CATEGORIES = Object.entries(EXPENSE_CATEGORIES)
  .map(([key, val]) => ({ key, ...val }))
  .slice(0, 8);

export default function AddTransactionModal() {
  const router = useRouter();

  const [type,     setType]     = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount,   setAmount]   = useState('');
  const [category, setCategory] = useState('FOOD');
  const [desc,     setDesc]     = useState('');
  const [saving,   setSaving]   = useState(false);

  async function handleSave() {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide.');
      return;
    }

    setSaving(true);
    try {
      const res = await mfetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type,
          amount:      parsed,
          category,
          description: desc || undefined,
          date:        new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Erreur ${res.status}`);
      }

      router.back();
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : "Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle transaction</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Type toggle */}
        <View style={styles.typeRow}>
          {(['EXPENSE', 'INCOME'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'EXPENSE' ? 'Dépense' : 'Revenu'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Montant (FCFA)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#64748B"
            autoFocus
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catBtn, category === cat.key && styles.catBtnActive]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={desc}
            onChangeText={setDesc}
            placeholder="Ex: Marché Cocody"
            placeholderTextColor="#64748B"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : (
              <>
                <Check size={20} color="white" />
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#0F172A' },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  title:             { fontSize: 18, fontWeight: '600', color: '#F8FAFC' },
  closeBtn:          { padding: 4 },
  scroll:            { padding: 20 },
  typeRow:           { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn:           { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1E293B', alignItems: 'center' },
  typeBtnActive:     { backgroundColor: '#3B82F6' },
  typeBtnText:       { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  typeBtnTextActive: { color: 'white' },
  field:             { marginBottom: 20 },
  label:             { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
  input:             { backgroundColor: '#1E293B', borderRadius: 12, padding: 14, color: '#F8FAFC', fontSize: 15 },
  catGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn:            { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E293B' },
  catBtnActive:      { backgroundColor: '#1D4ED8' },
  catIcon:           { fontSize: 14 },
  catLabel:          { fontSize: 12, color: '#CBD5E1' },
  saveBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22C55E', borderRadius: 14, padding: 16, marginTop: 8 },
  saveBtnDisabled:   { opacity: 0.6 },
  saveBtnText:       { fontSize: 16, fontWeight: '600', color: 'white' },
});
