import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Créer un compte — Budget-Pocket' };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer votre compte</h1>
        <p className="text-gray-500 text-sm">Gratuit, sans carte bancaire requise</p>
      </div>

      <RegisterForm />

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
            Se connecter →
          </Link>
        </p>
      </div>
    </>
  );
}
