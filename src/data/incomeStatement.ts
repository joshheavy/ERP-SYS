import { createCollection } from '../core/store/createCollection';

export type IncomeCategory = 'Revenue' | 'Cost of sales' | 'Operating expenses' | 'Other';

export interface IncomeStatementLine {
  id: string;
  account: string;
  category: IncomeCategory;
  amount: number;
  period: string;
}

export const INCOME_CATEGORIES: IncomeCategory[] = ['Revenue', 'Cost of sales', 'Operating expenses', 'Other'];

const SEED_LINES: IncomeStatementLine[] = [
  { id: 'isl-1001', account: 'Service revenue', category: 'Revenue', amount: 284600000, period: '2026-09' },
  { id: 'isl-1002', account: 'Product sales', category: 'Revenue', amount: 64200000, period: '2026-09' },
  { id: 'isl-1003', account: 'Support & maintenance', category: 'Revenue', amount: 18400000, period: '2026-09' },
  { id: 'isl-1004', account: 'Direct staff costs', category: 'Cost of sales', amount: 96800000, period: '2026-09' },
  { id: 'isl-1005', account: 'Subcontractor charges', category: 'Cost of sales', amount: 42300000, period: '2026-09' },
  { id: 'isl-1006', account: 'Hardware & licences', category: 'Cost of sales', amount: 21600000, period: '2026-09' },
  { id: 'isl-1007', account: 'Salaries & wages — admin', category: 'Operating expenses', amount: 51400000, period: '2026-09' },
  { id: 'isl-1008', account: 'Rent & utilities', category: 'Operating expenses', amount: 18400000, period: '2026-09' },
  { id: 'isl-1009', account: 'Marketing & sales', category: 'Operating expenses', amount: 9700000, period: '2026-09' },
  { id: 'isl-1010', account: 'Depreciation', category: 'Operating expenses', amount: 9600000, period: '2026-09' },
  { id: 'isl-1011', account: 'Office & administration', category: 'Operating expenses', amount: 12740000, period: '2026-09' },
  { id: 'isl-1012', account: 'Interest income', category: 'Other', amount: 3820000, period: '2026-09' },
  { id: 'isl-1013', account: 'Foreign exchange loss', category: 'Other', amount: -1460000, period: '2026-09' },
  { id: 'isl-1014', account: 'Finance costs', category: 'Other', amount: -2380000, period: '2026-09' }
];

export const incomeStatementStore = createCollection<IncomeStatementLine>('emtech.store.incomeStatement.v1', SEED_LINES, 'isl');
