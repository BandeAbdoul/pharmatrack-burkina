// src/app/components/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" *ngIf="currentUser">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="logo">💊</span>
          <span class="brand-name">PharmaTrack Burkina</span>
        </div>

        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            📊 Dashboard
          </a>
          <a routerLink="/medicines" routerLinkActive="active" class="nav-link">
            📦 Médicaments
          </a>
          <a routerLink="/sales" routerLinkActive="active" class="nav-link">
            💳 Ventes
          </a>
        </div>

        <div class="nav-user">
          <div class="user-info">
            <span class="user-icon">👤</span>
            <div class="user-details">
              <span class="username">{{ currentUser.username }}</span>
              <span class="user-role" [class.admin]="currentUser.role === 'admin'">
                {{ currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}
              </span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .logo {
      font-size: 32px;
    }

    .brand-name {
      font-size: 20px;
      font-weight: bold;
    }

    .nav-links {
      display: flex;
      gap: 10px;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s;
      background: rgba(255,255,255,0.1);
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(255,255,255,0.3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
    }

    .user-icon {
      font-size: 28px;
      background: rgba(255,255,255,0.2);
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .username {
      font-weight: 600;
      font-size: 15px;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.9;
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 10px;
    }

    .user-role.admin {
      background: #f39c12;
      color: white;
    }

    .btn-logout {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background: rgba(255,255,255,0.3);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
    }

    @media (max-width: 1024px) {
      .nav-container {
        flex-wrap: wrap;
      }

      .nav-links {
        order: 3;
        width: 100%;
        justify-content: space-around;
      }
    }

    @media (max-width: 768px) {
      .nav-brand .brand-name {
        display: none;
      }

      .user-details {
        display: none;
      }

      .nav-links {
        gap: 5px;
      }

      .nav-link {
        padding: 8px 12px;
        font-size: 14px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}