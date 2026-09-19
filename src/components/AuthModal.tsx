import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatFriendlyErrorMessage } from '../services/api';
import { X, Lock, User, Mail, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await register(username, password, email);
      }
      onClose();
    } catch (err: any) {
      setError(formatFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isLoginTab ? 'Đăng nhập FastBM' : 'Đăng ký tài khoản'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và ghi chép tài chính cá nhân
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${!isLoginTab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email phục hồi <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isLoginTab
                ? 'Đăng nhập vào FastBM'
                : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </div>
  );
};
