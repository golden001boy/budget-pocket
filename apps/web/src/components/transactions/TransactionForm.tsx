'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EXPENSE_CATEGORIES, EXPENSE_TYPE_LABELS } from '@budget-pocket/shared';

interface Props {
  currency?: string;
}

export function TransactionForm({ currency = 'XOF' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    type:        'EXPENSE',
    amount:      '',
    date:        new Date().toISOString().split('T')[0],
    category:    'FOOD',
    expenseType: 'CURRENT',
    description: '',
    merchant:    '',
    notes:       '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/transactions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur lors de la création');
      }
      router.push('/expenses');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'EXPENSE'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-border hover:bg-accent'
                }`}
              >
                {t === 'EXPENSE' ? '💸 Dépense' : '💰 Revenu'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant ({currency})</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expense type (only for expenses) */}
          {form.type === 'EXPENSE' && (
            <div className="space-y-1.5">
              <Label>Type de dépense</Label>
              <Select value={form.expenseType} onValueChange={(v) => set('expenseType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description & Merchant */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Ex: Courses du marché"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="merchant">Commerce</Label>
              <Input
                id="merchant"
                placeholder="Ex: Carrefour"
                value={form.merchant}
                onChange={(e) => set('merchant', e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Informations supplémentaires..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enregistrement...' : 'Enregistrer la transaction'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
