// src/app/components/medicines/medicine-list/medicine-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../../services/medicine.service';
import { AuthService } from '../../../services/auth.service';
import { Medicine } from '../../../models/medicine.model';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medicines-container">
      <div class="header">
        <h1>Gestion des Médicaments</h1>
        <button class="btn-add" (click)="showAddForm = true" *ngIf="isAdmin">
          ➕ Ajouter un médicament
        </button>
      </div>

      <!-- Recherche rapide (Template-driven) -->
      <div class="search-box">
        <input 
          type="text" 
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterMedicines()"
          placeholder="🔍 Rechercher un médicament..."
          class="search-input"
        >
      </div>

      <!-- Formulaire d'ajout/modification -->
      <div class="modal" *ngIf="showAddForm" (click)="closeModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingMedicine ? 'Modifier' : 'Ajouter' }} un médicament</h2>
            <button class="btn-close" (click)="cancelForm()">✕</button>
          </div>
          <form (ngSubmit)="saveMedicine()" #medicineForm="ngForm">
            <div class="form-group">
              <label>Nom du médicament *</label>
              <input 
                type="text" 
                [(ngModel)]="currentMedicine.name"
                name="name"
                required
                class="form-control"
                placeholder="Ex: Paracétamol"
              >
            </div>

            <div class="form-group">
              <label>Catégorie *</label>
              <select 
                [(ngModel)]="currentMedicine.category"
                name="category"
                required
                class="form-control"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Analgésique">Analgésique</option>
                <option value="Antibiotique">Antibiotique</option>
                <option value="Antipaludique">Antipaludique</option>
                <option value="Antiseptique">Antiseptique</option>
                <option value="Vitamines">Vitamines</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Prix (FCFA) *</label>
                <input 
                  type="number" 
                  [(ngModel)]="currentMedicine.price"
                  name="price"
                  required
                  min="0"
                  class="form-control"
                  placeholder="0"
                >
              </div>

              <div class="form-group">
                <label>Quantité *</label>
                <input 
                  type="number" 
                  [(ngModel)]="currentMedicine.quantity"
                  name="quantity"
                  required
                  min="0"
                  class="form-control"
                  placeholder="0"
                >
              </div>
            </div>

            <div class="form-group">
              <label>Date d'expiration *</label>
              <input 
                type="date" 
                [(ngModel)]="currentMedicine.expirationDate"
                name="expirationDate"
                required
                class="form-control"
              >
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="cancelForm()">
                Annuler
              </button>
              <button type="submit" class="btn-save" [disabled]="!medicineForm.valid">
                {{ editingMedicine ? 'Modifier' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Liste des médicaments -->
      <div class="medicines-grid" *ngIf="filteredMedicines.length > 0">
        <div 
          class="medicine-card" 
          *ngFor="let medicine of filteredMedicines"
          [class.low-stock]="medicine.quantity < 10"
        >
          <div class="card-header">
            <h3>{{ medicine.name }}</h3>
            <span class="category-badge">{{ medicine.category }}</span>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">Prix:</span>
              <span class="value">{{ medicine.price }} FCFA</span>
            </div>
            <div class="info-row">
              <span class="label">Stock:</span>
              <span class="value" [class.alert-text]="medicine.quantity < 10">
                {{ medicine.quantity }} unités
              </span>
            </div>
            <div class="info-row">
              <span class="label">Expiration:</span>
              <span class="value">{{ medicine.expirationDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <div class="card-footer" *ngIf="isAdmin">
            <button class="btn-edit" (click)="editMedicine(medicine)">
              ✏️ Modifier
            </button>
            <button class="btn-delete" (click)="deleteMedicine(medicine.id!)">
              🗑️ Supprimer
            </button>
          </div>

          <div class="alert-badge" *ngIf="medicine.quantity < 10">
            ⚠️ Stock faible
          </div>
        </div>
      </div>

      <div class="no-results" *ngIf="filteredMedicines.length === 0">
        <p>Aucun médicament trouvé</p>
      </div>
    </div>
  `,
  styles: [`
    .medicines-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 28px;
    }

    .btn-add {
      background: #27ae60;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-add:hover {
      background: #229954;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }

    .search-box {
      margin-bottom: 30px;
    }

    .search-input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .medicines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .medicine-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
      position: relative;
      border: 2px solid transparent;
    }

    .medicine-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .medicine-card.low-stock {
      border-color: #e74c3c;
      background: #fff5f5;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      gap: 10px;
    }

    .card-header h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 18px;
      flex: 1;
    }

    .category-badge {
      background: #3498db;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .card-body {
      margin-bottom: 15px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #7f8c8d;
      font-size: 14px;
    }

    .value {
      color: #2c3e50;
      font-weight: 600;
      font-size: 14px;
    }

    .alert-text {
      color: #e74c3c;
    }

    .card-footer {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .btn-edit, .btn-delete {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #3498db;
      color: white;
    }

    .btn-edit:hover {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .alert-badge {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #e74c3c;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 22px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #f0f0f0;
      color: #2c3e50;
    }

    form {
      padding: 20px;
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
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 25px;
    }

    .btn-cancel, .btn-save {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-cancel:hover {
      background: #bdc3c7;
    }

    .btn-save {
      background: #27ae60;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #229954;
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #7f8c8d;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .medicines-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MedicineListComponent implements OnInit {
  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  searchTerm: string = '';
  showAddForm: boolean = false;
  editingMedicine: Medicine | null = null;
  isAdmin: boolean = false;

  currentMedicine: Medicine = {
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    expirationDate: ''
  };

  constructor(
    private medicineService: MedicineService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.filteredMedicines = medicines;
      },
      error: (err) => console.error('Erreur chargement médicaments', err)
    });
  }

  filterMedicines(): void {
    if (!this.searchTerm) {
      this.filteredMedicines = this.medicines;
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredMedicines = this.medicines.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.category.toLowerCase().includes(search)
    );
  }

  editMedicine(medicine: Medicine): void {
    this.editingMedicine = medicine;
    this.currentMedicine = { ...medicine };
    this.showAddForm = true;
  }

  saveMedicine(): void {
    if (this.editingMedicine && this.editingMedicine.id) {
      this.medicineService.updateMedicine(this.editingMedicine.id, this.currentMedicine)
        .subscribe({
          next: () => {
            this.loadMedicines();
            this.cancelForm();
          },
          error: (err) => console.error('Erreur modification', err)
        });
    } else {
      this.medicineService.addMedicine(this.currentMedicine).subscribe({
        next: () => {
          this.loadMedicines();
          this.cancelForm();
        },
        error: (err) => console.error('Erreur ajout', err)
      });
    }
  }

  deleteMedicine(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      this.medicineService.deleteMedicine(id).subscribe({
        next: () => this.loadMedicines(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingMedicine = null;
    this.currentMedicine = {
      name: '',
      category: '',
      price: 0,
      quantity: 0,
      expirationDate: ''
    };
  }

  closeModal(event: MouseEvent): void {
    this.cancelForm();
  }
}