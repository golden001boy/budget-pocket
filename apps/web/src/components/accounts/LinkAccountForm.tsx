'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const PROVIDERS = [
  { value: 'WAVE',         label: '🌊 Wave'         },
  { value: 'MTN_MONEY',   label: '📱 MTN Money'    },
  { value: 'ORANGE_MONEY',label: '🟠 Orange Money' },
  { value: 'MANUAL',      label: '✍️ Manuel'        },
];

export function LinkAccountForm() {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    accountName:   '',
    provider:      'MANUAL',
    accountNumber: '',
    balance:       '0',
    currency:      'XOF',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/accounts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, balance: Number(form.balance) }),
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
          Ajouter un compte
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Lier un compte financier</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <Label>Type de compte</Label>
            <Select value={form.provider} onValueChange={(v) => set('provider', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nom du compte</Label>
            <Input placeholder="Ex: Wave Principal" value={form.accountName}
              onChange={(e) => set('accountName', e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Numéro / Téléphone (optionnel)</Label>
            <Input placeholder="+225 07..." value={form.accountNumber}
              onChange={(e) => set('accountNumber', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Solde actuel</Label>
              <Input type="number" min="0" step="1" value={form.balance}
                onChange={(e) => set('balance', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Devise</Label>
              <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="USD">Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Ajout...' : 'Lier le compte'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
