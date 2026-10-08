'use client';
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilterXIcon,
  InboxIcon,
  LockIcon,
  SettingsIcon,
  XIcon
} from
  'lucide-react';
import { cn } from '../../utils/cn';
import { usePreferences } from '../../contexts/PreferencesContext';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Choice';
import { EmptyState, Skeleton } from '../ui/Card';
import { Segmented } from '../ui/Tabs';
import { Tooltip } from '../ui/Tooltip';
import { exportToCsv, exportToPdf, extractText } from '../../utils/export';
import type { BulkAction, Column } from './types';

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  caption: string;
  /** Left side of the toolbar — filter controls belong here. */
  toolbar?: React.ReactNode;
  state?: 'ready' | 'loading' | 'error' | 'no-permission';
  onRetry?: () => void;
  /** True when rows are empty because filters excluded everything. */
  filtered?: boolean;
  onClearFilters?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  activeRowId?: string;
  pinFirstColumn?: boolean;
  showTotals?: boolean;
  exportable?: boolean;
  onExport?: () => void;
  pageSize?: number;
  maxBodyHeight?: string;
  className?: string;
}

type SortState = { id: string; dir: 'asc' | 'desc'; } | null;

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  toolbar,
  state = 'ready',
  onRetry,
  filtered = false,
  onClearFilters,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear here once they are created.',
  emptyAction,
  selectable = false,
  bulkActions = [],
  rowActions,
  onRowClick,
  activeRowId,
  pinFirstColumn = false,
  showTotals = false,
  exportable = true,
  onExport,
  pageSize = 12,
  maxBodyHeight,
  className
}: DataTableProps<T>) {
  const { density, setDensity } = usePreferences();
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState<string[]>(columns.filter((c) => c.defaultHidden).map((c) => c.id));
  const [columnMenu, setColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [exportMenu, setExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPage(1), [rows.length, sort]);
  useEffect(() => {
    if (!columnMenu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setColumnMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [columnMenu]);
  useEffect(() => {
    if (!exportMenu) return;
    const onDown = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [exportMenu]);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.id));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc' ?
        String(av).localeCompare(String(bv)) :
        String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sort, columns]);

  /** Build headers + a plain-text matrix of ALL sorted rows for export.
   *  Prefers a column's sortValue (already plain); else extracts text from the
   *  rendered cell. Uses visible columns so export mirrors what's on screen. */
  const buildExportData = () => {
    const headers = visibleColumns.map((c) => c.header);
    const data = sorted.map((row) =>
      visibleColumns.map((col) => {
        if (col.sortValue) return String(col.sortValue(row));
        return extractText(col.cell(row));
      })
    );
    return { headers, data };
  };

  const runExport = (kind: 'csv' | 'pdf') => {
    setExportMenu(false);
    if (onExport) {
      onExport();
      return;
    }
    const { headers, data } = buildExportData();
    if (kind === 'csv') exportToCsv(caption, headers, data);
    else exportToPdf(caption, headers, data);
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const rowHeightClass = density === 'compact' ? 'h-8' : 'h-10';
  const cellPad = density === 'compact' ? 'px-2.5' : 'px-3';

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.includes(getRowId(r)));
  const someSelected = selected.length > 0;

  const toggleAll = (checked: boolean) => {
    const ids = pageRows.map(getRowId);
    setSelected((prev) => checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id)));
  };

  const groups = visibleColumns.some((c) => c.group);

  const headerCell = (col: Column<T>, index: number) => {
    const sortable = Boolean(col.sortValue);
    const active = sort?.id === col.id;
    const pinned = pinFirstColumn && index === 0;
    return (
      <th
        key={col.id}
        scope="col"
        style={{ minWidth: col.width ?? 120 }}
        className={cn(
          'sticky top-0 z-20 border-b border-line-strong bg-surface-2 text-caption font-semibold uppercase tracking-wider text-ink-subtle',
          cellPad,
          'py-2.5',
          col.numeric ? 'text-right' : 'text-left',
          pinned && 'left-0 z-30 bg-surface-2',
          pinned && selectable && 'left-9'
        )}>

        {sortable ?
          <button
            type="button"
            onClick={() =>
              setSort((prev) =>
                prev?.id === col.id ?
                  prev.dir === 'asc' ?
                    { id: col.id, dir: 'desc' } :
                    null :
                  { id: col.id, dir: 'asc' }
              )
            }
            aria-label={`Sort by ${col.header}`}
            className={cn(
              'inline-flex items-center gap-1 rounded-[3px] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              col.numeric && 'flex-row-reverse',
              active && 'text-ink'
            )}>

            {col.header}
            {active ?
              sort!.dir === 'asc' ?
                <ArrowUpIcon className="h-3 w-3" /> :

                <ArrowDownIcon className="h-3 w-3" /> :


              <ArrowUpIcon className="h-3 w-3 opacity-0 transition-opacity duration-fast group-hover/head:opacity-40" />
            }
          </button> :

          col.header
        }
      </th>);

  };

  const renderBody = () => {
    if (state === 'loading') {
      return Array.from({ length: 6 }).map((_, i) =>
        <tr key={`sk-${i}`} className={cn('border-b border-line', rowHeightClass)}>
          {selectable && <td className={cn(cellPad, 'w-9')} />}
          {visibleColumns.map((col, idx) =>
            <td key={col.id} className={cn(cellPad, 'py-0')}>
              <Skeleton className={cn('h-3', idx === 0 ? 'w-32' : col.numeric ? 'ml-auto w-16' : 'w-20')} />
            </td>
          )}
          {rowActions && <td className={cn(cellPad, 'w-10')} />}
        </tr>
      );
    }

    return pageRows.map((row) => {
      const id = getRowId(row);
      const isSelected = selected.includes(id);
      const isActive = activeRowId === id;
      return (
        <tr
          key={id}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          className={cn(
            'group/row border-b border-line/70 transition-colors duration-instant',
            rowHeightClass,
            onRowClick && 'cursor-pointer',
            isActive
              ? 'bg-primary-soft'
              : isSelected
                ? 'bg-primary-soft/50'
                : 'odd:bg-surface even:bg-surface-2/40 hover:bg-primary-soft/30'
          )}>

          {selectable &&
            <td
              className="sticky left-0 z-10 w-9 bg-inherit pl-3"
              onClick={(e) => e.stopPropagation()}>

              <Checkbox
                checked={isSelected}
                aria-label={`Select row ${id}`}
                onChange={(checked) =>
                  setSelected((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id))
                } />

            </td>
          }
          {visibleColumns.map((col, index) => {
            const pinned = pinFirstColumn && index === 0;
            const tone = col.tone?.(row);
            return (
              <td
                key={col.id}
                className={cn(
                  cellPad,
                  'py-1.5 text-body text-ink',
                  col.numeric && 'tabular text-right',
                  // Pinned cells inherit the row's background (zebra / hover / active)
                  // so the sticky first column always matches its row.
                  pinned && 'sticky z-10 bg-inherit font-medium',
                  pinned && (selectable ? 'left-9' : 'left-0'),
                  tone === 'danger' && 'font-medium text-danger',
                  tone === 'success' && 'font-medium text-success',
                  tone === 'warning' && 'font-medium text-warning',
                  tone === 'neg' && 'font-medium text-numeric-negative',
                  tone === 'pos' && 'font-medium text-numeric-positive'
                )}>

                {col.cell(row)}
              </td>);

          })}
          {rowActions &&
            <td
              className={cn('w-10 pr-2 text-right align-middle')}
              onClick={(e) => e.stopPropagation()}>

              <span className="inline-flex opacity-0 transition-opacity duration-fast ease-exit group-hover/row:opacity-100 focus-within:opacity-100">
                {rowActions(row)}
              </span>
            </td>
          }
        </tr>);

    });
  };

  const columnSpan = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <section className={cn('overflow-hidden rounded-surface border border-line bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]', className)}>
      {/* Toolbar — replaced wholesale by the bulk action bar while rows are selected. */}
      <div className={cn('flex min-h-[52px] items-center gap-2 border-b border-line px-3 py-2', someSelected && 'bg-primary-soft/40')}>
        {someSelected ?
          <>
            <span className="tabular text-body font-medium text-ink">{selected.length} selected</span>
            <div className="mx-1 h-4 w-px bg-line" aria-hidden />
            {bulkActions.map((action) =>
              action.disabled && action.disabledReason ?
                <Tooltip key={action.id} label={action.disabledReason}>
                  <span>
                    <Button size="sm" icon={action.icon} disabled>
                      {action.label}
                    </Button>
                  </span>
                </Tooltip> :

                <Button
                  key={action.id}
                  size="sm"
                  variant={action.tone === 'danger' ? 'danger' : 'secondary'}
                  icon={action.icon}
                  onClick={() => action.onRun(selected)}>

                  {action.label}
                </Button>

            )}
            <Button
              className="ml-auto"
              size="sm"
              variant="ghost"
              icon={XIcon}
              onClick={() => setSelected([])}>

              Clear
            </Button>
          </> :

          <>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>
            <Segmented
              aria-label="Row density"
              value={density}
              onChange={(d) => setDensity(d as 'comfortable' | 'compact')}
              items={[
                { id: 'comfortable', label: 'Comfortable' },
                { id: 'compact', label: 'Compact' }]
              } />

            <div ref={menuRef} className="relative">
              <Tooltip label="Columns">
                <Button
                  size="sm"
                  variant="ghost"
                  iconOnly
                  icon={SettingsIcon}
                  aria-label="Choose columns"
                  onClick={() => setColumnMenu((o) => !o)} />

              </Tooltip>
              {columnMenu &&
                <div className="absolute right-0 top-[calc(100%+4px)] z-40 w-56 animate-pop-in rounded-control border border-line bg-surface p-2 shadow-pop">
                  <p className="px-1 pb-1.5 text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                    Visible columns
                  </p>
                  <div className="thin-scroll max-h-64 space-y-1 overflow-y-auto">
                    {columns.map((col, i) =>
                      <Checkbox
                        key={col.id}
                        className="w-full px-1 py-0.5"
                        label={col.header}
                        disabled={pinFirstColumn && i === 0}
                        checked={!hidden.includes(col.id)}
                        onChange={(checked) =>
                          setHidden((prev) =>
                            checked ? prev.filter((x) => x !== col.id) : [...prev, col.id]
                          )
                        } />

                    )}
                  </div>
                </div>
              }
            </div>
            {exportable &&
              <div ref={exportRef} className="relative">
                <Button size="sm" icon={DownloadIcon} onClick={() => (onExport ? runExport('csv') : setExportMenu((o) => !o))}>
                  Export
                </Button>
                {exportMenu && !onExport &&
                  <div className="absolute right-0 top-[calc(100%+4px)] z-40 w-44 animate-pop-in rounded-control border border-line bg-surface p-1 shadow-pop">
                    <button
                      type="button"
                      onClick={() => runExport('csv')}
                      className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-small text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <FileSpreadsheetIcon className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />
                      Export to CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => runExport('pdf')}
                      className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-small text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <FileTextIcon className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />
                      Print / PDF
                    </button>
                  </div>
                }
              </div>
            }
          </>
        }
      </div>

      <div className={cn('thin-scroll overflow-auto', maxBodyHeight)} style={maxBodyHeight ? undefined : undefined}>
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">{caption}</caption>
          {groups &&
            <thead>
              <tr>
                {selectable && <th className="sticky top-0 z-20 w-9 border-b border-line bg-surface-2" />}
                {visibleColumns.reduce<React.ReactNode[]>((acc, col, i) => {
                  const prev = visibleColumns[i - 1];
                  if (prev && prev.group === col.group) return acc;
                  const span = visibleColumns.filter((c) => c.group === col.group).length || 1;
                  acc.push(
                    <th
                      key={`g-${col.group ?? col.id}`}
                      colSpan={col.group ? span : 1}
                      className={cn(
                        'sticky top-0 z-20 border-b border-l border-line bg-surface-3 px-3 py-1 text-caption font-semibold uppercase tracking-wide text-ink-subtle',
                        !col.group && 'border-l-0'
                      )}>

                      {col.group ?? ''}
                    </th>
                  );
                  return acc;
                }, [])}
                {rowActions && <th className="sticky top-0 z-20 border-b border-line bg-surface-2" />}
              </tr>
            </thead>
          }
          <thead className="group/head">
            <tr>
              {selectable &&
                <th
                  scope="col"
                  className={cn('sticky left-0 top-0 z-30 w-9 border-b border-line bg-surface-2 pl-3')}>

                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={!allOnPageSelected && pageRows.some((r) => selected.includes(getRowId(r)))}
                    aria-label="Select all rows on this page"
                    onChange={toggleAll} />

                </th>
              }
              {visibleColumns.map(headerCell)}
              {rowActions &&
                <th scope="col" className="sticky top-0 z-20 w-10 border-b border-line bg-surface-2">
                  <span className="sr-only">Row actions</span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            {state === 'ready' && pageRows.length === 0 ?
              <tr>
                <td colSpan={columnSpan}>
                  {filtered ?
                    <EmptyState
                      icon={FilterXIcon}
                      title="No records match these filters"
                      description="Loosen or clear the filters to see results again."
                      action={
                        onClearFilters &&
                        <Button size="sm" onClick={onClearFilters}>
                          Clear all filters
                        </Button>

                      } /> :


                    <EmptyState
                      icon={InboxIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction} />

                  }
                </td>
              </tr> :
              state === 'error' ?
                <tr>
                  <td colSpan={columnSpan}>
                    <EmptyState
                      tone="error"
                      icon={AlertCircleIcon}
                      title="This table could not be loaded"
                      description="The request timed out before the records came back. Nothing was changed."
                      action={
                        onRetry &&
                        <Button size="sm" variant="primary" onClick={onRetry}>
                          Try again
                        </Button>

                      } />

                  </td>
                </tr> :
                state === 'no-permission' ?
                  <tr>
                    <td colSpan={columnSpan}>
                      <EmptyState
                        tone="locked"
                        icon={LockIcon}
                        title="You do not have access to these records"
                        description="Your role can view the module but not its records. Ask a system administrator to grant the relevant data permission." />

                    </td>
                  </tr> :

                  renderBody()
            }
          </tbody>
          {showTotals && state === 'ready' && pageRows.length > 0 &&
            <tfoot>
              <tr className="bg-surface-2">
                {selectable && <td className="sticky left-0 z-10 border-t-2 border-line-strong bg-surface-2" />}
                {visibleColumns.map((col, index) => {
                  const pinned = pinFirstColumn && index === 0;
                  return (
                    <td
                      key={col.id}
                      className={cn(
                        cellPad,
                        'border-t-2 border-line-strong py-2 text-body font-semibold text-ink',
                        col.numeric && 'tabular text-right',
                        pinned && 'sticky z-10 bg-surface-2',
                        pinned && (selectable ? 'left-9' : 'left-0')
                      )}>

                      {col.total ? col.total(sorted) : index === 0 ? `Total · ${sorted.length} rows` : null}
                    </td>);

                })}
                {rowActions && <td className="border-t-2 border-line-strong" />}
              </tr>
            </tfoot>
          }
        </table>
      </div>

      {state === 'ready' && sorted.length > 0 &&
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
          <p className="tabular text-small text-ink-muted">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              icon={ChevronLeftIcon}
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))} />

            <span className="tabular px-1 text-small text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              icon={ChevronRightIcon}
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />

          </div>
        </div>
      }
    </section>);

}