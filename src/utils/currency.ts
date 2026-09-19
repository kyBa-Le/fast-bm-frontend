export function formatVnd(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, isFirstGroup: boolean): string {
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const tens = Math.floor(remainder / 10);
  const units = remainder % 10;

  if (hundreds === 0 && tens === 0 && units === 0) {
    return '';
  }

  let result = '';

  if (!isFirstGroup || hundreds > 0) {
    result += DIGITS[hundreds] + ' trăm ';
  }

  if (tens > 1) {
    result += DIGITS[tens] + ' mươi ';
    if (units === 1) {
      result += 'mốt ';
    } else if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += DIGITS[units] + ' ';
    }
  } else if (tens === 1) {
    result += 'mười ';
    if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += DIGITS[units] + ' ';
    }
  } else {
    // tens === 0
    if (hundreds > 0 && units > 0) {
      result += 'lẻ ' + DIGITS[units] + ' ';
    } else if (hundreds === 0 && isFirstGroup && units > 0) {
      result += DIGITS[units] + ' ';
    }
  }

  return result.trim();
}

export function amountToVietnameseWords(amount: number): string {
  if (amount <= 0 || isNaN(amount)) return '';

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: number[] = [];

  let temp = Math.floor(amount);
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  if (groups.length === 0) return 'Không đồng';

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const grp = groups[i];
    if (grp > 0) {
      const isFirst = (i === groups.length - 1);
      const text = readThreeDigits(grp, isFirst);
      if (text) {
        words += text + (scales[i] ? ' ' + scales[i] : '') + ' ';
      }
    }
  }

  words = words.trim();
  if (!words) return 'Không đồng';

  // Capitalize first letter and append "đồng"
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng';
  return capitalized.replace(/\s+/g, ' ');
}

export const EXPENSE_CATEGORIES = [
  'Ăn uống',
  'Đi chợ / Thực phẩm',
  'Cà phê & Đồ uống',
  'Di chuyển',
  'Đồ dùng & Mua sắm',
  'Giao lưu / Bạn bè',
  'Cá nhân',
  'Thể thao',
  'Not remember',
];

export const INCOME_CATEGORIES = [
  'Không biết',
  'Trợ cấp gia đình',
  'Lương',
  'Thưởng',
  'Đầu tư',
  'Nhặt được',
  'Thu nhập khác',
];

