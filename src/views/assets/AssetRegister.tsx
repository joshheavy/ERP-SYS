'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/Progress';
import { DonutStat, DonutLegend, GroupedBars } from '../../components/charts/Charts';
import { FIXED_ASSETS } from '../../data/registers';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { FixedAsset } from '../../data/registers';

/** Net book value grouped by asset category, for the composition donut. */
const nbvByCategory = Object.entries(
  FIXED_ASSETS.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + a.netBookValue;
    return acc;
  }, {})
)
  .filter(([, v]) => v > 0)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value], idx) => ({ name, value, colorIndex: idx }));

/** Cost vs NBV per category, in KSh millions, for the bar chart. */
const costVsNbv = Object.entries(
  FIXED_ASSETS.reduce<Record<string, { cost: number; nbv: number }>>((acc, a) => {
    const short = a.category.split(' ')[0];
    acc[short] = acc[short] ?? { cost: 0, nbv: 0 };
    acc[short].cost += a.cost;
    acc[short].nbv += a.netBookValue;
    return acc;
  }, {})
).map(([category, v]) => ({
  category,
  cost: Math.round(v.cost / 1_000_000),
  nbv: Math.round(v.nbv / 1_000_000)
}));

const CONDITION_TONE: Record<FixedAsset['condition'], 'success' | 'warning' | 'danger'> = {
  'in service': 'success',
  'under repair': 'warning',
  retired: 'danger'
};

export function AssetRegister() {
  const [query, setQuery] = useState('');
  const [condition, setCondition] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FIXED_ASSETS.filter((a) => {
      if (condition && a.condition !== condition) return false;
      if (!q) return true;
      return a.tag.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.custodian.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    });
  }, [query, condition]);

  const totalCost = FIXED_ASSETS.reduce((s, a) => s + a.cost, 0);
  const totalNbv = FIXED_ASSETS.reduce((s, a) => s + a.netBookValue, 0);

  const columns: Column<FixedAsset>[] = [
    {
      id: 'tag', header: 'Asset', width: 220, sortValue: (r) => r.tag, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.description}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.tag}</span>
        </span>
      )
    },
    { id: 'category', header: 'Category', width: 150, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'custodian', header: 'Custodian', width: 150, sortValue: (r) => r.custodian, cell: (r) => r.custodian },
    { id: 'location', header: 'Location', width: 170, defaultHidden: true, sortValue: (r) => r.location, cell: (r) => r.location },
    { id: 'acquired', header: 'Acquired', width: 120, sortValue: (r) => r.acquiredOn, cell: (r) => <span className="tabular">{formatDate(r.acquiredOn)}</span> },
    { id: 'cost', header: 'Cost', numeric: true, width: 140, sortValue: (r) => r.cost, cell: (r) => formatMoney(r.cost), total: (all) => formatMoney(all.reduce((s, r) => s + r.cost, 0)) },
    { id: 'accum', header: 'Accum. dep.', numeric: true, width: 140, defaultHidden: true, sortValue: (r) => r.accumulatedDepreciation, cell: (r) => formatMoney(r.accumulatedDepreciation) },
    {
      id: 'depreciation',
      header: 'Depreciated',
      width: 150,
      sortValue: (r) => r.accumulatedDepreciation / r.cost,
      cell: (r) => <ProgressBar value={r.accumulatedDepreciation} max={r.cost} size="sm" tone={r.netBookValue === 0 ? 'danger' : 'primary'} caption={`${Math.round((r.accumulatedDepreciation / r.cost) * 100)}%`} />
    },
    { id: 'nbv', header: 'Net book value', numeric: true, width: 150, sortValue: (r) => r.netBookValue, cell: (r) => <span className="font-semibold">{formatMoney(r.netBookValue)}</span>, total: (all) => formatMoney(all.reduce((s, r) => s + r.netBookValue, 0)) },
    {
      id: 'condition',
      header: 'Condition',
      width: 130,
      sortValue: (r) => r.condition,
      cell: (r) => <span className="capitalize">{r.condition}</span>,
      tone: (r) => CONDITION_TONE[r.condition]
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/register'].trail}
        title="Asset register"
        meta={
          <>
            <span className="tabular">{FIXED_ASSETS.length} assets</span>
            <span aria-hidden>·</span>
            <span>{FIXED_ASSETS.filter((a) => a.condition === 'under repair').length} under repair</span>
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Net book value" value={formatMoney(totalNbv)} />
          <StatTile label="Acquisition cost" value={formatMoney(totalCost)} />
          <StatTile label="Fully depreciated" value={String(FIXED_ASSETS.filter((a) => a.netBookValue === 0).length)} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Net book value by category" level={3} />
            <div className="px-4 py-3">
              <DonutStat data={nbvByCategory} height={170} centerValue={formatMoney(totalNbv, { symbol: false })} centerLabel="NBV" />
              <div className="mt-3">
                <DonutLegend data={nbvByCategory} total={totalNbv} format={(v) => formatMoney(v)} />
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Cost vs net book value" description="KSh millions per category." level={3} />
            <div className="px-3 py-4">
              <GroupedBars
                data={costVsNbv}
                xKey="category"
                height={200}
                format={(v) => `KSh ${v}M`}
                series={[
                  { key: 'cost', label: 'Cost', colorIndex: 0 },
                  { key: 'nbv', label: 'Net book value', colorIndex: 1 }
                ]}
              />
            </div>
          </Card>
        </div>

        <DataTable
          caption="Fixed asset register"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(condition) || query.length > 0}
          onClearFilters={() => {
            setCondition('');
            setQuery('');
          }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search tag, asset or custodian"
              chips={condition ? [{ id: 'cond', label: 'Condition', value: condition }] : []}
              onRemoveChip={() => setCondition('')}
              onClearAll={() => {
                setCondition('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  options={[
                    { value: '', label: 'All conditions' },
                    { value: 'in service', label: 'In service' },
                    { value: 'under repair', label: 'Under repair' },
                    { value: 'retired', label: 'Retired' }
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
