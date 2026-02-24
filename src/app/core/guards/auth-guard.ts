import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {

  const auth = inject(Auth);
  const router = inject(Router);

  if(!auth.isAuthenticated()){
    return router.parseUrl('/')
  }

  const expectedRoles = route.data?.['expectedRoles'] as Array<string>;

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  const userRole = auth.role() ?? '';
  const hasRole = expectedRoles.includes(userRole);

  if (!hasRole) {
    return router.parseUrl('/'); 
  }

  return true;
};
