import type React from 'react';
import {
  AwardIcon,
  BoxesIcon,
  BriefcaseIcon,
  Building2Icon,
  BuildingIcon,
  ArrowDownCircleIcon,
  ArrowLeftRightIcon,
  ArrowUpCircleIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CoinsIcon,
  FileBarChartIcon,
  GavelIcon,
  InboxIcon,
  LandmarkIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareWarningIcon,
  NetworkIcon,
  PackageMinusIcon,
  PackagePlusIcon,
  PackageSearchIcon,
  PercentIcon,
  PiggyBankIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TargetIcon,
  TrendingUpIcon,
  TruckIcon,
  UploadIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon
} from
  'lucide-react';
import type { ModuleId, Role } from '../types/common';

/* ==========================================================================
   RAW navigation data. This is the hand-authored source the MODULE_REGISTRY
   assembles from. Application code should NOT import from here directly — it
   should import the derived, registry-backed constants from ../data/navigation
   (which are produced by src/core/module/selectors.ts). As each module is moved
   into src/modules/<id>, its slice of this data moves into that module's
   manifest and is deleted from here.
   ========================================================================== */

export interface NavPage {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; }>;
  badge?: number;
  /** Present in the real product but not built in this prototype. */
  stub?: boolean;
}

export interface NavGroup {
  label?: string;
  pages: NavPage[];
  /**
   * Marks this group as a SELLABLE SUB-MODULE. When set, the group (and its
   * pages/routes/commands) is gated on the install's sub-module license: it is
   * shown only where the sub-module is entitled AND the role is permitted.
   * Groups WITHOUT a submoduleId are CORE — always on when the parent module is
   * entitled. The id must be stable and namespaced by module, e.g.
   * 'finance.subledgers'. `submoduleLabel` overrides the display name shown on
   * the licensing screen (defaults to the group's `label`).
   */
  submoduleId?: string;
  submoduleLabel?: string;
}

export interface ModuleNav {
  id: ModuleId;
  label: string;
  shortLabel?: string;
  blurb?: string;
  icon: React.ComponentType<{ className?: string; }>;
  home: string;
  groups: NavGroup[];
}

export interface RailSection {
  label: string;
  moduleIds: ModuleId[];
}

export interface CommandItem {
  id: string;
  label: string;
  group: string;
  path: string;
  keywords: string;
  shortcut?: string;
}

export const RAW_MODULES: ModuleNav[] = [
  {
    id: 'finance',
    label: 'Finance',
    shortLabel: 'Finance',
    blurb: 'General ledger, journals, reports and period close.',
    icon: LandmarkIcon,
    home: '/finance',
    groups: [
      {
        pages: [
          { label: 'Dashboard', path: '/finance', icon: LayoutDashboardIcon },
          { label: 'Approvals', path: '/approvals', icon: InboxIcon, badge: 7 }]
      },
      {
        label: 'General ledger',
        pages: [
          { label: 'Journal entries', path: '/finance/journals', icon: ReceiptIcon },
          { label: 'General ledger', path: '/finance/ledger', icon: BookOpenIcon },
          { label: 'Chart of accounts', path: '/finance/accounts', icon: CoinsIcon },
          { label: 'Bank reconciliation', path: '/finance/reconciliation', icon: WalletIcon }]
      },
      {
        label: 'Sub-ledgers',
        submoduleId: 'finance.subledgers',
        pages: [
          { label: 'Accounts payable', path: '/finance/payables', icon: ArrowUpCircleIcon },
          { label: 'Accounts receivable', path: '/finance/receivables', icon: ArrowDownCircleIcon }]
      },
      {
        label: 'Reporting',
        submoduleId: 'finance.reporting',
        pages: [
          { label: 'Trial balance', path: '/finance/reports/trial-balance', icon: FileBarChartIcon },
          { label: 'Income statement', path: '/finance/reports/income', icon: FileBarChartIcon }]
      },
      {
        label: 'Configuration',
        submoduleId: 'finance.configuration',
        pages: [
          { label: 'Fiscal periods', path: '/finance/periods', icon: CalendarRangeIcon },
          { label: 'Currencies', path: '/finance/currencies', icon: CoinsIcon },
          { label: 'Tax configuration', path: '/finance/tax', icon: PercentIcon },
          { label: 'Finance settings', path: '/finance/settings', icon: SettingsIcon }]
      }]
  },
  {
    id: 'hr',
    label: 'Human Resources',
    shortLabel: 'People',
    blurb: 'Employees, leave and the 17-step payroll.',
    icon: UsersIcon,
    home: '/hr',
    groups: [
      {
        pages: [
          { label: 'Dashboard', path: '/hr', icon: LayoutDashboardIcon },
          { label: 'Approvals', path: '/approvals', icon: InboxIcon, badge: 7 },
          { label: 'Employees', path: '/hr/employees', icon: UsersIcon }]
      },
      {
        label: 'Organization',
        pages: [
          { label: 'Branches', path: '/hr/org/branches', icon: Building2Icon },
          { label: 'Departments', path: '/hr/org/departments', icon: NetworkIcon },
          { label: 'Job grades', path: '/hr/org/grades', icon: LayersIcon },
          { label: 'Job steps', path: '/hr/org/steps', icon: CoinsIcon },
          { label: 'Job roles', path: '/hr/org/roles', icon: BriefcaseIcon },
          { label: 'Holidays', path: '/hr/holidays', icon: CalendarDaysIcon }]
      },
      {
        label: 'Recruitment',
        submoduleId: 'hr.recruitment',
        pages: [
          { label: 'Jobs', path: '/hr/recruitment/jobs', icon: BriefcaseIcon },
          { label: 'Applications', path: '/hr/recruitment/applications', icon: ClipboardListIcon },
          { label: 'Interviews', path: '/hr/recruitment/interviews', icon: CalendarClockIcon }]
      },
      {
        label: 'Performance',
        submoduleId: 'hr.performance',
        pages: [
          { label: 'KPIs', path: '/hr/performance/kpis', icon: TargetIcon },
          { label: 'Staff goals', path: '/hr/performance/goals', icon: AwardIcon },
          { label: 'Reports', path: '/hr/performance/reports', icon: FileBarChartIcon }]
      },
      {
        label: 'Employee relations',
        submoduleId: 'hr.relations',
        pages: [
          { label: 'Grievances', path: '/hr/relations/grievances', icon: MessageSquareWarningIcon },
          { label: 'Disciplinary cases', path: '/hr/relations/disciplinary', icon: GavelIcon }]
      },
      {
        label: 'Payroll',
        submoduleId: 'hr.payroll',
        pages: [
          { label: 'Payroll runs', path: '/hr/payroll', icon: WalletIcon },
          { label: 'Pay structures', path: '/hr/payroll/structures', icon: CoinsIcon }]
      },
      {
        label: 'Statutory',
        submoduleId: 'hr.statutory',
        pages: [
          { label: 'PAYE bands', path: '/hr/statutory/paye', icon: PercentIcon },
          { label: 'NSSF', path: '/hr/statutory/nssf', icon: PiggyBankIcon },
          { label: 'SHIF & levies', path: '/hr/statutory/rates', icon: ShieldCheckIcon }]
      },
      {
        label: 'Leave',
        submoduleId: 'hr.leave',
        pages: [
          { label: 'Leave requests', path: '/hr/leave/requests', icon: ClipboardListIcon, badge: 4 },
          { label: 'Team calendar', path: '/hr/leave/calendar', icon: CalendarDaysIcon }]
      },
      {
        label: 'Offboarding',
        submoduleId: 'hr.offboarding',
        pages: [
          { label: 'Exit management', path: '/hr/exits', icon: LogOutIcon }]
      },
      {
        label: 'Tools',
        submoduleId: 'hr.tools',
        pages: [
          { label: 'Bulk uploads', path: '/hr/bulk-uploads', icon: UploadIcon }]
      }]
  },
  {
    id: 'procurement',
    label: 'Procurement',
    shortLabel: 'Procure',
    blurb: 'Requisitions, purchase orders and goods receipts.',
    icon: ShoppingCartIcon,
    home: '/procurement',
    groups: [
      {
        pages: [
          { label: 'Dashboard', path: '/procurement', icon: LayoutDashboardIcon },
          { label: 'Approvals', path: '/approvals', icon: InboxIcon, badge: 7 }]
      },
      {
        label: 'Source to receipt',
        pages: [
          { label: 'Requisitions', path: '/procurement/requisitions', icon: ClipboardListIcon },
          { label: 'Purchase orders', path: '/procurement/orders', icon: ShoppingCartIcon },
          { label: 'Goods receipts', path: '/procurement/receipts', icon: TruckIcon }]
      },
      {
        label: 'Master data',
        submoduleId: 'procurement.vendors',
        submoduleLabel: 'Vendors',
        pages: [{ label: 'Vendors', path: '/procurement/vendors', icon: BuildingIcon }]
      }]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    shortLabel: 'Stock',
    blurb: 'Item balances, movements and stock valuation.',
    icon: BoxesIcon,
    home: '/inventory',
    groups: [
      {
        pages: [{ label: 'Dashboard', path: '/inventory', icon: LayoutDashboardIcon }]
      },
      {
        label: 'Stock',
        pages: [
          { label: 'Item balances', path: '/inventory/items', icon: PackageSearchIcon },
          { label: 'Stock movements', path: '/inventory/movements', icon: TruckIcon }]
      }]
  },
  {
    id: 'assets',
    label: 'Fixed Assets',
    shortLabel: 'Assets',
    blurb: 'Asset register and depreciation.',
    icon: BuildingIcon,
    home: '/assets',
    groups: [
      {
        pages: [{ label: 'Dashboard', path: '/assets', icon: LayoutDashboardIcon }]
      },
      {
        label: 'Register',
        pages: [
          { label: 'Asset register', path: '/assets/register', icon: BuildingIcon },
          { label: 'Verification', path: '/assets/verification', icon: ClipboardCheckIcon },
          { label: 'Depreciation runs', path: '/assets/depreciation', icon: FileBarChartIcon }]
      },
      {
        label: 'Transactions',
        submoduleId: 'assets.transactions',
        pages: [
          { label: 'Acquisitions', path: '/assets/acquisitions', icon: PackagePlusIcon },
          { label: 'Transfers', path: '/assets/transfers', icon: ArrowLeftRightIcon },
          { label: 'Revaluation', path: '/assets/revaluation', icon: TrendingUpIcon },
          { label: 'Disposals', path: '/assets/disposals', icon: PackageMinusIcon }]
      },
      {
        label: 'Master data',
        pages: [
          { label: 'Categories', path: '/assets/categories', icon: LayersIcon }]
      },
      {
        label: 'Reporting',
        submoduleId: 'assets.reporting',
        pages: [
          { label: 'Reports', path: '/assets/reports', icon: FileBarChartIcon }]
      }]
  },
  {
    id: 'budgeting',
    label: 'Budgeting',
    shortLabel: 'Budget',
    blurb: 'Budget lines, commitments and virements.',
    icon: PiggyBankIcon,
    home: '/budgeting',
    groups: [
      {
        pages: [{ label: 'Dashboard', path: '/budgeting', icon: LayoutDashboardIcon }]
      },
      {
        label: 'Plan',
        pages: [
          { label: 'Budget lines', path: '/budgeting/lines', icon: PiggyBankIcon },
          { label: 'Virements', path: '/budgeting/virements', icon: CoinsIcon }]
      }]
  }
  // NOTE: the 'admin' module is intentionally NOT here — it has been migrated to
  // src/modules/admin/admin.module.ts as the reference module manifest, and is
  // registered directly in the MODULE_REGISTRY.
];

export const RAW_ROLE_MODULES: Record<Role, ModuleId[]> = {
  admin: ['finance', 'hr', 'procurement', 'inventory', 'assets', 'budgeting'],
  manager: ['finance', 'hr', 'procurement', 'inventory', 'assets', 'budgeting'],
  officer: ['hr', 'procurement', 'inventory', 'assets', 'budgeting'],
  auditor: ['finance', 'hr', 'procurement', 'inventory', 'assets', 'budgeting'],
  employee: []
};

export const RAW_RAIL_SECTIONS: RailSection[] = [
  { label: 'Operations', moduleIds: ['procurement', 'inventory', 'assets'] },
  { label: 'People', moduleIds: ['hr'] },
  { label: 'Business', moduleIds: ['finance', 'budgeting'] }
];

export const RAW_ROUTE_META: Record<string, { module: ModuleId; trail: string[]; }> = {
  '/finance': { module: 'finance', trail: ['Finance', 'Dashboard'] },
  '/hr': { module: 'hr', trail: ['Human Resources', 'Dashboard'] },
  '/procurement': { module: 'procurement', trail: ['Procurement', 'Dashboard'] },
  '/inventory': { module: 'inventory', trail: ['Inventory', 'Dashboard'] },
  '/assets': { module: 'assets', trail: ['Fixed Assets', 'Dashboard'] },
  '/budgeting': { module: 'budgeting', trail: ['Budgeting', 'Dashboard'] },
  '/finance/journals': { module: 'finance', trail: ['Finance', 'General ledger', 'Journal entries'] },
  '/finance/ledger': { module: 'finance', trail: ['Finance', 'General ledger', 'General ledger'] },
  '/finance/accounts': { module: 'finance', trail: ['Finance', 'General ledger', 'Chart of accounts'] },
  '/finance/reconciliation': { module: 'finance', trail: ['Finance', 'General ledger', 'Bank reconciliation'] },
  '/finance/payables': { module: 'finance', trail: ['Finance', 'Sub-ledgers', 'Accounts payable'] },
  '/finance/receivables': { module: 'finance', trail: ['Finance', 'Sub-ledgers', 'Accounts receivable'] },
  '/finance/reports/trial-balance': { module: 'finance', trail: ['Finance', 'Reporting', 'Trial balance'] },
  '/finance/reports/income': { module: 'finance', trail: ['Finance', 'Reporting', 'Income statement'] },
  '/finance/periods': { module: 'finance', trail: ['Finance', 'Configuration', 'Fiscal periods'] },
  '/finance/currencies': { module: 'finance', trail: ['Finance', 'Configuration', 'Currencies'] },
  '/finance/tax': { module: 'finance', trail: ['Finance', 'Configuration', 'Tax configuration'] },
  '/finance/settings': { module: 'finance', trail: ['Finance', 'Configuration', 'Finance settings'] },
  '/hr/payroll': { module: 'hr', trail: ['Human Resources', 'Payroll', 'Payroll runs'] },
  '/hr/payroll/run': { module: 'hr', trail: ['Human Resources', 'Payroll', 'Run payroll'] },
  '/hr/payroll/structures': { module: 'hr', trail: ['Human Resources', 'Payroll', 'Pay structures'] },
  '/hr/employees': { module: 'hr', trail: ['Human Resources', 'People', 'Employees'] },
  '/hr/org/branches': { module: 'hr', trail: ['Human Resources', 'Organization', 'Branches'] },
  '/hr/org/departments': { module: 'hr', trail: ['Human Resources', 'Organization', 'Departments'] },
  '/hr/org/grades': { module: 'hr', trail: ['Human Resources', 'Organization', 'Job grades'] },
  '/hr/org/steps': { module: 'hr', trail: ['Human Resources', 'Organization', 'Job steps'] },
  '/hr/org/roles': { module: 'hr', trail: ['Human Resources', 'Organization', 'Job roles'] },
  '/hr/holidays': { module: 'hr', trail: ['Human Resources', 'Organization', 'Holidays'] },
  '/hr/bulk-uploads': { module: 'hr', trail: ['Human Resources', 'Tools', 'Bulk uploads'] },
  '/hr/recruitment/jobs': { module: 'hr', trail: ['Human Resources', 'Recruitment', 'Jobs'] },
  '/hr/recruitment/applications': { module: 'hr', trail: ['Human Resources', 'Recruitment', 'Applications'] },
  '/hr/recruitment/interviews': { module: 'hr', trail: ['Human Resources', 'Recruitment', 'Interviews'] },
  '/hr/performance/kpis': { module: 'hr', trail: ['Human Resources', 'Performance', 'KPIs'] },
  '/hr/performance/goals': { module: 'hr', trail: ['Human Resources', 'Performance', 'Staff goals'] },
  '/hr/performance/reports': { module: 'hr', trail: ['Human Resources', 'Performance', 'Reports'] },
  '/hr/relations/grievances': { module: 'hr', trail: ['Human Resources', 'Employee relations', 'Grievances'] },
  '/hr/relations/disciplinary': { module: 'hr', trail: ['Human Resources', 'Employee relations', 'Disciplinary cases'] },
  '/hr/statutory/paye': { module: 'hr', trail: ['Human Resources', 'Statutory', 'PAYE bands'] },
  '/hr/statutory/nssf': { module: 'hr', trail: ['Human Resources', 'Statutory', 'NSSF'] },
  '/hr/statutory/rates': { module: 'hr', trail: ['Human Resources', 'Statutory', 'SHIF & levies'] },
  '/hr/leave/requests': { module: 'hr', trail: ['Human Resources', 'Leave', 'Leave requests'] },
  '/hr/leave/calendar': { module: 'hr', trail: ['Human Resources', 'Leave', 'Team calendar'] },
  '/hr/exits': { module: 'hr', trail: ['Human Resources', 'Offboarding', 'Exit management'] },
  '/procurement/requisitions': { module: 'procurement', trail: ['Procurement', 'Source to receipt', 'Requisitions'] },
  '/procurement/requisitions/new': { module: 'procurement', trail: ['Procurement', 'Requisitions', 'New requisition'] },
  '/procurement/orders': { module: 'procurement', trail: ['Procurement', 'Source to receipt', 'Purchase orders'] },
  '/procurement/receipts': { module: 'procurement', trail: ['Procurement', 'Source to receipt', 'Goods receipts'] },
  '/procurement/vendors': { module: 'procurement', trail: ['Procurement', 'Suppliers', 'Vendors'] },
  '/inventory/items': { module: 'inventory', trail: ['Inventory', 'Stock', 'Item balances'] },
  '/inventory/movements': { module: 'inventory', trail: ['Inventory', 'Stock', 'Stock movements'] },
  '/assets/register': { module: 'assets', trail: ['Fixed Assets', 'Register', 'Asset register'] },
  '/assets/verification': { module: 'assets', trail: ['Fixed Assets', 'Register', 'Verification'] },
  '/assets/depreciation': { module: 'assets', trail: ['Fixed Assets', 'Register', 'Depreciation runs'] },
  '/assets/acquisitions': { module: 'assets', trail: ['Fixed Assets', 'Transactions', 'Acquisitions'] },
  '/assets/transfers': { module: 'assets', trail: ['Fixed Assets', 'Transactions', 'Transfers'] },
  '/assets/revaluation': { module: 'assets', trail: ['Fixed Assets', 'Transactions', 'Revaluation'] },
  '/assets/disposals': { module: 'assets', trail: ['Fixed Assets', 'Transactions', 'Disposals'] },
  '/assets/categories': { module: 'assets', trail: ['Fixed Assets', 'Master data', 'Categories'] },
  '/assets/reports': { module: 'assets', trail: ['Fixed Assets', 'Reporting', 'Reports'] },
  '/budgeting/lines': { module: 'budgeting', trail: ['Budgeting', 'Plan', 'Budget lines'] },
  '/budgeting/virements': { module: 'budgeting', trail: ['Budgeting', 'Plan', 'Virements'] }
};

export const RAW_COMMANDS: CommandItem[] = [
  { id: 'c1', label: 'Run payroll', group: 'Actions', path: '/hr/payroll/run', keywords: 'payroll wizard salary', shortcut: 'R' },
  { id: 'c2', label: 'New requisition', group: 'Actions', path: '/procurement/requisitions/new', keywords: 'requisition purchase raise' },
  { id: 'c4', label: 'Payroll runs', group: 'Human Resources', path: '/hr/payroll', keywords: 'payroll runs register' },
  { id: 'c5', label: 'Leave requests', group: 'Human Resources', path: '/hr/leave/requests', keywords: 'leave absence' },
  { id: 'c6', label: 'Team leave calendar', group: 'Human Resources', path: '/hr/leave/calendar', keywords: 'calendar coverage' },
  { id: 'c5a', label: 'Employees', group: 'Human Resources', path: '/hr/employees', keywords: 'employees staff people register' },
  { id: 'c5b', label: 'Branches', group: 'Human Resources', path: '/hr/org/branches', keywords: 'branches offices organization structure' },
  { id: 'c5c', label: 'Departments', group: 'Human Resources', path: '/hr/org/departments', keywords: 'departments organization structure' },
  { id: 'c5m', label: 'Holidays', group: 'Human Resources', path: '/hr/holidays', keywords: 'holidays public company calendar days off non-working' },
  { id: 'c5n', label: 'Job steps', group: 'Human Resources', path: '/hr/org/steps', keywords: 'job steps salary notch grade progression scale' },
  { id: 'c5o', label: 'Job roles', group: 'Human Resources', path: '/hr/org/roles', keywords: 'job roles positions titles grade department headcount' },
  { id: 'c5p', label: 'Bulk uploads', group: 'Human Resources', path: '/hr/bulk-uploads', keywords: 'bulk upload import csv data mass load' },
  { id: 'c5d', label: 'Jobs & recruitment', group: 'Human Resources', path: '/hr/recruitment/jobs', keywords: 'jobs recruitment hiring vacancies' },
  { id: 'c5k', label: 'Interviews', group: 'Human Resources', path: '/hr/recruitment/interviews', keywords: 'interviews recruitment schedule panel candidate outcome recommend' },
  { id: 'c5e', label: 'Staff goals', group: 'Human Resources', path: '/hr/performance/goals', keywords: 'performance goals kpi appraisal scorecard' },
  { id: 'c5l', label: 'Performance reports', group: 'Human Resources', path: '/hr/performance/reports', keywords: 'performance reports balanced scorecard bsc kpi employee appraisal rating' },
  { id: 'c5f', label: 'Grievances', group: 'Human Resources', path: '/hr/relations/grievances', keywords: 'grievances employee relations complaints' },
  { id: 'c5j', label: 'Exit management', group: 'Human Resources', path: '/hr/exits', keywords: 'exit offboarding resignation termination retirement clearance leaving' },
  { id: 'c5g', label: 'PAYE tax bands', group: 'Human Resources', path: '/hr/statutory/paye', keywords: 'paye tax bands statutory payroll kra' },
  { id: 'c5h', label: 'NSSF tiers', group: 'Human Resources', path: '/hr/statutory/nssf', keywords: 'nssf pension statutory contribution tiers' },
  { id: 'c5i', label: 'SHIF & levies', group: 'Human Resources', path: '/hr/statutory/rates', keywords: 'shif nhif housing levy relief statutory' },
  { id: 'c7', label: 'Journal entries', group: 'Finance', path: '/finance/journals', keywords: 'gl ledger journal posting' },
  { id: 'c7a', label: 'General ledger', group: 'Finance', path: '/finance/ledger', keywords: 'gl general ledger account activity postings running balance' },
  { id: 'c8', label: 'Trial balance', group: 'Finance', path: '/finance/reports/trial-balance', keywords: 'report trial balance' },
  { id: 'c9', label: 'Finance settings', group: 'Finance', path: '/finance/settings', keywords: 'config settings period' },
  { id: 'c9a', label: 'Accounts payable', group: 'Finance', path: '/finance/payables', keywords: 'ap payable bills vendor supplier owed' },
  { id: 'c9b', label: 'Accounts receivable', group: 'Finance', path: '/finance/receivables', keywords: 'ar receivable invoices customer owed' },
  { id: 'c9c', label: 'Fiscal periods', group: 'Finance', path: '/finance/periods', keywords: 'periods close open accounting calendar' },
  { id: 'c9d', label: 'Currencies', group: 'Finance', path: '/finance/currencies', keywords: 'currency fx rate exchange' },
  { id: 'c9e', label: 'Tax configuration', group: 'Finance', path: '/finance/tax', keywords: 'tax vat wht paye rates' },
  { id: 'c10', label: 'Requisitions', group: 'Procurement', path: '/procurement/requisitions', keywords: 'requisition list' },
  { id: 'c11', label: 'Purchase orders', group: 'Procurement', path: '/procurement/orders', keywords: 'po vendor order' },
  { id: 'c12', label: 'Goods receipts', group: 'Procurement', path: '/procurement/receipts', keywords: 'grn receive delivery' },
  { id: 'c13', label: 'Item balances', group: 'Inventory', path: '/inventory/items', keywords: 'stock inventory items' },
  { id: 'c14', label: 'Asset register', group: 'Fixed Assets', path: '/assets/register', keywords: 'assets depreciation' },
  { id: 'c14e', label: 'Asset verification', group: 'Fixed Assets', path: '/assets/verification', keywords: 'assets verification stock take physical count tagging audit found' },
  { id: 'c14a', label: 'Asset acquisitions', group: 'Fixed Assets', path: '/assets/acquisitions', keywords: 'assets acquisition capitalise new' },
  { id: 'c14b', label: 'Asset transfers', group: 'Fixed Assets', path: '/assets/transfers', keywords: 'assets transfer custodian location move' },
  { id: 'c14f', label: 'Asset revaluation', group: 'Fixed Assets', path: '/assets/revaluation', keywords: 'assets revaluation revalue carrying value nbv impairment uplift fair value appraisal' },
  { id: 'c14c', label: 'Asset disposals', group: 'Fixed Assets', path: '/assets/disposals', keywords: 'assets disposal sale scrap write-off gain loss' },
  { id: 'c14d', label: 'Asset categories', group: 'Fixed Assets', path: '/assets/categories', keywords: 'assets categories classes depreciation method' },
  { id: 'c14g', label: 'Asset reports', group: 'Fixed Assets', path: '/assets/reports', keywords: 'assets reports register nbv depreciation movements summary export' },
  { id: 'c15', label: 'Budget lines', group: 'Budgeting', path: '/budgeting/lines', keywords: 'budget allocation variance' }
];

// Re-export the icon set the admin manifest needs, so it doesn't re-import lucide separately.
export { ShieldCheckIcon, UsersIcon, UserCogIcon };
