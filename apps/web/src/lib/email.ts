import { Resend } from 'resend';

// Mirrors the Sentry pattern (story 15.4): no RESEND_API_KEY means this is a
// safe no-op rather than a boot-time crash. Locally, the reset link is
// logged to the console instead so the flow stays testable without a real
// Resend account.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? 'Budget-Pocket <no-reply@budget-pocket.app>';

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY absent — lien de réinitialisation pour ${to} : ${resetUrl}`);
    return;
  }

  try {
    await resend.emails.send({
      from:    FROM,
      to,
      subject: 'Réinitialisation de votre mot de passe Budget-Pocket',
      html: `
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a> (lien valable 1 heure).</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    });
  } catch (error) {
    // Matches rateLimit.ts's fail-open logging convention: a transport
    // failure here shouldn't surface which emails exist in the system, and
    // the caller already returns a generic success response regardless.
    console.error('[email] Échec d\'envoi de l\'email de réinitialisation', error);
  }
}
