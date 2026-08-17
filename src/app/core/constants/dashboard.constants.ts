import { NavItem } from '@core/models/dashboard.model';

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'uil-apps', route: '/dashboard', exact: true },
  { label: 'Restaurants', icon: 'uil-store', route: '/dashboard/restaurants' },
];
