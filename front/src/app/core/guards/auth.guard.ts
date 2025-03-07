import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/authentification/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    console.log('authGuard : ', authService.isAuthenticated());
    return true;
  }

  return router.createUrlTree(['/login']);
};
