import Link from 'next/link';
import {
  ArrowRight, BarChart3, Shield, Zap, TrendingUp, Wallet, Brain, Check,
} from 'lucide-react';
import { HeroMockup } from '@/components/marketing/HeroMockup';
import { DemoCharts } from '@/components/marketing/DemoCharts';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-7 w-7 text-blue-400" />
            <span className="text-xl font-bold">Budget-Pocket</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#apercu" className="hover:text-white transition-colors">Aperçu</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
              <Zap className="h-4 w-4" />
              Nouvelle génération de gestion financière
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl mb-6">
              Maîtrisez votre
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {' '}avenir financier
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-xl text-slate-400 mb-10 lg:mx-0">
              Suivez vos dépenses, gérez votre épargne, investissez sur la BRVM et les marchés mondiaux.
              Avec votre conseiller IA personnel, prenez les meilleures décisions financières.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-lg hover:bg-blue-500 transition-all hover:scale-105"
              >
                Créer mon compte gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 px-8 py-4 font-semibold text-lg hover:bg-white/5 transition-colors"
              >
                Voir la démo
              </Link>
            </div>
          </div>

          <HeroMockup />
        </div>

        {/* Value-prop strip */}
        <div className="mt-24 grid grid-cols-2 gap-6 border-y border-white/10 py-8 sm:grid-cols-4">
          {VALUE_PROPS.map((v) => (
            <div key={v.label} className="text-center">
              <p className="text-2xl font-bold text-white md:text-3xl">{v.value}</p>
              <p className="mt-1 text-xs text-slate-400 md:text-sm">{v.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* See it in action */}
      <section id="apercu" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-3">Vos finances, visualisées clairement</h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            Un aperçu des tableaux de bord que vous retrouverez dans l&apos;application — données d&apos;exemple.
          </p>
        </div>
        <DemoCharts />
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-3">Tout ce qu&apos;il faut, dans une seule app</h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            De la dépense du quotidien à la planification de la retraite.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 inline-flex rounded-xl p-3" style={{ backgroundColor: `${f.color}20` }}>
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="tarifs" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-3">Un tarif simple</h2>
          <p className="mx-auto max-w-2xl text-slate-400">Commencez gratuitement, passez à Premium quand vous en avez besoin.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold mb-1">Gratuit</h3>
            <p className="text-3xl font-bold mb-6">0 F <span className="text-base font-normal text-slate-400">/ toujours</span></p>
            <ul className="space-y-3 text-sm text-slate-300">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border border-blue-500/40 bg-blue-600/10 p-8">
            <span className="absolute -top-3 right-8 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">Recommandé</span>
            <h3 className="text-lg font-semibold mb-1">Premium</h3>
            <p className="text-3xl font-bold mb-6">4 900 F <span className="text-base font-normal text-slate-400">/ mois</span></p>
            <ul className="space-y-3 text-sm text-slate-300">
              {PREMIUM_TEASER_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 p-12">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Prêt à prendre le contrôle ?</h2>
          <p className="mx-auto max-w-xl text-slate-300 mb-8">
            Créez votre compte en moins d&apos;une minute, aucune carte bancaire requise pour démarrer.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-lg hover:bg-blue-500 transition-all hover:scale-105"
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Budget-Pocket. Tous droits réservés.
      </footer>
    </div>
  );
}

const VALUE_PROPS = [
  { value: '19',      label: 'Catégories de dépenses' },
  { value: '4',       label: 'Marchés suivis (BRVM, Crypto, Intl.)' },
  { value: '12 mois', label: 'De prévisions financières' },
  { value: '24/7',    label: 'Suivi automatisé' },
];

const FEATURES = [
  {
    icon:        Wallet,
    color:       '#3b82f6',
    title:       'Suivi des dépenses',
    description: 'Catégorisez vos dépenses fixes, courantes et occasionnelles. Recevez des alertes de dépassement de budget.',
  },
  {
    icon:        BarChart3,
    color:       '#059669',
    title:       'Analyse financière',
    description: 'Visualisez votre situation financière avec des graphiques clairs. Prévisions sur 6 à 12 mois.',
  },
  {
    icon:        TrendingUp,
    color:       '#d97706',
    title:       'Investissements',
    description: 'Suivez vos actions BRVM, marchés internationaux (CAC40, NASDAQ) et crypto-actifs en temps réel.',
  },
  {
    icon:        Brain,
    color:       '#ef4444',
    title:       'Conseiller IA',
    description: 'Un conseiller financier IA personnalisé qui connaît votre situation et vous guide vers vos objectifs.',
  },
  {
    icon:        Zap,
    color:       '#3b82f6',
    title:       'Synchronisation',
    description: 'Connectez Wave, MTN MoMo et Orange Money pour une synchronisation automatique (bientôt disponible).',
  },
  {
    icon:        Shield,
    color:       '#059669',
    title:       'Sécurisé',
    description: 'Vos données sont chiffrées et protégées. Nous ne partageons jamais vos informations financières.',
  },
];

const FREE_FEATURES = [
  '50 transactions / mois',
  '3 objectifs financiers',
  '5 positions de portefeuille',
  '1 compte lié',
  'Prévisions sur 3 mois',
];

const PREMIUM_TEASER_FEATURES = [
  'Transactions illimitées',
  'Objectifs illimités',
  'Portefeuille illimité',
  'Conseiller IA (50 messages/jour)',
  'Prévisions sur 12 mois',
];
