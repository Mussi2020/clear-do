import { DateFilterRange } from '../types';

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getTodayStr(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a YYYY-MM-DD date string and return new YYYY-MM-DD string
 */
export function addDaysToDateStr(baseDateStr: string, daysToAdd: number): string {
  const parts = baseDateStr.split('-');
  if (parts.length !== 3) return baseDateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into human readable format, e.g. "7月26日 周日"
 */
export function formatDateHuman(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const todayStr = getTodayStr();
  const yesterdayStr = getTodayStr(-1);
  const tomorrowStr = getTodayStr(1);

  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';
  if (dateStr === tomorrowStr) return '明天';

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayOfWeek = days[d.getDay()];
  
  return `${Number(parts[1])}月${Number(parts[2])}日 ${dayOfWeek}`;
}

/**
 * Check if a date string YYYY-MM-DD is strictly before today
 */
export function isBeforeDate(dateStr: string, compareDateStr: string): boolean {
  return dateStr < compareDateStr;
}

/**
 * Calculate distance in days between two YYYY-MM-DD strings
 */
export function daysBetween(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns date range boundaries [startDate, endDate] in YYYY-MM-DD format for report filters
 */
export function getDateRangeBoundaries(range: DateFilterRange, customStart?: string, customEnd?: string): [string, string] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (range) {
    case 'today': {
      const todayStr = format(today);
      return [todayStr, todayStr];
    }
    case 'this_week': {
      // Assuming Monday is start of week
      const currentDay = today.getDay(); // 0 is Sunday
      const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distanceToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [format(monday), format(sunday)];
    }
    case 'this_month': {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return [format(firstDay), format(lastDay)];
    }
    case 'this_quarter': {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      const firstDay = new Date(year, quarterStartMonth, 1);
      const lastDay = new Date(year, quarterStartMonth + 3, 0);
      return [format(firstDay), format(lastDay)];
    }
    case 'this_year': {
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);
      return [format(firstDay), format(lastDay)];
    }
    case 'custom': {
      return [customStart || '2000-01-01', customEnd || '2099-12-31'];
    }
    case 'all':
    default:
      return ['2000-01-01', '2099-12-31'];
  }
}
