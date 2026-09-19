import {
  AuthResponse,
  CreateTransactionPayload,
  Transaction,
  TransactionsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://fast-bm-1-0-0.onrender.com';

export function getStoredToken(): string | null {
  return localStorage.getItem('fastbm_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('fastbm_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('fastbm_token');
}

export function getStoredUser(): any | null {
  const data = localStorage.getItem('fastbm_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  localStorage.setItem('fastbm_user', JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem('fastbm_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `Lỗi yêu cầu: ${response.status} ${response.statusText}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json();
}

export const api = {
  login: (username: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: (username: string, password: string, email?: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email: email || undefined }),
    });
  },

  getTransactions: (): Promise<TransactionsResponse> => {
    return request<TransactionsResponse>('/api/v1/transactions', {
      method: 'GET',
    });
  },

  createTransaction: (data: CreateTransactionPayload): Promise<Transaction> => {
    return request<Transaction>('/api/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTransaction: (id: string, data: Partial<CreateTransactionPayload>): Promise<Transaction> => {
    return request<Transaction>(`/api/v1/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTransaction: (id: string): Promise<{ success: boolean; id: string }> => {
    return request<{ success: boolean; id: string }>(`/api/v1/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

