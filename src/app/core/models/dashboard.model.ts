export interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  delta?: string;
  note?: string;
  solidIcon?: boolean;
  serviceTags?: string[];
  split?: Array<{
    label: string;
    value: string;
    tone?: 'primary' | 'muted';
  }>;
}

export interface AttentionIssue {
  restaurantName: string;
  restaurantId: string;
  issue: string;
  icon: string;
  tone: 'danger' | 'warning' | 'neutral';
  status: string;
  action: string;
}

export interface PlatformEvent {
  message: string;
  time: string;
  tone: 'success' | 'danger';
}

export interface RecentRestaurant {
  name: string;
  onboardedAt: string;
  planLabel: string;
  logoUrl: string;
  tone: 'primary' | 'secondary' | 'muted';
}
