import { createCollection } from '../core/store/createCollection';

export type StatementLineType = 'debit' | 'credit';

export interface StatementLine {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: StatementLineType;
  matched: boolean;
  /** The ledger entry or journal this line was matched to, when matched. */
  matchedTo?: string;
}

const SEED_LINES: StatementLine[] = [
  { id: 'stl-1001', date: '2026-09-02', description: 'Standing order — KPLC power', reference: 'SO-448120', amount: 184500, type: 'debit', matched: true, matchedTo: 'JNL-2026-0912' },
  { id: 'stl-1002', date: '2026-09-03', description: 'Customer receipt — Safaricom PLC', reference: 'RTGS-773401', amount: 2640000, type: 'credit', matched: true, matchedTo: 'RCT-2026-0431' },
  { id: 'stl-1003', date: '2026-09-04', description: 'Cheque — Nyumba Contractors Ltd', reference: 'CHQ-009812', amount: 936400, type: 'debit', matched: false },
  { id: 'stl-1004', date: '2026-09-05', description: 'M-PESA paybill settlement', reference: 'MPS-556210', amount: 418200, type: 'credit', matched: true, matchedTo: 'RCT-2026-0439' },
  { id: 'stl-1005', date: '2026-09-08', description: 'Bank charges — ledger fees', reference: 'CHG-090826', amount: 12800, type: 'debit', matched: false },
  { id: 'stl-1006', date: '2026-09-09', description: 'Salary batch — September payroll', reference: 'PAY-2026-09', amount: 12480000, type: 'debit', matched: true, matchedTo: 'JNL-2026-0921' },
  { id: 'stl-1007', date: '2026-09-10', description: 'Customer receipt — Kenya Airways', reference: 'RTGS-773998', amount: 1875000, type: 'credit', matched: false },
  { id: 'stl-1008', date: '2026-09-11', description: 'Supplier payment — Twiga Foods Ltd', reference: 'EFT-114420', amount: 642300, type: 'debit', matched: true, matchedTo: 'PMT-2026-0288' },
  { id: 'stl-1009', date: '2026-09-11', description: 'Interest credit — call deposit', reference: 'INT-090926', amount: 96700, type: 'credit', matched: false },
  { id: 'stl-1010', date: '2026-09-12', description: 'Cheque — Coastal Suppliers Ltd', reference: 'CHQ-009845', amount: 288900, type: 'debit', matched: false },
  { id: 'stl-1011', date: '2026-09-12', description: 'Customer receipt — Bidco Africa', reference: 'RTGS-774510', amount: 1320000, type: 'credit', matched: true, matchedTo: 'RCT-2026-0451' },
  { id: 'stl-1012', date: '2026-09-13', description: 'Standing order — office rent', reference: 'SO-448377', amount: 780000, type: 'debit', matched: false }
];

export const reconciliationStore = createCollection<StatementLine>('emtech.store.reconciliation.v1', SEED_LINES, 'stl');
