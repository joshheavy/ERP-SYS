import type React from 'react';

export interface Column<T> {
  id: string;
  header: string;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  /** Sort key. Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  /** Numeric columns are right-aligned and tabular. */
  numeric?: boolean;
  /** Minimum pixel width — drives the horizontal scroll of wide tables. */
  width?: number;
  /** Header group label, used by wide registers to band earnings vs. deductions. */
  group?: string;
  /** Hidden until turned on in the column menu. */
  defaultHidden?: boolean;
  /**
   * Per-cell semantic tone. Use `danger/success/warning` for alarms/status, and
   * `pos/neg` for money figures (a controlled finance green/red distinct from
   * the alarm colours). Always pair with a sign/label — never colour alone.
   */
  tone?: (row: T) => 'danger' | 'success' | 'warning' | 'pos' | 'neg' | undefined;
  /** Totals row content. */
  total?: (rows: T[]) => React.ReactNode;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; }>;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  disabledReason?: string;
  onRun: (ids: string[]) => void;
}

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}