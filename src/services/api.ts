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

export const PENDING_TRANSACTIONS_KEY = 'fastbm_pending_transactions';

export function getPendingTransactions(): any[] {
  const data = localStorage.getItem(PENDING_TRANSACTIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function savePendingTransactions(transactions: any[]): void {
  localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function clearPendingTransactions(): void {
  localStorage.removeItem(PENDING_TRANSACTIONS_KEY);
}

export function formatFriendlyErrorMessage(err: any): string {
  if (!err) return 'Không thể kết nối đến hệ thống. Vui lòng thử lại sau.';
  const rawMsg = (err.message || String(err)).toLowerCase();

  if (
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('networkerror') ||
    rawMsg.includes('econnrefused') ||
    rawMsg.includes('load failed') ||
    rawMsg.includes('offline')
  ) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng Internet.';
  }

  if (rawMsg.includes('invalid credentials') || rawMsg.includes('401') || rawMsg.includes('unauthorized')) {
    return 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  }

  if (rawMsg.includes('already exists') || rawMsg.includes('409') || rawMsg.includes('conflict')) {
    return 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên đăng nhập khác.';
  }

  if (
    rawMsg.includes('500') ||
    rawMsg.includes('502') ||
    rawMsg.includes('503') ||
    rawMsg.includes('504') ||
    rawMsg.includes('internal server error')
  ) {
    return 'Máy chủ đang trong quá trình khởi động hoặc bảo trì. Vui lòng đợi 30 giây rồi thử lại.';
  }

  if (rawMsg.includes('timeout')) {
    return 'Thời gian chờ kết nối quá lâu. Vui lòng thử lại sau giây lát.';
  }

  if (err.message && !err.message.includes('HTTP') && !err.message.includes('status:')) {
    return err.message;
  }

  return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng Internet.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    let message = errorBody.message;

    if (response.status === 401) {
      message = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
    } else if (response.status === 409) {
      message = 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.';
    } else if (response.status >= 500) {
      message = 'Máy chủ đang trong quá trình khởi động hoặc bảo trì. Vui lòng đợi 30 giây rồi thử lại.';
    } else if (!message) {
      message = 'Không thể hoàn tất yêu cầu lúc này. Vui lòng thử lại sau.';
    }

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

