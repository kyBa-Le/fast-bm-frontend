import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User as UserIcon, Zap, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();

  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                FastBM Web
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Single-Page Entry
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Quản lý tài chính cá nhân siêu tốc
            </p>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-500">Tài khoản:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-slate-500" />
                  {user.username}
                </span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={quickDemoLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thử nhanh dat_budget</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
