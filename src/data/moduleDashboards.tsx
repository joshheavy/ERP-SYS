import type { ModuleId } from '../types/common';
import type { CompositionSlice } from './dashboardCharts';

/**
 * Per-module dashboard configuration. Each business module opens onto its own
 * dashboard (like the legacy Angular ERP) — a hero, KPI tiles, a chart and
 * quick links into the module's screens. A single reusable <ModuleDashboard>
 * renders whichever config it is handed, so all six look consistent.
 */

export interface ModuleKpi {
  label: string;
  value: string;
  delta?: string;
  direction?: 'up' | 'down' | 'flat';
  goodUp?: boolean;
  colorIndex: number;
}

export interface ModuleQuickLink {
  label: string;
  description: string;
  href: string;
}

export type ModuleChart =
  | { kind: 'area'; title: string; description: string; data: Record<string, number | string>[]; xKey: string; series: { key: string; label: string; colorIndex: number }[]; format?: 'money' | 'plain' }
  | { kind: 'bars'; title: string; description: string; data: Record<string, number | string>[]; xKey: string; series: { key: string; label: string; colorIndex: number }[]; format?: 'money' | 'plain' }
  | { kind: 'donut'; title: string; description: string; data: CompositionSlice[]; centerLabel: string; format?: 'money' | 'plain' };

export interface ModuleDashboardConfig {
  id: ModuleId;
  /** One-line hero subtitle. */
  tagline: string;
  kpis: ModuleKpi[];
  chart: ModuleChart;
  quickLinks: ModuleQuickLink[];
}

/* ----------------------------- Chart series ----------------------------- */

const HR_HEADCOUNT: Record<string, number | string>[] = [
  { month: 'Apr', headcount: 1231, joiners: 12 },
  { month: 'May', headcount: 1238, joiners: 9 },
  { month: 'Jun', headcount: 1240, joiners: 7 },
  { month: 'Jul', headcount: 1244, joiners: 11 },
  { month: 'Aug', headcount: 1247, joiners: 6 },
  { month: 'Sep', headcount: 1248, joiners: 5 }
];

const PROCUREMENT_SPEND: Record<string, number | string>[] = [
  { month: 'Apr', requisitions: 42, orders: 31 },
  { month: 'May', requisitions: 51, orders: 38 },
  { month: 'Jun', requisitions: 47, orders: 40 },
  { month: 'Jul', requisitions: 58, orders: 44 },
  { month: 'Aug', requisitions: 63, orders: 51 },
  { month: 'Sep', requisitions: 55, orders: 48 }
];

const INVENTORY_BY_CATEGORY: CompositionSlice[] = [
  { name: 'ICT hardware', value: 38, colorIndex: 0 },
  { name: 'Consumables', value: 22, colorIndex: 1 },
  { name: 'Spare parts', value: 18, colorIndex: 2 },
  { name: 'Stationery', value: 12, colorIndex: 3 },
  { name: 'Other', value: 10, colorIndex: 4 }
];

const ASSETS_BY_CLASS: CompositionSlice[] = [
  { name: 'Plant & machinery', value: 38, colorIndex: 0 },
  { name: 'Motor vehicles', value: 26, colorIndex: 1 },
  { name: 'ICT equipment', value: 18, colorIndex: 2 },
  { name: 'Furniture', value: 13, colorIndex: 3 },
  { name: 'Buildings', value: 5, colorIndex: 4 }
];

const BUDGET_UTILISATION: Record<string, number | string>[] = [
  { line: 'ICT capex', allocated: 68, used: 60 },
  { line: 'Facilities', allocated: 24, used: 28 },
  { line: 'Travel', allocated: 12, used: 18 },
  { line: 'Vehicles', allocated: 45, used: 12 }
];

const FINANCE_REVENUE: Record<string, number | string>[] = [
  { month: 'Apr', revenue: 588, spend: 507 },
  { month: 'May', revenue: 624, spend: 531 },
  { month: 'Jun', revenue: 641, spend: 548 },
  { month: 'Jul', revenue: 668, spend: 559 },
  { month: 'Aug', revenue: 692, spend: 571 },
  { month: 'Sep', revenue: 724, spend: 586 }
];

/* --------------------------- Dashboard configs -------------------------- */

export const MODULE_DASHBOARDS: Partial<Record<ModuleId, ModuleDashboardConfig>> = {
  finance: {
    id: 'finance',
    tagline: 'General ledger, journals, sub-ledgers and period close.',
    kpis: [
      { label: 'Net payable (Sep)', value: 'KSh 357.2M', delta: '+1.5%', direction: 'up', goodUp: false, colorIndex: 0 },
      { label: 'Unposted journals', value: '2', delta: '-1', direction: 'down', goodUp: true, colorIndex: 1 },
      { label: 'AR outstanding', value: 'KSh 33.9M', delta: '+4%', direction: 'up', goodUp: false, colorIndex: 2 },
      { label: 'AP outstanding', value: 'KSh 11.8M', delta: '-6%', direction: 'down', goodUp: true, colorIndex: 3 }
    ],
    chart: { kind: 'area', title: 'Revenue vs spend', description: 'Last 6 months, KSh millions.', data: FINANCE_REVENUE, xKey: 'month', series: [{ key: 'revenue', label: 'Revenue', colorIndex: 0 }, { key: 'spend', label: 'Spend', colorIndex: 1 }], format: 'money' },
    quickLinks: [
      { label: 'Journal entries', description: 'Post and review journals', href: '/finance/journals' },
      { label: 'Chart of accounts', description: 'Manage the ledger structure', href: '/finance/accounts' },
      { label: 'Accounts payable', description: 'Supplier bills & payments', href: '/finance/payables' },
      { label: 'Accounts receivable', description: 'Customer invoices', href: '/finance/receivables' },
      { label: 'Trial balance', description: 'Generate the period report', href: '/finance/reports/trial-balance' },
      { label: 'Fiscal periods', description: 'Open & close periods', href: '/finance/periods' }
    ]
  },
  hr: {
    id: 'hr',
    tagline: 'People, payroll, leave, recruitment and performance.',
    kpis: [
      { label: 'Headcount', value: '1,248', delta: '+5', direction: 'up', goodUp: true, colorIndex: 1 },
      { label: 'On leave today', value: '18', direction: 'flat', colorIndex: 2 },
      { label: 'Leave requests pending', value: '4', delta: '+2', direction: 'up', goodUp: false, colorIndex: 3 },
      { label: 'Open positions', value: '6', direction: 'flat', colorIndex: 0 }
    ],
    chart: { kind: 'area', title: 'Headcount trend', description: 'Last 6 months.', data: HR_HEADCOUNT, xKey: 'month', series: [{ key: 'headcount', label: 'Headcount', colorIndex: 1 }], format: 'plain' },
    quickLinks: [
      { label: 'Employees', description: 'The staff register', href: '/hr/employees' },
      { label: 'Payroll runs', description: 'Run and review payroll', href: '/hr/payroll' },
      { label: 'Leave requests', description: 'Approve staff leave', href: '/hr/leave/requests' },
      { label: 'Recruitment', description: 'Jobs and applications', href: '/hr/recruitment/jobs' },
      { label: 'Performance', description: 'KPIs and staff goals', href: '/hr/performance/goals' },
      { label: 'Organization', description: 'Branches & departments', href: '/hr/org/branches' }
    ]
  },
  procurement: {
    id: 'procurement',
    tagline: 'Requisitions, purchase orders, receipts and suppliers.',
    kpis: [
      { label: 'Requisitions pending', value: '4', delta: '+1', direction: 'up', goodUp: false, colorIndex: 3 },
      { label: 'Open purchase orders', value: '9', direction: 'flat', colorIndex: 0 },
      { label: 'Awaiting delivery', value: '5', direction: 'flat', colorIndex: 1 },
      { label: 'Active vendors', value: '12', delta: '+1', direction: 'up', goodUp: true, colorIndex: 2 }
    ],
    chart: { kind: 'bars', title: 'Requisitions vs orders', description: 'Last 6 months, count.', data: PROCUREMENT_SPEND, xKey: 'month', series: [{ key: 'requisitions', label: 'Requisitions', colorIndex: 0 }, { key: 'orders', label: 'Orders', colorIndex: 2 }], format: 'plain' },
    quickLinks: [
      { label: 'Requisitions', description: 'Raise and track requests', href: '/procurement/requisitions' },
      { label: 'Purchase orders', description: 'Issued orders', href: '/procurement/orders' },
      { label: 'Goods receipts', description: 'Record deliveries', href: '/procurement/receipts' },
      { label: 'Vendors', description: 'Supplier master data', href: '/procurement/vendors' }
    ]
  },
  inventory: {
    id: 'inventory',
    tagline: 'Stock balances, movements and valuation.',
    kpis: [
      { label: 'Stock value', value: 'KSh 68.4M', delta: '-2%', direction: 'down', goodUp: false, colorIndex: 0 },
      { label: 'Distinct items', value: '68', direction: 'flat', colorIndex: 1 },
      { label: 'Below reorder', value: '7', delta: '+2', direction: 'up', goodUp: false, colorIndex: 3 },
      { label: 'Warehouses', value: '3', direction: 'flat', colorIndex: 2 }
    ],
    chart: { kind: 'donut', title: 'Stock value by category', description: 'Share of on-hand value.', data: INVENTORY_BY_CATEGORY, centerLabel: 'Categories', format: 'plain' },
    quickLinks: [
      { label: 'Item balances', description: 'On-hand stock', href: '/inventory/items' },
      { label: 'Stock movements', description: 'Ins, outs and transfers', href: '/inventory/movements' }
    ]
  },
  assets: {
    id: 'assets',
    tagline: 'Register, depreciation, acquisitions and disposals.',
    kpis: [
      { label: 'Net book value', value: 'KSh 67.8M', delta: '-1%', direction: 'down', goodUp: false, colorIndex: 0 },
      { label: 'Assets tracked', value: '6', direction: 'flat', colorIndex: 1 },
      { label: 'Under repair', value: '1', direction: 'flat', colorIndex: 3 },
      { label: 'Pending disposals', value: '1', direction: 'flat', colorIndex: 2 }
    ],
    chart: { kind: 'donut', title: 'Net book value by class', description: 'Share of NBV.', data: ASSETS_BY_CLASS, centerLabel: 'Classes', format: 'plain' },
    quickLinks: [
      { label: 'Asset register', description: 'All tracked assets', href: '/assets/register' },
      { label: 'Depreciation runs', description: 'Monthly depreciation', href: '/assets/depreciation' },
      { label: 'Acquisitions', description: 'Capitalise new assets', href: '/assets/acquisitions' },
      { label: 'Disposals', description: 'Retire and sell assets', href: '/assets/disposals' }
    ]
  },
  budgeting: {
    id: 'budgeting',
    tagline: 'Budget lines, commitments and virements.',
    kpis: [
      { label: 'Budget available', value: 'KSh 41.8M', delta: '+12%', direction: 'up', goodUp: true, colorIndex: 2 },
      { label: 'Total allocated', value: 'KSh 149M', direction: 'flat', colorIndex: 0 },
      { label: 'Utilisation', value: '72%', delta: '+4%', direction: 'up', goodUp: false, colorIndex: 1 },
      { label: 'Over-committed lines', value: '1', direction: 'flat', colorIndex: 3 }
    ],
    chart: { kind: 'bars', title: 'Allocated vs used', description: 'By budget line, KSh millions.', data: BUDGET_UTILISATION, xKey: 'line', series: [{ key: 'allocated', label: 'Allocated', colorIndex: 0 }, { key: 'used', label: 'Used', colorIndex: 3 }], format: 'money' },
    quickLinks: [
      { label: 'Budget lines', description: 'Allocations and spend', href: '/budgeting/lines' },
      { label: 'Virements', description: 'Transfer between lines', href: '/budgeting/virements' }
    ]
  }
};
