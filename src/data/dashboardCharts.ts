import type { ModuleId } from '../types/common';

/* ==========================================================================
   Dashboard chart data. Kept separate from the module fixtures so the visual
   layer (charts) has purpose-built series. Figures are in KSh millions unless
   noted, matching the Kenyan context.
   ========================================================================== */

/** 12-month revenue vs spend trend — drives the headline area chart. */
export interface TrendPoint {
  month: string;
  revenue: number;
  spend: number;
  /** Index signature so the point is assignable to the chart's generic row type. */
  [key: string]: string | number;
}

export const REVENUE_TREND: TrendPoint[] = [
  { month: 'Oct', revenue: 512, spend: 468 },
  { month: 'Nov', revenue: 528, spend: 472 },
  { month: 'Dec', revenue: 596, spend: 511 },
  { month: 'Jan', revenue: 544, spend: 489 },
  { month: 'Feb', revenue: 561, spend: 495 },
  { month: 'Mar', revenue: 603, spend: 522 },
  { month: 'Apr', revenue: 588, spend: 507 },
  { month: 'May', revenue: 624, spend: 531 },
  { month: 'Jun', revenue: 641, spend: 548 },
  { month: 'Jul', revenue: 668, spend: 559 },
  { month: 'Aug', revenue: 692, spend: 571 },
  { month: 'Sep', revenue: 724, spend: 586 }
];

/** Income vs expense per weekday — drives the grouped bar chart. */
export interface IncomeExpensePoint {
  day: string;
  income: number;
  expense: number;
  /** Index signature so the point is assignable to the chart's generic row type. */
  [key: string]: string | number;
}

export const INCOME_EXPENSE: IncomeExpensePoint[] = [
  { day: 'Mon', income: 84, expense: 62 },
  { day: 'Tue', income: 72, expense: 55 },
  { day: 'Wed', income: 96, expense: 71 },
  { day: 'Thu', income: 68, expense: 58 },
  { day: 'Fri', income: 110, expense: 74 },
  { day: 'Sat', income: 44, expense: 31 },
  { day: 'Sun', income: 28, expense: 19 }
];

/** Budget split by category — drives the donut composition. */
export interface CompositionSlice {
  name: string;
  value: number;
  colorIndex: number;
}

export const BUDGET_COMPOSITION: CompositionSlice[] = [
  { name: 'Payroll', value: 486, colorIndex: 0 },
  { name: 'Operations', value: 142, colorIndex: 1 },
  { name: 'Capital', value: 98, colorIndex: 2 },
  { name: 'Travel', value: 41, colorIndex: 3 },
  { name: 'Other', value: 33, colorIndex: 4 }
];

/** Tiny per-module trend series for KPI sparklines (last 8 points). */
export const MODULE_SPARKLINES: Record<ModuleId, number[]> = {
  finance: [340, 348, 352, 349, 356, 353, 357, 357],
  hr: [1236, 1240, 1238, 1244, 1246, 1247, 1248, 1248],
  procurement: [3, 4, 3, 5, 4, 6, 5, 4],
  inventory: [72, 70, 74, 69, 73, 71, 70, 68],
  assets: [61, 61, 60, 60, 59, 59, 58, 58],
  budgeting: [52, 55, 58, 61, 63, 66, 69, 72],
  suppliers: [9, 9, 10, 10, 11, 11, 12, 12],
  imprest: [5, 6, 5, 7, 6, 8, 7, 8],
  prepayment: [3, 3, 4, 4, 3, 4, 4, 4],
  reports: [2, 2, 3, 3, 4, 4, 5, 5],
  admin: [4, 4, 5, 5, 5, 5, 5, 5]
};

/** Headline KPI tiles for the dashboard band. */
export interface KpiTile {
  id: string;
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down' | 'flat';
  /** Is an upward move good for this metric? Drives the delta colour. */
  goodUp: boolean;
  sparkKey: ModuleId;
  colorIndex: number;
}

export const DASHBOARD_KPIS: KpiTile[] = [
  { id: 'k1', label: 'Net payable', value: 'KSh 357.2M', delta: '+1.5%', direction: 'up', goodUp: false, sparkKey: 'finance', colorIndex: 0 },
  { id: 'k2', label: 'Employees paid', value: '1,248', delta: '+8', direction: 'up', goodUp: true, sparkKey: 'hr', colorIndex: 1 },
  { id: 'k3', label: 'Budget available', value: 'KSh 41.8M', delta: '+12%', direction: 'up', goodUp: true, sparkKey: 'budgeting', colorIndex: 2 },
  { id: 'k4', label: 'Pending approvals', value: '7', delta: '-3', direction: 'down', goodUp: false, sparkKey: 'procurement', colorIndex: 3 }
];
