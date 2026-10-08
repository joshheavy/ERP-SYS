import { createCollection } from '../core/store/createCollection';

/**
 * KENYAN PAYROLL STATUTORY CONFIGURATION
 * --------------------------------------
 * The rates and bands a payroll officer maintains: PAYE progressive tax bands,
 * NSSF contribution tiers, and the flat statutory rates (SHIF, Affordable
 * Housing Levy, personal relief). Seed values reflect the 2026 Kenyan regime.
 * All persisted via createCollection so edits survive navigation.
 *
 * These drive the payroll computation; here they are configuration only.
 */

/* ------------------------------- PAYE bands ------------------------------ */
export interface PayeBand {
  id: string;
  /** Lower bound of monthly taxable income (KES), inclusive. */
  lower: number;
  /** Upper bound (KES), or null for the top open-ended band. */
  upper: number | null;
  /** Marginal rate % applied within the band. */
  rate: number;
}

// 2026 monthly PAYE bands (KES).
const SEED_PAYE: PayeBand[] = [
  { id: 'paye-1', lower: 0, upper: 24000, rate: 10 },
  { id: 'paye-2', lower: 24001, upper: 32333, rate: 25 },
  { id: 'paye-3', lower: 32334, upper: 500000, rate: 30 },
  { id: 'paye-4', lower: 500001, upper: 800000, rate: 32.5 },
  { id: 'paye-5', lower: 800001, upper: null, rate: 35 }
];

export const payeBandsStore = createCollection<PayeBand>('emtech.store.paye.v1', SEED_PAYE, 'paye');

/** Progressive PAYE on a monthly taxable amount, using the given bands. */
export function computePaye(taxable: number, bands: PayeBand[]): number {
  const ordered = [...bands].sort((a, b) => a.lower - b.lower);
  let tax = 0;
  for (const band of ordered) {
    if (taxable <= band.lower) break;
    const upper = band.upper ?? Infinity;
    const slice = Math.min(taxable, upper) - band.lower + (band.lower === 0 ? 0 : 1);
    // Simpler slice calc: portion of income falling inside this band.
    const bandFloor = band.lower === 0 ? 0 : band.lower - 1;
    const inBand = Math.max(0, Math.min(taxable, upper) - bandFloor);
    void slice;
    tax += (inBand * band.rate) / 100;
  }
  return Math.round(tax);
}

/* ------------------------------- NSSF tiers ------------------------------ */
export interface NssfTier {
  id: string;
  name: string;
  /** Lower earnings limit for the tier (KES). */
  lowerLimit: number;
  /** Upper earnings limit for the tier (KES). */
  upperLimit: number;
  /** Employee contribution rate %. */
  rate: number;
}

// 2026 NSSF two-tier structure (KES pensionable limits).
const SEED_NSSF: NssfTier[] = [
  { id: 'nssf-1', name: 'Tier I', lowerLimit: 0, upperLimit: 8000, rate: 6 },
  { id: 'nssf-2', name: 'Tier II', lowerLimit: 8001, upperLimit: 72000, rate: 6 }
];

export const nssfTiersStore = createCollection<NssfTier>('emtech.store.nssf.v1', SEED_NSSF, 'nssf');

/** Employee NSSF deduction: rate applied to pensionable pay capped per tier. */
export function computeNssf(gross: number, tiers: NssfTier[]): number {
  let total = 0;
  for (const tier of tiers) {
    const floor = tier.lowerLimit === 0 ? 0 : tier.lowerLimit - 1;
    const inTier = Math.max(0, Math.min(gross, tier.upperLimit) - floor);
    total += (inTier * tier.rate) / 100;
  }
  return Math.round(total);
}

/* --------------------------- Flat statutory rates ------------------------ */
export interface StatutoryRates {
  id: string;
  /** SHIF (ex-NHIF) contribution as % of gross. */
  shifRate: number;
  /** Minimum monthly SHIF contribution (KES). */
  shifMinimum: number;
  /** Affordable Housing Levy as % of gross (employee share). */
  housingLevyRate: number;
  /** Monthly personal relief (KES). */
  personalRelief: number;
  /** Insurance relief cap % of premiums. */
  insuranceReliefRate: number;
}

const SEED_RATES: StatutoryRates[] = [
  { id: 'rates', shifRate: 2.75, shifMinimum: 300, housingLevyRate: 1.5, personalRelief: 2400, insuranceReliefRate: 15 }
];

export const statutoryRatesStore = createCollection<StatutoryRates>('emtech.store.statutoryRates.v1', SEED_RATES, 'rates');
