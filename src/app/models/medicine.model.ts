// src/app/models/medicine.model.ts
export interface Medicine {
  id?: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  expirationDate: string;
  alertThreshold?: number;
}