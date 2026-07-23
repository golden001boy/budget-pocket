'use client';

import { BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarC as Bar, XAxisC as XAxis, YAxisC as YAxis, TooltipC as Tooltip, LegendC as Legend } from '@/lib/rechartsCompat';
import { formatCurrency, type Currency } from '@budget-pocket/shared';

interface DataPoint {
  label: string;
  revenus: number;
  depenses: number;
}

interface Props {
  data: DataPoint[];
  currency?: Currency;
}

export function SpendingTrendChart({ data, currency = 'XOF' }: Props) {
  const fmt = (v: number) => formatCurrency(v, currency).replace(/\s/g, ' ');

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <YAxis tickFormatter={(v: number) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 0 }).format(v)} tick={{ fontSize: 11 }} width={72} />
        <Tooltip
          formatter={(value: number, name: string) => [fmt(value), name === 'revenus' ? 'Revenus' : 'Dépenses']}
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 13 }}
        />
        <Legend formatter={(v: string) => (v === 'revenus' ? 'Revenus' : 'Dépenses')} />
        <Bar dataKey="revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="depenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
