'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type Status = 'pending' | 'success' | 'error';

export function VerifyEmailForm({ token }: { token?: string }) {
  const { update } = useSession();
  const [status,  setStatus]  = useState<Status>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ce lien est invalide.');
      return;
    }

    (async () => {
      const res = await fetch('/api/auth/verify-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Erreur lors de la vérification');
        return;
      }

      setStatus('success');
      setMessage(data.data.message);
      // Forces the JWT to pick up the new emailVerified value — otherwise
      // the stale session would keep showing the "confirm your email"
      // banner until the token naturally refreshes (see lib/auth.ts).
      await update();
    })();
  }, [token, update]);

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
        Vérification en cours...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {message}
        </div>
        <Link href="/dashboard" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-sm text-teal-700 bg-teal-50 rounded-lg px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
      <Link href="/dashboard" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
        → Aller au tableau de bord
      </Link>
    </div>
  );
}
