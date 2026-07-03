import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@budget-pocket/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RetirementPlanForm } from '@/components/planning/RetirementPlanForm';
import { TaxRecordForm } from '@/components/planning/TaxRecordForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Umbrella, Receipt, CheckCircle2 } from 'lucide-react';

export default async function PlanningPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const fmt = (n: number) => formatCurrency(n, session.user.currency);

  const [retirementPlan, taxRecords] = await Promise.all([
    prisma.retirementPlan.findUnique({ where: { userId: session.user.id } }),
    prisma.taxRecord.findMany({
      where:   { userId: session.user.id },
      orderBy: { year: 'desc' },
      take:    5,
    }),
  ]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Planification financière</h1>
        <p className="text-muted-foreground text-sm">Retraite et gestion fiscale</p>
      </div>

      <Tabs defaultValue="retirement">
        <TabsList className="mb-6">
          <TabsTrigger value="retirement" className="gap-2">
            <Umbrella className="h-4 w-4" /> Retraite
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <Receipt className="h-4 w-4" /> Fiscal
          </TabsTrigger>
        </TabsList>

        {/* Retirement Tab */}
        <TabsContent value="retirement">
          {retirementPlan ? (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Âge actuel</p>
                    <p className="text-2xl font-bold mt-1">{retirementPlan.currentAge} ans</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Âge cible retraite</p>
                    <p className="text-2xl font-bold mt-1">{retirementPlan.targetRetirementAge} ans</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Épargne actuelle</p>
                    <p className="text-xl font-bold mt-1">{fmt(Number(retirementPlan.currentSavings))}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Revenu mensuel cible</p>
                    <p className="text-xl font-bold mt-1">{fmt(Number(retirementPlan.targetMonthlyIncome))}</p>
                  </CardContent>
                </Card>
              </div>

              {/* FIRE projection */}
              {(() => {
                const yearsLeft      = retirementPlan.targetRetirementAge - retirementPlan.currentAge;
                const monthlyRate    = Number(retirementPlan.expectedReturnRate) / 100 / 12;
                const totalMonths    = yearsLeft * 12;
                const monthlyContrib = Number(retirementPlan.monthlyContribution);
                const current        = Number(retirementPlan.currentSavings);
                const fv             = current * Math.pow(1 + monthlyRate, totalMonths)
                  + monthlyContrib * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
                const fireNumber     = (Number(retirementPlan.targetMonthlyIncome) * 12) / 0.04;
                const funded         = fv >= fireNumber;

                return (
                  <Card className={funded ? 'border-emerald-300' : 'border-amber-300'}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        {funded
                          ? <><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Objectif retraite finançable</>
                          : <><Umbrella className="h-5 w-5 text-amber-500" /> Objectif retraite en cours</>
                        }
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Capital FIRE requis</p>
                        <p className="text-lg font-bold">{fmt(Math.round(fireNumber))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Capital projeté à {retirementPlan.targetRetirementAge} ans</p>
                        <p className={`text-lg font-bold ${funded ? 'text-emerald-600' : 'text-amber-600'}`}>{fmt(Math.round(fv))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contribution mensuelle</p>
                        <p className="text-lg font-bold">{fmt(monthlyContrib)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Années restantes</p>
                        <p className="text-lg font-bold">{yearsLeft} ans</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <RetirementPlanForm initial={retirementPlan} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Umbrella className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Aucun plan retraite configuré</p>
              <RetirementPlanForm />
            </div>
          )}
        </TabsContent>

        {/* Taxes Tab */}
        <TabsContent value="taxes">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Suivi des obligations fiscales</p>
              <TaxRecordForm year={currentYear} />
            </div>

            {taxRecords.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Aucune déclaration fiscale enregistrée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {taxRecords.map((tr) => (
                  <Card key={tr.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Exercice {tr.year}</span>
                          <Badge variant={tr.isPaid ? 'default' : 'outline'} className="text-xs">
                            {tr.isPaid ? '✅ Payé' : '⏳ En cours'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tr.category}</p>
                        {tr.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Échéance : {new Date(tr.dueDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{fmt(Number(tr.amount))}</p>
                        {tr.paidAt && (
                          <p className="text-xs text-muted-foreground">
                            Payé le : {new Date(tr.paidAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
