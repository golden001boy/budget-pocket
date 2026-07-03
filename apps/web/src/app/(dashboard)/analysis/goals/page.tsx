import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@budget-pocket/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalForm } from '@/components/goals/GoalForm';
import { CheckCircle2, Clock, Target } from 'lucide-react';

const GOAL_TYPE_LABELS: Record<string, string> = {
  EMERGENCY_FUND: '🛡️ Fonds d\'urgence',
  TRAVEL:         '✈️ Voyage',
  PURCHASE:       '🛒 Achat',
  EDUCATION:      '📚 Éducation',
  RETIREMENT:     '🏖️ Retraite',
  SAVINGS:        '💰 Épargne',
  DEBT_PAYOFF:    '💳 Remboursement dette',
  OTHER:          '🎯 Autre',
};

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const fmt   = (n: number) => formatCurrency(n, session.user.currency);
  const goals = await prisma.financialGoal.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const active    = goals.filter((g) => g.status === 'ACTIVE');
  const completed = goals.filter((g) => g.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Objectifs financiers</h1>
          <p className="text-muted-foreground text-sm">
            {active.length} actif{active.length > 1 ? 's' : ''} · {completed.length} atteint{completed.length > 1 ? 's' : ''}
          </p>
        </div>
        <GoalForm />
      </div>

      {active.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun objectif actif</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {active.map((goal) => {
            const current = Number(goal.currentAmount);
            const target  = Number(goal.targetAmount);
            const pct     = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            const remaining  = target - current;
            const daysLeft   = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
              : null;
            const monthlyNeeded = daysLeft && daysLeft > 0 ? (remaining / (daysLeft / 30)) : null;

            return (
              <Card key={goal.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{goal.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {GOAL_TYPE_LABELS[goal.type] ?? goal.type}
                        </Badge>
                      </div>
                      {goal.notes && <p className="text-xs text-muted-foreground">{goal.notes}</p>}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold">{pct.toFixed(0)}%</p>
                      {daysLeft !== null && (
                        <p className={`text-xs flex items-center gap-1 ${daysLeft < 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          <Clock className="h-3 w-3" />
                          {daysLeft > 0 ? `${daysLeft}j restants` : 'Expiré'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Progress value={pct} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">{fmt(current)} atteint</span>
                    <span className="font-medium">{fmt(target)} objectif</span>
                  </div>
                  {monthlyNeeded && monthlyNeeded > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 px-2 py-1 rounded">
                      💡 Épargnez environ {fmt(Math.ceil(monthlyNeeded))} / mois pour atteindre cet objectif
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />Objectifs atteints
          </h2>
          <div className="space-y-2">
            {completed.map((goal) => (
              <Card key={goal.id} className="opacity-70">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{goal.name}</span>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">{fmt(Number(goal.targetAmount))} ✓</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
