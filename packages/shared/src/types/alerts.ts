export type AlertType =
  | 'OVERSPEND' | 'LOW_BALANCE' | 'GOAL_MILESTONE'
  | 'SYNC_ERROR' | 'AI_RECOMMENDATION' | 'PRICE_ALERT';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertDTO {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  isDismissed: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
