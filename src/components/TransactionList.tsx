import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CreateTransactionPayload } from '../types';
import { formatVnd } from '../utils/currency';
import { TransactionDetailModal } from './TransactionDetailModal';
import {
  Search,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Inbox,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CreateTransactionPayload>) => Promise<void>;
  isLoading?: boolean;
}

interface DateGroup {
  date: string;
  items: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onUpdate,
  isLoading,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchDate = t.date?.includes(q);
        if (!matchDesc && !matchCat && !matchDate) return false;
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, DateGroup>();

    for (const tx of filtered) {
      const dateKey = tx.date || 'Không rõ ngày';
      if (!map.has(dateKey)) {
        map.set(dateKey, {
          date: dateKey,
          items: [],
          totalIncome: 0,
          totalExpense: 0,
        });
      }
      const group = map.get(dateKey)!;
      group.items.push(tx);
      if (tx.type === 'INCOME') {
        group.totalIncome += tx.amount;
      } else {
        group.totalExpense += tx.amount;
      }
    }

    // Sort date groups descending (newest date first)
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  // Helper for friendly date label
  const getFriendlyDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);

    if (dateStr === today) return 'Hôm nay';
    if (dateStr === yesterday) return 'Hôm qua';
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm hover:shadow-md transition">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <span>Lịch sử giao dịch</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
              {filtered.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Giao dịch được tự động gom nhóm theo từng ngày
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Thu nhập
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm theo nội dung, danh mục hoặc ngày (vd: xe khách, 2026-09-05)..."
          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Transactions List Grouped by Date */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Đang tải dữ liệu giao dịch...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
          <Inbox className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Chưa có giao dịch nào phù hợp</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Nhập thông tin ở bảng bên trái để tạo bản ghi đầu tiên
          </p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[620px] overflow-y-auto pr-1">
          {groupedByDate.map((group) => {
            const friendly = getFriendlyDateLabel(group.date);
            return (
              <div key={group.date} className="space-y-2">
                {/* Date Group Header Component */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-slate-900">{group.date}</span>
                    {friendly && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-[10px]">
                        {friendly}
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px]">
                      ({group.items.length} giao dịch)
                    </span>
                  </div>

                  {/* Daily Subtotal Summary */}
                  <div className="flex items-center gap-2.5 font-semibold text-[11px]">
                    {group.totalExpense > 0 && (
                      <span className="text-rose-600">
                        -{formatVnd(group.totalExpense)}
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-emerald-600">
                        +{formatVnd(group.totalIncome)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in this Date Group */}
                <div className="space-y-2 pl-1 sm:pl-2">
                  {group.items.map((tx) => {
                    const isExpense = tx.type === 'EXPENSE';
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/60 hover:bg-slate-100/90 border border-slate-200/80 hover:border-slate-300 transition group cursor-pointer shadow-2xs"
                      >
                        {/* Left: Icon & Description */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isExpense
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isExpense ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition">
                              {tx.description || (
                                <span className="text-slate-400 font-normal italic">
                                  Không có mô tả
                                </span>
                              )}
                            </div>
                            <div className="flex items-center flex-wrap gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs">
                                {tx.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {tx.date}
                              </span>
                              {tx.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {tx.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Formatted Amount & Chevron */}
                        <div className="flex items-center gap-2.5 shrink-0 ml-3">
                          <div
                            className={`font-extrabold text-sm sm:text-base tracking-tight text-right ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatVnd(tx.amount)}
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail & Edit Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </div>
  );
};
