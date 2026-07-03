'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, type Currency } from '@budget-pocket/shared';

interface DataPoint {
  label: string;
  patrimoine: number;
}

interface Props {
  data: DataPoint[];
  currency?: Currency;
}

export function NetWorthChart({ data, currency = 'XOF' }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v: number) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 0 }).format(v)} tick={{ fontSize: 11 }} width={80} />
        <Tooltip
          formatter={(v: number) => [formatCurrency(v, currency), 'Patrimoine']}
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 13 }}
        />
        <Area type="monotone" dataKey="patrimoine" stroke="#3b82f6" strokeWidth={2} fill="url(#netWorthGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
