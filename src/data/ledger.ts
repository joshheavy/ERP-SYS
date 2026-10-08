'use client';

import { createCollection } from '../core/store/createCollection';
import type { DocumentStatus, TimelineEvent } from '../types/common';

/**
 * GENERAL LEDGER — the posting engine.
 * ------------------------------------
 * A journal is a balanced set of debit/credit lines against accounts. Only when
 * a journal is POSTED does it affect the ledger: the trial balance and every
 * account's activity are DERIVED from the posted journals here, never hand-kept
 * in a parallel array. Draft/pending/cancelled journals contribute nothing to
 * balances. This mirrors a real GL: journals are the source of truth, balances
 * are a projection over the posted set.
 *
 * The journal lines carry their own account code + name, so the ledger is
 * self-describing and does not depend on the separate chart-of-accounts codes.
 */

export interface JournalLine {
  id: string;
  account: string;
  accountName: string;
  costCentre: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntry {
  id: string;
  reference: string;
  description: string;
  period: string;
  postedOn: string;
  source: string;
  costCentre: string;
  debit: number;
  credit: number;
  currency: string;
  preparedBy: string;
  approvedBy: string;
  status: DocumentStatus;
  lines: JournalLine[];
  timeline: TimelineEvent[];
}

/** Classify an account by its GL code prefix (1=Asset, 2=Liability, 3=Equity, 4=Income, 5/6=Expense). */
export type AccountClass = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export function classifyAccount(code: string): AccountClass {
  switch (code.charAt(0)) {
    case '1':
      return 'Asset';
    case '2':
      return 'Liability';
    case '3':
      return 'Equity';
    case '4':
      return 'Income';
    default:
      return 'Expense'; // 5xxx and 6xxx
  }
}

/** A debit-natured class holds its balance on the debit side; the rest on credit. */
export function isDebitNatured(cls: AccountClass): boolean {
  return cls === 'Asset' || cls === 'Expense';
}

const SEED_JOURNALS: JournalEntry[] = [
  {
    id: 'je-0114',
    reference: 'JE-2026-09-0114',
    description: 'September 2026 payroll journal',
    period: '2026-09',
    postedOn: '2026-09-14',
    source: 'Payroll',
    costCentre: 'CC-100 Corporate',
    debit: 486412900,
    credit: 486412900,
    currency: 'KES',
    preparedBy: 'Nancy Wambui',
    approvedBy: 'David Kimani',
    status: 'pending',
    lines: [
      { id: 'jl1', account: '5100', accountName: 'Salaries & wages', costCentre: 'CC-100', debit: 486412900, credit: 0, memo: 'Gross pay, September 2026' },
      { id: 'jl2', account: '2200', accountName: 'PAYE payable', costCentre: 'CC-100', debit: 0, credit: 58269600, memo: 'PAYE withheld' },
      { id: 'jl3', account: '2210', accountName: 'NSSF payable', costCentre: 'CC-100', debit: 0, credit: 38913000, memo: 'Employee NSSF' },
      { id: 'jl4', account: '2230', accountName: 'Housing Levy payable', costCentre: 'CC-100', debit: 0, credit: 9728200, memo: 'Affordable Housing Levy' },
      { id: 'jl5', account: '2220', accountName: 'SHIF payable', costCentre: 'CC-100', debit: 0, credit: 7296100, memo: 'SHIF contributions' },
      { id: 'jl6', account: '2300', accountName: 'Net pay payable', costCentre: 'CC-100', debit: 0, credit: 372206000, memo: 'Net pay to staff' }
    ],
    timeline: [
      { id: 'jt1', actor: 'Nancy Wambui', actorRole: 'Senior Payroll Officer', action: 'generated the journal from PR-2026-09', at: '2026-09-14T16:20:00', outcome: 'created' },
      { id: 'jt2', actor: 'Nancy Wambui', actorRole: 'Senior Payroll Officer', action: 'submitted for approval', at: '2026-09-14T16:22:00', outcome: 'submitted' },
      { id: 'jt3', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'is reviewing the journal', at: '2026-09-14T16:25:00', outcome: 'pending' }
    ]
  },
  {
    id: 'je-0112',
    reference: 'JE-2026-09-0112',
    description: 'Generator maintenance accrual',
    period: '2026-09',
    postedOn: '2026-09-13',
    source: 'Manual',
    costCentre: 'CC-320 Facilities',
    debit: 1076000,
    credit: 1076000,
    currency: 'KES',
    preparedBy: 'Faith Njoroge',
    approvedBy: 'David Kimani',
    status: 'posted',
    lines: [
      { id: 'jl7', account: '5410', accountName: 'Repairs & maintenance', costCentre: 'CC-320', debit: 1076000, credit: 0, memo: 'Q3 generator service' },
      { id: 'jl8', account: '2400', accountName: 'Accruals', costCentre: 'CC-320', debit: 0, credit: 1076000, memo: 'Accrued at period end' }
    ],
    timeline: [
      { id: 'jt4', actor: 'Faith Njoroge', actorRole: 'Finance Officer', action: 'created the journal', at: '2026-09-13T10:02:00', outcome: 'created' },
      { id: 'jt5', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'approved the journal', at: '2026-09-13T15:40:00', outcome: 'approved' },
      { id: 'jt6', actor: 'Faith Njoroge', actorRole: 'Finance Officer', action: 'posted to the general ledger', at: '2026-09-13T15:52:00', outcome: 'posted' }
    ]
  },
  {
    id: 'je-0109',
    reference: 'JE-2026-09-0109',
    description: 'ICT equipment capitalisation',
    period: '2026-09',
    postedOn: '2026-09-11',
    source: 'Fixed Assets',
    costCentre: 'CC-210 IT',
    debit: 18740000,
    credit: 18740000,
    currency: 'KES',
    preparedBy: 'Joy Wangari',
    approvedBy: 'David Kimani',
    status: 'posted',
    lines: [
      { id: 'jl9', account: '1500', accountName: 'Property, plant & equipment', costCentre: 'CC-210', debit: 18740000, credit: 0, memo: 'ICT equipment — capitalised from GRN-2026-0271' },
      { id: 'jl10', account: '2100', accountName: 'Accounts payable', costCentre: 'CC-210', debit: 0, credit: 18740000, memo: 'Nairobi Systems invoice' }
    ],
    timeline: [
      { id: 'jt7', actor: 'Joy Wangari', actorRole: 'Finance Officer', action: 'created the journal', at: '2026-09-11T09:14:00', outcome: 'created' },
      { id: 'jt8', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'approved and posted', at: '2026-09-11T11:30:00', outcome: 'posted' }
    ]
  },
  {
    id: 'je-0107',
    reference: 'JE-2026-09-0107',
    description: 'Bank charges — August statement',
    period: '2026-09',
    postedOn: '2026-09-09',
    source: 'Bank reconciliation',
    costCentre: 'CC-100 Corporate',
    debit: 284500,
    credit: 284500,
    currency: 'KES',
    preparedBy: 'Ruth Atieno',
    approvedBy: 'Faith Njoroge',
    status: 'posted',
    lines: [
      { id: 'jl11', account: '5430', accountName: 'Bank charges', costCentre: 'CC-100', debit: 284500, credit: 0, memo: 'August charges' },
      { id: 'jl12', account: '1101', accountName: 'KCB current account', costCentre: 'CC-100', debit: 0, credit: 284500, memo: 'Per statement' }
    ],
    timeline: [
      { id: 'jt9', actor: 'Ruth Atieno', actorRole: 'Admin Officer', action: 'created the journal', at: '2026-09-09T13:11:00', outcome: 'created' },
      { id: 'jt10', actor: 'Faith Njoroge', actorRole: 'Finance Officer', action: 'approved and posted', at: '2026-09-09T14:02:00', outcome: 'posted' }
    ]
  },
  {
    id: 'je-0104',
    reference: 'JE-2026-09-0104',
    description: 'Travel advance retirement — Northern survey',
    period: '2026-09',
    postedOn: '2026-09-08',
    source: 'Manual',
    costCentre: 'CC-410 Operations',
    debit: 2140000,
    credit: 2140000,
    currency: 'KES',
    preparedBy: 'Mercy Achieng',
    approvedBy: '—',
    status: 'draft',
    lines: [
      { id: 'jl13', account: '5420', accountName: 'Travel & subsistence', costCentre: 'CC-410', debit: 2140000, credit: 0, memo: 'Retired advance' },
      { id: 'jl14', account: '1301', accountName: 'Staff advances', costCentre: 'CC-410', debit: 0, credit: 2140000, memo: 'Advance cleared' }
    ],
    timeline: [
      { id: 'jt11', actor: 'Mercy Achieng', actorRole: 'Operations Supervisor', action: 'created the journal', at: '2026-09-08T16:44:00', outcome: 'created' }
    ]
  },
  {
    id: 'je-0101',
    reference: 'JE-2026-09-0101',
    description: 'Reversal — duplicate vendor payment',
    period: '2026-09',
    postedOn: '2026-09-04',
    source: 'Manual',
    costCentre: 'CC-100 Corporate',
    debit: 940000,
    credit: 940000,
    currency: 'KES',
    preparedBy: 'Faith Njoroge',
    approvedBy: 'David Kimani',
    status: 'cancelled',
    lines: [
      { id: 'jl15', account: '2100', accountName: 'Accounts payable', costCentre: 'CC-100', debit: 940000, credit: 0, memo: 'Duplicate reversed' },
      { id: 'jl16', account: '1101', accountName: 'KCB current account', costCentre: 'CC-100', debit: 0, credit: 940000, memo: 'Recovered' }
    ],
    timeline: [
      { id: 'jt12', actor: 'Faith Njoroge', actorRole: 'Finance Officer', action: 'created the journal', at: '2026-09-04T10:00:00', outcome: 'created' },
      { id: 'jt13', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'cancelled the journal', at: '2026-09-04T16:12:00', outcome: 'rejected', comment: 'Vendor issued a credit note instead. Cancelling this reversal.' }
    ]
  }
];

/**
 * Opening balances per account (before the current period's postings), keyed by
 * account code. These stand in for the prior periods a real GL would carry
 * forward. Kept as debit-positive / credit-negative net amounts on the account's
 * NATURAL side — i.e. a positive number means a balance on the account's natural
 * side. The trial-balance derivation re-splits them into debit/credit columns.
 */
export const OPENING_BALANCES: Record<string, number> = {
  '1101': 184484500, // KCB current account (natural: debit)
  '1301': 8420000, // Staff advances (debit)
  '1500': 142800000, // Property, plant & equipment (debit)
  '2100': 42180000, // Accounts payable (credit)
  '2400': 6240000, // Accruals (credit)
  '2300': 0, // Net pay payable (credit)
  '2200': 54120000, // PAYE payable (credit)
  '2210': 36940000, // NSSF payable (credit)
  '2230': 0, // Housing Levy payable (credit)
  '2220': 0, // SHIF payable (credit)
  '5100': 3812400000, // Salaries & wages (debit)
  '5410': 28420000, // Repairs & maintenance (debit)
  '5420': 84200000, // Travel & subsistence (debit)
  '5430': 2840000 // Bank charges (debit)
};

// v2: journal lines remapped to the canonical Chart-of-Accounts codes so the
// ledger derivations align 1:1 with the CoA (no bridging map needed).
export const journalsStore = createCollection<JournalEntry>('emtech.store.journals.v2', SEED_JOURNALS, 'je');

/** Journals that actually hit the ledger. */
export function postedJournals(all: JournalEntry[]): JournalEntry[] {
  return all.filter((j) => j.status === 'posted');
}

/* ------------------------------------------------------------------ *
 * Derivations over the POSTED journal set.
 * ------------------------------------------------------------------ */

export interface TrialBalanceRow {
  id: string;
  account: string;
  accountName: string;
  classification: AccountClass;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

interface Accumulator {
  account: string;
  accountName: string;
  periodDebit: number;
  periodCredit: number;
}

/**
 * Trial balance derived from posted journals + opening balances. One row per
 * account touched by an opening balance or a posted line. Closing = opening ±
 * period movement, re-split into debit/credit columns on the account's natural
 * side.
 */
export function deriveTrialBalance(all: JournalEntry[]): TrialBalanceRow[] {
  const byAccount = new Map<string, Accumulator>();

  // Ensure every account with an opening balance appears, even with no movement.
  for (const code of Object.keys(OPENING_BALANCES)) {
    byAccount.set(code, { account: code, accountName: nameForAccount(all, code), periodDebit: 0, periodCredit: 0 });
  }

  for (const j of postedJournals(all)) {
    for (const line of j.lines) {
      const acc = byAccount.get(line.account) ?? {
        account: line.account,
        accountName: line.accountName,
        periodDebit: 0,
        periodCredit: 0
      };
      acc.periodDebit += line.debit;
      acc.periodCredit += line.credit;
      if (!acc.accountName) acc.accountName = line.accountName;
      byAccount.set(line.account, acc);
    }
  }

  const rows: TrialBalanceRow[] = [];
  for (const acc of byAccount.values()) {
    const cls = classifyAccount(acc.account);
    const debitNatured = isDebitNatured(cls);
    const opening = OPENING_BALANCES[acc.account] ?? 0;

    const openingDebit = debitNatured ? opening : 0;
    const openingCredit = debitNatured ? 0 : opening;

    // Net movement expressed on the natural side, then re-split for the closing.
    const naturalMovement = debitNatured
      ? acc.periodDebit - acc.periodCredit
      : acc.periodCredit - acc.periodDebit;
    const closingNatural = opening + naturalMovement;

    rows.push({
      id: `tb-${acc.account}`,
      account: acc.account,
      accountName: acc.accountName,
      classification: cls,
      openingDebit,
      openingCredit,
      periodDebit: acc.periodDebit,
      periodCredit: acc.periodCredit,
      closingDebit: debitNatured ? Math.max(closingNatural, 0) : Math.max(-closingNatural, 0),
      closingCredit: debitNatured ? Math.max(-closingNatural, 0) : Math.max(closingNatural, 0)
    });
  }

  return rows.sort((a, b) => a.account.localeCompare(b.account));
}

/** Best-known display name for an account code, taken from any posted line. */
function nameForAccount(all: JournalEntry[], code: string): string {
  for (const j of all) {
    const line = j.lines.find((l) => l.account === code);
    if (line) return line.accountName;
  }
  return code;
}

export interface LedgerPosting {
  id: string;
  date: string;
  reference: string;
  journalId: string;
  description: string;
  memo: string;
  costCentre: string;
  debit: number;
  credit: number;
  /** Running balance on the account's natural side, after this posting. */
  runningBalance: number;
}

export interface AccountActivity {
  account: string;
  accountName: string;
  classification: AccountClass;
  opening: number;
  closing: number;
  totalDebit: number;
  totalCredit: number;
  postings: LedgerPosting[];
}

/** All account codes that have an opening balance or a posted movement, sorted. */
export function ledgerAccounts(all: JournalEntry[]): { account: string; accountName: string }[] {
  const seen = new Map<string, string>();
  for (const code of Object.keys(OPENING_BALANCES)) seen.set(code, nameForAccount(all, code));
  for (const j of postedJournals(all)) {
    for (const line of j.lines) if (!seen.has(line.account)) seen.set(line.account, line.accountName);
  }
  return [...seen.entries()]
    .map(([account, accountName]) => ({ account, accountName }))
    .sort((a, b) => a.account.localeCompare(b.account));
}

/**
 * Per-account activity: opening balance, every posted line in date order with a
 * running balance, and the closing balance. Running balance is on the account's
 * natural side (debit-positive for assets/expenses, credit-positive otherwise).
 */
export function deriveAccountActivity(all: JournalEntry[], code: string): AccountActivity {
  const cls = classifyAccount(code);
  const debitNatured = isDebitNatured(cls);
  const opening = OPENING_BALANCES[code] ?? 0;

  const lines: LedgerPosting[] = [];
  for (const j of postedJournals(all)) {
    for (const line of j.lines) {
      if (line.account !== code) continue;
      lines.push({
        id: line.id,
        date: j.postedOn,
        reference: j.reference,
        journalId: j.id,
        description: j.description,
        memo: line.memo,
        costCentre: line.costCentre,
        debit: line.debit,
        credit: line.credit,
        runningBalance: 0 // filled below
      });
    }
  }

  lines.sort((a, b) => (a.date === b.date ? a.reference.localeCompare(b.reference) : a.date.localeCompare(b.date)));

  let running = opening;
  let totalDebit = 0;
  let totalCredit = 0;
  for (const p of lines) {
    running += debitNatured ? p.debit - p.credit : p.credit - p.debit;
    p.runningBalance = running;
    totalDebit += p.debit;
    totalCredit += p.credit;
  }

  return {
    account: code,
    accountName: nameForAccount(all, code),
    classification: cls,
    opening,
    closing: running,
    totalDebit,
    totalCredit,
    postings: lines
  };
}

/**
 * Net posted movement (on the account's natural side) for an account code.
 * Journals now post to the canonical Chart-of-Accounts codes, so this keys
 * directly off `code` — no bridging map. Returns null when the account has had
 * no posted movement, so the CoA screen can show a dash for untouched accounts.
 */
export function postedMovementForAccount(all: JournalEntry[], code: string): number | null {
  let debit = 0;
  let credit = 0;
  let touched = false;
  for (const j of postedJournals(all)) {
    for (const line of j.lines) {
      if (line.account !== code) continue;
      debit += line.debit;
      credit += line.credit;
      touched = true;
    }
  }
  if (!touched) return null;
  const cls = classifyAccount(code);
  return isDebitNatured(cls) ? debit - credit : credit - debit;
}

/** Next journal reference for a new manual entry, e.g. JE-2026-09-0115. */
export function nextJournalReference(all: JournalEntry[], period: string): string {
  const prefix = `JE-${period}-`;
  let max = 0;
  for (const j of all) {
    if (!j.reference.startsWith(prefix)) continue;
    const n = Number(j.reference.slice(prefix.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
