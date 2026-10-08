import type { ModuleId } from '../types/common';
import { formatMoney, formatMoneyCompact } from '../utils/format';
import { REQUISITIONS, PURCHASE_ORDERS } from './procurement';
import { LEAVE_REQUESTS } from './leave';
import { INVENTORY_ITEMS, FIXED_ASSETS, BUDGET_LINE_ROWS } from './registers';
import { PAYROLL_RUNS } from './payroll';
import { APPROVAL_QUEUE } from './approvals';
import { suppliersStore } from './suppliers';
import { imprestStore } from './imprest';
import { prepaymentsStore } from './prepayments';

export interface ModuleStat {
  label: string;
  value: string;
  /** Optional tone for the value. */
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export interface ModuleSummary {
  id: ModuleId;
  /** The headline metric shown large. */
  headline: { label: string; value: string };
  /** Supporting stats. */
  stats: ModuleStat[];
  /** Where the module's "Open" action goes. */
  href: string;
  cta: string;
}

/* --- Derived figures from the fixtures ------------------------------------ */

const inventoryValue = INVENTORY_ITEMS.reduce((s, i) => s + i.onHand * i.unitCost, 0);
const belowReorder = INVENTORY_ITEMS.filter((i) => i.onHand - i.reserved <= i.reorderLevel).length;

const assetsNbv = FIXED_ASSETS.reduce((s, a) => s + a.netBookValue, 0);
const underRepair = FIXED_ASSETS.filter((a) => a.condition === 'under repair').length;

const budgetAllocated = BUDGET_LINE_ROWS.reduce((s, b) => s + b.allocated, 0);
const budgetAvailable = BUDGET_LINE_ROWS.reduce((s, b) => s + b.available, 0);
const overCommitted = BUDGET_LINE_ROWS.filter((b) => b.utilisation > 100).length;

const openReqs = REQUISITIONS.filter((r) => r.status === 'pending').length;
const openPos = PURCHASE_ORDERS.filter((p) => p.lines.some((l) => l.receivedQuantity < l.quantity)).length;

const pendingLeave = LEAVE_REQUESTS.filter((r) => r.status === 'pending').length;
const draftRun = PAYROLL_RUNS.find((r) => r.status === 'draft');

const pendingApprovals = APPROVAL_QUEUE.length;

const suppliersSeed = suppliersStore.seed;
const prequalified = suppliersSeed.filter((s) => s.prequalStatus === 'prequalified').length;
const imprestSeed = imprestStore.seed;
const imprestPendingSurrender = imprestSeed.filter((i) => i.status === 'pendingSurrender').length;
const prepaymentsSeed = prepaymentsStore.seed;
const prepaymentsApprovedValue = prepaymentsSeed.filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
const prepaymentsPending = prepaymentsSeed.filter((p) => p.status === 'pending').length;

/**
 * One summary per module. The role dashboard renders a card for each module the
 * signed-in user can access, so the same data drives every role's dashboard.
 */
export const MODULE_SUMMARIES: Record<ModuleId, ModuleSummary> = {
  finance: {
    id: 'finance',
    headline: { label: 'September net payable', value: formatMoneyCompact(357247800) },
    stats: [
      { label: 'Unposted journals', value: '2', tone: 'warning' },
      { label: 'Pending approvals', value: String(pendingApprovals) },
      { label: 'Unreconciled bank items', value: '6' }
    ],
    href: '/finance',
    cta: 'Open Finance'
  },
  hr: {
    id: 'hr',
    headline: { label: 'Payroll — employees in scope', value: draftRun ? draftRun.employees.toLocaleString() : '1,248' },
    stats: [
      { label: 'Run in progress', value: draftRun ? 'September' : 'None', tone: draftRun ? 'warning' : 'default' },
      { label: 'Leave requests pending', value: String(pendingLeave) },
      { label: 'Blocking exceptions', value: '2', tone: 'danger' }
    ],
    href: '/hr/payroll',
    cta: 'Open HR'
  },
  procurement: {
    id: 'procurement',
    headline: { label: 'Requisitions awaiting approval', value: String(openReqs) },
    stats: [
      { label: 'Open purchase orders', value: String(openPos) },
      { label: 'Total requisitions', value: String(REQUISITIONS.length) },
      { label: 'Awaiting delivery', value: String(openPos), tone: 'warning' }
    ],
    href: '/procurement/requisitions',
    cta: 'Open Procurement'
  },
  inventory: {
    id: 'inventory',
    headline: { label: 'Stock value on hand', value: formatMoneyCompact(inventoryValue) },
    stats: [
      { label: 'Items below reorder', value: String(belowReorder), tone: belowReorder > 0 ? 'warning' : 'success' },
      { label: 'Distinct items', value: String(INVENTORY_ITEMS.length) },
      { label: 'Warehouses', value: '3' }
    ],
    href: '/inventory/items',
    cta: 'Open Inventory'
  },
  assets: {
    id: 'assets',
    headline: { label: 'Net book value', value: formatMoneyCompact(assetsNbv) },
    stats: [
      { label: 'Assets tracked', value: String(FIXED_ASSETS.length) },
      { label: 'Under repair', value: String(underRepair), tone: underRepair > 0 ? 'warning' : 'success' },
      { label: 'Fully depreciated', value: String(FIXED_ASSETS.filter((a) => a.netBookValue === 0).length) }
    ],
    href: '/assets/register',
    cta: 'Open Fixed Assets'
  },
  budgeting: {
    id: 'budgeting',
    headline: { label: 'Budget available', value: formatMoneyCompact(budgetAvailable) },
    stats: [
      { label: 'Total allocated', value: formatMoneyCompact(budgetAllocated) },
      { label: 'Utilisation', value: `${Math.round(((budgetAllocated - budgetAvailable) / budgetAllocated) * 100)}%` },
      { label: 'Over-committed lines', value: String(overCommitted), tone: overCommitted > 0 ? 'danger' : 'success' }
    ],
    href: '/budgeting/lines',
    cta: 'Open Budgeting'
  },
  suppliers: {
    id: 'suppliers',
    headline: { label: 'Registered suppliers', value: String(suppliersSeed.length) },
    stats: [
      { label: 'Prequalified', value: String(prequalified), tone: 'success' },
      { label: 'Pending prequalification', value: String(suppliersSeed.filter((s) => s.prequalStatus === 'pending').length), tone: 'warning' },
      { label: 'Disqualified', value: String(suppliersSeed.filter((s) => s.prequalStatus === 'disqualified').length) }
    ],
    href: '/suppliers/registry',
    cta: 'Open Suppliers'
  },
  imprest: {
    id: 'imprest',
    headline: { label: 'Imprests issued', value: String(imprestSeed.filter((i) => i.status !== 'draft').length) },
    stats: [
      { label: 'Pending surrender', value: String(imprestPendingSurrender), tone: imprestPendingSurrender > 0 ? 'warning' : 'success' },
      { label: 'Retired', value: String(imprestSeed.filter((i) => i.status === 'retired').length) },
      { label: 'Total records', value: String(imprestSeed.length) }
    ],
    href: '/imprest/requests',
    cta: 'Open Imprest'
  },
  prepayment: {
    id: 'prepayment',
    headline: { label: 'Approved prepayments', value: formatMoneyCompact(prepaymentsApprovedValue) },
    stats: [
      { label: 'Pending approval', value: String(prepaymentsPending), tone: prepaymentsPending > 0 ? 'warning' : 'default' },
      { label: 'Total records', value: String(prepaymentsSeed.length) },
      { label: 'Being amortized', value: String(prepaymentsSeed.filter((p) => p.status === 'approved').length) }
    ],
    href: '/prepayment/requests',
    cta: 'Open Prepayments'
  },
  reports: {
    id: 'reports',
    headline: { label: 'Reports available', value: '5' },
    stats: [
      { label: 'Live reports', value: '4', tone: 'success' },
      { label: 'Cross-module', value: 'Yes' },
      { label: 'Export', value: 'XLSX / PDF' }
    ],
    href: '/reports',
    cta: 'Open Reports'
  },
  admin: {
    id: 'admin',
    headline: { label: 'Active users', value: '5' },
    stats: [
      { label: 'Roles configured', value: '5' },
      { label: 'Modules', value: '11' },
      { label: 'Permission changes', value: 'Live' }
    ],
    href: '/admin/organization',
    cta: 'Open Administration'
  }
};

/** Exact-figure variant for a couple of headline tiles used elsewhere. */
export const FINANCE_NET_PAYABLE = formatMoney(357247800);
