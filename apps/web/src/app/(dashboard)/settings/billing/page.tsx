import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, CreditCard, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

const PREMIUM_FEATURES = [
  { icon: '📊', text: 'Transactions illimitées (vs 50/mois en gratuit)' },
  { icon: '📈', text: 'Analyses et prévisions sur 12 mois' },
  { icon: '🎯', text: 'Objectifs financiers illimités' },
  { icon: '🔮', text: 'Simulateurs immobilier, retraite et bourse' },
  { icon: '⚡', text: 'Alertes dépassement budget en temps réel' },
  { icon: '📥', text: 'Export CSV de toutes vos données' },
];

export default async function BillingPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const searchParams = await searchParamsPromise;
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findFirst({
      where:   { userId: session.user.id, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    }),
  ]);

  if (!user) redirect('/login');

  const isPremium = user.role === 'PREMIUM' || user.role === 'ADMIN';
  const justUpgraded = searchParams.success === '1';
  const canceled     = searchParams.canceled === '1';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Abonnement</h1>
          <p className="text-muted-foreground text-sm">Gérez votre plan Budget-Pocket</p>
        </div>
      </div>

      {/* Success banner */}
      {justUpgraded && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 p-4">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">Bienvenue dans Premium !</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Votre abonnement est actif. Toutes les fonctionnalités sont maintenant débloquées.</p>
          </div>
        </div>
      )}

      {/* Canceled banner */}
      {canceled && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">Paiement annulé. Votre plan gratuit est toujours actif.</p>
        </div>
      )}

      {/* Current plan card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Plan actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{isPremium ? 'Premium' : 'Gratuit'}</span>
                <Badge variant={isPremium ? 'default' : 'secondary'}>
                  {isPremium ? '✨ Actif' : 'Basique'}
                </Badge>
              </div>
              {isPremium && subscription && (
                <p className="text-sm text-muted-foreground">
                  {subscription.expiresAt
                    ? `Renouvellement le ${new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}`
                    : `Actif depuis le ${new Date(subscription.startedAt).toLocaleDateString('fr-FR')}`}
                </p>
              )}
              {!isPremium && (
                <p className="text-sm text-muted-foreground">50 transactions · 3 objectifs · Analyses 3 mois</p>
              )}
            </div>

            {isPremium ? (
              <Link
                href="/api/stripe/portal"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Shield className="h-4 w-4" />
                {"Gérer l'abonnement"}
              </Link>
            ) : (
              <Link
                href="/api/stripe/checkout"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Passer à Premium
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features comparison */}
      {!isPremium && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">✨ Ce que vous débloquez avec Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm">
                  <span className="text-lg leading-none mt-0.5">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-2xl font-bold">4 900 <span className="text-base font-normal text-muted-foreground">FCFA / mois</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Annulable à tout moment</p>
              </div>
              <Link
                href="/api/stripe/checkout"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Commencer maintenant
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
