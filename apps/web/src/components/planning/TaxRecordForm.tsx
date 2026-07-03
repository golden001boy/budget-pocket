'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function TaxRecordForm({ year }: { year: number }) {
  const router  = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    year:     String(year),
    category: 'Impôt sur le revenu',
    amount:   '',
    dueDate:  '',
    notes:    '',
    isPaid:   false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/planning/taxes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          year:     Number(form.year),
          category: form.category,
          amount:   Number(form.amount),
          dueDate:  form.dueDate || undefined,
          notes:    form.notes || undefined,
          isPaid:   form.isPaid,
        }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter déclaration
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajouter une déclaration fiscale</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Année</Label>
              <Input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Échéance</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Catégorie fiscale</Label>
            <Input value={form.category} onChange={(e) => set('category', e.target.value)}
              placeholder="Ex: Impôt sur le revenu, Patente, TVA..." required />
          </div>
          <div className="space-y-1.5">
            <Label>Montant (FCFA)</Label>
            <Input type="number" min="0" value={form.amount}
              onChange={(e) => set('amount', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optionnel)</Label>
            <Input value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Numéro de référence, commentaires..." />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPaid} onChange={(e) => set('isPaid', e.target.checked)}
              className="h-4 w-4 rounded border" />
            Déjà payé
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
