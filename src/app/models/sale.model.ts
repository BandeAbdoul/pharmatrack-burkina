// src/app/models/sale.model.ts
export interface Sale {
  id?: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}
