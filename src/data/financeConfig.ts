import { createCollection } from '../core/store/createCollection';

/* ------------------------------------------------------------------ *
 * Fiscal periods — the accounting calendar. Postings are only allowed
 * into an open period; closing a period locks it.
 * ------------------------------------------------------------------ */
export type PeriodStatus = 'open' | 'closed' | 'future';

export interface FiscalPeriod {
  id: string;
  code: string;        // e.g. '2026-07'
  name: string;        // e.g. 'July 2026'
  startDate: string;
  endDate: string;
  status: PeriodStatus;
}

// Kenya government fiscal year starts in July.
const SEED_PERIODS: FiscalPeriod[] = [
  { id: 'fp-2026-07', code: '2026-07', name: 'July 2026', startDate: '2026-07-01', endDate: '2026-07-31', status: 'closed' },
  { id: 'fp-2026-08', code: '2026-08', name: 'August 2026', startDate: '2026-08-01', endDate: '2026-08-31', status: 'closed' },
  { id: 'fp-2026-09', code: '2026-09', name: 'September 2026', startDate: '2026-09-01', endDate: '2026-09-30', status: 'open' },
  { id: 'fp-2026-10', code: '2026-10', name: 'October 2026', startDate: '2026-10-01', endDate: '2026-10-31', status: 'future' },
  { id: 'fp-2026-11', code: '2026-11', name: 'November 2026', startDate: '2026-11-01', endDate: '2026-11-30', status: 'future' },
  { id: 'fp-2026-12', code: '2026-12', name: 'December 2026', startDate: '2026-12-01', endDate: '2026-12-31', status: 'future' }
];

export const fiscalPeriodsStore = createCollection<FiscalPeriod>('emtech.store.periods.v1', SEED_PERIODS, 'fp');

/* ------------------------------------------------------------------ *
 * Currencies — base is KES; others carry an FX rate to KES.
 * ------------------------------------------------------------------ */
export interface Currency {
  id: string;
  code: string;
  name: string;
  /** How many KES one unit of this currency is worth. Base (KES) = 1. */
  rateToKES: number;
  base: boolean;
  active: boolean;
}

const SEED_CURRENCIES: Currency[] = [
  { id: 'cur-kes', code: 'KES', name: 'Kenyan Shilling', rateToKES: 1, base: true, active: true },
  { id: 'cur-usd', code: 'USD', name: 'US Dollar', rateToKES: 129.5, base: false, active: true },
  { id: 'cur-eur', code: 'EUR', name: 'Euro', rateToKES: 140.2, base: false, active: true },
  { id: 'cur-gbp', code: 'GBP', name: 'Pound Sterling', rateToKES: 164.8, base: false, active: true },
  { id: 'cur-ugx', code: 'UGX', name: 'Ugandan Shilling', rateToKES: 0.035, base: false, active: true },
  { id: 'cur-tzs', code: 'TZS', name: 'Tanzanian Shilling', rateToKES: 0.05, base: false, active: false }
];

export const currenciesStore = createCollection<Currency>('emtech.store.currencies.v1', SEED_CURRENCIES, 'cur');

/* ------------------------------------------------------------------ *
 * Tax rates — Kenyan statutory taxes used across finance & payroll.
 * ------------------------------------------------------------------ */
export type TaxType = 'VAT' | 'WHT' | 'PAYE' | 'Excise';

export interface TaxRate {
  id: string;
  code: string;
  name: string;
  type: TaxType;
  /** Percentage rate, e.g. 16 for 16%. */
  rate: number;
  active: boolean;
}

const SEED_TAX: TaxRate[] = [
  { id: 'tax-vat16', code: 'VAT16', name: 'VAT — standard rate', type: 'VAT', rate: 16, active: true },
  { id: 'tax-vat0', code: 'VAT0', name: 'VAT — zero rated', type: 'VAT', rate: 0, active: true },
  { id: 'tax-vatex', code: 'VATEX', name: 'VAT — exempt', type: 'VAT', rate: 0, active: true },
  { id: 'tax-wht5', code: 'WHT5', name: 'Withholding tax — professional fees', type: 'WHT', rate: 5, active: true },
  { id: 'tax-wht3', code: 'WHT3', name: 'Withholding tax — contractual', type: 'WHT', rate: 3, active: true },
  { id: 'tax-wht10', code: 'WHT10', name: 'Withholding tax — royalties', type: 'WHT', rate: 10, active: true },
  { id: 'tax-payeb', code: 'PAYE-B', name: 'PAYE — top band', type: 'PAYE', rate: 35, active: true },
  { id: 'tax-excise', code: 'EXC', name: 'Excise duty — services', type: 'Excise', rate: 20, active: false }
];

export const taxRatesStore = createCollection<TaxRate>('emtech.store.taxrates.v1', SEED_TAX, 'tax');
