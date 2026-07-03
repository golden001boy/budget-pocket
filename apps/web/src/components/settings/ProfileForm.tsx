'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  user: { name: string; email: string; currency: string; timezone: string };
}

const CURRENCIES = [
  { value: 'XOF', label: 'FCFA (XOF)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar (USD)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
];

const TIMEZONES = [
  { value: 'Africa/Abidjan',    label: 'Abidjan (UTC+0)'  },
  { value: 'Africa/Dakar',      label: 'Dakar (UTC+0)'    },
  { value: 'Africa/Lagos',      label: 'Lagos (UTC+1)'    },
  { value: 'Africa/Douala',     label: 'Douala (UTC+1)'   },
  { value: 'Africa/Nairobi',    label: 'Nairobi (UTC+3)'  },
  { value: 'Europe/Paris',      label: 'Paris (UTC+1/+2)' },
];

export function ProfileForm({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: user.name, currency: user.currency, timezone: user.timezone });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error   && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">✓ Profil mis à jour</p>}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-secondary/50" />
            <p className="text-xs text-muted-foreground">{"L'email ne peut pas être modifié"}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Votre nom" />
          </div>

          <div className="space-y-1.5">
            <Label>Devise principale</Label>
            <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Fuseau horaire</Label>
            <Select value={form.timezone} onValueChange={(v) => set('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
