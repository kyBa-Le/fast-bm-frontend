export type TransactionType = 'EXPENSE' | 'INCOME';

export interface User {
  id: string;
  username: string;
  email?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  time?: string | null;
  description?: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  summary: TransactionSummary;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  currency?: string;
  date: string;
  time?: string;
  description?: string;
  category: string;
}

export interface AuthResponse {
  access_token: string;
  user_id?: string;
  username?: string;
  email?: string | null;
  user?: User;
}

