import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User as UserIcon, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Top Left: Logo & Brand + Clickable Username Badge */}
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
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(true)}
                    title="Nhấn để xem thông tin tài khoản và đăng xuất"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user.username}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isAuthenticated && user
                  ? `Xin chào, ${user.username} • Đã kết nối đám mây`
                  : 'Quản lý tài chính cá nhân siêu tốc'}
              </p>
            </div>
          </div>

          {/* Top Right: User Profile trigger or Login */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                title="Tài khoản"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
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

      {/* User Account Modal (Contains Logout button) */}
      {isUserModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            {/* Close button */}
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-5 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-emerald-500/20 mb-3">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">{user.username}</h3>
              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tài khoản đồng bộ đám mây</span>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5 mb-6 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Tên đăng nhập:</span>
                <span className="font-bold text-slate-900">{user.username}</span>
              </div>
              {user.email && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Email:</span>
                  <span className="font-bold text-slate-900">{user.email}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Trạng thái:</span>
                <span className="font-semibold text-emerald-600">✓ Đang hoạt động</span>
              </div>
            </div>

            {/* Logout Action inside Modal */}
            <button
              type="button"
              onClick={() => {
                setIsUserModalOpen(false);
                logout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
