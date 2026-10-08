/** Money, number, date and period formatting. Every figure in the product goes through here. */

export const CURRENCY_SYMBOL = 'KSh ';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const qtyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
});

/** 1234567.5 -> "KSh 1,234,567.50". Negatives get an explicit minus sign. */
export function formatMoney(value: number, opts?: { symbol?: boolean; }): string {
  const showSymbol = opts?.symbol !== false;
  const sign = value < 0 ? '-' : '';
  const body = moneyFormatter.format(Math.abs(value));
  return `${sign}${showSymbol ? CURRENCY_SYMBOL : ''}${body}`;
}

/** For KPI tiles where the exact kobo is noise. */
export function formatMoneyCompact(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${CURRENCY_SYMBOL}${compactFormatter.format(Math.abs(value))}`;
}

export function formatQty(value: number): string {
  return qtyFormatter.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

/** Signed variance, always explicit about direction. */
export function formatVariance(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${CURRENCY_SYMBOL}${moneyFormatter.format(Math.abs(value))}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'];


/** "2026-09-14" -> "14 Sep 2026" */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/** "2026-09-14T09:41:00" -> "14 Sep 2026, 09:41" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${time}`;
}

/** "2026-09" -> "September 2026" */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const idx = Number(month) - 1;
  if (!MONTHS[idx]) return period;
  return `${MONTHS[idx]} ${year}`;
}

export function periodLabel(period: string, granularity: 'month' | 'quarter' | 'year'): string {
  const [year, month] = period.split('-');
  if (granularity === 'year') return `FY ${year}`;
  if (granularity === 'quarter') return `Q${Math.ceil(Number(month) / 3)} ${year}`;
  return formatPeriod(period);
}

export function monthOptions(year: number): { value: string; label: string; }[] {
  return MONTHS.map((m, i) => ({
    value: `${year}-${String(i + 1).padStart(2, '0')}`,
    label: `${m} ${year}`
  }));
}

/** Working days between two ISO dates, excluding weekends and the supplied holidays. */
export function workingDaysBetween(startIso: string, endIso: string, holidays: string[] = []): number {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    const iso = cursor.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !holidays.includes(iso)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = new Date('2026-09-14T17:00:00').getTime();
  const mins = Math.round((now - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso.slice(0, 10));
}

export function initials(name: string): string {
  return name.
    split(' ').
    filter(Boolean).
    slice(0, 2).
    map((part) => part[0]?.toUpperCase() ?? '').
    join('');
}