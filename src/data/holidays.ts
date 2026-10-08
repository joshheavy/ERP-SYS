import { createCollection } from '../core/store/createCollection';

/* ------------------------------------------------------------------ *
 * Holidays — the organisation's non-working days. Public holidays are
 * statutory (Kenya); company holidays are organisation-specific. These
 * feed leave day-counting and payroll working-day calculations.
 * ------------------------------------------------------------------ */

export type HolidayType = 'public' | 'company';

export interface Holiday {
  id: string;
  name: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  type: HolidayType;
  /** Recurs on the same calendar date every year (e.g. fixed public holidays). */
  recurring: boolean;
  notes: string;
}

export const HOLIDAY_TYPES: HolidayType[] = ['public', 'company'];
export const HOLIDAY_TYPE_LABEL: Record<HolidayType, string> = {
  public: 'Public',
  company: 'Company'
};

/** Kenyan public holidays for 2026 plus a couple of company days. */
const SEED_HOLIDAYS: Holiday[] = [
  { id: 'hol-0001', name: "New Year's Day", date: '2026-01-01', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0002', name: 'Good Friday', date: '2026-04-03', type: 'public', recurring: false, notes: 'Moves each year.' },
  { id: 'hol-0003', name: 'Easter Monday', date: '2026-04-06', type: 'public', recurring: false, notes: 'Moves each year.' },
  { id: 'hol-0004', name: 'Labour Day', date: '2026-05-01', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0005', name: 'Madaraka Day', date: '2026-06-01', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0006', name: 'Huduma Day', date: '2026-10-10', type: 'public', recurring: true, notes: 'Utamaduni / Huduma Day.' },
  { id: 'hol-0007', name: 'Mashujaa Day', date: '2026-10-20', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0008', name: 'Jamhuri Day', date: '2026-12-12', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0009', name: 'Christmas Day', date: '2026-12-25', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0010', name: 'Boxing Day', date: '2026-12-26', type: 'public', recurring: true, notes: '' },
  { id: 'hol-0011', name: 'Company anniversary', date: '2026-08-14', type: 'company', recurring: true, notes: 'Founders day — offices closed.' },
  { id: 'hol-0012', name: 'Year-end shutdown', date: '2026-12-31', type: 'company', recurring: false, notes: 'Half day; offices close at noon.' }
];

export const holidaysStore = createCollection<Holiday>('emtech.store.holidays.v1', SEED_HOLIDAYS, 'hol');
