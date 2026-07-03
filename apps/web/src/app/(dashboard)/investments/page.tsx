import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, ASSET_RISK_SCORES } from '@budget-pocket/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PortfolioAllocationChart } from '@/components/charts/PortfolioAllocationChart';
import { AddPortfolioItemForm } from '@/components/investments/AddPortfolioItemForm';
import { TrendingUp, TrendingDown, Shield } from 'lucide-react';

const ASSET_CLASS_META: Record<string, { label: string; color: string; icon: string }> = {
  CRYPTO:       { label: 'Crypto',        color: '#f59e0b', icon: '₿' },
  STOCK_BRVM:   { label: 'BRVM',          color: '#3b82f6', icon: '🌍' },
  STOCK_INTL:   { label: 'Actions Intl',  color: '#8b5cf6', icon: '📊' },
  BOND:         { label: 'Obligations',   color: '#10b981', icon: '📄' },
  REAL_ESTATE:  { label: 'Immobilier',    color: '#ec4899', icon: '🏠' },
  SAVINGS_ACCOUNT: { label: 'Épargne',   color: '#6b7280', icon: '🏦' },
};

export default async function InvestmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const fmt  = (n: number) => formatCurrency(n, session.user.currency);

  const items = await prisma.portfolioItem.findMany({
    where:   { userId: session.user.id },
    orderBy: { assetClass: 'asc' },
  });

  const totalValue = items.reduce((s, i) => s + Number(i.currentPrice ?? i.averageCost) * Number(i.quantity), 0);
  const totalCost  = items.reduce((s, i) => s + Number(i.averageCost) * Number(i.quantity), 0);
  const totalGain  = totalValue - totalCost;
  const gainPct    = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Weighted risk score
  const weightedRisk = totalValue > 0
    ? items.reduce((s, i) => {
        const val  = Number(i.currentPrice ?? i.averageCost) * Number(i.quantity);
        const risk = ASSET_RISK_SCORES[i.assetClass as keyof typeof ASSET_RISK_SCORES] ?? 5;
        return s + (val / totalValue) * risk;
      }, 0)
    : 0;

  // Allocation chart data
  const byClass: Record<string, number> = {};
  for (const item of items) {
    const val = Number(item.currentPrice ?? item.averageCost) * Number(item.quantity);
    byClass[item.assetClass] = (byClass[item.assetClass] ?? 0) + val;
  }
  const allocationData = Object.entries(byClass).map(([cls, value]) => ({
    name:  ASSET_CLASS_META[cls]?.label ?? cls,
    value,
    color: ASSET_CLASS_META[cls]?.color ?? '#6b7280',
  }));

  const riskLabel = weightedRisk <= 3 ? 'Faible' : weightedRisk <= 6 ? 'Modéré' : 'Élevé';
  const riskColor = weightedRisk <= 3 ? 'text-emerald-600' : weightedRisk <= 6 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portefeuille</h1>
          <p className="text-muted-foreground text-sm">{items.length} position{items.length > 1 ? 's' : ''}</p>
        </div>
        <AddPortfolioItemForm />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Valeur totale</p>
            <p className="text-xl font-bold mt-1">{fmt(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Plus/moins value</p>
            <div className="flex items-center gap-1 mt-1">
              {totalGain >= 0
                ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                : <TrendingDown className="h-4 w-4 text-red-500" />}
              <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}{fmt(totalGain)}
              </p>
            </div>
            <p className={`text-xs mt-0.5 ${gainPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{"Coût d'achat"}</p>
            <p className="text-xl font-bold mt-1">{fmt(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Score de risque
            </p>
            <p className={`text-xl font-bold mt-1 ${riskColor}`}>
              {weightedRisk.toFixed(1)}/10 — {riskLabel}
            </p>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune position dans votre portefeuille</p>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez vos investissements BRVM, crypto ou actions</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Liste des positions</TabsTrigger>
            <TabsTrigger value="allocation">Répartition</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const meta        = ASSET_CLASS_META[item.assetClass];
                    const currentVal  = Number(item.currentPrice ?? item.averageCost);
                    const cost        = Number(item.averageCost);
                    const qty         = Number(item.quantity);
                    const totalVal    = currentVal * qty;
                    const gain        = (currentVal - cost) * qty;
                    const gainPctItem = cost > 0 ? ((currentVal - cost) / cost) * 100 : 0;

                    return (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                          style={{ backgroundColor: `${meta?.color ?? '#6b7280'}20` }}
                        >
                          {meta?.icon ?? '💼'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.ticker ?? item.name}</span>
                            <Badge variant="outline" className="text-xs">{meta?.label ?? item.assetClass}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {qty} × {fmt(cost)} = {fmt(totalVal)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{fmt(totalVal)}</p>
                          <p className={`text-xs ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {gain >= 0 ? '+' : ''}{fmt(gain)} ({gainPctItem >= 0 ? '+' : ''}{gainPctItem.toFixed(1)}%)
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{"Répartition par classe d'actifs"}</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioAllocationChart data={allocationData} currency={session.user.currency} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
