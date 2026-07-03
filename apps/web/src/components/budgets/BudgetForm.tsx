'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@budget-pocket/shared';
import { Plus } from 'lucide-react';

interface Props {
  year: number;
  month: number;
}

export function BudgetForm({ year, month }: Props) {
  const router  = useRouter();
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ category: 'FOOD', amount: '', alertAt: '80' });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/budgets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          category: form.category,
          amount:   Number(form.amount),
          alertAt:  Number(form.alertAt),
          year,
          month,
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
          Nouveau budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_CATEGORIES).map(([k, c]) => (
                  <SelectItem key={k} value={k}>{c.icon} {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant mensuel</Label>
            <Input id="amount" type="number" min="0" step="1" placeholder="0" value={form.amount}
              onChange={(e) => set('amount', e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert">{"Seuil d'alerte (%)"}</Label>
            <Input id="alert" type="number" min="50" max="100" value={form.alertAt}
              onChange={(e) => set('alertAt', e.target.value)} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Création...' : 'Créer le budget'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
