'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import { payStructuresStore, type PayStructure } from '../../data/payStructures';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface StructureForm {
  name: string;
  grade: string;
  basic: number;
  house: number;
  transport: number;
  medical: number;
  active: boolean;
}

const emptyForm: StructureForm = { name: '', grade: '', basic: 0, house: 0, transport: 0, medical: 0, active: true };

const gross = (s: { basic: number; house: number; transport: number; medical: number }) =>
  s.basic + s.house + s.transport + s.medical;

export function PayStructures() {
  const can = useCan();
  const structures = useCollection(payStructuresStore);
  const [query, setQuery] = useState('');

  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<StructureForm>(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };
  const openEdit = (s: PayStructure) => {
    setForm({ name: s.name, grade: s.grade, basic: s.basic, house: s.house, transport: s.transport, medical: s.medical, active: s.active });
    setEditing(s.id);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return structures;
    return structures.filter((s) => s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q));
  }, [structures, query]);

  const activeCount = structures.filter((s) => s.active).length;
  const avgGross = structures.length ? structures.reduce((sum, s) => sum + gross(s), 0) / structures.length : 0;

  const save = () => {
    if (!form.name.trim() || !form.grade.trim()) {
      toast.error('Name and grade are required');
      return;
    }
    if (editing === 'new') {
      payStructuresStore.create(form);
      toast.success(`Structure ${form.name} created`);
    } else if (editing) {
      payStructuresStore.update(editing, form);
      toast.success(`Structure ${form.name} updated`);
    }
    setEditing(null);
  };

  const remove = (s: PayStructure) => {
    payStructuresStore.remove(s.id);
    toast.success(`Structure ${s.name} deleted`);
  };

  const columns: Column<PayStructure>[] = [
    { id: 'name', header: 'Structure', width: 200, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'grade', header: 'Grade', width: 90, sortValue: (r) => r.grade, cell: (r) => <span className="tabular">{r.grade}</span> },
    { id: 'basic', header: 'Basic', numeric: true, width: 150, sortValue: (r) => r.basic, cell: (r) => formatMoney(r.basic), total: (all) => formatMoney(all.reduce((s, r) => s + r.basic, 0)) },
    { id: 'house', header: 'House', numeric: true, width: 140, sortValue: (r) => r.house, cell: (r) => formatMoney(r.house) },
    { id: 'transport', header: 'Transport', numeric: true, width: 140, sortValue: (r) => r.transport, cell: (r) => formatMoney(r.transport) },
    { id: 'medical', header: 'Medical', numeric: true, width: 140, defaultHidden: true, sortValue: (r) => r.medical, cell: (r) => formatMoney(r.medical) },
    { id: 'gross', header: 'Gross', numeric: true, width: 160, sortValue: (r) => gross(r), cell: (r) => formatMoney(gross(r)), total: (all) => formatMoney(all.reduce((s, r) => s + gross(r), 0)) },
    { id: 'active', header: 'Status', width: 100, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive'), tone: (r) => (r.active ? 'success' : undefined) }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/payroll/structures']?.trail ?? ['Human Resources', 'Payroll', 'Pay structures']}
        title="Pay structures"
        meta={
          <>
            <span className="tabular">{structures.length} structures</span>
            <span aria-hidden>·</span>
            <span>{activeCount} active</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot add structures'} onClick={openNew}>
            New structure
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Structures" value={String(structures.length)} />
          <StatTile label="Active" value={String(activeCount)} footnote="In use for payroll" />
          <StatTile label="Average gross" value={formatMoney(avgGross)} />
        </div>

        <DataTable
          caption="Payroll pay structures"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={query.length > 0}
          onClearFilters={() => setQuery('')}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search structure or grade"
              onClearAll={() => setQuery('')}
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              <Button
                size="sm"
                variant="ghost"
                iconOnly
                icon={Trash2Icon}
                aria-label={`Delete ${r.name}`}
                disabled={!can.create}
                onClick={() => remove(r)}
              />
            </div>
          )}
        />
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New pay structure' : 'Edit pay structure'}
        subtitle={editing === 'new' ? 'Define a grade and its allowances' : form.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              {editing === 'new' ? 'Create structure' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Structure details" description="Name and grade for this pay band.">
            <Field label="Name" span={8} required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Senior officer" />
            </Field>
            <Field label="Grade" span={4} required>
              <Input value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} className="font-mono" placeholder="e.g. O1" />
            </Field>
          </FormSection>

          <FormSection title="Allowances" description="Monthly amounts in KES that make up the gross pay.">
            <Field label="Basic pay" span={6}>
              <Input numeric type="number" value={form.basic} onChange={(e) => setForm((f) => ({ ...f, basic: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="House" span={6}>
              <Input numeric type="number" value={form.house} onChange={(e) => setForm((f) => ({ ...f, house: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="Transport" span={6}>
              <Input numeric type="number" value={form.transport} onChange={(e) => setForm((f) => ({ ...f, transport: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="Medical" span={6}>
              <Input numeric type="number" value={form.medical} onChange={(e) => setForm((f) => ({ ...f, medical: Number(e.target.value) || 0 }))} />
            </Field>
          </FormSection>

          <FormSection title="Status" description="Whether this structure is available to payroll.">
            <div className="col-span-12">
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Active</span>
                <Toggle checked={form.active} onChange={() => setForm((f) => ({ ...f, active: !f.active }))} aria-label="Active" />
              </label>
            </div>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
