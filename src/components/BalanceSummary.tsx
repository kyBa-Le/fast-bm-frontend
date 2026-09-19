import React from 'react';
import { TransactionSummary } from '../types';
import { formatVnd } from '../utils/currency';
import { TrendingDown, TrendingUp, Wallet, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BalanceSummaryProps {
  summary: TransactionSummary;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary }) => {
  const isPositive = summary.balance >= 0;

  return (
    <div className="space-y-3 mb-6">
      {/* 1. HERO CARD: Số dư khả dụng (Much bigger, prominent, easy to see) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white border-2 border-indigo-200/90 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-700">
              Số dư khả dụng hiện tại
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 shadow-xs">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Large Focal Balance */}
        <div className={`text-4xl sm:text-5xl md:text-6xl font-black mt-3 sm:mt-4 tracking-tight ${isPositive ? 'text-indigo-950' : 'text-rose-600'
          }`}>
          {formatVnd(summary.balance)}
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-indigo-700/80 font-semibold">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Tổng số giao dịch: <strong className="text-indigo-950 font-bold">{summary.count}</strong></span>
        </div>
      </div>

      {/* 2 & 3. COMPACT COMPANION CARDS: Tổng thu nhập & Tổng chi tiêu (Noticeably smaller) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Total Income Card (Compact) */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Tổng thu nhập (+)
            </span>
            <div className="text-xl sm:text-2xl font-bold mt-1 tracking-tight text-emerald-700">
              {formatVnd(summary.totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-emerald-600 font-medium">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              <span>Nguồn thu đã ghi nhận</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-100/90 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expense Card (Compact) */}
        <div className="bg-gradient-to-br from-rose-50/70 via-orange-50/30 to-white border border-rose-200/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Tổng chi tiêu (-)
            </span>
            <div className="text-xl sm:text-2xl font-bold mt-1 tracking-tight text-rose-700">
              {formatVnd(summary.totalExpense)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-rose-600 font-medium">
              <ArrowDownRight className="w-3 h-3 text-rose-600" />
              <span>Khoản chi đã ghi nhận</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-100/90 text-rose-700">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
