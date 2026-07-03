export const CHART_COLORS = {
  primary:   '#0F4C75',
  secondary: '#1B9E77',
  accent:    '#27AE60',
  warning:   '#E67E22',
  danger:    '#E74C3C',
  info:      '#3498DB',
  muted:     '#95A5A6',
  palette: [
    '#0F4C75', '#1B9E77', '#27AE60', '#3498DB',
    '#9B59B6', '#E67E22', '#E74C3C', '#1ABC9C',
    '#F39C12', '#2ECC71',
  ],
} as const;

export const RISK_COLORS = {
  low:    '#22C55E',
  medium: '#F59E0B',
  high:   '#EF4444',
} as const;

export function getRiskColor(score: number): string {
  if (score <= 3) return RISK_COLORS.low;
  if (score <= 6) return RISK_COLORS.medium;
  return RISK_COLORS.high;
}
