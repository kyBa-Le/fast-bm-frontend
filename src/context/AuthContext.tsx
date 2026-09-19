import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  api,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  removeStoredToken,
  removeStoredUser,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const extractUser = (res: any, fallbackUsername: string): User => {
    if (res.user && res.user.username) {
      return res.user;
    }
    return {
      id: res.user_id || res.id || '',
      username: res.username || fallbackUsername,
      email: res.email || null,
    };
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      const userData = extractUser(res, username);
      setStoredToken(res.access_token);
      setStoredUser(userData);
      setToken(res.access_token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(username, password, email);
      const userData = extractUser(res, username);
      setStoredToken(res.access_token);
      setStoredUser(userData);
      setToken(res.access_token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    await login('dat_budget', 'Dat@2026');
  };

  const logout = () => {
    removeStoredToken();
    removeStoredUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

