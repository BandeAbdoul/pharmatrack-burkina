// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { SaleService } from '../../services/sale.service';
import { Medicine } from '../../models/medicine.model';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h1>Tableau de Bord - PharmaTrack Burkina</h1>
      
      <div class="stats-grid">
        <div class="stat-card alert">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>Médicaments en Rupture</h3>
            <p class="stat-number">{{ lowStockMedicines.length }}</p>
            <a routerLink="/medicines" class="stat-link">Voir détails →</a>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Chiffre d'Affaires du Jour</h3>
            <p class="stat-number">{{ todayRevenue | number:'1.0-0' }} FCFA</p>
          </div>
        </div>

        <div class="stat-card sales">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>Ventes Aujourd'hui</h3>
            <p class="stat-number">{{ todaySalesCount }}</p>
          </div>
        </div>

        <div class="stat-card stock">
          <div class="stat-icon">💊</div>
          <div class="stat-content">
            <h3>Total Médicaments</h3>
            <p class="stat-number">{{ totalMedicines }}</p>
          </div>
        </div>
      </div>

      <div class="alerts-section" *ngIf="lowStockMedicines.length > 0">
        <h2>🚨 Alertes de Rupture de Stock</h2>
        <div class="alert-list">
          <div class="alert-item" *ngFor="let medicine of lowStockMedicines">
            <span class="medicine-name">{{ medicine.name }}</span>
            <span class="medicine-category">{{ medicine.category }}</span>
            <span class="medicine-stock" [class.critical]="medicine.quantity < 5">
              Stock: {{ medicine.quantity }}
            </span>
          </div>
        </div>
      </div>

      <div class="recent-sales" *ngIf="todaySales.length > 0">
        <h2>📋 Ventes Récentes</h2>
        <table class="sales-table">
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
              <th>Heure</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sale of todaySales.slice(0, 5)">
              <td>{{ sale.medicineName }}</td>
              <td>{{ sale.quantity }}</td>
              <td>{{ sale.price }} FCFA</td>
              <td><strong>{{ sale.total }} FCFA</strong></td>
              <td>{{ formatTime(sale.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      font-size: 28px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      gap: 15px;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 40px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      font-size: 14px;
      color: #7f8c8d;
      margin: 0 0 10px 0;
      font-weight: 500;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
      color: #2c3e50;
    }

    .stat-link {
      color: #3498db;
      text-decoration: none;
      font-size: 14px;
      margin-top: 10px;
      display: inline-block;
    }

    .stat-link:hover {
      text-decoration: underline;
    }

    .alert { border-left: 4px solid #e74c3c; }
    .revenue { border-left: 4px solid #27ae60; }
    .sales { border-left: 4px solid #3498db; }
    .stock { border-left: 4px solid #9b59b6; }

    .alerts-section, .recent-sales {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #fff5f5;
      border-radius: 8px;
      border-left: 3px solid #e74c3c;
    }

    .medicine-name {
      font-weight: 600;
      color: #2c3e50;
      flex: 1;
    }

    .medicine-category {
      color: #7f8c8d;
      font-size: 14px;
      margin: 0 15px;
    }

    .medicine-stock {
      background: #ffeaa7;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .medicine-stock.critical {
      background: #ff7675;
      color: white;
    }

    .sales-table {
      width: 100%;
      border-collapse: collapse;
    }

    .sales-table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #dee2e6;
    }

    .sales-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .sales-table tr:hover {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  lowStockMedicines: Medicine[] = [];
  todaySales: Sale[] = [];
  todayRevenue: number = 0;
  todaySalesCount: number = 0;
  totalMedicines: number = 0;

  constructor(
    private medicineService: MedicineService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    this.loadLowStockMedicines();
    this.loadTodaySales();
    this.loadTotalMedicines();
  }

  loadLowStockMedicines(): void {
    this.medicineService.getLowStockMedicines(10).subscribe({
      next: (medicines) => {
        this.lowStockMedicines = medicines;
      },
      error: (err) => console.error('Erreur chargement médicaments', err)
    });
  }

  loadTodaySales(): void {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    // Charger toutes les ventes et filtrer côté client
    this.saleService.getSales().subscribe({
      next: (allSales) => {
        // Filtrer les ventes du jour
        this.todaySales = allSales.filter(sale => {
          // Extraire la date au format YYYY-MM-DD
          const saleDate = sale.date.split('T')[0];
          return saleDate === today;
        }).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        this.todaySalesCount = this.todaySales.length;
        this.todayRevenue = this.todaySales.reduce((sum, sale) => sum + sale.total, 0);
      },
      error: (err) => console.error('Erreur chargement ventes', err)
    });
  }

  loadTotalMedicines(): void {
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.totalMedicines = medicines.length;
      },
      error: (err) => console.error('Erreur chargement total', err)
    });
  }

  formatTime(dateString: string): string {
    if (dateString && dateString.length === 10) {
      return 'Aujourd\'hui';
    }
    if (dateString && dateString.includes('T')) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return 'Aujourd\'hui';
  }
}