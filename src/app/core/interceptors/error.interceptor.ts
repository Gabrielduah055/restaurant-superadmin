import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const fieldErrors = (error.error as { errors?: { fieldErrors?: Record<string, string[]> } } | null)?.errors
        ?.fieldErrors;
      const fieldErrorMessage = fieldErrors
        ? Object.entries(fieldErrors)
            .filter(([, messages]) => messages.length)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ')
        : '';
      const message =
        fieldErrorMessage ||
        (error.error as { message?: string } | null)?.message ||
        error.message ||
        'Something went wrong. Please try again.';

      return throwError(() => new Error(message));
    }),
  );
};
