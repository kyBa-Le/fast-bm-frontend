import { Transaction } from '../types';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // If the field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generates RFC-compliant CSV string with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function generateTransactionsCsv(transactions: Transaction[]): string {
  const headers = [
    'Mã giao dịch',
    'Ngày',
    'Giờ',
    'Loại giao dịch',
    'Số tiền (VND)',
    'Danh mục',
    'Mô tả / Ghi chú',
    'Tiền tệ',
    'Thời gian tạo',
  ];

  const headerLine = headers.map(escapeCsvField).join(',');

  const rows = transactions.map((t) => {
    const typeLabel = t.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu';
    return [
      escapeCsvField(t.id),
      escapeCsvField(t.date || ''),
      escapeCsvField(t.time || ''),
      escapeCsvField(typeLabel),
      escapeCsvField(t.amount),
      escapeCsvField(t.category || ''),
      escapeCsvField(t.description || ''),
      escapeCsvField(t.currency || 'VND'),
      escapeCsvField(t.created_at || ''),
    ].join(',');
  });

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Vietnamese characters properly
  return '\uFEFF' + [headerLine, ...rows].join('\r\n');
}

/**
 * Triggers a client-side download of all transactions as a CSV file.
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  customFilename?: string
): { success: boolean; count: number } {
  if (!transactions || transactions.length === 0) {
    return { success: false, count: 0 };
  }

  const csvContent = generateTransactionsCsv(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const filename = customFilename || `fastbm_lich_su_giao_dich_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: transactions.length };
}
