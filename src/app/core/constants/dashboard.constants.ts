import { NavItem } from '@core/models/dashboard.model';

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'uil-apps', route: '/dashboard', exact: true },
  { label: 'Restaurants', icon: 'uil-store', route: '/dashboard/restaurants' },
  { label: 'Subscriptions', icon: 'uil-receipt', route: '/dashboard/subscriptions' },
  { label: 'WhatsApp Operations', icon: 'uil-whatsapp', route: '/dashboard/whatsapp-operations' },
  { label: 'Agent Operations', icon: 'uil-robot', route: '/dashboard/agent-operations' },
  { label: 'System Health', icon: 'uil-heart-medical', route: '/dashboard/system-health' },
  { label: 'Audit Logs', icon: 'uil-clipboard-notes', route: '/dashboard/audit-logs' },
];
