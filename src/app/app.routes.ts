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
        path: 'plans-subscriptions',
        loadComponent: () =>
          import('@features/plans-subscriptions/plans-subscriptions.component').then(
            (m) => m.PlansSubscriptionsComponent,
          ),
      },
      {
        path: 'whatsapp-sessions',
        loadComponent: () =>
          import('@features/whatsapp-sessions/whatsapp-sessions.component').then(
            (m) => m.WhatsAppSessionsComponent,
          ),
      },
      {
        path: 'admin-users',
        loadComponent: () => import('@features/admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'audit-activity',
        loadComponent: () =>
          import('@features/audit-activity/audit-activity.component').then((m) => m.AuditActivityComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('@features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
