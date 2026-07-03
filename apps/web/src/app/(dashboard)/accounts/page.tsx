import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@budget-pocket/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkAccountForm } from '@/components/accounts/LinkAccountForm';
import { Link2, Wifi, WifiOff } from 'lucide-react';

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  WAVE:        { label: 'Wave',        icon: '🌊', color: '#0ea5e9' },
  MTN_MONEY:   { label: 'MTN Money',   icon: '📱', color: '#f59e0b' },
  ORANGE_MONEY:{ label: 'Orange Money',icon: '🟠', color: '#f97316' },
  MANUAL:      { label: 'Manuel',      icon: '✍️', color: '#6b7280' },
};

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const fmt      = (n: number) => formatCurrency(n, session.user.currency);
  const accounts = await prisma.linkedAccount.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes comptes</h1>
          <p className="text-muted-foreground text-sm">{accounts.length} compte{accounts.length > 1 ? 's' : ''} lié{accounts.length > 1 ? 's' : ''}</p>
        </div>
        <LinkAccountForm />
      </div>

      {/* Total balance */}
      {accounts.length > 0 && (
        <Card className="mb-6 bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm opacity-80">Solde total de tous les comptes</p>
            <p className="text-3xl font-bold mt-1">{fmt(totalBalance)}</p>
          </CardContent>
        </Card>
      )}

      {/* Sync notice */}
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 flex items-start gap-3">
        <WifiOff className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Synchronisation automatique bientôt disponible</p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
            La connexion directe Wave / MTN Money / Orange Money est en cours de développement. Vous pouvez déjà ajouter vos comptes manuellement.
          </p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Link2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun compte lié</p>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez vos comptes Wave, MTN ou Orange Money</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const meta = PROVIDER_META[account.provider] ?? PROVIDER_META.OTHER;
            return (
              <Card key={account.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-xl flex-shrink-0"
                    style={{ backgroundColor: `${meta.color}20` }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium">{account.accountName}</span>
                      <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                      {account.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <Wifi className="h-3 w-3" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <WifiOff className="h-3 w-3" /> Inactif
                        </span>
                      )}
                    </div>
                    {account.accountNumber && (
                      <p className="text-xs text-muted-foreground">
                        {account.accountNumber.slice(0, 4)}••••{account.accountNumber.slice(-2)}
                      </p>
                    )}
                    {account.lastSyncAt && (
                      <p className="text-xs text-muted-foreground">
                        Sync : {new Date(account.lastSyncAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{fmt(Number(account.balance ?? 0))}</p>
                    <p className="text-xs text-muted-foreground">{account.currency}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
