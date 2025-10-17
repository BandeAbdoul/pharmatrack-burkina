// src/app/components/sales/sale-form/sale-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicineService } from '../../../services/medicine.service';
import { SaleService } from '../../../services/sale.service';
import { Medicine } from '../../../models/medicine.model';
import { Sale } from '../../../models/sale.model';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sales-container">
      <div class="header">
        <h1>💳 Enregistrer une Vente</h1>
      </div>

      <div class="sales-layout">
        <!-- Formulaire de vente -->
        <div class="sale-form-card">
          <h2>Nouvelle Vente</h2>
          <form (ngSubmit)="processSale()" #saleForm="ngForm">
            <div class="form-group">
              <label>Médicament *</label>
              <select 
                [(ngModel)]="selectedMedicineId"
                name="medicine"
                (change)="onMedicineSelect()"
                required
                class="form-control"
              >
                <option value="">Sélectionner un médicament</option>
                <option *ngFor="let medicine of availableMedicines" [value]="medicine.id">
                  {{ medicine.name }} - {{ medicine.price }} FCFA (Stock: {{ medicine.quantity }})
                </option>
              </select>
            </div>

            <div class="medicine-details" *ngIf="selectedMedicine">
              <div class="detail-item">
                <span class="label">Catégorie:</span>
                <span class="value">{{ selectedMedicine.category }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Prix unitaire:</span>
                <span class="value">{{ selectedMedicine.price }} FCFA</span>
              </div>
              <div class="detail-item">
                <span class="label">Stock disponible:</span>
                <span class="value" [class.low]="selectedMedicine.quantity < 10">
                  {{ selectedMedicine.quantity }} unités
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>Quantité *</label>
              <input 
                type="number" 
                [(ngModel)]="quantity"
                name="quantity"
                required
                min="1"
                [max]="selectedMedicine?.quantity || 0"
                class="form-control"
                placeholder="Nombre d'unités"
                (input)="calculateTotal()"
                (ngModelChange)="calculateTotal()"
              >
              <small class="error" *ngIf="quantity > (selectedMedicine?.quantity || 0)">
                ⚠️ Stock insuffisant ({{ selectedMedicine?.quantity }} disponibles)
              </small>
            </div>

            <div class="total-section" *ngIf="quantity && selectedMedicine">
              <div class="total-label">Total à payer:</div>
              <div class="total-amount">{{ saleTotal | number:'1.0-0' }} FCFA</div>
            </div>

            <button 
              type="submit" 
              class="btn-submit"
              [disabled]="!saleForm.valid || quantity > (selectedMedicine?.quantity || 0) || processing"
            >
              {{ processing ? 'Traitement...' : '✓ Valider la vente' }}
            </button>
          </form>

          <div class="success-message" *ngIf="successMessage">
            ✓ {{ successMessage }}
          </div>
          <div class="error-message" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>
        </div>

        <!-- Historique des ventes du jour -->
        <div class="today-sales-card">
          <h2>📊 Ventes du Jour</h2>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">{{ todaySales.length }}</div>
              <div class="stat-label">Ventes</div>
            </div>
            <div class="stat-box revenue">
              <div class="stat-value">{{ todayRevenue | number:'1.0-0' }}</div>
              <div class="stat-label">FCFA</div>
            </div>
          </div>

          <div class="sales-list">
            <div class="sale-item" *ngFor="let sale of todaySales">
              <div class="sale-header">
                <strong>{{ sale.medicineName }}</strong>
                <span class="sale-time">{{ formatSaleTime(sale.date) }}</span>
              </div>
              <div class="sale-details">
                <span>{{ sale.quantity }} × {{ sale.price }} FCFA</span>
                <span class="sale-total">{{ sale.total }} FCFA</span>
              </div>
            </div>
          </div>

          <div class="no-sales" *ngIf="todaySales.length === 0">
            <p>Aucune vente aujourd'hui</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sales-container {
      padding: 20px;
    }

    .header {
      margin-bottom: 30px;
    }

    h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 28px;
    }

    .sales-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .sale-form-card, .today-sales-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      color: #2c3e50;
      margin: 0 0 20px 0;
      font-size: 20px;
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
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
    }

    .medicine-details {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-item .label {
      color: #7f8c8d;
      font-size: 14px;
    }

    .detail-item .value {
      color: #2c3e50;
      font-weight: 600;
      font-size: 14px;
    }

    .detail-item .value.low {
      color: #e74c3c;
    }

    .error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    .total-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .total-label {
      font-size: 14px;
      margin-bottom: 5px;
      opacity: 0.9;
    }

    .total-amount {
      font-size: 36px;
      font-weight: bold;
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #229954;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .success-message, .error-message {
      margin-top: 15px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 25px;
    }

    .stat-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-box.revenue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.8;
    }

    .sales-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .sale-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 10px;
      transition: all 0.3s;
    }

    .sale-item:hover {
      background: #e9ecef;
      transform: translateX(5px);
    }

    .sale-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .sale-header strong {
      color: #2c3e50;
    }

    .sale-time {
      color: #7f8c8d;
      font-size: 13px;
    }

    .sale-details {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #7f8c8d;
    }

    .sale-total {
      color: #27ae60;
      font-weight: 600;
    }

    .no-sales {
      text-align: center;
      padding: 40px 20px;
      color: #7f8c8d;
    }

    @media (max-width: 1024px) {
      .sales-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SaleFormComponent implements OnInit {
  availableMedicines: Medicine[] = [];
  todaySales: Sale[] = [];
  selectedMedicineId: string = '';
  selectedMedicine: Medicine | null = null;
  quantity: number = 1;
  saleTotal: number = 0;
  todayRevenue: number = 0;
  processing: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private medicineService: MedicineService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
    this.loadTodaySales();
  }

  loadMedicines(): void {
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.availableMedicines = medicines.filter(m => m.quantity > 0);
      },
      error: (err) => console.error('Erreur chargement médicaments', err)
    });
  }

  loadTodaySales(): void {
    this.saleService.getTodaySales().subscribe({
      next: (sales) => {
        this.todaySales = sales.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.todayRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      },
      error: (err) => console.error('Erreur chargement ventes', err)
    });
  }

  onMedicineSelect(): void {
    const medicine = this.availableMedicines.find(
      m => m.id === Number(this.selectedMedicineId)
    );
    this.selectedMedicine = medicine || null;
    
    // Réinitialiser la quantité à 1 ou 0 selon la disponibilité
    if (this.selectedMedicine && this.selectedMedicine.quantity > 0) {
      this.quantity = 1;
    } else {
      this.quantity = 0;
    }
    
    this.calculateTotal();
    this.clearMessages();
  }

  calculateTotal(): void {
    if (this.selectedMedicine && this.quantity > 0) {
      this.saleTotal = this.selectedMedicine.price * this.quantity;
    } else {
      this.saleTotal = 0;
    }
  }

  processSale(): void {
    if (!this.selectedMedicine || this.quantity <= 0) {
      return;
    }

    if (this.quantity > this.selectedMedicine.quantity) {
      this.errorMessage = 'Stock insuffisant';
      return;
    }

    this.processing = true;
    this.clearMessages();

    // Créer la date du jour au format YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Format: 2025-10-16

    const sale: Sale = {
      medicineId: this.selectedMedicine.id!,
      medicineName: this.selectedMedicine.name,
      quantity: this.quantity,
      price: this.selectedMedicine.price,
      total: this.saleTotal,
      date: dateString  // Utiliser le format YYYY-MM-DD
    };

    // Enregistrer la vente
    this.saleService.addSale(sale).subscribe({
      next: () => {
        // Mettre à jour le stock
        const updatedMedicine: Medicine = {
          ...this.selectedMedicine!,
          quantity: this.selectedMedicine!.quantity - this.quantity
        };

        this.medicineService.updateMedicine(updatedMedicine.id!, updatedMedicine).subscribe({
          next: () => {
            this.successMessage = `Vente enregistrée avec succès! Total: ${this.saleTotal} FCFA`;
            this.processing = false;
            this.resetForm();
            this.loadMedicines();
            this.loadTodaySales();
            
            // Faire disparaître le message après 3 secondes
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (err) => {
            console.error('Erreur mise à jour stock', err);
            this.errorMessage = 'Erreur lors de la mise à jour du stock';
            this.processing = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur enregistrement vente', err);
        this.errorMessage = 'Erreur lors de l\'enregistrement de la vente';
        this.processing = false;
      }
    });
  }

  resetForm(): void {
    this.selectedMedicineId = '';
    this.selectedMedicine = null;
    this.quantity = 1;
    this.saleTotal = 0;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  formatSaleTime(dateString: string): string {
    // Si la date est au format YYYY-MM-DD, afficher "Aujourd'hui"
    if (dateString && dateString.length === 10) {
      return 'Aujourd\'hui';
    }
    // Si la date contient l'heure, l'extraire
    if (dateString && dateString.includes('T')) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return 'Aujourd\'hui';
  }
}