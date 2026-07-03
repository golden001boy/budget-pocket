import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, TrendingUp, Activity } from 'lucide-react';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  const now      = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    premiumUsers,
    newUsersThisMonth,
    totalTransactions,
    txThisMonth,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PREMIUM' } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take:    10,
      select: {
        id: true, name: true, email: true, role: true, currency: true,
        createdAt: true, onboardingDone: true,
        _count: { select: { transactions: true } },
      },
    }),
  ]);

  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Utilisateurs total',   value: totalUsers,        sub: `+${newUsersThisMonth} ce mois`,          icon: Users,       color: 'text-blue-500'    },
    { label: 'Abonnés Premium',       value: premiumUsers,      sub: `${conversionRate}% de conversion`,        icon: CreditCard,  color: 'text-amber-500'   },
    { label: 'Transactions totales',  value: totalTransactions, sub: `${txThisMonth} ce mois`,                  icon: TrendingUp,  color: 'text-emerald-500' },
    { label: 'Taux d\'onboarding',    value: `${totalUsers > 0 ? ((await prisma.user.count({ where: { onboardingDone: true } }) / totalUsers * 100).toFixed(0)) : 0}%`, sub: 'ont terminé le wizard', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vue globale</h1>
        <p className="text-muted-foreground text-sm">
          {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Derniers inscrits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Devise</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Transactions</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{u.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'PREMIUM' ? 'default' : u.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.currency}</td>
                  <td className="px-4 py-3 text-right font-mono">{u._count.transactions}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    {!u.onboardingDone && (
                      <span className="ml-1 text-amber-500">· onboarding</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
