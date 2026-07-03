import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, EXPENSE_CATEGORIES } from '@budget-pocket/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { AlertTriangle } from 'lucide-react';

const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const fmt   = (n: number) => formatCurrency(n, session.user.currency);

  const budgets = await prisma.budget.findMany({
    where:   { userId: session.user.id, year, month },
    orderBy: { category: 'asc' },
  });

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent    = budgets.reduce((s, b) => s + Number(b.spent),  0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground text-sm">{MONTH_LABELS[now.getMonth()]} {year}</p>
        </div>
        <BudgetForm year={year} month={month} />
      </div>

      <div className="grid gap-4 grid-cols-3 mb-6">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Budget total</p>
          <p className="text-xl font-bold">{fmt(totalBudgeted)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Dépensé</p>
          <p className="text-xl font-bold text-red-600">{fmt(totalSpent)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Restant</p>
          <p className={`text-xl font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {fmt(totalBudgeted - totalSpent)}
          </p>
        </CardContent></Card>
      </div>

      {budgets.length === 0 ? (
        <Card><CardContent className="text-center py-12">
          <p className="text-muted-foreground">Aucun budget défini pour ce mois</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const cat       = EXPENSE_CATEGORIES[budget.category as keyof typeof EXPENSE_CATEGORIES];
            const spent     = Number(budget.spent);
            const amount    = Number(budget.amount);
            const alertPct  = Number(budget.alertAt ?? 80);
            const pct       = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;
            const over      = spent > amount;
            const warning   = pct >= alertPct;

            return (
              <Card key={budget.id} className={over ? 'border-red-300' : warning ? 'border-amber-300' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat?.icon ?? '📦'}</span>
                      <span className="font-medium">{cat?.label ?? budget.category}</span>
                      {over && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="h-3 w-3" />Dépassé
                        </Badge>
                      )}
                      {!over && warning && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          ⚠️ {pct.toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      <span className={over ? 'text-red-600' : ''}>{fmt(spent)}</span>
                      <span className="text-muted-foreground"> / {fmt(amount)}</span>
                    </p>
                  </div>
                  <Progress value={pct} className={`h-2 ${over ? '[&>div]:bg-red-500' : warning ? '[&>div]:bg-amber-500' : ''}`} />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {over ? `Dépassement de ${fmt(spent - amount)}` : `${fmt(amount - spent)} restant`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
