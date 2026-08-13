import {
  AttentionIssue,
  DashboardStat,
  NavItem,
  PlatformEvent,
  RecentRestaurant,
} from '@core/models/dashboard.model';
import { PlanInsight } from '@core/models/plan.model';

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'uil-apps', route: '/dashboard', exact: true },
  { label: 'Restaurants', icon: 'uil-store', route: '/dashboard/restaurants' },
  { label: 'Plans & Subscriptions', icon: 'uil-transaction', route: '/dashboard/plans-subscriptions' },
  { label: 'WhatsApp Sessions', icon: 'uil-comment-alt', route: '/dashboard/whatsapp-sessions' },
  { label: 'Admin Users', icon: 'uil-users-alt', route: '/dashboard/admin-users' },
  { label: 'Audit Activity', icon: 'uil-history', route: '/dashboard/audit-activity' },
  { label: 'Settings', icon: 'uil-setting', route: '/dashboard/settings' },
];

export const OVERVIEW_PAGE_COPY = {
  title: 'Platform Overview',
  subtitle: 'Real-time status of the OrderBridge AI ecosystem.',
  downloadReportLabel: 'Download Report',
  newRestaurantLabel: 'New Restaurant',
  attentionTitle: 'Restaurants Needing Attention',
  criticalIssuesLabel: '5 Critical Issues',
  viewAllIssuesLabel: 'View All Restaurant Issues',
  planTitle: 'Restaurants by Plan',
  eventsTitle: 'Platform Events',
  recentTitle: 'Recently Onboarded Restaurants',
};

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    label: 'Total Restaurants',
    value: '1,248',
    icon: 'uil-store',
    delta: '+12%',
    split: [
      { label: 'Active', value: '1,102', tone: 'primary' },
      { label: 'Trial', value: '98', tone: 'muted' },
    ],
  },
  {
    label: 'Monthly Subscription Revenue',
    value: '$42,850.00',
    icon: 'uil-money-bill',
    note: '8% increase from last month',
  },
  {
    label: 'Expected Monthly Revenue',
    value: '$48,200.00',
    icon: 'uil-analytics',
    note: 'Includes active trial conversions',
  },
  {
    label: 'Platform Health',
    value: '99.98%',
    icon: 'uil-server',
    solidIcon: true,
    serviceTags: ['MongoDB', 'Hermes', 'Wasender'],
  },
];

export const ATTENTION_ISSUES: AttentionIssue[] = [
  {
    restaurantName: 'Taco Bell Express - Manhattan',
    restaurantId: '#RE-4412',
    issue: 'Session Disconnected',
    icon: 'uil-wifi-slash',
    tone: 'danger',
    status: 'Offline',
    action: 'Re-authenticate',
  },
  {
    restaurantName: 'Le Petit Bistro',
    restaurantId: '#RE-9021',
    issue: 'Trial Ending in 2 Days',
    icon: 'uil-clock',
    tone: 'warning',
    status: 'In Trial',
    action: 'Extend/Convert',
  },
  {
    restaurantName: 'Sushi House Zen',
    restaurantId: '#RE-3381',
    issue: 'Payment Method Expired',
    icon: 'uil-credit-card-slash',
    tone: 'neutral',
    status: 'Pending',
    action: 'Notify Client',
  },
];

export const PLAN_INSIGHTS: PlanInsight[] = [
  { label: 'Enterprise Suite', count: 142, percentage: 65, tone: 'primary' },
  { label: 'Pro Monthly', count: 812, percentage: 86, tone: 'primary' },
  { label: 'Basic Starter', count: 294, percentage: 42, tone: 'muted' },
];

export const PLATFORM_EVENTS: PlatformEvent[] = [
  { message: 'The Pizza Hub upgraded to Enterprise.', time: '2 minutes ago', tone: 'success' },
  { message: 'New restaurant Green Salads Co. created.', time: '15 minutes ago', tone: 'success' },
  { message: 'Hermes API experienced high latency.', time: '48 minutes ago', tone: 'danger' },
];

export const RECENT_RESTAURANTS: RecentRestaurant[] = [
  {
    name: 'Golden Spoon Gourmet',
    onboardedAt: 'Onboarded Today, 10:45 AM',
    planLabel: 'Pro Monthly',
    logoUrl: 'restaurant-golden-spoon.svg',
    tone: 'primary',
  },
  {
    name: 'Neon Burger',
    onboardedAt: 'Onboarded Today, 08:12 AM',
    planLabel: 'Basic Starter',
    logoUrl: 'restaurant-neon-burger.svg',
    tone: 'secondary',
  },
  {
    name: 'Morning Mist Coffee',
    onboardedAt: 'Yesterday, 04:30 PM',
    planLabel: 'Pro Monthly',
    logoUrl: 'restaurant-morning-mist.svg',
    tone: 'primary',
  },
  {
    name: 'Urban Eats Kitchen',
    onboardedAt: 'Yesterday, 11:15 AM',
    planLabel: 'Enterprise',
    logoUrl: 'restaurant-urban-eats.svg',
    tone: 'muted',
  },
];
