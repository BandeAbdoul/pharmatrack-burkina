// src/app/models/user.model.ts
export interface User {
  id?: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}