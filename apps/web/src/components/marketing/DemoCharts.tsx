'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { NET_WORTH_DEMO, PORTFOLIO_DEMO, CASHFLOW_DEMO } from './demoData';

const fmtCompact = (n: number) =>
  new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n) + ' F';

const RADIAN = Math.PI / 180;

function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {Math.round(percent * 100)}%
    </text>
  );
}

const tooltipStyle = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 12,
  color: '#e2e8f0',
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mb-4 text-sm text-slate-400">{subtitle}</p>
      {children}
    </div>
  );
}

export function DemoCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ChartCard title="Évolution du patrimoine" subtitle="Sur les 6 derniers mois">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={NET_WORTH_DEMO} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="demoNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v: number) => [fmtCompact(v), 'Patrimoine']} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="patrimoine" stroke="#3b82f6" strokeWidth={2} fill="url(#demoNetWorth)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Répartition du portefeuille" subtitle="Par classe d'actifs">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={PORTFOLIO_DEMO}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={DonutLabel as any}
              labelLine={false}
              isAnimationActive={false}
            >
              {PORTFOLIO_DEMO.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, name: string) => [`${v}%`, name]} contentStyle={tooltipStyle} />
            <Legend
              iconType="circle"
              formatter={(v) => <span className="text-xs text-slate-300">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenus vs dépenses" subtitle="4 derniers mois">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={CASHFLOW_DEMO} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              formatter={(v: number, name: string) => [fmtCompact(v), name === 'revenus' ? 'Revenus' : 'Dépenses']}
              contentStyle={tooltipStyle}
            />
            <Legend formatter={(v) => <span className="text-xs text-slate-300">{v === 'revenus' ? 'Revenus' : 'Dépenses'}</span>} />
            <Bar dataKey="revenus" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="depenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
