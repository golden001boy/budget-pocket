import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.onboardingDone) redirect('/dashboard');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
      <OnboardingWizard userName={session.user.name ?? 'vous'} />
    </div>
  );
}
