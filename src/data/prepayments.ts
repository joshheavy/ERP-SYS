import { createCollection } from '../core/store/createCollection';

export type PrepaymentStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Prepayment {
  id: string;
  reference: string;
  payee: string;
  description: string;
  amount: number;
  /** ISO date the prepaid period starts. */
  startDate: string;
  /** Number of months to amortize over. */
  months: number;
  account: string;
  status: PrepaymentStatus;
  raisedBy: string;
  raisedOn: string;
}

/** Straight-line monthly amortization schedule for a prepayment. */
export interface AmortizationRow {
  period: string;
  charge: number;
  balance: number;
}

export function amortizationSchedule(p: Prepayment): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  if (p.months <= 0) return rows;
  const perMonth = p.amount / p.months;
  let balance = p.amount;
  const [y, m] = p.startDate.split('-').map(Number);
  for (let i = 0; i < p.months; i++) {
    const d = new Date(y, (m - 1) + i, 1);
    balance = Math.max(0, balance - perMonth);
    rows.push({
      period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      charge: Math.round(perMonth),
      balance: Math.round(balance)
    });
  }
  return rows;
}

const SEED_PREPAYMENTS: Prepayment[] = [
  { id: 'ppd-0001', reference: 'PPD-2026-0001', payee: 'Britam Insurance', description: 'Annual motor fleet insurance premium', amount: 4800000, startDate: '2026-07', months: 12, account: '1400 Prepaid insurance', status: 'approved', raisedBy: 'Joseph Kariuki', raisedOn: '2026-07-02' },
  { id: 'ppd-0002', reference: 'PPD-2026-0002', payee: 'Nairobi County', description: 'Business permit — full year', amount: 960000, startDate: '2026-01', months: 12, account: '1410 Prepaid licences', status: 'approved', raisedBy: 'Joseph Kariuki', raisedOn: '2026-01-08' },
  { id: 'ppd-0003', reference: 'PPD-2026-0003', payee: 'Microsoft EA', description: 'Microsoft 365 annual subscription', amount: 3240000, startDate: '2026-09', months: 12, account: '1420 Prepaid software', status: 'pending', raisedBy: 'Faith Chebet', raisedOn: '2026-09-05' },
  { id: 'ppd-0004', reference: 'PPD-2026-0004', payee: 'Kenya Power', description: 'Prepaid electricity deposit', amount: 600000, startDate: '2026-08', months: 6, account: '1430 Prepaid utilities', status: 'draft', raisedBy: 'Samuel Mutua', raisedOn: '2026-08-20' }
];

export const prepaymentsStore = createCollection<Prepayment>('emtech.store.prepayments.v1', SEED_PREPAYMENTS, 'ppd');
