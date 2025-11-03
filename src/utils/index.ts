import type { RangeType, DateRange } from '../types';

// Date and time utilities
export function pad(n: number): string {
  return n < 10 ? '0' + n : n.toString();
}

export function to12h(h: number, m: number = 0): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${pad(m)} ${ampm}`;
}

export function fmtTimeString24To12(s: string): string {
  if (!s) return s;
  const [h, m] = s.split(':').map(Number);
  return to12h(h, m);
}

export function fmtDate(d: Date | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fyRangeForDate(now: Date = new Date(), fyStartMonth: number = 4, fyStartDay: number = 1): DateRange {
  const fyStart = new Date(now.getFullYear(), fyStartMonth - 1, fyStartDay);
  const inThisFY = now >= fyStart;
  const start = inThisFY 
    ? fyStart 
    : new Date(now.getFullYear() - 1, fyStartMonth - 1, fyStartDay);
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + 1);
  end.setMilliseconds(-1);
  return { start, end };
}

export function computeRange(type: RangeType): DateRange {
  const now = new Date();
  
  if (type === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  if (type === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  if (type === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  
  if (type === 'fy') {
    return fyRangeForDate(now);
  }
  
  return { start: null, end: null };
}

export function inRange(dateLike: Date | string, start: Date | null, end: Date | null): boolean {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return (!start || d >= start) && (!end || d <= end);
}

// ID generation
export function generateId(): string {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return String(Date.now() + Math.floor(Math.random() * 1000));
}

// Staff schedule parsing
export function isWorkingDay(scheduleStr: string, dayAbbrev: string): { start: { h: number; m: number }; end: { h: number; m: number } } | null {
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (!scheduleStr || !scheduleStr.includes(' ')) return null;
  
  const parts = scheduleStr.split(' ');
  const days = parts[0];
  const times = parts[1];
  const [startStr, endStr] = (times || '').split('-');
  
  const start = parseAmPm(startStr || '9AM');
  const end = parseAmPm(endStr || '6PM');
  
  const [from, to] = days.split('-');
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  
  let activeDays: string[] = [];
  if (fromIdx > -1 && toIdx > -1) {
    activeDays = fromIdx <= toIdx 
      ? order.slice(fromIdx, toIdx + 1)
      : [...order.slice(fromIdx), ...order.slice(0, toIdx + 1)];
  }
  
  return activeDays.includes(dayAbbrev) ? { start, end } : null;
}

export function parseAmPm(s: string): { h: number; m: number } {
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return { h: 9, m: 0 };
  
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3].toUpperCase();
  
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  
  return { h, m: min };
}

// Class name utilities
export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Export new utilities
export * from './constants';
export * from './helpers';

// Form utilities
export function getServicePrice(service: string): number {
  const prices: { [key: string]: number } = {
    'Haircut': 300,
    'Beard Trim': 200,
    'Hair + Beard': 450,
    'Shave': 250,
    'Hair Color': 500,
  };
  return prices[service] || 0;
}

// Export utilities
export function exportToCsv(data: any[], filename: string): void {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Local storage utilities
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return defaultValue;
}

// Additional date/time formatting functions for appointments
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${minutes} ${ampm}`;
}