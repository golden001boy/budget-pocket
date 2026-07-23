'use client';

import { LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';
import { LineC as Line, XAxisC as XAxis, YAxisC as YAxis, TooltipC as Tooltip, ReferenceLineC as ReferenceLine, LegendC as Legend } from '@/lib/rechartsCompat';
import { formatCurrency, type Currency } from '@budget-pocket/shared';

interface DataPoint {
  label: string;
  actual?: number;
  forecast?: number;
}

interface Props {
  data: DataPoint[];
  currency?: Currency;
  splitIndex?: number;
}

export function ForecastChart({ data, currency = 'XOF', splitIndex }: Props) {
  const splitLabel = splitIndex !== undefined ? data[splitIndex]?.label : undefined;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v: number) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 0 }).format(v)} tick={{ fontSize: 11 }} width={80} />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(v, currency), name === 'actual' ? 'Réel' : 'Prévision']}
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 13 }}
        />
        <Legend formatter={(v: string) => (v === 'actual' ? 'Réel' : 'Prévision')} />
        {splitLabel && <ReferenceLine x={splitLabel} stroke="#6b7280" strokeDasharray="4 4" label={{ value: "Aujourd'hui", position: 'top', fontSize: 11 }} />}
        <Line type="monotone" dataKey="actual"   stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
