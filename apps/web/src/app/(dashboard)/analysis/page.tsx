import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { computeMonthlySnapshot } from '@/lib/analytics/snapshot';
import { projectForecast } from '@/lib/analytics/forecast';
import { formatCurrency } from '@budget-pocket/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart';
import { ForecastChart } from '@/components/charts/ForecastChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import Link from 'next/link';
import { TrendingUp, Target } from 'lucide-react';

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const now = new Date();
  const fmt = (n: number) => formatCurrency(n, session.user.currency);

  const snapshots = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return computeMonthlySnapshot(session.user.id, d.getFullYear(), d.getMonth() + 1);
    }),
  );

  const trendData = snapshots.map((s, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: MONTH_SHORT[d.getMonth()], revenus: s.totalIncome, depenses: s.totalExpenses };
  });

  const currentSnap  = snapshots[5];
  const categoryData = Object.entries(currentSnap.categoryBreakdown)
    .map(([category, amount]) => ({ category, amount: amount ?? 0 }))
    .filter((d) => d.amount > 0);

  const isPremium      = session.user.role === 'PREMIUM' || session.user.role === 'ADMIN';
  const forecastMonths = isPremium ? 12 : 3;
  const forecast       = projectForecast(snapshots, forecastMonths);

  const totalProjectedSavings = forecast.reduce((s, f) => s + f.projectedSavings, 0);

  const forecastData = [
    ...snapshots.map((s, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { label: MONTH_SHORT[d.getMonth()], actual: s.totalSavings };
    }),
    ...forecast.map((f) => ({ label: f.label, forecast: f.projectedSavings })),
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analyses financières</h1>
          <p className="text-muted-foreground text-sm">{"Vue d'ensemble sur 6 mois"}</p>
        </div>
        <Link href="/analysis/goals" className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors">
          <Target className="h-4 w-4" />Mes objectifs
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{"Taux d'épargne (mois)"}</p>
            <p className={`text-2xl font-bold mt-1 ${currentSnap.savingsRate >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentSnap.savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Épargne cumulée (6 mois)</p>
            <p className={`text-2xl font-bold mt-1 ${snapshots.reduce((s, x) => s + x.totalSavings, 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(snapshots.reduce((s, x) => s + x.totalSavings, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Prévision épargne {forecastMonths} mois</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{fmt(totalProjectedSavings)}</p>
            {!isPremium && (
              <p className="text-xs text-amber-600 mt-1">
                <Link href="/settings" className="hover:underline">Premium → 12 mois</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Revenus vs Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart data={trendData} currency={session.user.currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Dépenses par catégorie</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Aucune dépense ce mois-ci
              </div>
            ) : (
              <CategoryPieChart data={categoryData} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{"Prévisions d'épargne"}</CardTitle></CardHeader>
        <CardContent>
          <ForecastChart data={forecastData} currency={session.user.currency} splitIndex={5} />
        </CardContent>
      </Card>
    </div>
  );
}
