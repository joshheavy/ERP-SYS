import { createCollection } from '../core/store/createCollection';

/**
 * Sub-ledger invoices for Accounts Payable (supplier bills) and Accounts
 * Receivable (customer invoices). Same shape; the `party` is a vendor for AP
 * and a customer for AR. Status is derived from amount/paid/dueDate at render.
 */
export type InvoiceStatus = 'open' | 'partpaid' | 'paid' | 'overdue';

export interface SubledgerInvoice {
  id: string;
  reference: string;
  party: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
}

/** Effective status: paid if settled; overdue if past due with a balance; else open/partpaid. */
export function invoiceStatus(inv: SubledgerInvoice, today = '2026-09-17'): InvoiceStatus {
  const balance = inv.amount - inv.paid;
  if (balance <= 0) return 'paid';
  if (inv.dueDate < today) return 'overdue';
  return inv.paid > 0 ? 'partpaid' : 'open';
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  open: 'Open',
  partpaid: 'Part-paid',
  paid: 'Paid',
  overdue: 'Overdue'
};

/** Tailwind pill classes per status (never colour-alone — always paired with the label). */
export const INVOICE_STATUS_STYLE: Record<InvoiceStatus, string> = {
  open: 'bg-info-soft text-info',
  partpaid: 'bg-warning-soft text-warning',
  paid: 'bg-success-soft text-success',
  overdue: 'bg-danger-soft text-danger'
};

const SEED_PAYABLES: SubledgerInvoice[] = [
  { id: 'ap-0001', reference: 'BILL-2026-0142', party: 'Nairobi Systems Ltd', date: '2026-08-28', dueDate: '2026-09-27', amount: 4180000, paid: 0 },
  { id: 'ap-0002', reference: 'BILL-2026-0143', party: 'Savannah Office Supplies', date: '2026-09-01', dueDate: '2026-10-01', amount: 862000, paid: 400000 },
  { id: 'ap-0003', reference: 'BILL-2026-0144', party: 'Rift Valley Facilities Services', date: '2026-08-10', dueDate: '2026-09-09', amount: 1240000, paid: 0 },
  { id: 'ap-0004', reference: 'BILL-2026-0145', party: 'Simba Motors Ltd', date: '2026-09-05', dueDate: '2026-10-05', amount: 2960000, paid: 2960000 },
  { id: 'ap-0005', reference: 'BILL-2026-0146', party: 'Britam Insurance', date: '2026-07-02', dueDate: '2026-07-16', amount: 4800000, paid: 4800000 },
  { id: 'ap-0006', reference: 'BILL-2026-0147', party: 'Kenya Power', date: '2026-09-02', dueDate: '2026-09-16', amount: 686000, paid: 0 },
  { id: 'ap-0007', reference: 'BILL-2026-0148', party: 'Microsoft EA', date: '2026-09-05', dueDate: '2026-10-20', amount: 3240000, paid: 0 },
  { id: 'ap-0008', reference: 'BILL-2026-0149', party: 'Nairobi Systems Ltd', date: '2026-09-12', dueDate: '2026-10-12', amount: 1520000, paid: 500000 }
];

const SEED_RECEIVABLES: SubledgerInvoice[] = [
  { id: 'ar-0001', reference: 'INV-2026-0311', party: 'Kenya Commercial Bank', date: '2026-08-20', dueDate: '2026-09-19', amount: 12400000, paid: 6000000 },
  { id: 'ar-0002', reference: 'INV-2026-0312', party: 'Safaricom PLC', date: '2026-09-01', dueDate: '2026-10-01', amount: 8600000, paid: 0 },
  { id: 'ar-0003', reference: 'INV-2026-0313', party: 'Equity Group Holdings', date: '2026-08-05', dueDate: '2026-09-04', amount: 5200000, paid: 0 },
  { id: 'ar-0004', reference: 'INV-2026-0314', party: 'Co-operative Bank', date: '2026-09-08', dueDate: '2026-10-08', amount: 3480000, paid: 3480000 },
  { id: 'ar-0005', reference: 'INV-2026-0315', party: 'Kenya Airways', date: '2026-08-15', dueDate: '2026-09-14', amount: 6900000, paid: 2000000 },
  { id: 'ar-0006', reference: 'INV-2026-0316', party: 'Bamburi Cement', date: '2026-09-10', dueDate: '2026-10-10', amount: 4100000, paid: 0 },
  { id: 'ar-0007', reference: 'INV-2026-0317', party: 'East African Breweries', date: '2026-09-12', dueDate: '2026-10-26', amount: 7250000, paid: 0 }
];

export const payablesStore = createCollection<SubledgerInvoice>('emtech.store.payables.v1', SEED_PAYABLES, 'ap');
export const receivablesStore = createCollection<SubledgerInvoice>('emtech.store.receivables.v1', SEED_RECEIVABLES, 'ar');
