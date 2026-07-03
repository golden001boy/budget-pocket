import Link from 'next/link';

const STATS = [
  { value: '2 M+',    label: 'transactions suivies' },
  { value: '98%',     label: 'de satisfaction' },
  { value: '0 FCFA',  label: 'pour démarrer' },
];

const FEATURES = [
  { icon: '📊', text: 'Suivi complet de vos dépenses quotidiennes' },
  { icon: '📈', text: 'Analyses et prévisions sur 12 mois' },
  { icon: '💸', text: 'Compatible Wave, MTN Money, Orange Money' },
  { icon: '🎯', text: 'Objectifs d\'épargne avec suivi de progression' },
];

const TESTIMONIAL = {
  quote: 'Budget-Pocket m\'a permis d\'économiser 150 000 FCFA en 3 mois. Je vois enfin où va mon argent.',
  name:  'Aminata K.',
  role:  'Infirmière, Abidjan',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — visual / marketing ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0a1628]">

        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[90px]" />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xl shadow-lg shadow-teal-500/30">
              💰
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Budget-Pocket</span>
          </Link>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Gestion budgétaire intelligente
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
              Prenez le contrôle<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                de vos finances
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
              Suivez chaque dépense, atteignez vos objectifs et faites croître votre patrimoine — conçu pour l&apos;Afrique de l&apos;Ouest.
            </p>

            {/* Feature list */}
            <ul className="space-y-3 mb-10">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-lg flex-shrink-0">{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="flex gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                {TESTIMONIAL.name[0]}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{TESTIMONIAL.name}</p>
                <p className="text-slate-500 text-xs">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-8">

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-lg">
            💰
          </div>
          <span className="text-lg font-bold text-gray-900">Budget-Pocket</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
