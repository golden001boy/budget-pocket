import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Mot de passe oublié — Budget-Pocket' };

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h1>
        <p className="text-gray-500 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </>
  );
}
