import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; role?: string; q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  const page  = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const limit = 20;
  const skip  = (page - 1) * limit;
  const role  = searchParams.role as 'FREE' | 'PREMIUM' | 'ADMIN' | undefined;
  const q     = searchParams.q?.trim();

  const where = {
    ...(role ? { role } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, currency: true,
        onboardingDone: true, createdAt: true,
        _count: { select: { transactions: true, goals: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  const roleVariant = (r: string) =>
    r === 'PREMIUM' ? 'default' : r === 'ADMIN' ? 'destructive' : 'secondary';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground text-sm">{total} compte{total !== 1 ? 's' : ''} au total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(['', 'FREE', 'PREMIUM', 'ADMIN'] as const).map((r) => (
          <a
            key={r || 'all'}
            href={`/admin/users${r ? `?role=${r}` : ''}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              (role ?? '') === r
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {r || 'Tous'}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Devise</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tx</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Objectifs</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{u.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    {!u.onboardingDone && (
                      <span className="text-xs text-amber-500">onboarding incomplet</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.currency}</td>
                  <td className="px-4 py-3 text-right font-mono">{u._count.transactions}</td>
                  <td className="px-4 py-3 text-right font-mono">{u._count.goals}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?page=${p}${role ? `&role=${role}` : ''}`}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
