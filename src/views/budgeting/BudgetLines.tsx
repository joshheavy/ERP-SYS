'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { GroupedBars } from '../../components/charts/Charts';
import { BUDGET_LINE_ROWS } from '../../data/registers';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { BudgetLineRow } from '../../data/registers';

/** Committed+spent vs available per line, in KSh millions, for the bar chart. */
const utilisationSeries = BUDGET_LINE_ROWS.map((b) => ({
  code: b.code.replace(/-2026$/, ''),
  committed: Math.round((b.committed + b.spent) / 1_000_000),
  available: Math.round(Math.max(0, b.available) / 1_000_000)
}));

export function BudgetLines() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BUDGET_LINE_ROWS.filter((b) => {
      if (category && b.category !== category) return false;
      if (!q) return true;
      return b.code.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.costCentre.toLowerCase().includes(q);
    });
  }, [query, category]);

  const allocated = BUDGET_LINE_ROWS.reduce((s, b) => s + b.allocated, 0);
  const available = BUDGET_LINE_ROWS.reduce((s, b) => s + b.available, 0);
  const overCommitted = BUDGET_LINE_ROWS.filter((b) => b.utilisation > 100).length;

  const columns: Column<BudgetLineRow>[] = [
    {
      id: 'code', header: 'Budget line', width: 200, sortValue: (r) => r.code, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.description}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.code}</span>
        </span>
      )
    },
    { id: 'costCentre', header: 'Cost centre', width: 160, sortValue: (r) => r.costCentre, cell: (r) => r.costCentre },
    { id: 'category', header: 'Type', width: 110, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'allocated', header: 'Allocated', numeric: true, width: 150, sortValue: (r) => r.allocated, cell: (r) => formatMoney(r.allocated), total: (all) => formatMoney(all.reduce((s, r) => s + r.allocated, 0)) },
    { id: 'committed', header: 'Committed', numeric: true, width: 150, sortValue: (r) => r.committed, cell: (r) => formatMoney(r.committed), total: (all) => formatMoney(all.reduce((s, r) => s + r.committed, 0)) },
    { id: 'spent', header: 'Spent', numeric: true, width: 150, sortValue: (r) => r.spent, cell: (r) => formatMoney(r.spent), total: (all) => formatMoney(all.reduce((s, r) => s + r.spent, 0)) },
    {
      id: 'available',
      header: 'Available',
      numeric: true,
      width: 150,
      sortValue: (r) => r.available,
      cell: (r) => <span className="font-semibold">{formatMoney(r.available)}</span>,
      tone: (r) => (r.available < 0 ? 'danger' : undefined),
      total: (all) => formatMoney(all.reduce((s, r) => s + r.available, 0))
    },
    {
      id: 'utilisation',
      header: 'Utilisation',
      width: 170,
      sortValue: (r) => r.utilisation,
      cell: (r) => <ProgressBar value={Math.min(100, r.utilisation)} max={100} size="sm" tone={r.utilisation > 100 ? 'danger' : r.utilisation > 85 ? 'warning' : 'primary'} caption={`${r.utilisation}%`} />
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/budgeting/lines'].trail}
        title="Budget lines"
        meta={
          <>
            <span className="tabular">{BUDGET_LINE_ROWS.length} lines</span>
            <span aria-hidden>·</span>
            <span>Fiscal year 2026</span>
            {overCommitted > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="text-danger">{overCommitted} over-committed</span>
              </>
            )}
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Total allocated" value={formatMoney(allocated)} />
          <StatTile label="Available" value={formatMoney(available)} footnote={`${Math.round(((allocated - available) / allocated) * 100)}% utilised`} />
          <StatTile label="Over-committed lines" value={String(overCommitted)} />
        </div>

        <Card>
          <CardHeader title="Committed vs available by line" description="KSh millions per budget line." level={3} />
          <div className="px-3 py-4">
            <GroupedBars
              data={utilisationSeries}
              xKey="code"
              height={240}
              format={(v) => `KSh ${v}M`}
              series={[
                { key: 'committed', label: 'Committed + spent', colorIndex: 3 },
                { key: 'available', label: 'Available', colorIndex: 1 }
              ]}
            />
          </div>
        </Card>

        <DataTable
          caption="Budget lines"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(category) || query.length > 0}
          onClearFilters={() => {
            setCategory('');
            setQuery('');
          }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search code, line or cost centre"
              chips={category ? [{ id: 'cat', label: 'Type', value: category }] : []}
              onRemoveChip={() => setCategory('')}
              onClearAll={() => {
                setCategory('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by type"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: '', label: 'All types' },
                    { value: 'Capital', label: 'Capital' },
                    { value: 'Operating', label: 'Operating' }
                  ]}
                />
              }
            />
          }
        />
      </div>
    </div>
  );
}
