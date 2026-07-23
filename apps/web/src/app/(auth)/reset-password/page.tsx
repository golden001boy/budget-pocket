import type { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = { title: 'Réinitialiser le mot de passe — Budget-Pocket' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm">Choisissez un nouveau mot de passe pour votre compte</p>
      </div>

      <ResetPasswordForm token={token} />
    </>
  );
}
