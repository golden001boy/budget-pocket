import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { MfaSettings } from '@/components/settings/MfaSettings';
import { User, CreditCard, Bell, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findFirst({
      where:   { userId: session.user.id, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    }),
  ]);

  if (!user) redirect('/login');

  const isPremium = user.role === 'PREMIUM' || user.role === 'ADMIN';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><ShieldCheck className="h-4 w-4" /> Sécurité</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" /> Abonnement</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={{ name: user.name ?? '', email: user.email, currency: user.currency, timezone: user.timezone }} />
        </TabsContent>

        <TabsContent value="security">
          <MfaSettings initialMfaEnabled={user.mfaEnabled} />
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-4">
            {/* Current plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan actuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{isPremium ? 'Premium' : 'Gratuit'}</span>
                      <Badge variant={isPremium ? 'default' : 'secondary'}>
                        {isPremium ? '✨ Actif' : 'Basique'}
                      </Badge>
                    </div>
                    {isPremium && subscription && (
                      <p className="text-sm text-muted-foreground">
                        Renouvellement le {new Date(subscription.expiresAt ?? subscription.startedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {!isPremium && (
                      <p className="text-sm text-muted-foreground">
                        50 transactions/mois · 3 objectifs · Analyses 3 mois
                      </p>
                    )}
                  </div>
                  {!isPremium && (
                    <Link
                      href="/api/stripe/checkout"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Passer à Premium
                    </Link>
                  )}
                  {isPremium && (
                    <Link
                      href="/api/stripe/portal"
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      {"Gérer l'abonnement"}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Premium features */}
            {!isPremium && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base">✨ Budget-Pocket Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Transactions illimitées',
                      'Analyses et prévisions sur 12 mois',
                      'Simulateurs immobilier, retraite et bourse',
                      'Objectifs financiers illimités',
                      'Alertes budget en temps réel',
                      'Export CSV de vos données',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-emerald-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Configuration des notifications bientôt disponible</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
