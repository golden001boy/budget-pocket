'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ShieldOff, AlertCircle, Copy } from 'lucide-react';

interface Props {
  initialMfaEnabled: boolean;
}

type Step =
  | { name: 'idle' }
  | { name: 'settingUp'; secret: string; qrCodeDataUrl: string }
  | { name: 'recoveryCodes'; codes: string[] }
  | { name: 'disabling' };

// Story 15.32 (ADR-008 residual, MFA — optional, user-activated TOTP).
// Three server round-trips, one component: generate a secret (not yet
// active), confirm it with a real code from the user's authenticator app
// (proves they actually scanned it), then show one-time recovery codes.
// Disabling requires the password again plus a code, same reasoning as
// requiring both to change anything else security-sensitive.
export function MfaSettings({ initialMfaEnabled }: Props) {
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [step, setStep] = useState<Step>({ name: 'idle' });
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep({ name: 'idle' });
    setCode('');
    setPassword('');
    setError('');
  }

  async function startSetup() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Erreur lors de la configuration');
      setStep({ name: 'settingUp', secret: body.data.secret, qrCodeDataUrl: body.data.qrCodeDataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Code invalide');
      setMfaEnabled(true);
      setStep({ name: 'recoveryCodes', codes: body.data.recoveryCodes });
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token: code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Erreur');
      setMfaEnabled(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {mfaEnabled ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
          Double authentification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {step.name === 'idle' && mfaEnabled && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              La double authentification est activée sur votre compte — un code de votre application d&apos;authentification vous sera demandé à chaque connexion.
            </p>
            <Button variant="outline" onClick={() => setStep({ name: 'disabling' })}>
              Désactiver
            </Button>
          </div>
        )}

        {step.name === 'idle' && !mfaEnabled && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ajoutez une couche de sécurité supplémentaire : un code à usage unique généré par une application d&apos;authentification (Google Authenticator, Authy...) en plus de votre mot de passe.
            </p>
            <Button onClick={startSetup} disabled={loading}>
              {loading ? 'Génération...' : 'Activer la double authentification'}
            </Button>
          </div>
        )}

        {step.name === 'settingUp' && (
          <form onSubmit={confirmSetup} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scannez ce QR code avec votre application d&apos;authentification, puis saisissez le code à 6 chiffres qu&apos;elle affiche.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, not a static asset Next's optimizer can handle */}
            <img src={step.qrCodeDataUrl} alt="QR code de configuration MFA" className="h-40 w-40 border rounded-lg" />
            <div className="space-y-1.5">
              <Label>Ou saisissez cette clé manuellement</Label>
              <code className="block text-xs bg-secondary/50 rounded px-2 py-1.5 break-all">{step.secret}</code>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfa-confirm-code">Code de vérification</Label>
              <Input
                id="mfa-confirm-code"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? 'Vérification...' : 'Confirmer'}</Button>
              <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>
            </div>
          </form>
        )}

        {step.name === 'recoveryCodes' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              Double authentification activée.
            </div>
            <p className="text-sm text-muted-foreground">
              Conservez ces codes de récupération dans un endroit sûr — chacun ne peut être utilisé qu&apos;une seule fois pour vous connecter si vous perdez l&apos;accès à votre application d&apos;authentification. Ils ne seront plus jamais affichés.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-secondary/50 rounded-lg p-4">
              {step.codes.map((c) => <span key={c}>{c}</span>)}
            </div>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(step.codes.join('\n'))}
              className="gap-2"
            >
              <Copy className="h-4 w-4" /> Copier les codes
            </Button>
            <Button onClick={reset} className="w-full">{"J'ai sauvegardé mes codes"}</Button>
          </div>
        )}

        {step.name === 'disabling' && (
          <form onSubmit={disable} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirmez votre mot de passe et un code de vérification (ou un code de récupération) pour désactiver la double authentification.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="mfa-disable-password">Mot de passe</Label>
              <Input
                id="mfa-disable-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfa-disable-code">Code de vérification ou de récupération</Label>
              <Input
                id="mfa-disable-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? 'Désactivation...' : 'Désactiver'}
              </Button>
              <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
