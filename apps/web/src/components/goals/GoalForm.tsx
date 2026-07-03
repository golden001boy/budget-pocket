'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const GOAL_TYPES = [
  { value: 'EMERGENCY_FUND', label: '🛡️ Fonds d\'urgence' },
  { value: 'TRAVEL',         label: '✈️ Voyage'           },
  { value: 'PURCHASE',       label: '🛒 Achat'            },
  { value: 'EDUCATION',      label: '📚 Éducation'        },
  { value: 'RETIREMENT',     label: '🏖️ Retraite'         },
  { value: 'SAVINGS',        label: '💰 Épargne'          },
  { value: 'DEBT_PAYOFF',    label: '💳 Remboursement dette' },
  { value: 'OTHER',          label: '🎯 Autre'            },
];

export function GoalForm() {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    name: '', type: 'EMERGENCY_FUND', targetAmount: '',
    currentAmount: '0', deadline: '', notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/goals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          form.name,
          type:          form.type,
          targetAmount:  Number(form.targetAmount),
          currentAmount: Number(form.currentAmount),
          deadline:      form.deadline || undefined,
          notes:         form.notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur');
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un objectif financier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => set('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">{"Nom de l'objectif"}</Label>
            <Input id="name" placeholder="Ex: Fonds de retraite" value={form.name}
              onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="target">Montant cible</Label>
              <Input id="target" type="number" min="0" step="1" placeholder="0"
                value={form.targetAmount} onChange={(e) => set('targetAmount', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="current">Montant actuel</Label>
              <Input id="current" type="number" min="0" step="1" placeholder="0"
                value={form.currentAmount} onChange={(e) => set('currentAmount', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deadline">Date limite (optionnel)</Label>
            <Input id="deadline" type="date" value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Décrivez votre objectif..." value={form.notes}
              onChange={(e) => set('notes', e.target.value)} rows={2} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Création...' : 'Créer l\'objectif'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
