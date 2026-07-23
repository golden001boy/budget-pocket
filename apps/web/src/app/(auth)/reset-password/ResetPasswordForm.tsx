'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema } from '@budget-pocket/shared';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResetPasswordForm({ token }: { token?: string }) {
  const router   = useRouter();
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [showPwd,  setShowPwd] = useState(false);
  const [done,     setDone]    = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Lien invalide — aucun jeton fourni.');
      return;
    }
    setLoading(true);

    const fd     = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({ token, password: fd.get('password') });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(parsed.data),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la réinitialisation');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  }

  if (!token) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        Ce lien est invalide. Redemandez un lien de réinitialisation.
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-start gap-2 text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Mot de passe mis à jour. Redirection vers la connexion...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Nouveau mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Minimum 10 caractères"
            autoComplete="new-password"
            required
            className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm shadow-teal-200"
      >
        {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
}
