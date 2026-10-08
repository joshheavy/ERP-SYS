import { createCollection } from '../core/store/createCollection';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  /** Parent account code for the hierarchy, or '' for a top-level account. */
  parent: string;
  /** Whether entries can post directly to this account (vs. a header/rollup). */
  postable: boolean;
  active: boolean;
  /** Current balance (KES), positive as its natural side. */
  balance: number;
}

export const ACCOUNT_TYPES: AccountType[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

const SEED_ACCOUNTS: LedgerAccount[] = [
  { id: 'acc-1000', code: '1000', name: 'Assets', type: 'Asset', parent: '', postable: false, active: true, balance: 0 },
  { id: 'acc-1100', code: '1100', name: 'Cash & bank', type: 'Asset', parent: '1000', postable: false, active: true, balance: 0 },
  { id: 'acc-1101', code: '1101', name: 'KCB current account', type: 'Asset', parent: '1100', postable: true, active: true, balance: 48260000 },
  { id: 'acc-1102', code: '1102', name: 'Equity Bank account', type: 'Asset', parent: '1100', postable: true, active: true, balance: 21840000 },
  { id: 'acc-1103', code: '1103', name: 'Petty cash', type: 'Asset', parent: '1100', postable: true, active: true, balance: 180000 },
  { id: 'acc-1200', code: '1200', name: 'Accounts receivable', type: 'Asset', parent: '1000', postable: true, active: true, balance: 12640000 },
  { id: 'acc-1301', code: '1301', name: 'Staff advances', type: 'Asset', parent: '1000', postable: true, active: true, balance: 8420000 },
  { id: 'acc-1500', code: '1500', name: 'Property, plant & equipment', type: 'Asset', parent: '1000', postable: true, active: true, balance: 142800000 },
  { id: 'acc-2000', code: '2000', name: 'Liabilities', type: 'Liability', parent: '', postable: false, active: true, balance: 0 },
  { id: 'acc-2100', code: '2100', name: 'Accounts payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 42180000 },
  { id: 'acc-2200', code: '2200', name: 'PAYE payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 54120000 },
  { id: 'acc-2210', code: '2210', name: 'NSSF payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 36940000 },
  { id: 'acc-2220', code: '2220', name: 'SHIF payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 0 },
  { id: 'acc-2230', code: '2230', name: 'Housing Levy payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 0 },
  { id: 'acc-2300', code: '2300', name: 'Net pay payable', type: 'Liability', parent: '2000', postable: true, active: true, balance: 0 },
  { id: 'acc-2400', code: '2400', name: 'Accruals', type: 'Liability', parent: '2000', postable: true, active: true, balance: 6240000 },
  { id: 'acc-3000', code: '3000', name: 'Equity', type: 'Equity', parent: '', postable: false, active: true, balance: 0 },
  { id: 'acc-3100', code: '3100', name: 'Retained earnings', type: 'Equity', parent: '3000', postable: true, active: true, balance: 132400000 },
  { id: 'acc-4000', code: '4000', name: 'Income', type: 'Income', parent: '', postable: false, active: true, balance: 0 },
  { id: 'acc-4100', code: '4100', name: 'Service revenue', type: 'Income', parent: '4000', postable: true, active: true, balance: 284600000 },
  { id: 'acc-4200', code: '4200', name: 'Other income', type: 'Income', parent: '4000', postable: true, active: true, balance: 6820000 },
  { id: 'acc-5000', code: '5000', name: 'Expenses', type: 'Expense', parent: '', postable: false, active: true, balance: 0 },
  { id: 'acc-5100', code: '5100', name: 'Salaries & wages', type: 'Expense', parent: '5000', postable: true, active: true, balance: 3812400000 },
  { id: 'acc-5200', code: '5200', name: 'Rent & utilities', type: 'Expense', parent: '5000', postable: true, active: true, balance: 18400000 },
  { id: 'acc-5300', code: '5300', name: 'Depreciation', type: 'Expense', parent: '5000', postable: true, active: true, balance: 9600000 },
  { id: 'acc-5400', code: '5400', name: 'Office & administration', type: 'Expense', parent: '5000', postable: true, active: true, balance: 12740000 },
  { id: 'acc-5410', code: '5410', name: 'Repairs & maintenance', type: 'Expense', parent: '5000', postable: true, active: true, balance: 28420000 },
  { id: 'acc-5420', code: '5420', name: 'Travel & subsistence', type: 'Expense', parent: '5000', postable: true, active: true, balance: 84200000 },
  { id: 'acc-5430', code: '5430', name: 'Bank charges', type: 'Expense', parent: '5000', postable: true, active: true, balance: 2840000 }
];

// v2: chart unified with the GL posting engine — journals now post to these
// canonical codes, so the ledger derivations key directly off account.code.
export const accountsStore = createCollection<LedgerAccount>('emtech.store.accounts.v2', SEED_ACCOUNTS, 'acc');
