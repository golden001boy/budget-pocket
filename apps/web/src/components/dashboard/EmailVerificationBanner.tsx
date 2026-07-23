'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, X } from 'lucide-react';

// Non-blocking by design (story 15.12, decided with the user): shows a
// dismissible-for-this-render banner rather than gating any part of the
// app on emailVerified. Self-contained client component so the (dashboard)
// layout itself doesn't need to become a session-aware server component.
export function EmailVerificationBanner() {
  const { data: session, status } = useSession();
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (status !== 'authenticated' || session.user.emailVerified || dismissed) {
    return null;
  }

  async function handleResend() {
    setSending(true);
    await fetch('/api/auth/resend-verification', { method: 'POST' });
    setSending(false);
    setSent(true);
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <Mail className="h-4 w-4 flex-shrink-0" />
        {sent ? (
          <span>Email de confirmation renvoyé — vérifiez votre boîte de réception.</span>
        ) : (
          <span>
            Confirmez votre adresse email.{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="font-semibold underline hover:no-underline disabled:opacity-50"
            >
              {sending ? 'Envoi...' : 'Renvoyer le lien'}
            </button>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-800 flex-shrink-0"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
