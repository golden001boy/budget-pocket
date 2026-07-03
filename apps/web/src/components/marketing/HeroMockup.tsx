'use client';

import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { NET_WORTH_DEMO, PORTFOLIO_DEMO } from './demoData';

const fmtCompact = (n: number) =>
  new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export function HeroMockup() {
  const last  = NET_WORTH_DEMO[NET_WORTH_DEMO.length - 1].patrimoine;
  const first = NET_WORTH_DEMO[0].patrimoine;
  const growthPct = (((last - first) / first) * 100).toFixed(0);

  return (
    <div className="relative mx-auto max-w-lg lg:mx-0">
      {/* Main dashboard card */}
      <div className="rounded-2xl border border-white/10 bg-slate-800/60 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs font-medium text-slate-400">Tableau de bord</span>
        </div>

        <div className="p-5">
          {/* Stat tiles */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400 mb-1">Patrimoine total</p>
              <p className="text-xl font-bold text-white">{fmtCompact(last)} F</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +{growthPct}% / 6 mois
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400 mb-1">Épargne du mois</p>
              <p className="text-xl font-bold text-white">530K F</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-300">
                <TrendingUp className="h-3.5 w-3.5" />
                Taux : 50%
              </div>
            </div>
          </div>

          {/* Net worth mini area chart — single series, no legend needed */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-1 text-xs text-slate-400">Évolution du patrimoine</p>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={NET_WORTH_DEMO} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`${fmtCompact(v)} FCFA`, 'Patrimoine']}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="patrimoine" stroke="#3b82f6" strokeWidth={2} fill="url(#heroNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Floating portfolio badge */}
      <div className="absolute -bottom-6 -right-4 hidden w-44 rounded-xl border border-white/10 bg-slate-800/90 p-3 shadow-xl backdrop-blur-xl sm:block">
        <p className="mb-2 text-xs font-medium text-slate-300">Portefeuille</p>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{
            background: `conic-gradient(${PORTFOLIO_DEMO.map((d, i) => {
              const prevTotal = PORTFOLIO_DEMO.slice(0, i).reduce((s, x) => s + x.value, 0);
              return `${d.color} ${prevTotal}% ${prevTotal + d.value}%`;
            }).join(', ')})`,
          }}>
            <div className="h-5 w-5 rounded-full bg-slate-800" />
          </div>
          <div className="text-xs text-slate-400">
            <div className="font-semibold text-white">3 positions</div>
            BRVM · Crypto · +
          </div>
        </div>
      </div>
    </div>
  );
}
