import Link from 'next/link';
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, Wallet, Brain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-7 w-7 text-blue-400" />
            <span className="text-xl font-bold">Budget-Pocket</span>
          </div>
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
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap className="h-4 w-4" />
          Nouvelle génération de gestion financière
        </div>

        <h1 className="text-5xl font-bold leading-tight md:text-7xl mb-6">
          Maîtrisez votre
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            {' '}avenir financier
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-xl text-slate-400 mb-10">
          Suivez vos dépenses, gérez votre épargne, investissez sur la BRVM et les marchés mondiaux.
          Avec votre conseiller IA personnel, prenez les meilleures décisions financières.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
      </main>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 inline-flex rounded-xl bg-blue-600/20 p-3">
                <f.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Budget-Pocket. Tous droits réservés.
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon:        Wallet,
    title:       'Suivi des dépenses',
    description: 'Catégorisez vos dépenses fixes, courantes et occasionnelles. Recevez des alertes de dépassement de budget.',
  },
  {
    icon:        BarChart3,
    title:       'Analyse financière',
    description: 'Visualisez votre situation financière avec des graphiques clairs. Prévisions sur 6 à 12 mois.',
  },
  {
    icon:        TrendingUp,
    title:       'Investissements',
    description: 'Suivez vos actions BRVM, marchés internationaux (CAC40, NASDAQ) et crypto-actifs en temps réel.',
  },
  {
    icon:        Brain,
    title:       'Conseiller IA',
    description: 'Un conseiller financier IA personnalisé qui connaît votre situation et vous guide vers vos objectifs.',
  },
  {
    icon:        Zap,
    title:       'Synchronisation',
    description: 'Connectez Wave, MTN MoMo et Orange Money pour une synchronisation automatique (bientôt disponible).',
  },
  {
    icon:        Shield,
    title:       'Sécurisé',
    description: 'Vos données sont chiffrées et protégées. Nous ne partageons jamais vos informations financières.',
  },
];
