import type { Metadata } from 'next';
import { VerifyEmailForm } from './VerifyEmailForm';

export const metadata: Metadata = { title: 'Confirmation email — Budget-Pocket' };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirmation de votre email</h1>
      </div>

      <VerifyEmailForm token={token} />
    </>
  );
}
