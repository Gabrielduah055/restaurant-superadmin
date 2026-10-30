import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/auth/auth.guard';
import { roleGuard } from '@core/auth/role.guard';


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin'] },
    loadComponent: () =>
      import('@core/layout/super-admin-layout/super-admin-layout.component').then(
        (m) => m.SuperAdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () => import('@features/overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'businesses',
        loadComponent: () =>
          import('@features/businesses/business-list/business-list.component').then(
            (m) => m.BusinessListComponent,
          ),
      },
      {
        path: 'businesses/new',
        loadComponent: () =>
          import('@features/businesses/add-business/add-business.component').then(
            (m) => m.AddBusinessComponent,
          ),
      },
      {
        path: 'businesses/:businessId',
        loadComponent: () =>
          import('@features/businesses/business-details/business-details.component').then(
            (m) => m.BusinessDetailsComponent,
          ),
      },
      {
        path: 'restaurants',
        loadComponent: () =>
          import('@features/restaurants/restaurant-list/restaurant-list.component').then(
            (m) => m.RestaurantListComponent,
          ),
      },
      {
        path: 'restaurants/new',
        loadComponent: () =>
          import('@features/restaurants/add-restaurant/add-restaurant.component').then(
            (m) => m.AddRestaurantComponent,
          ),
      },
      {
        path: 'restaurants/:restaurantId',
        loadComponent: () =>
          import('@features/restaurants/restaurant-details/restaurant-details.component').then(
            (m) => m.RestaurantDetailsComponent,
          ),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('@features/subscriptions/subscriptions.component').then(
            (m) => m.SubscriptionsComponent,
          ),
      },
      {
        path: 'whatsapp-operations',
        loadComponent: () =>
          import('@features/whatsapp-sessions/whatsapp-sessions.component').then(
            (m) => m.WhatsAppSessionsComponent,
          ),
      },
      {
        path: 'agent-operations',
        loadComponent: () =>
          import('@features/agent-operations/agent-operations.component').then(
            (m) => m.AgentOperationsComponent,
          ),
      },
      {
        path: 'system-health',
        loadComponent: () =>
          import('@features/system-health/system-health.component').then(
            (m) => m.SystemHealthComponent,
          ),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('@features/audit-activity/audit-activity.component').then(
            (m) => m.AuditActivityComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
