'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader } from '../../components/ui/Card';
import { DonutStat, DonutLegend } from '../../components/charts/Charts';
import { INVENTORY_ITEMS } from '../../data/registers';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney, formatQty } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { InventoryItem } from '../../data/registers';

const available = (i: InventoryItem) => i.onHand - i.reserved;
const stockValue = (i: InventoryItem) => i.onHand * i.unitCost;

/** Stock value grouped by category, for the composition donut. */
const stockByCategory = Object.entries(
  INVENTORY_ITEMS.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + stockValue(i);
    return acc;
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value], idx) => ({ name, value, colorIndex: idx }));

export function ItemBalances() {
  const [query, setQuery] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const warehouses = Array.from(new Set(INVENTORY_ITEMS.map((i) => i.warehouse)));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVENTORY_ITEMS.filter((i) => {
      if (warehouse && i.warehouse !== warehouse) return false;
      if (!q) return true;
      return i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    });
  }, [query, warehouse]);

  const belowReorder = INVENTORY_ITEMS.filter((i) => available(i) <= i.reorderLevel).length;
  const totalValue = INVENTORY_ITEMS.reduce((s, i) => s + stockValue(i), 0);

  const columns: Column<InventoryItem>[] = [
    {
      id: 'code', header: 'Item', width: 200, sortValue: (r) => r.code, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.description}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.code}</span>
        </span>
      )
    },
    { id: 'category', header: 'Category', width: 130, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'warehouse', header: 'Warehouse', width: 200, sortValue: (r) => r.warehouse, cell: (r) => <span className="block truncate">{r.warehouse}</span> },
    { id: 'onHand', header: 'On hand', numeric: true, width: 100, sortValue: (r) => r.onHand, cell: (r) => formatQty(r.onHand), total: (all) => formatQty(all.reduce((s, r) => s + r.onHand, 0)) },
    { id: 'reserved', header: 'Reserved', numeric: true, width: 100, defaultHidden: true, sortValue: (r) => r.reserved, cell: (r) => formatQty(r.reserved) },
    {
      id: 'available',
      header: 'Available',
      numeric: true,
      width: 110,
      sortValue: (r) => available(r),
      cell: (r) => (
        <span className="inline-flex items-center gap-1">
          {available(r) <= r.reorderLevel && <AlertTriangleIcon className="h-3.5 w-3.5 text-warning" aria-label="Below reorder level" />}
          {formatQty(available(r))}
        </span>
      ),
      tone: (r) => (available(r) <= r.reorderLevel ? 'warning' : undefined)
    },
    { id: 'reorder', header: 'Reorder at', numeric: true, width: 110, sortValue: (r) => r.reorderLevel, cell: (r) => formatQty(r.reorderLevel) },
    { id: 'unitCost', header: 'Unit cost', numeric: true, width: 120, sortValue: (r) => r.unitCost, cell: (r) => formatMoney(r.unitCost) },
    { id: 'value', header: 'Stock value', numeric: true, width: 150, sortValue: (r) => stockValue(r), cell: (r) => formatMoney(stockValue(r)), total: (all) => formatMoney(all.reduce((s, r) => s + stockValue(r), 0)) },
    { id: 'lastMovement', header: 'Last movement', width: 140, sortValue: (r) => r.lastMovement, cell: (r) => <span className="tabular">{formatDate(r.lastMovement)}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/inventory/items'].trail}
        title="Item balances"
        meta={
          <>
            <span className="tabular">{INVENTORY_ITEMS.length} items</span>
            <span aria-hidden>·</span>
            <span>{belowReorder} below reorder level</span>
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-3">
            <StatTile emphasis label="Total stock value" value={formatMoney(totalValue)} />
            <StatTile label="Items below reorder" value={String(belowReorder)} footnote="Needs replenishment" />
            <StatTile label="Warehouses" value={String(warehouses.length)} />
          </div>
          <Card className="lg:col-span-1">
            <CardHeader title="Stock value by category" level={3} />
            <div className="px-4 py-3">
              <DonutStat data={stockByCategory} height={160} />
              <div className="mt-3">
                <DonutLegend data={stockByCategory} total={totalValue} format={(v) => formatMoney(v)} />
              </div>
            </div>
          </Card>
        </div>

        <DataTable
          caption="Inventory item balances"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(warehouse) || query.length > 0}
          onClearFilters={() => {
            setWarehouse('');
            setQuery('');
          }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search item, code or category"
              chips={warehouse ? [{ id: 'wh', label: 'Warehouse', value: warehouse }] : []}
              onRemoveChip={() => setWarehouse('')}
              onClearAll={() => {
                setWarehouse('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-56"
                  aria-label="Filter by warehouse"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  options={[{ value: '', label: 'All warehouses' }, ...warehouses.map((w) => ({ value: w, label: w }))]}
                />
              }
            />
          }
        />
      </div>
    </div>
  );
}
