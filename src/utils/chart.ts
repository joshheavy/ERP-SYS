/**
 * Categorical chart palette. Charts read colours from here (which map to the
 * --c-chart-* CSS tokens) so every chart in the product is consistent and
 * theme-aware, instead of each borrowing the primary colour.
 */
export const CHART_COLORS = [
  'var(--c-chart-1)',
  'var(--c-chart-2)',
  'var(--c-chart-3)',
  'var(--c-chart-4)',
  'var(--c-chart-5)'
] as const;

/** Pick a series colour by index, wrapping if there are more series than hues. */
export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Shared axis/grid/tooltip styling tokens for Recharts. */
export const CHART_TOKENS = {
  grid: 'var(--c-chart-grid)',
  axisText: 'var(--c-text-subtle)',
  tooltipBg: 'var(--c-surface)',
  tooltipBorder: 'var(--c-border)',
  tooltipText: 'var(--c-text)'
};
