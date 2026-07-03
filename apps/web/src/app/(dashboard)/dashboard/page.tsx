import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';
import { formatCurrency } from '@budget-pocket/shared';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const now      = new Date();
  const snapshot = await computeMonthlySnapshot(session.user.id, now.getFullYear(), now.getMonth() + 1);
  const fmt      = (n: number) => formatCurrency(n, session.user.currency);

  const recentTxs = await prisma.transaction.findMany({
    where:   { userId: session.user.id },
    orderBy: { date: 'desc' },
    take:    5,
  });

  const activeGoals = await prisma.financialGoal.findMany({
    where:  { userId: session.user.id, status: 'ACTIVE' },
    take:   3,
  });

  const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bonjour, {session.user.name?.split(' ')[0] ?? 'vous'} 👋</h1>
        <p className="text-muted-foreground">{MONTH_LABELS[now.getMonth()]} {now.getFullYear()}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus du mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{fmt(snapshot.totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses du mois</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{fmt(snapshot.totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Épargne nette</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${snapshot.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {fmt(snapshot.totalSavings)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{"Taux d'épargne : "}{snapshot.savingsRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Objectifs actifs</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <Link href="/analysis/goals" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Transactions récentes</CardTitle>
            <Link href="/expenses" className="text-sm text-primary hover:underline">Voir tout</Link>
          </CardHeader>
          <CardContent>
            {recentTxs.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">{"Aucune transaction pour l'instant"}</p>
            ) : (
              <ul className="space-y-3">
                {recentTxs.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{tx.description ?? tx.merchant ?? tx.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{fmt(Number(tx.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Objectifs financiers</CardTitle>
            <Link href="/analysis/goals" className="text-sm text-primary hover:underline">Voir tout</Link>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-2">Aucun objectif actif</p>
                <Link href="/analysis/goals" className="text-sm text-primary hover:underline">
                  Créer un objectif
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {activeGoals.map((goal) => {
                  const pct = Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
                  return (
                    <li key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{fmt(Number(goal.currentAmount))}</span>
                        <span>{fmt(Number(goal.targetAmount))}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/expenses/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          + Ajouter une dépense
        </Link>
        <Link href="/investments" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          Voir mon portefeuille
        </Link>
        <Link href="/advisor" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          Conseiller IA
        </Link>
      </div>
    </div>
  );
}
