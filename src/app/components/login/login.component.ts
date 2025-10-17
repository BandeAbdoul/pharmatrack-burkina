// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <div class="logo-icon">💊</div>
          <h1>PharmaTrack Burkina</h1>
          <p class="subtitle">Système de Gestion Pharmaceutique</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input 
              type="text" 
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              placeholder="Entrez votre nom d'utilisateur"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              placeholder="Entrez votre mot de passe"
              class="form-control"
            >
          </div>

          <div class="error-message" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-login"
            [disabled]="!loginForm.valid || loading"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="demo-accounts">
          <h3>Comptes de démonstration :</h3>
          <div class="demo-account">
            <strong>Admin:</strong> admin / admin123
          </div>
          <div class="demo-account">
            <strong>Utilisateur:</strong> user / user123
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      padding: 40px;
      width: 100%;
      max-width: 450px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo-icon {
      font-size: 60px;
      margin-bottom: 15px;
    }

    .logo h1 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 4px solid #c33;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .demo-accounts {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .demo-accounts h3 {
      color: #7f8c8d;
      font-size: 14px;
      margin: 0 0 15px 0;
      font-weight: 500;
    }

    .demo-account {
      background: #f8f9fa;
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #2c3e50;
    }

    .demo-account strong {
      color: #667eea;
    }
  `]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Erreur de connexion';
      }
    });
  }
}