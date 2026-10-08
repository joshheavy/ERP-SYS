'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  movementsStore,
  MOVEMENT_TYPES,
  WAREHOUSES,
  type MovementType,
  type StockMovement
} from '../../data/movements';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatQty } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface MovementForm {
  date: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  type: MovementType;
  quantity: number;
  reference: string;
  notes: string;
}

const emptyForm: MovementForm = {
  date: '2026-09-14',
  itemCode: '',
  itemName: '',
  warehouse: WAREHOUSES[0],
  type: 'in',
  quantity: 0,
  reference: '',
  notes: ''
};

const TYPE_LABELS: Record<MovementType, string> = { in: 'Goods in', out: 'Goods out', transfer: 'Transfer' };

export function StockMovements() {
  const can = useCan();
  const movements = useCollection(movementsStore);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<MovementForm>(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movements.filter((m) => {
      if (type && m.type !== type) return false;
      if (warehouse && m.warehouse !== warehouse) return false;
      if (!q) return true;
      return m.itemCode.toLowerCase().includes(q) || m.itemName.toLowerCase().includes(q) || m.reference.toLowerCase().includes(q);
    });
  }, [movements, query, type, warehouse]);

  const inQty = movements.filter((m) => m.type === 'in').reduce((s, m) => s + m.quantity, 0);
  const outQty = movements.filter((m) => m.type === 'out').reduce((s, m) => s + m.quantity, 0);

  const save = () => {
    if (!form.itemCode.trim() || !form.reference.trim()) {
      toast.error('Item code and reference are required');
      return;
    }
    movementsStore.create({
      date: form.date,
      itemCode: form.itemCode,
      itemName: form.itemName || form.itemCode,
      warehouse: form.warehouse,
      type: form.type,
      quantity: form.quantity,
      reference: form.reference,
      notes: form.notes.trim() || undefined
    });
    toast.success(`Movement ${form.reference} recorded`);
    setCreating(false);
  };

  const chips = [
    type ? { id: 'type', label: 'Type', value: TYPE_LABELS[type as MovementType] } : null,
    warehouse ? { id: 'wh', label: 'Warehouse', value: warehouse } : null
  ].filter(Boolean) as { id: string; label: string; value: string }[];

  const clearAll = () => {
    setType('');
    setWarehouse('');
    setQuery('');
  };

  const columns: Column<StockMovement>[] = [
    { id: 'date', header: 'Date', width: 120, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    {
      id: 'item', header: 'Item', width: 220, sortValue: (r) => r.itemCode, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.itemName}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.itemCode}</span>
        </span>
      )
    },
    { id: 'warehouse', header: 'Warehouse', width: 190, sortValue: (r) => r.warehouse, cell: (r) => <span className="block truncate">{r.warehouse}</span> },
    {
      id: 'type', header: 'Type', width: 110, sortValue: (r) => r.type, cell: (r) => TYPE_LABELS[r.type],
      tone: (r) => (r.type === 'in' ? 'success' : r.type === 'out' ? 'warning' : undefined)
    },
    { id: 'quantity', header: 'Quantity', numeric: true, width: 110, sortValue: (r) => r.quantity, cell: (r) => formatQty(r.quantity), total: (all) => formatQty(all.reduce((s, r) => s + r.quantity, 0)) },
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'notes', header: 'Notes', width: 200, defaultHidden: true, sortValue: (r) => r.notes ?? '', cell: (r) => <span className="block truncate">{r.notes ?? '—'}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/inventory/movements']?.trail ?? ['Inventory', 'Stock', 'Stock movements']}
        title="Stock movements"
        meta={
          <>
            <span className="tabular">{movements.length} movements</span>
            <span aria-hidden>·</span>
            <span>{formatQty(inQty)} in · {formatQty(outQty)} out</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot record movements'} onClick={openNew}>
            Record movement
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Movements" value={String(movements.length)} />
          <StatTile label="Quantity in" value={formatQty(inQty)} footnote="Goods received" />
          <StatTile label="Quantity out" value={formatQty(outQty)} footnote="Goods issued" />
        </div>

        <DataTable
          caption="Inventory stock movements"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(type) || Boolean(warehouse) || query.length > 0}
          onClearFilters={clearAll}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search item or reference"
              chips={chips}
              onRemoveChip={(id) => {
                if (id === 'type') setType('');
                if (id === 'wh') setWarehouse('');
              }}
              onClearAll={clearAll}
              controls={
                <>
                  <Select
                    className="w-40"
                    aria-label="Filter by type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={[{ value: '', label: 'All types' }, ...MOVEMENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))]}
                  />
                  <Select
                    className="w-52"
                    aria-label="Filter by warehouse"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    options={[{ value: '', label: 'All warehouses' }, ...WAREHOUSES.map((w) => ({ value: w, label: w }))]}
                  />
                </>
              }
            />
          }
        />
      </div>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="Record movement"
        subtitle="Log a goods in, out or transfer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              Record movement
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Item" description="What is moving and where.">
            <Field label="Item code" span={6} required>
              <Input value={form.itemCode} onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))} className="font-mono" placeholder="e.g. ITM-0101" />
            </Field>
            <Field label="Item name" span={6}>
              <Input value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} placeholder="e.g. A4 Copier paper" />
            </Field>
            <Field label="Warehouse" span={12}>
              <Select
                value={form.warehouse}
                onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value }))}
                options={WAREHOUSES.map((w) => ({ value: w, label: w }))}
              />
            </Field>
          </FormSection>

          <FormSection title="Movement" description="Direction, quantity and reference.">
            <Field label="Type" span={6}>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MovementType }))}
                options={MOVEMENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
              />
            </Field>
            <Field label="Quantity" span={6}>
              <Input numeric type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="Reference" span={6} required>
              <Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="font-mono" placeholder="e.g. GRN-2026-0921" />
            </Field>
            <Field label="Date" span={6}>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Notes" span={12}>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional context for this movement" />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
