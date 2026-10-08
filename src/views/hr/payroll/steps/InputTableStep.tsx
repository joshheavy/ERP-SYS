'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2Icon, DownloadIcon, UploadCloudIcon } from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { FilterBar } from '../../../../components/data-table/FilterBar';
import { DataTable } from '../../../../components/data-table/DataTable';
import { StatTile } from '../../../../components/ui/StatTile';
import type { Column } from '../../../../components/data-table/types';
import type { InputBatchRow, PayrollStep } from '../../../../types/payroll';
import { formatMoney } from '../../../../utils/format';

const BATCH_META: Record<
  string,
  { source: string; tiles: { label: string; value: string }[]; valueHeader: string; money?: boolean }
> = {
  attendance: {
    source: 'Biometric & manual attendance import',
    valueHeader: 'Days worked',
    tiles: [
      { label: 'Rows imported', value: '1,248' },
      { label: 'Below 22 days', value: '3' },
      { label: 'Manual overrides', value: '1' }
    ]
  },
  lwop: {
    source: 'Approved HR leave records',
    valueHeader: 'Unpaid days',
    tiles: [
      { label: 'Employees affected', value: '7' },
      { label: 'Total deducted', value: 'KSh 412,560.00' },
      { label: 'Unconfirmed', value: '1' }
    ]
  },
  overtime: {
    source: 'Approved overtime claims',
    valueHeader: 'Hours',
    tiles: [
      { label: 'Claims priced', value: '46' },
      { label: 'Above 40h cap', value: '1' },
      { label: 'Departments', value: '5' }
    ]
  },
  allowances: {
    source: 'Allowance changes & one-off adjustments',
    valueHeader: 'Amount',
    money: true,
    tiles: [
      { label: 'Allowance changes', value: '19' },
      { label: 'One-off adjustments', value: '8' },
      { label: 'Reversals', value: '0' }
    ]
  },
  loans: {
    source: 'Loan schedules & advance recoveries',
    valueHeader: 'Recovery',
    money: true,
    tiles: [
      { label: 'Repayments scheduled', value: '132' },
      { label: 'Capped at net floor', value: '2' },
      { label: 'Fully recovered', value: '9' }
    ]
  }
};

export interface InputTableStepProps {
  step: PayrollStep;
  rows: InputBatchRow[];
  complete: boolean;
  onComplete: () => void;
}

/** Loads a batch of period inputs, lets the officer review it, then commits it into the run. */
export function InputTableStep({ step, rows, complete, onComplete }: InputTableStepProps) {
  const meta = BATCH_META[step.id] ?? { source: 'Imported batch', valueHeader: 'Value', tiles: [] };
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const columns: Column<InputBatchRow>[] = [
    {
      id: 'employee',
      header: 'Employee',
      width: 220,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.name}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.employeeId}</span>
        </span>
      )
    },
    { id: 'department', header: 'Department', width: 180, sortValue: (r) => r.department, cell: (r) => r.department },
    {
      id: 'value',
      header: meta.valueHeader,
      numeric: true,
      width: 140,
      sortValue: (r) => r.value,
      cell: (r) => (meta.money ? formatMoney(r.value) : `${r.value.toLocaleString()} ${r.unit}`)
    },
    { id: 'source', header: 'Source', width: 240, sortValue: (r) => r.source, cell: (r) => <span className="block truncate text-ink-muted">{r.source}</span> },
    {
      id: 'note',
      header: 'Note',
      width: 220,
      cell: (r) => (r.note ? <span className="text-warning">{r.note}</span> : <span className="text-ink-subtle">—</span>)
    }
  ];

  return (
    <div className="space-y-4">
      {meta.tiles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {meta.tiles.map((tile, i) => (
            <StatTile key={tile.label} emphasis={i === 0} label={tile.label} value={tile.value} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Imported batch"
          description={meta.source}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" icon={DownloadIcon}>
                Template
              </Button>
              <Button size="sm" icon={UploadCloudIcon}>
                Re-import
              </Button>
            </div>
          }
        />
        <div className="p-3">
          <DataTable
            caption={step.title}
            columns={columns}
            rows={filtered}
            getRowId={(r) => r.id}
            pageSize={8}
            filtered={query.length > 0}
            onClearFilters={() => setQuery('')}
            emptyTitle="No rows in this batch"
            emptyDescription="Nothing was imported for this input. The run will treat every employee as standard."
            toolbar={
              <FilterBar query={query} onQueryChange={setQuery} placeholder="Search employee or department" />
            }
          />
        </div>
      </Card>

      {complete && (
        <p className="flex items-center gap-1.5 text-small text-success">
          <CheckCircle2Icon className="h-4 w-4" aria-hidden />
          {step.didChange}
        </p>
      )}
      {!complete && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onComplete}>
            Apply this batch to the run
          </Button>
        </div>
      )}
    </div>
  );
}
