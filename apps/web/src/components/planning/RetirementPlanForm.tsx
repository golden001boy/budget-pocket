'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface RetirementPlan {
  currentAge:          number;
  targetRetirementAge: number;
  currentSavings:      unknown;
  monthlyContribution: unknown;
  expectedReturnRate:  unknown;
  targetMonthlyIncome: unknown;
}

interface Props {
  initial?: RetirementPlan;
}

export function RetirementPlanForm({ initial }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(!initial);

  const [form, setForm] = useState({
    currentAge:          String(initial?.currentAge ?? 35),
    targetRetirementAge: String(initial?.targetRetirementAge ?? 65),
    currentSavings:      String(Number(initial?.currentSavings ?? 0)),
    monthlyContribution: String(Number(initial?.monthlyContribution ?? 0)),
    expectedReturnRate:  String(Number(initial?.expectedReturnRate ?? 8)),
    targetMonthlyIncome: String(Number(initial?.targetMonthlyIncome ?? 500000)),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/planning/retirement', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          currentAge:          Number(form.currentAge),
          targetRetirementAge: Number(form.targetRetirementAge),
          currentSavings:      Number(form.currentSavings),
          monthlyContribution: Number(form.monthlyContribution),
          expectedReturnRate:  Number(form.expectedReturnRate),
          targetMonthlyIncome: Number(form.targetMonthlyIncome),
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  if (!editing && initial) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
        <Settings className="h-4 w-4" />
        Modifier le plan retraite
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {initial ? 'Modifier le plan retraite' : 'Configurer mon plan retraite'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Âge actuel</Label>
              <Input type="number" min="18" max="80" value={form.currentAge}
                onChange={(e) => set('currentAge', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Âge de retraite cible</Label>
              <Input type="number" min="40" max="80" value={form.targetRetirementAge}
                onChange={(e) => set('targetRetirementAge', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Épargne retraite actuelle (FCFA)</Label>
            <Input type="number" min="0" step="1" value={form.currentSavings}
              onChange={(e) => set('currentSavings', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Contribution mensuelle (FCFA)</Label>
            <Input type="number" min="0" step="1" value={form.monthlyContribution}
              onChange={(e) => set('monthlyContribution', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Rendement annuel attendu (%)</Label>
              <Input type="number" min="1" max="30" step="0.5" value={form.expectedReturnRate}
                onChange={(e) => set('expectedReturnRate', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Revenu mensuel cible (FCFA)</Label>
              <Input type="number" min="0" step="1" value={form.targetMonthlyIncome}
                onChange={(e) => set('targetMonthlyIncome', e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            {initial && (
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
