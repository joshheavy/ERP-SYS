'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Choice';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { kpisStore, type Kpi, type KpiPerspective } from '../../../data/performance';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import type { Column } from '../../../components/data-table/types';

const PERSPECTIVES: KpiPerspective[] = ['Financial', 'Customer', 'Internal', 'Learning'];

type KpiForm = Omit<Kpi, 'id'>;
const emptyForm: KpiForm = { code: '', name: '', perspective: 'Financial', weight: 0, active: true };

export function Kpis() {
  const can = useCan();
  const kpis = useCollection(kpisStore);
  const [query, setQuery] = useState('');
  const [perspective, setPerspective] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<KpiForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (k: Kpi) => { const { id, ...rest } = k; void id; setForm(rest); setEditing(k.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kpis.filter((k) => {
      if (perspective && k.perspective !== perspective) return false;
      if (!q) return true;
      return k.name.toLowerCase().includes(q) || k.code.toLowerCase().includes(q);
    });
  }, [kpis, query, perspective]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { kpisStore.create(form); toast.success(`KPI ${form.code} created`); }
    else if (editing) { kpisStore.update(editing, form); toast.success(`KPI ${form.code} updated`); }
    setEditing(null);
  };
  const remove = (k: Kpi) => { kpisStore.remove(k.id); toast.success(`KPI ${k.code} removed`); };

  const columns: Column<Kpi>[] = [
    { id: 'code', header: 'Code', width: 110, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'name', header: 'KPI', width: 300, sortValue: (r) => r.name, cell: (r) => <span className="block truncate">{r.name}</span> },
    { id: 'perspective', header: 'Perspective', width: 140, sortValue: (r) => r.perspective, cell: (r) => r.perspective },
    { id: 'weight', header: 'Weight', numeric: true, width: 100, sortValue: (r) => r.weight, cell: (r) => `${r.weight}%` },
    { id: 'active', header: 'Status', width: 110, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive') }
  ];

  const clearAll = () => { setQuery(''); setPerspective(''); };
  const totalWeight = kpis.reduce((s, k) => s + k.weight, 0);

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/performance/kpis']?.trail ?? ['Human Resources', 'Performance', 'KPIs']}
        title="KPIs"
        meta={<span className="tabular">{kpis.length} indicators</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New KPI</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="KPIs" value={String(kpis.length)} />
          <StatTile label="Active" value={String(kpis.filter((k) => k.active).length)} />
          <StatTile label="Total weight" value={`${totalWeight}%`} />
        </div>
        <DataTable
          caption="KPIs"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(perspective) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search KPI or code"
              chips={perspective ? [{ id: 'perspective', label: 'Perspective', value: perspective }] : []}
              onRemoveChip={() => setPerspective('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by perspective"
                  value={perspective}
                  onChange={(e) => setPerspective(e.target.value)}
                  options={[{ value: '', label: 'All perspectives' }, ...PERSPECTIVES.map((p) => ({ value: p, label: p }))]}
                />
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.code}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.code}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New KPI' : 'Edit KPI'}
        subtitle={editing === 'new' ? 'Define a key performance indicator' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create KPI' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="KPI details" description="Code, perspective and scoring weight.">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" /></Field>
            <Field label="Name" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Perspective" span={6}><Select value={form.perspective} onChange={(e) => setForm((f) => ({ ...f, perspective: e.target.value as KpiPerspective }))} options={PERSPECTIVES.map((p) => ({ value: p, label: p }))} /></Field>
            <Field label="Weight (%)" span={6}><Input numeric type="number" min={0} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) || 0 }))} /></Field>
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
