import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';
import { AuthSessionService } from './auth-session.service';

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(FirebaseAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const profile = await authSession.loadProfile();
  if (!profile) {
    return router.createUrlTree(['/login'], { queryParams: { reason: 'access' } });
  }

  return !allowedRoles?.length || allowedRoles.includes(profile.role)
    ? true
    : router.createUrlTree(['/login'], { queryParams: { reason: 'access' } });
};
