import React from 'react';
import { TransactionSummary } from '../types';
import { formatVnd } from '../utils/currency';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface BalanceSummaryProps {
  summary: TransactionSummary;
  availableMonths?: string[];
  selectedPeriod?: string;
  onSelectPeriod?: (period: string) => void;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  summary,
  availableMonths = [],
  selectedPeriod = 'CURRENT_MONTH',
  onSelectPeriod,
}) => {
  const isPositive = summary.balance >= 0;
  const isCurrentMonth = selectedPeriod === 'CURRENT_MONTH';

  // Format month for display (e.g. '2026-10' -> 'Tháng 10/2026')
  const formatMonthLabel = (m: string) => {
    const parts = m.split('-');
    if (parts.length === 2) {
      return `Tháng ${parts[1]}/${parts[0]}`;
    }
    return m;
  };

  return (
    <div className="space-y-3 mb-6">
      {/* 1. HERO CARD: Số dư khả dụng */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white border-2 border-indigo-200/90 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-700">
              {summary.periodLabel ? `Số dư khả dụng — ${summary.periodLabel}` : 'Số dư khả dụng hiện tại'}
            </span>
          </div>

          {/* Period Selector / Switcher */}
          {onSelectPeriod && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="relative inline-flex items-center">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => onSelectPeriod(e.target.value)}
                  className="pl-8 pr-7 py-1.5 bg-white/90 hover:bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-900 font-semibold text-xs rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition appearance-none"
                >
                  <option value="CURRENT_MONTH">Tháng này (Mặc định - Đồng bộ Mobile)</option>
                  <option value="ALL">Toàn bộ thời gian (Tất cả)</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthLabel(m)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500 absolute right-2 pointer-events-none" />
              </div>

              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-xs hidden sm:flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Large Focal Balance */}
        <div
          className={`text-4xl sm:text-5xl md:text-6xl font-black mt-3 sm:mt-4 tracking-tight ${
            isPositive ? 'text-indigo-950' : 'text-rose-600'
          }`}
        >
          {formatVnd(summary.balance)}
        </div>

        {/* Balance Metadata & Parity Indicator */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-indigo-700/80 font-semibold">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>
              Số giao dịch kỳ này: <strong className="text-indigo-950 font-bold">{summary.count}</strong>
            </span>
          </div>

          {isCurrentMonth && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>Khớp số dư với ứng dụng Android</span>
            </div>
          )}
        </div>
      </div>

      {/* 2 & 3. COMPACT COMPANION CARDS: Tổng thu nhập & Tổng chi tiêu */}
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
