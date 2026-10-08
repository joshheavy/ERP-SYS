'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  assetCategoriesStore,
  DEPRECIATION_METHODS,
  METHOD_LABEL,
  type AssetCategory,
  type DepreciationMethod
} from '../../data/assetsAdmin';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

type CategoryForm = Omit<AssetCategory, 'id'>;
const emptyForm: CategoryForm = { code: '', name: '', method: 'straight-line', usefulLife: 5, rate: 20, active: true };

export function AssetCategories() {
  const can = useCan();
  const categories = useCollection(assetCategoriesStore);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (c: AssetCategory) => { const { id, ...rest } = c; void id; setForm(rest); setEditing(c.id); };

  const rows = useMemo(() => [...categories].sort((a, b) => a.code.localeCompare(b.code)), [categories]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { assetCategoriesStore.create(form); toast.success(`Category ${form.name} created`); }
    else if (editing) { assetCategoriesStore.update(editing, form); toast.success(`Category ${form.name} updated`); }
    setEditing(null);
  };
  const remove = (c: AssetCategory) => { assetCategoriesStore.remove(c.id); toast.success(`Category ${c.name} removed`); };

  const columns: Column<AssetCategory>[] = [
    { id: 'code', header: 'Code', width: 90, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'name', header: 'Category', width: 220, sortValue: (r) => r.name, cell: (r) => r.name },
    { id: 'method', header: 'Method', width: 160, sortValue: (r) => r.method, cell: (r) => METHOD_LABEL[r.method] },
    { id: 'life', header: 'Useful life', numeric: true, width: 120, sortValue: (r) => r.usefulLife, cell: (r) => (r.usefulLife ? `${r.usefulLife} yrs` : '—') },
    { id: 'rate', header: 'Rate', numeric: true, width: 100, sortValue: (r) => r.rate, cell: (r) => `${r.rate}%` },
    { id: 'active', header: 'Status', width: 100, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive') }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/categories']?.trail ?? ['Fixed Assets', 'Master data', 'Categories']}
        title="Asset categories"
        meta={<span className="tabular">{categories.length} classes</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New category</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Categories" value={String(categories.length)} />
          <StatTile label="Active" value={String(categories.filter((c) => c.active).length)} />
          <StatTile label="Straight line" value={String(categories.filter((c) => c.method === 'straight-line').length)} />
        </div>
        <DataTable
          caption="Asset categories"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          onRowClick={(r) => openEdit(r)}
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.name}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New asset category' : 'Edit asset category'}
        subtitle={editing === 'new' ? 'Add an asset class' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create category' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Category" description="Class and its default depreciation treatment.">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="font-mono" /></Field>
            <Field label="Name" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Depreciation method" span={6}><Select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as DepreciationMethod }))} options={DEPRECIATION_METHODS.map((m) => ({ value: m, label: METHOD_LABEL[m] }))} /></Field>
            <Field label="Useful life (years)" span={3}><Input numeric type="number" value={form.usefulLife} onChange={(e) => setForm((f) => ({ ...f, usefulLife: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Rate (%)" span={3}><Input numeric type="number" step="0.1" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) || 0 }))} /></Field>
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
