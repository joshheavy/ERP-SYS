/**
 * Journals and the trial balance now live in the GL posting engine
 * (`./ledger`), where the trial balance is DERIVED from posted journals rather
 * than hand-kept. These re-exports preserve the old `../data/finance` import
 * paths for existing call sites.
 */
export type { JournalEntry, JournalLine, TrialBalanceRow } from './ledger';
export {
  journalsStore,
  deriveTrialBalance,
  deriveAccountActivity,
  ledgerAccounts,
  nextJournalReference
} from './ledger';

/* ------------------------------------------------------------------ *
 * Finance dashboard fixtures (not part of the GL engine).
 * ------------------------------------------------------------------ */

export const SPEND_TREND = [
  { month: 'Apr', payroll: 468.2, operating: 96.4 },
  { month: 'May', payroll: 471.8, operating: 88.1 },
  { month: 'Jun', payroll: 474.1, operating: 102.6 },
  { month: 'Jul', payroll: 476.3, operating: 94.8 },
  { month: 'Aug', payroll: 479.1, operating: 108.2 },
  { month: 'Sep', payroll: 486.4, operating: 91.5 }];


export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  reference: string;
  at: string;
  path: string;
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: 'ra1', actor: 'Nancy Wambui', action: 'submitted the September payroll journal', reference: 'JE-2026-09-0114', at: '2026-09-14T16:22:00', path: '/finance/journals' },
  { id: 'ra2', actor: 'Daniel Mwangi', action: 'recorded a partial goods receipt', reference: 'GRN-2026-0301', at: '2026-09-14T10:15:00', path: '/procurement/receipts' },
  { id: 'ra3', actor: 'Hassan Abdi', action: 'approved a leave request as supervisor', reference: 'LV-2026-0788', at: '2026-09-14T11:02:00', path: '/hr/leave/requests' },
  { id: 'ra4', actor: 'Faith Njoroge', action: 'posted the maintenance accrual', reference: 'JE-2026-09-0112', at: '2026-09-13T15:52:00', path: '/finance/journals' },
  { id: 'ra5', actor: 'David Kimani', action: 'rejected a travel advance requisition', reference: 'REQ-2026-0405', at: '2026-09-08T09:10:00', path: '/procurement/requisitions' }];


export const PERIOD_STATUS = {
  current: '2026-09',
  closesOn: '2026-10-05',
  // NOTE: the unposted-journal count is now derived live from `journalsStore`
  // (see the Finance dashboard). This static figure is kept only as a fallback
  // reference and is no longer the source of the dashboard tile.
  journalsPending: 2,
  unreconciledBankItems: 6
};
