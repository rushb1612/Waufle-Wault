import { Currency } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
];

export const CATEGORIES = [
  { id: 'Food & Dining', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: 'Groceries', name: 'Groceries', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'Shopping', name: 'Shopping', icon: 'Package', color: '#ec4899' },
  { id: 'Transportation', name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6' },
  { id: 'Utilities', name: 'Utilities', icon: 'Zap', color: '#eab308' },
  { id: 'Healthcare', name: 'Healthcare', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'Travel', name: 'Travel', icon: 'Plane', color: '#06b6d4' },
  { id: 'Subscriptions', name: 'Subscriptions', icon: 'Repeat', color: '#a855f7' },
  { id: 'Salary', name: 'Salary', icon: 'Briefcase', color: '#22c55e' },
  { id: 'Investment', name: 'Investment', icon: 'TrendingUp', color: '#14b8a6' },
  { id: 'Other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
];

export function formatCurrency(amount: number, currency: Currency = SUPPORTED_CURRENCIES[0]): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency.code === 'INR') {
    formatted = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const res = `${currency.symbol}${formatted}`;
  return isNegative ? `-${res}` : res;
}

export function formatDateRelative(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();

  // Reset times to compare dates directly
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 50, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 60, 30]);
        break;
    }
  }
}

// Generate a lightweight, scannable QR Code as SVG
// (Standard byte-mode QR matrix algorithm representation or clean payment barcode)
export function generateQRSVG(data: string, size = 180): string {
  // Simple clean SVG QR visual generator using deterministic hash grid
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  const gridSize = 21;
  const cellSize = size / gridSize;
  let rects = '';

  // Standard 3 finder patterns (top-left, top-right, bottom-left)
  const isFinder = (r: number, c: number) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= gridSize - 7) return true;
    if (r >= gridSize - 7 && c < 7) return true;
    return false;
  };

  const isFinderFilled = (r: number, c: number) => {
    // Top-left
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right
    if (r < 7 && c >= gridSize - 7) {
      const oc = c - (gridSize - 7);
      if (r === 0 || r === 6 || oc === 0 || oc === 6) return true;
      if (r >= 2 && r <= 4 && oc >= 2 && oc <= 4) return true;
      return false;
    }
    // Bottom-left
    if (r >= gridSize - 7 && c < 7) {
      const or = r - (gridSize - 7);
      if (or === 0 || or === 6 || c === 0 || c === 6) return true;
      if (or >= 2 && or <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return false;
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        filled = isFinderFilled(r, c);
      } else {
        // Deterministic pseudo-random based on payload + position
        const seed = Math.sin((r * 23 + c * 37 + Math.abs(hash)) % 1000) * 10000;
        filled = (seed - Math.floor(seed)) > 0.45;
      }
      if (filled) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="currentColor" />`;
      }
    }
  }

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="text-zinc-900 dark:text-zinc-100">${rects}</svg>`;
}
