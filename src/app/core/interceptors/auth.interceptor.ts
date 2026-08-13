import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { FirebaseAuthService } from '@core/auth/firebase-auth.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(FirebaseAuthService);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

  if (!isApiRequest) {
    return next(request);
  }

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(request);
      }

      return next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    }),
  );
};
