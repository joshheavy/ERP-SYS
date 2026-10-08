'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDate, formatPeriod } from '../../utils/format';
import { Segmented } from './Tabs';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

const TRIGGER =
  'flex h-8 w-full items-center gap-2 rounded-control border border-line-strong bg-surface px-2.5 text-left text-body ' +
  'transition-[border-color,box-shadow] duration-fast ease-exit ' +
  'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-3';

export interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  label: string;
  min?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Dates rendered with a marker, e.g. public holidays. */
  markedDates?: string[];
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  min,
  disabled,
  invalid,
  markedDates = [],
  className
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const base = value ? new Date(`${value}T00:00:00`) : new Date('2026-09-14T00:00:00');
  const [cursor, setCursor] = useState({ year: base.getFullYear(), month: base.getMonth() });

  const first = new Date(cursor.year, cursor.month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    )];


  const shift = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(TRIGGER, invalid && 'border-danger')}>

        <CalendarIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
        <span className={cn('tabular truncate', value ? 'text-ink' : 'text-ink-subtle')}>
          {value ? formatDate(value) : 'Select date'}
        </span>
      </button>

      {open &&
        <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[248px] animate-pop-in rounded-control border border-line bg-surface p-2 shadow-pop">
          <div className="mb-1.5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shift(-1)}
              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-ink-muted hover:bg-surface-3 hover:text-ink">

              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-h4 text-ink">
              {MONTH_SHORT[cursor.month]} {cursor.year}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shift(1)}
              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-ink-muted hover:bg-surface-3 hover:text-ink">

              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) =>
              <span key={d} className="py-1 text-center text-caption font-medium text-ink-subtle">
                {d}
              </span>
            )}
            {cells.map((iso, i) => {
              if (!iso) return <span key={`pad-${i}`} />;
              const day = Number(iso.slice(-2));
              const weekend = [5, 6].includes((i % 7 + 7) % 7);
              const selected = iso === value;
              const marked = markedDates.includes(iso);
              const blocked = Boolean(min && iso < min);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={blocked}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    'tabular relative flex h-7 items-center justify-center rounded-[4px] text-small',
                    'transition-colors duration-fast ease-exit',
                    selected ?
                      'bg-primary font-semibold text-white' :
                      blocked ?
                        'cursor-not-allowed text-ink-subtle/50' :
                        weekend ?
                          'text-ink-subtle hover:bg-surface-3' :
                          'text-ink hover:bg-surface-3'
                  )}>

                  {day}
                  {marked && !selected &&
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-warning" aria-hidden />
                  }
                </button>);

            })}
          </div>
          {markedDates.length > 0 &&
            <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-caption text-ink-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden /> Public holiday
            </p>
          }
        </div>
      }
    </div>);

}

export type PeriodGranularity = 'month' | 'quarter' | 'year';

export interface PeriodPickerProps {
  value: string;
  granularity: PeriodGranularity;
  onChange: (period: string, granularity: PeriodGranularity) => void;
  label: string;
  /** Periods already closed cannot be selected again. */
  closedPeriods?: string[];
  disabled?: boolean;
  className?: string;
}

export function PeriodPicker({
  value,
  granularity,
  onChange,
  label,
  closedPeriods = [],
  disabled,
  className
}: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const [year, setYear] = useState(Number(value.slice(0, 4)));

  const display =
    granularity === 'year' ?
      `FY ${value.slice(0, 4)}` :
      granularity === 'quarter' ?
        `Q${Math.ceil(Number(value.slice(5, 7)) / 3)} ${value.slice(0, 4)}` :
        formatPeriod(value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={TRIGGER}>

        <CalendarIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
        <span className="tabular truncate text-ink">{display}</span>
      </button>

      {open &&
        <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[268px] animate-pop-in rounded-control border border-line bg-surface p-2.5 shadow-pop">
          <Segmented
            aria-label="Period granularity"
            className="mb-2.5 w-full"
            value={granularity}
            onChange={(g) => onChange(value, g as PeriodGranularity)}
            items={[
              { id: 'month', label: 'Month' },
              { id: 'quarter', label: 'Quarter' },
              { id: 'year', label: 'Fiscal year' }]
            } />

          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setYear((y) => y - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-ink-muted hover:bg-surface-3">

              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="tabular text-h4 text-ink">{year}</span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setYear((y) => y + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-[4px] text-ink-muted hover:bg-surface-3">

              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {granularity === 'year' ?
            <button
              type="button"
              onClick={() => {
                onChange(`${year}-01`, 'year');
                setOpen(false);
              }}
              className="w-full rounded-[4px] bg-surface-3 py-2 text-body font-medium text-ink hover:bg-line">

              Select FY {year}
            </button> :

            <div className={cn('grid gap-1', granularity === 'quarter' ? 'grid-cols-2' : 'grid-cols-3')}>
              {(granularity === 'quarter' ?
                [1, 4, 7, 10].map((m) => ({ m, label: `Q${Math.ceil(m / 3)}` })) :
                MONTH_SHORT.map((label, i) => ({ m: i + 1, label }))).
                map(({ m, label: cellLabel }) => {
                  const period = `${year}-${String(m).padStart(2, '0')}`;
                  const closed = closedPeriods.includes(period);
                  const selected = period === value;
                  return (
                    <button
                      key={period}
                      type="button"
                      disabled={closed}
                      title={closed ? 'Period closed' : undefined}
                      onClick={() => {
                        onChange(period, granularity);
                        setOpen(false);
                      }}
                      className={cn(
                        'rounded-[4px] py-1.5 text-small',
                        selected ?
                          'bg-primary font-semibold text-white' :
                          closed ?
                            'cursor-not-allowed bg-surface-3 text-ink-subtle line-through' :
                            'text-ink hover:bg-surface-3'
                      )}>

                      {cellLabel}
                    </button>);

                })}
            </div>
          }
          {closedPeriods.length > 0 && granularity === 'month' &&
            <p className="mt-2 border-t border-line pt-2 text-caption text-ink-subtle">
              Struck-through periods are closed and locked for posting.
            </p>
          }
        </div>
      }
    </div>);

}