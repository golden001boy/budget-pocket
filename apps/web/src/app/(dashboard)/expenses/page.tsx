import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@budget-pocket/shared';
import { EXPENSE_CATEGORIES, EXPENSE_TYPE_LABELS } from '@budget-pocket/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';

interface SearchParams {
  page?:     string;
  category?: string;
  type?:     string;
  month?:    string;
}

export default async function ExpensesPage({ searchParams: searchParamsPromise }: { searchParams: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const searchParams = await searchParamsPromise;
  const page     = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 20;
  const fmt      = (n: number) => formatCurrency(n, session.user.currency);

  const where: Record<string, unknown> = { userId: session.user.id };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.type)     where.expenseType = searchParams.type;
  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-').map(Number);
    where.date = {
      gte: new Date(y, m - 1, 1),
      lt:  new Date(y, m, 1),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dépenses & revenus</h1>
          <p className="text-muted-foreground text-sm">{total} transaction{total > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle transaction
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres :</span>
          {Object.entries(EXPENSE_CATEGORIES).slice(0, 6).map(([key, cat]) => (
            <Link
              key={key}
              href={`/expenses?category=${key}${searchParams.month ? `&month=${searchParams.month}` : ''}`}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                searchParams.category === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
          {searchParams.category && (
            <Link href="/expenses" className="text-xs text-muted-foreground hover:text-foreground underline">
              Effacer les filtres
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Transaction list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-3">Aucune transaction trouvée</p>
              <Link href="/expenses/new" className="text-primary hover:underline text-sm">
                Ajouter votre première transaction
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((tx) => {
                const cat = EXPENSE_CATEGORIES[tx.category as keyof typeof EXPENSE_CATEGORIES];
                return (
                  <li key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg flex-shrink-0">
                      {cat?.icon ?? '💳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description ?? tx.merchant ?? cat?.label ?? tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString('fr-FR')}
                        </span>
                        {tx.expenseType && (
                          <Badge variant="outline" className="text-xs py-0">
                            {EXPENSE_TYPE_LABELS[tx.expenseType as keyof typeof EXPENSE_TYPE_LABELS]}
                          </Badge>
                        )}
                        {tx.merchant && (
                          <span className="text-xs text-muted-foreground">{tx.merchant}</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{fmt(Number(tx.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/expenses?page=${page - 1}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              ← Précédent
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/expenses?page=${page + 1}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
