import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { BalanceSummary } from './components/BalanceSummary';
import { QuickEntryForm } from './components/QuickEntryForm';
import { TransactionList } from './components/TransactionList';
import { api } from './services/api';
import { Transaction, TransactionSummary, CreateTransactionPayload } from './types';
import { Lock, User, Mail, Zap, ArrowRight, AlertCircle, ShieldCheck, Smartphone, Database } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isAuthenticated, login, register, quickDemoLogin } = useAuth();
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

  const handleQuickLogin = async () => {
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      await quickDemoLogin();
    } catch (err: any) {
      setAuthError(err.message || 'Không thể đăng nhập vào tài khoản mẫu.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!isAuthenticated ? (
          /* Mandatory Login Gate Card */
          <div className="py-8 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đăng nhập bắt buộc trước khi sử dụng</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Chào mừng đến với FastBM
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm">
                Vui lòng đăng nhập để đảm bảo toàn bộ dữ liệu thu chi được lưu trữ an toàn và đồng bộ hai chiều với điện thoại Android.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
              {/* Quick Demo Login Preset Button */}
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isAuthSubmitting}
                className="w-full mb-5 flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 hover:border-emerald-300 transition group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      ⚡ Đăng nhập nhanh: dat_budget
                    </div>
                    <div className="text-[11px] text-emerald-700/80">
                      Đã có 49 bản ghi chi tiêu & thu nhập
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  hoặc tài khoản khác
                </span>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(true); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginTab(false); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${!isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
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
                      placeholder="e.g. dat_budget"
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
                  {isAuthSubmitting ? 'Đang kết nối...' : isLoginTab ? 'Đăng nhập vào tài khoản' : 'Đăng ký tài khoản'}
                </button>
              </form>
            </div>

            {/* Cloud Safety Features */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
                <Smartphone className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold block text-slate-800">Đồng bộ Android</span>
                Tự động 2 chiều
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
                <Database className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <span className="font-bold block text-slate-800">Đám mây Render</span>
                PostgreSQL an toàn
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="font-bold block text-slate-800">Bảo mật JWT</span>
                Không thất lạc dữ liệu
              </div>
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
        Fast Budget Manager &copy; 2026 — Built with Native Java Android, NestJS & ReactJS
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
