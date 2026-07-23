'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema } from '@budget-pocket/shared';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd     = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: fd.get('email') });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(parsed.data),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de l\'envoi');
      return;
    }

    // Always shown on success, whether or not the email is registered —
    // the API response is deliberately generic (see forgot-password/route.ts).
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex items-start gap-2 text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          required
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500"
        />
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
        {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
      </Button>
    </form>
  );
}
