import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Top Left: Logo & Brand + Logged-in Username */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                FastBM
              </span>
              {isAuthenticated && user && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.username}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isAuthenticated && user
                ? `Xin chào, ${user.username} • Đã kết nối đám mây`
                : 'Quản lý tài chính cá nhân siêu tốc'}
            </p>
          </div>
        </div>

        {/* Top Right: Logout (when authenticated) or Login (when unauthenticated) */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={logout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
