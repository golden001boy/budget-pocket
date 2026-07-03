'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const ASSET_CLASSES = [
  { value: 'CRYPTO',          label: '₿ Crypto-monnaies'    },
  { value: 'STOCK_BRVM',      label: '🌍 Actions BRVM'      },
  { value: 'STOCK_INTL',      label: '📊 Actions Intl'      },
  { value: 'BOND',            label: '📄 Obligations'       },
  { value: 'REAL_ESTATE',     label: '🏠 Immobilier'        },
  { value: 'SAVINGS_ACCOUNT', label: '🏦 Compte épargne'    },
];

export function AddPortfolioItemForm() {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    assetClass:   'STOCK_BRVM',
    name:         '',
    ticker:       '',
    quantity:     '1',
    averageCost:  '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portfolio', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          assetClass:   form.assetClass,
          name:         form.name,
          ticker:       form.ticker,
          quantity:     Number(form.quantity),
          averageCost:  Number(form.averageCost),
          purchaseDate: form.purchaseDate,
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
          Ajouter position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une position</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <Label>{"Classe d'actif"}</Label>
            <Select value={form.assetClass} onValueChange={(v) => set('assetClass', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_CLASSES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">{"Nom de l'actif"}</Label>
              <Input id="name" placeholder="Ex: Bitcoin" value={form.name}
                onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticker">Symbole (ticker)</Label>
              <Input id="ticker" placeholder="Ex: BTC" value={form.ticker}
                onChange={(e) => set('ticker', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantité</Label>
              <Input id="qty" type="number" min="0" step="any" value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">{"Prix moyen d'achat"}</Label>
              <Input id="price" type="number" min="0" step="any" placeholder="0"
                value={form.averageCost} onChange={(e) => set('averageCost', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">{"Date d'achat"}</Label>
            <Input id="date" type="date" value={form.purchaseDate}
              onChange={(e) => set('purchaseDate', e.target.value)} required />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Ajout...' : 'Ajouter au portefeuille'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
