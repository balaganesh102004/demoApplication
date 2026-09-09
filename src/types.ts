// Common types used throughout the application

export type Theme = 'light' | 'dark' | 'system';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  persistent?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface TableRow {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  department: string;
  date?: string;
  amount?: number;
  createdAt?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  difficulty: 'easy' | 'medium' | 'hard';
  controls: string[];
}
