import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { BalanceSummary } from './components/BalanceSummary';
import { QuickEntryForm } from './components/QuickEntryForm';
import { TransactionList } from './components/TransactionList';
import { api } from './services/api';
import { Transaction, TransactionSummary, CreateTransactionPayload } from './types';
import { Lock, User, Mail, AlertCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isAuthenticated, login, register } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth gate state for unauthenticated view
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions);
      setSummary(res.summary);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTransaction = async (payload: CreateTransactionPayload) => {
    setIsSaving(true);
    try {
      const newTx = await api.createTransaction(payload);
      setTransactions((prev) => [newTx, ...prev]);
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTransaction = async (id: string, payload: Partial<CreateTransactionPayload>) => {
    try {
      const updated = await api.updateTransaction(id, payload);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      await loadData();
    } catch (err: any) {
      alert(`Không thể cập nhật giao dịch: ${err.message}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await loadData();
    } catch (err: any) {
      alert(`Không thể xoá giao dịch: ${err.message}`);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await register(username, password, email);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!isAuthenticated ? (
          /* Clean, Minimalist Login Gate Card */
          <div className="py-12 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Đăng nhập tài khoản
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm">
                Vui lòng đăng nhập để bắt đầu quản lý và ghi chép tài chính của bạn.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(true); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(false); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    !isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng ký mới
                </button>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                {!isLoginTab && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email khôi phục (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isAuthSubmitting ? 'Đang xử lý...' : isLoginTab ? 'Đăng nhập' : 'Tạo tài khoản'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div>
            {/* Balance Overview Cards (Distinct 3 Colors) */}
            <BalanceSummary summary={summary} />

            {/* 2-Column Responsive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Unified Single-Page Quick Entry Form */}
              <div className="lg:col-span-5 sticky top-20">
                <QuickEntryForm onSubmit={handleCreateTransaction} isLoading={isSaving} />
              </div>

              {/* Right Column: Real-time Transaction Ledger & Filter */}
              <div className="lg:col-span-7">
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                  onUpdate={handleUpdateTransaction}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 mt-12 text-center text-xs text-slate-500">
        Fast Budget Manager &copy; 2026
      </footer>

      {/* Optional Auth Modal (can be triggered from navbar if needed) */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
