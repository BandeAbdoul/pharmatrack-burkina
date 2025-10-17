// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Vérifier si la route nécessite un rôle admin
      if (route.data['role'] === 'admin' && !this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }

    // Non authentifié, rediriger vers login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}