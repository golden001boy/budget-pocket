import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Connexion — Budget-Pocket' };

export default function LoginPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bon retour 👋</h1>
        <p className="text-gray-500 text-sm">Connectez-vous à votre espace Budget-Pocket</p>
      </div>

      <LoginForm />

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
            Créer un compte gratuit →
          </Link>
        </p>
      </div>
    </>
  );
}
