import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (!allowedRoles?.length) {
    return true;
  }

  return true;
};
