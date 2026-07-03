'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { computeRealEstate } from '@/lib/simulators/realEstate';
import { computeRetirement } from '@/lib/simulators/retirement';
import { computeStockGrowth } from '@/lib/simulators/stockGrowth';
import { Home, TrendingUp, Umbrella, Plus } from 'lucide-react';

interface Scenario {
  id:        string;
  type:      string;
  name:      string;
  inputs:    unknown;
  results:   unknown;
  createdAt: Date;
}

const SCENARIO_META = {
  REAL_ESTATE:      { label: 'Immobilier',  icon: Home,       color: 'text-blue-600'    },
  EARLY_RETIREMENT: { label: 'Retraite',    icon: Umbrella,   color: 'text-purple-600'  },
  STOCK_INVESTMENT: { label: 'Placement',   icon: TrendingUp, color: 'text-emerald-600' },
};

type ScenarioType = keyof typeof SCENARIO_META;

export function ScenarioList({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<ScenarioType>('REAL_ESTATE');
  const [result, setResult]         = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving]         = useState(false);

  const [reForm,  setReForm]  = useState({ price: '50000000', downPayment: '10000000', rate: '7', years: '20' });
  const [retForm, setRetForm] = useState({ age: '35', retAge: '65', savings: '5000000', contrib: '100000', target: '500000' });
  const [stForm,  setStForm]  = useState({ initial: '1000000', monthly: '50000', rate: '8', years: '10' });

  function runSimulation() {
    if (activeType === 'REAL_ESTATE') {
      const r = computeRealEstate({
        propertyPrice: Number(reForm.price),
        downPayment:   Number(reForm.downPayment),
        interestRate:  Number(reForm.rate),
        loanTermYears: Number(reForm.years),
      });
      setResult({ monthlyPayment: r.monthlyPayment, totalPaid: r.totalPaid, totalInterest: r.totalInterest, loanAmount: r.loanAmount });
    } else if (activeType === 'EARLY_RETIREMENT') {
      const r = computeRetirement({
        currentAge:          Number(retForm.age),
        targetRetirementAge: Number(retForm.retAge),
        currentSavings:      Number(retForm.savings),
        monthlyContribution: Number(retForm.contrib),
        expectedReturnRate:  8,
        inflationRate:       3,
        targetMonthlyIncome: Number(retForm.target),
      });
      setResult({
        requiredNestEgg:        r.requiredNestEgg,
        yearsToRetirement:      r.yearsToRetirement,
        projectedSavings:       r.projectedSavings,
        monthlyIncomeAchievable: r.monthlyIncomeAchievable,
        isFunded:               r.isFunded,
        fundingGap:             r.fundingGap,
      });
    } else {
      const r = computeStockGrowth({
        initialAmount:        Number(stForm.initial),
        monthlyAmount:        Number(stForm.monthly),
        expectedAnnualReturn: Number(stForm.rate),
        investmentYears:      Number(stForm.years),
      });
      setResult({ finalValue: r.finalValue, totalInvested: r.totalInvested, totalGain: r.totalGain, totalGainPercent: r.totalGainPercent });
    }
  }

  async function saveScenario() {
    if (!result) return;
    setSaving(true);
    await fetch('/api/advisor/scenarios', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        type:       activeType,
        name:       `${SCENARIO_META[activeType].label} — ${new Date().toLocaleDateString('fr-FR')}`,
        inputs:  {},
        results: result,
      }),
    });
    setSaving(false);
    router.refresh();
  }

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <div className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-2">
          {(Object.keys(SCENARIO_META) as ScenarioType[]).map((t) => {
            const meta = SCENARIO_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                onClick={() => { setActiveType(t); setResult(null); }}
                className={`flex-1 flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-colors ${activeType === t ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
              >
                <Icon className={`h-5 w-5 ${meta.color}`} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Simulateur — {SCENARIO_META[activeType].label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeType === 'REAL_ESTATE' && (
              <>
                <Field label="Prix du bien (FCFA)"   value={reForm.price}       onChange={(v) => setReForm((f) => ({ ...f, price: v }))} />
                <Field label="Apport (FCFA)"          value={reForm.downPayment} onChange={(v) => setReForm((f) => ({ ...f, downPayment: v }))} />
                <Field label="Taux annuel (%)"         value={reForm.rate}        onChange={(v) => setReForm((f) => ({ ...f, rate: v }))} />
                <Field label="Durée (années)"          value={reForm.years}       onChange={(v) => setReForm((f) => ({ ...f, years: v }))} />
              </>
            )}
            {activeType === 'EARLY_RETIREMENT' && (
              <>
                <Field label="Âge actuel"                  value={retForm.age}    onChange={(v) => setRetForm((f) => ({ ...f, age: v }))} />
                <Field label="Âge de retraite cible"        value={retForm.retAge} onChange={(v) => setRetForm((f) => ({ ...f, retAge: v }))} />
                <Field label="Épargne actuelle (FCFA)"      value={retForm.savings} onChange={(v) => setRetForm((f) => ({ ...f, savings: v }))} />
                <Field label="Contribution mensuelle (FCFA)" value={retForm.contrib} onChange={(v) => setRetForm((f) => ({ ...f, contrib: v }))} />
                <Field label="Revenu mensuel cible (FCFA)"  value={retForm.target}  onChange={(v) => setRetForm((f) => ({ ...f, target: v }))} />
              </>
            )}
            {activeType === 'STOCK_INVESTMENT' && (
              <>
                <Field label="Montant initial (FCFA)"  value={stForm.initial}  onChange={(v) => setStForm((f) => ({ ...f, initial: v }))} />
                <Field label="Apport mensuel (FCFA)"   value={stForm.monthly}  onChange={(v) => setStForm((f) => ({ ...f, monthly: v }))} />
                <Field label="Rendement annuel (%)"    value={stForm.rate}     onChange={(v) => setStForm((f) => ({ ...f, rate: v }))} />
                <Field label="Horizon (années)"        value={stForm.years}    onChange={(v) => setStForm((f) => ({ ...f, years: v }))} />
              </>
            )}
            <Button onClick={runSimulation} className="w-full mt-2">Simuler</Button>
          </CardContent>
        </Card>

        {/* Result card */}
        {result && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              {activeType === 'REAL_ESTATE' && (
                <>
                  <Row label="Mensualité"       value={fmt(result.monthlyPayment as number)} />
                  <Row label="Montant emprunté" value={fmt(result.loanAmount as number)} />
                  <Row label="Total intérêts"   value={fmt(result.totalInterest as number)} />
                  <Row label="Coût total"       value={fmt(result.totalPaid as number)} />
                </>
              )}
              {activeType === 'EARLY_RETIREMENT' && (
                <>
                  <Row label="Capital nécessaire (FIRE)"   value={fmt(result.requiredNestEgg as number)} />
                  <Row label="Années avant retraite"        value={`${result.yearsToRetirement as number} ans`} />
                  <Row label="Capital projeté"              value={fmt(result.projectedSavings as number)} />
                  <Row label="Revenu mensuel atteignable"   value={fmt(result.monthlyIncomeAchievable as number)} />
                  <Row label="Statut"                       value={(result.isFunded as boolean) ? '✅ Objectif finançable' : `❌ Manque ${fmt(result.fundingGap as number)}`} />
                </>
              )}
              {activeType === 'STOCK_INVESTMENT' && (
                <>
                  <Row label="Valeur finale"   value={fmt(result.finalValue as number)} />
                  <Row label="Total investi"   value={fmt(result.totalInvested as number)} />
                  <Row label="Gains"           value={fmt(result.totalGain as number)} />
                  <Row label="Rendement total" value={`+${(result.totalGainPercent as number).toFixed(1)}%`} />
                </>
              )}
              <Button size="sm" variant="outline" onClick={saveScenario} disabled={saving} className="w-full mt-2">
                <Plus className="h-3 w-3 mr-1" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder ce scénario'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Saved scenarios */}
      <div>
        <h3 className="font-semibold mb-3">Scénarios sauvegardés</h3>
        {scenarios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground text-sm">
              Aucun scénario sauvegardé
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {scenarios.map((s) => {
              const meta = SCENARIO_META[s.type as ScenarioType];
              const Icon = meta?.icon ?? TrendingUp;
              return (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${meta?.color ?? 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{s.name}</span>
                        <Badge variant="outline" className="text-xs">{meta?.label ?? s.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
