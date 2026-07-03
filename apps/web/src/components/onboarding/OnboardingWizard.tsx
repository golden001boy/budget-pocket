'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@budget-pocket/shared';
import { Check } from 'lucide-react';

const STEPS = ['Bienvenue', 'Devise & Profil', 'Premier compte', 'Premier budget'];

interface Props {
  userName: string;
}

export function OnboardingWizard({ userName }: Props) {
  const router  = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ currency: 'XOF', timezone: 'Africa/Abidjan' });
  const [account, setAccount] = useState({ accountName: 'Compte principal', provider: 'MANUAL', balance: '' });
  const [budget,  setBudget]  = useState({ category: 'FOOD', amount: '' });

  async function finish() {
    setLoading(true);
    const now = new Date();

    await Promise.allSettled([
      fetch('/api/user/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...profile, onboardingDone: true }),
      }),
      account.balance ? fetch('/api/accounts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...account, balance: Number(account.balance), currency: profile.currency }),
      }) : Promise.resolve(),
      budget.amount ? fetch('/api/budgets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...budget, amount: Number(budget.amount), alertAt: 80, year: now.getFullYear(), month: now.getMonth() + 1 }),
      }) : Promise.resolve(),
    ]);

    router.push('/dashboard');
    router.refresh();
  }

  const firstName = userName.split(' ')[0];

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-blue-500 text-white ring-2 ring-blue-400/40' :
              'bg-white/10 text-white/40'
            }`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 rounded-full transition-all ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="p-8">
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="text-5xl">💰</div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Bienvenue, {firstName} !</h1>
                <p className="text-slate-300">
                  Budget-Pocket va vous aider à gérer votre argent, suivre vos dépenses
                  et atteindre vos objectifs financiers. Prêt à commencer ?
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {[
                  { icon: '📊', text: 'Suivi des dépenses' },
                  { icon: '🎯', text: 'Objectifs financiers' },
                  { icon: '🤖', text: 'Conseiller IA' },
                ].map((f) => (
                  <div key={f.text} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-slate-300 text-xs">{f.text}</div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="w-full" size="lg">
                Commencer la configuration →
              </Button>
            </div>
          )}

          {/* Step 1 — Currency & Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold mb-1">Devise & Localisation</h2>
                <p className="text-slate-400 text-sm">Configurez votre devise principale</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Devise principale</Label>
                  <Select value={profile.currency} onValueChange={(v) => setProfile((p) => ({ ...p, currency: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">🌍 FCFA — Franc CFA (XOF)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                      <SelectItem value="USD">🇺🇸 Dollar américain (USD)</SelectItem>
                      <SelectItem value="GBP">🇬🇧 Livre sterling (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Fuseau horaire</Label>
                  <Select value={profile.timezone} onValueChange={(v) => setProfile((p) => ({ ...p, timezone: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Abidjan">🇨🇮 Abidjan (UTC+0)</SelectItem>
                      <SelectItem value="Africa/Dakar">🇸🇳 Dakar (UTC+0)</SelectItem>
                      <SelectItem value="Africa/Lagos">🇳🇬 Lagos (UTC+1)</SelectItem>
                      <SelectItem value="Africa/Douala">🇨🇲 Douala (UTC+1)</SelectItem>
                      <SelectItem value="Africa/Nairobi">🇰🇪 Nairobi (UTC+3)</SelectItem>
                      <SelectItem value="Europe/Paris">🇫🇷 Paris (UTC+1/+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} className="text-slate-400">← Retour</Button>
                <Button onClick={() => setStep(2)} className="flex-1">Continuer →</Button>
              </div>
            </div>
          )}

          {/* Step 2 — First Account */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold mb-1">Votre premier compte</h2>
                <p className="text-slate-400 text-sm">Ajoutez votre compte principal (optionnel)</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Nom du compte</Label>
                  <Input
                    className="bg-slate-700 border-slate-600"
                    value={account.accountName}
                    onChange={(e) => setAccount((a) => ({ ...a, accountName: e.target.value }))}
                    placeholder="Ex: Wave Principal"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Type</Label>
                  <Select value={account.provider} onValueChange={(v) => setAccount((a) => ({ ...a, provider: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAVE">🌊 Wave</SelectItem>
                      <SelectItem value="MTN_MONEY">📱 MTN Money</SelectItem>
                      <SelectItem value="ORANGE_MONEY">🟠 Orange Money</SelectItem>
                      <SelectItem value="MANUAL">✍️ Manuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Solde actuel ({profile.currency})</Label>
                  <Input
                    type="number"
                    className="bg-slate-700 border-slate-600"
                    value={account.balance}
                    onChange={(e) => setAccount((a) => ({ ...a, balance: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400">← Retour</Button>
                <Button variant="outline" onClick={() => setStep(3)} className="border-slate-600 text-slate-300">Passer</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continuer →</Button>
              </div>
            </div>
          )}

          {/* Step 3 — First Budget */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold mb-1">Votre premier budget</h2>
                <p className="text-slate-400 text-sm">Définissez un budget mensuel pour démarrer</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Catégorie</Label>
                  <Select value={budget.category} onValueChange={(v) => setBudget((b) => ({ ...b, category: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORIES).map(([k, c]) => (
                        <SelectItem key={k} value={k}>{c.icon} {c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-200">Budget mensuel ({profile.currency})</Label>
                  <Input
                    type="number"
                    className="bg-slate-700 border-slate-600"
                    value={budget.amount}
                    onChange={(e) => setBudget((b) => ({ ...b, amount: e.target.value }))}
                    placeholder="Ex: 150000"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400">← Retour</Button>
                <Button variant="outline" onClick={finish} disabled={loading} className="border-slate-600 text-slate-300">
                  Passer
                </Button>
                <Button onClick={finish} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  {loading ? 'Configuration...' : '✓ Terminer la configuration'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
