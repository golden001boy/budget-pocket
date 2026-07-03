'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EXPENSE_CATEGORIES } from '@budget-pocket/shared';

interface DataPoint {
  category: string;
  amount: number;
}

interface Props {
  data: DataPoint[];
}

export function CategoryPieChart({ data }: Props) {
  const enriched = data.map((d) => {
    const cat = EXPENSE_CATEGORIES[d.category as keyof typeof EXPENSE_CATEGORIES];
    return { ...d, label: cat?.label ?? d.category, color: cat?.color ?? '#6b7280' };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="amount"
          nameKey="label"
        >
          {enriched.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [new Intl.NumberFormat('fr-FR').format(v) + ' FCFA', '']}
          contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 13 }}
        />
        <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
