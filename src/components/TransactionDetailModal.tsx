import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, CreateTransactionPayload } from '../types';
import {
  formatVnd,
  amountToVietnameseWords,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../utils/currency';
import {
  X,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Tag,
  FileText,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CreateTransactionPayload>) => Promise<void>;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDelete,
  onUpdate,
}) => {
  if (!transaction) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state (amount in thousands unit: 195000 -> 195)
  const [editType, setEditType] = useState<TransactionType>(transaction.type);
  const [editAmountRaw, setEditAmountRaw] = useState<string>(
    String(Math.round(transaction.amount / 1000))
  );
  const [editDate, setEditDate] = useState<string>(transaction.date);
  const [editTime, setEditTime] = useState<string>(transaction.time || '');
  const [editDesc, setEditDesc] = useState<string>(transaction.description || '');
  const [editCat, setEditCat] = useState<string>(transaction.category);

  const hiddenModalDatePickerRef = useRef<HTMLInputElement>(null);
  const hiddenModalTimePickerRef = useRef<HTMLInputElement>(null);

  const isExpense = (isEditing ? editType : transaction.type) === 'EXPENSE';

  // Calculate live value during editing
  const parsedEditNumber = parseInt(editAmountRaw.replace(/\D/g, ''), 10) || 0;
  const calculatedEditAmount = parsedEditNumber * 1000;
  const editWords = amountToVietnameseWords(calculatedEditAmount);

  const handleDelete = async () => {
    const label = transaction.description || 'khoản này';
    if (!window.confirm(`Bạn có chắc chắn muốn xoá ${label}?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedEditAmount <= 0) {
      alert('Vui lòng nhập số tiền lớn hơn 0!');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(transaction.id, {
        type: editType,
        amount: calculatedEditAmount,
        date: editDate,
        time: editTime || undefined,
        description: editDesc.trim() || undefined,
        category: editCat,
      });
      setIsEditing(false);
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi cập nhật giao dịch: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-900 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isEditing ? (
          /* VIEW DETAIL MODE */
          <div className="space-y-5">
            {/* Header: Type Badge & Amount */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 shadow-2xs">
                {isExpense ? (
                  <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    Chi tiêu
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Thu nhập
                  </span>
                )}
              </div>

              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${isExpense ? 'text-rose-600' : 'text-emerald-600'
                  }`}
              >
                {isExpense ? '-' : '+'}
                {formatVnd(transaction.amount)}
              </div>

              <div className="text-xs text-slate-500 italic mt-1 max-w-sm mx-auto">
                🗣️ {amountToVietnameseWords(transaction.amount)}
              </div>
            </div>

            {/* Detail Grid */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-sm">
              {/* Description */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Nội dung
                </span>
                <span className="font-bold text-slate-900 text-right">
                  {transaction.description || (
                    <span className="text-slate-400 font-normal italic">Không có mô tả</span>
                  )}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Danh mục
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold text-xs shadow-2xs">
                  {transaction.category}
                </span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ngày thực hiện
                </span>
                <span className="font-semibold text-slate-800">
                  {transaction.date}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Giờ thực hiện
                </span>
                <span className="font-semibold text-slate-800">
                  {transaction.time || (
                    <span className="text-slate-400 font-normal italic">Không có</span>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons in Detail Modal */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xoá</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* EDIT MODE INSIDE MODAL */
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Chỉnh sửa giao dịch
            </h3>

            {/* Type Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Loại giao dịch
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditType('EXPENSE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${editType === 'EXPENSE'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
                    }`}
                >
                  CHI TIÊU
                </button>
                <button
                  type="button"
                  onClick={() => setEditType('INCOME')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${editType === 'INCOME'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                    }`}
                >
                  THU NHẬP
                </button>
              </div>
            </div>

            {/* Amount Input with .000 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số tiền (.000 ₫)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={editAmountRaw ? Number(editAmountRaw.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                  onChange={(e) => setEditAmountRaw(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-lg font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 pr-24"
                />
                <div className="absolute right-3 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-xs border border-indigo-200">
                  .000 ₫
                </div>
              </div>
              {calculatedEditAmount > 0 && (
                <div className="text-[11px] text-indigo-700 font-semibold mt-1">
                  = {formatVnd(calculatedEditAmount)} ({editWords})
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => hiddenModalDatePickerRef.current?.showPicker ? hiddenModalDatePickerRef.current.showPicker() : hiddenModalDatePickerRef.current?.click()}
                    className="absolute right-2 text-slate-400 hover:text-indigo-600 p-1 cursor-pointer transition"
                    title="Chọn ngày"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="date"
                    ref={hiddenModalDatePickerRef}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.value) setEditDate(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giờ
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="HH:mm"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => hiddenModalTimePickerRef.current?.showPicker ? hiddenModalTimePickerRef.current.showPicker() : hiddenModalTimePickerRef.current?.click()}
                    className="absolute right-2 text-slate-400 hover:text-indigo-600 p-1 cursor-pointer transition"
                    title="Chọn giờ"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="time"
                    ref={hiddenModalTimePickerRef}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.value) setEditTime(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung / Ghi chú
              </label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Nội dung khoản chi/thu"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={editCat}
                onChange={(e) => setEditCat(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
              >
                {(editType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Action Buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                Huỷ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
