import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/authentification/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  console.log('AuthInterceptor: Intercepting request', req.url);

  const token = authService.getToken();
  console.log('AuthInterceptor: Token present:', !!token);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('AuthInterceptor: Added token to request');

    return next(clonedReq).pipe(
      catchError((error) => {
        console.log('AuthInterceptor: Caught error', error);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log(
            'AuthInterceptor: 401 error, attempting to refresh token'
          );
          return authService.refreshToken().pipe(
            switchMap((token) => {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token.token}`,
                },
              });
              return next(newReq);
            }),
            catchError((refreshError) => {
              console.log('AuthInterceptor: Token refresh failed, logging out');
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
