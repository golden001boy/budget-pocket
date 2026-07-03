import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ScenarioList } from '@/components/advisor/ScenarioList';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Clock } from 'lucide-react';

export default async function AdvisorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const scenarios = await prisma.scenario.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take:    10,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold">Simulateurs financiers</h1>
          <p className="text-muted-foreground text-sm">Immobilier · Retraite · Placement boursier</p>
        </div>
      </div>

      {/* Chat IA — coming soon */}
      <Card className="mb-6 border-dashed border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">Conseiller IA — Bientôt disponible</p>
            <p className="text-sm text-blue-700/80 dark:text-blue-400 mt-0.5">
              Le chat avec votre conseiller financier personnel sera activé dans une prochaine mise à jour.
              En attendant, utilisez les simulateurs ci-dessous — ils fonctionnent entièrement hors-ligne.
            </p>
          </div>
        </CardContent>
      </Card>

      <ScenarioList scenarios={scenarios} />
    </div>
  );
}
