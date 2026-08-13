import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();

  return user ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const user = await authService.getCurrentUser();

  return user ? router.createUrlTree(['/dashboard']) : true;
};
