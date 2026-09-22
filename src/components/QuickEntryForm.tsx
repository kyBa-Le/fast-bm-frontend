import React, { useState, useRef, useEffect } from 'react';
import { TransactionType, CreateTransactionPayload } from '../types';
import {
  amountToVietnameseWords,
  formatVnd,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../utils/currency';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  Tag,
  Zap,
  Check,
  RotateCcw,
} from 'lucide-react';

interface QuickEntryFormProps {
  onSubmit: (payload: CreateTransactionPayload) => Promise<void>;
  isLoading?: boolean;
}

export const QuickEntryForm: React.FC<QuickEntryFormProps> = ({ onSubmit, isLoading }) => {
  // Form State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountInput, setAmountInput] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Focus Refs for Sequential Enter Navigation
  const typeContainerRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const hiddenDatePickerRef = useRef<HTMLInputElement>(null);
  const hiddenTimePickerRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Update default category when switching type
  useEffect(() => {
    if (type === 'EXPENSE') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type]);

  // Initial focus on amount input
  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  // Global Alt+C (Chi tiêu) and Alt+T (Thu nhập) shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setType('EXPENSE');
        amountInputRef.current?.focus();
      } else if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setType('INCOME');
        amountInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Always add .000 (thousand mode): typing 195 yields 195,000 VND
  const rawDigits = parseInt(amountInput.replace(/\D/g, ''), 10) || 0;
  const finalCalculatedAmount = rawDigits * 1000;
  const vietnameseWords = amountToVietnameseWords(finalCalculatedAmount);

  // Quick Amount Handlers (in thousands)
  const handleQuickAdd = (thousandUnits: number) => {
    const currentVal = parseInt(amountInput.replace(/\D/g, ''), 10) || 0;
    setAmountInput(String(currentVal + thousandUnits));
    amountInputRef.current?.focus();
  };

  const handleAppendZeroes = () => {
    if (!amountInput) return;
    setAmountInput((prev) => prev + '000');
    amountInputRef.current?.focus();
  };

  // Keyboard Navigation on Enter
  const handleKeyDown = (
    e: React.KeyboardEvent,
    currentField: 'type' | 'amount' | 'date' | 'time' | 'description' | 'category' | 'submit'
  ) => {
    // Ctrl+Enter or Cmd+Enter to immediately submit from any field
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (currentField === 'type') {
      // Space or Arrow keys toggle type
      if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setType((prev) => (prev === 'EXPENSE' ? 'INCOME' : 'EXPENSE'));
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      switch (currentField) {
        case 'type':
          amountInputRef.current?.focus();
          amountInputRef.current?.select();
          break;

        case 'amount':
          if (finalCalculatedAmount <= 0) {
            alert('Vui lòng nhập số tiền lớn hơn 0!');
            return;
          }
          dateInputRef.current?.focus();
          break;

        case 'date':
          timeInputRef.current?.focus();
          break;

        case 'time':
          descInputRef.current?.focus();
          break;

        case 'description':
          categorySelectRef.current?.focus();
          break;

        case 'category':
          submitButtonRef.current?.focus();
          break;

        case 'submit':
          handleSubmit();
          break;
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (finalCalculatedAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      amountInputRef.current?.focus();
      return;
    }

    try {
      await onSubmit({
        type,
        amount: finalCalculatedAmount,
        currency: 'VND',
        date,
        time: time || undefined,
        description: description.trim() || undefined,
        category,
      });

      // Show temporary celebratory feedback
      const formatted = formatVnd(finalCalculatedAmount);
      setSuccessMessage(`Đã ghi nhận ${type === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'}: ${formatted} - ${description.trim() || category}`);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Reset fields
      setAmountInput('');
      setDescription('');
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

      // Auto-refocus back to Amount input for non-stop rapid typing
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    } catch (err: any) {
      alert(`Lỗi khi lưu giao dịch: ${err.message}`);
    }
  };

  const handleReset = () => {
    setAmountInput('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory(type === 'EXPENSE' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    amountInputRef.current?.focus();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm hover:shadow-md transition">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              Nhập giao dịch mới
            </h3>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question 1: Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Hôm nay bạn muốn ghi nhận khoản gì?
          </label>

          <div
            ref={typeContainerRef}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, 'type')}
            className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {/* Chi tiêu Tab */}
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                amountInputRef.current?.focus();
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-1 ring-rose-600'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'
                }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>CHI TIÊU (Expense)</span>
            </button>

            {/* Thu nhập Tab */}
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                amountInputRef.current?.focus();
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-700'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>THU NHẬP (Income)</span>
            </button>
          </div>
        </div>

        {/* Question 2: Amount (Always + .000) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Số tiền là bao nhiêu?
          </label>

          {/* Amount Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              inputMode="numeric"
              ref={amountInputRef}
              value={amountInput ? Number(amountInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setAmountInput(clean);
              }}
              onKeyDown={(e) => handleKeyDown(e, 'amount')}
              placeholder="195"
              className="w-full text-2xl sm:text-3xl font-extrabold px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition tracking-tight pr-28"
            />

            {/* Always Visible .000 ₫ Suffix inside input */}
            <div className="absolute right-3.5 flex items-center">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-black text-sm sm:text-base tracking-wide border border-indigo-200">
                .000 ₫
              </div>
            </div>
          </div>

          {/* Quick Increment Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <button
              type="button"
              onClick={handleAppendZeroes}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold transition cursor-pointer"
            >
              +000
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(10)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              +10k
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(50)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              +50k
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(100)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              +100k
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(500)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              +500k
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(1000)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              +1tr
            </button>
          </div>

          {/* Real-time Calculated Value & Vietnamese Words Preview */}
          {finalCalculatedAmount > 0 && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-indigo-900 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-indigo-700">Giá trị thực tế:</span>
                <span className="text-sm font-extrabold text-indigo-950">
                  {formatVnd(finalCalculatedAmount)}
                </span>
              </div>
              <div className="italic text-indigo-700/90 truncate max-w-sm">
                🗣️ {vietnameseWords}
              </div>
            </div>
          )}
        </div>

        {/* Question 3: Time and Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Giao dịch phát sinh vào thời gian nào?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngày</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  ref={dateInputRef}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'date')}
                  placeholder="YYYY-MM-DD"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button
                  type="button"
                  onClick={() => hiddenDatePickerRef.current?.showPicker ? hiddenDatePickerRef.current.showPicker() : hiddenDatePickerRef.current?.click()}
                  className="absolute right-2.5 text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                  title="Chọn từ lịch"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  ref={hiddenDatePickerRef}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.value) setDate(e.target.value);
                  }}
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().slice(0, 10))}
                  className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer"
                >
                  [Hôm nay]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().slice(0, 10));
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                >
                  [Hôm qua]
                </button>
              </div>
            </div>

            {/* Time */}
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Giờ (tuỳ chọn)</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  ref={timeInputRef}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'time')}
                  placeholder="HH:mm"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button
                  type="button"
                  onClick={() => hiddenTimePickerRef.current?.showPicker ? hiddenTimePickerRef.current.showPicker() : hiddenTimePickerRef.current?.click()}
                  className="absolute right-2.5 text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                  title="Chọn giờ"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <input
                  type="time"
                  ref={hiddenTimePickerRef}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.value) setTime(e.target.value);
                  }}
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                  }}
                  className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer"
                >
                  [Bây giờ]
                </button>
                <button
                  type="button"
                  onClick={() => setTime('')}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                >
                  [Bỏ trống]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question 4: Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Nội dung cụ thể của khoản này là gì?
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              ref={descInputRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'description')}
              placeholder={
                type === 'EXPENSE'
                  ? 'Ví dụ: Ăn cơm, đổ xăng, mua nồi cơm điện...'
                  : 'Ví dụ: Tiền má cho, tiền lương, tiền thưởng...'
              }
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
        </div>

        {/* Question 5: Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Khoản này thuộc danh mục nào?
          </label>

          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              ref={categorySelectRef}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'category')}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer font-medium"
            >
              {(type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${category === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: Submit and Reset */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            ref={submitButtonRef}
            disabled={isLoading}
            onKeyDown={(e) => handleKeyDown(e, 'submit')}
            className={`flex-1 py-3.5 px-6 rounded-xl text-white font-extrabold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${type === 'EXPENSE'
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
          >
            <Check className="w-5 h-5" />
            <span>{isLoading ? 'Đang lưu...' : 'Lưu giao dịch'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Làm mới form"
            className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
