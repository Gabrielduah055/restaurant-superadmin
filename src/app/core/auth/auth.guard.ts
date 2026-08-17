import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';
import { AuthSessionService } from './auth-session.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();

  return user ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();

  if (!user) return true;

  const profile = await authSession.loadProfile();
  if (profile?.role === 'super_admin') {
    return router.createUrlTree(['/dashboard']);
  }

  await authService.logout();
  authSession.clear();
  return true;
};
