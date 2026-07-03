import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export default async function NewExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nouvelle transaction</h1>
        <p className="text-muted-foreground text-sm">Saisissez les détails de votre transaction</p>
      </div>
      <TransactionForm currency={session.user.currency} />
    </div>
  );
}
