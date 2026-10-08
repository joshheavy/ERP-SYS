'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import { taxRatesStore, type TaxRate, type TaxType } from '../../data/financeConfig';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

const TAX_TYPES: TaxType[] = ['VAT', 'WHT', 'PAYE', 'Excise'];

type TaxForm = Omit<TaxRate, 'id'>;
const emptyForm: TaxForm = { code: '', name: '', type: 'VAT', rate: 0, active: true };

export function TaxConfig() {
  const can = useCan();
  const taxes = useCollection(taxRatesStore);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<TaxForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (t: TaxRate) => { const { id, ...rest } = t; void id; setForm(rest); setEditing(t.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return taxes.filter((t) => {
      if (type && t.type !== type) return false;
      return !q || t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
    });
  }, [taxes, query, type]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { taxRatesStore.create(form); toast.success(`${form.code} created`); }
    else if (editing) { taxRatesStore.update(editing, form); toast.success(`${form.code} updated`); }
    setEditing(null);
  };
  const remove = (t: TaxRate) => { taxRatesStore.remove(t.id); toast.success(`${t.code} removed`); };

  const columns: Column<TaxRate>[] = [
    { id: 'code', header: 'Code', width: 110, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'name', header: 'Name', width: 280, sortValue: (r) => r.name, cell: (r) => r.name },
    { id: 'type', header: 'Type', width: 110, sortValue: (r) => r.type, cell: (r) => r.type },
    { id: 'rate', header: 'Rate', numeric: true, width: 100, sortValue: (r) => r.rate, cell: (r) => `${r.rate}%` },
    { id: 'active', header: 'Status', width: 100, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive') }
  ];

  const clearAll = () => { setQuery(''); setType(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/tax']?.trail ?? ['Finance', 'Configuration', 'Tax configuration']}
        title="Tax configuration"
        meta={<span className="tabular">{taxes.length} tax rates</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New tax rate</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Tax rates" value={String(taxes.length)} />
          <StatTile label="Active" value={String(taxes.filter((t) => t.active).length)} />
          <StatTile label="VAT standard" value={`${taxes.find((t) => t.code === 'VAT16')?.rate ?? 16}%`} />
        </div>
        <DataTable
          caption="Tax rates"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(type) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search code or name"
              chips={type ? [{ id: 'type', label: 'Type', value: type }] : []}
              onRemoveChip={() => setType('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: '', label: 'All types' }, ...TAX_TYPES.map((t) => ({ value: t, label: t }))]} />}
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
        title={editing === 'new' ? 'New tax rate' : 'Edit tax rate'}
        subtitle={editing === 'new' ? 'Add a tax rate' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create tax rate' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Tax rate" description="Code, type and percentage.">
            <Field label="Code" span={6} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" placeholder="VAT16" /></Field>
            <Field label="Type" span={6} required><Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TaxType }))} options={TAX_TYPES.map((t) => ({ value: t, label: t }))} /></Field>
            <Field label="Name" span={12} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="VAT — standard rate" /></Field>
            <Field label="Rate (%)" span={6} required><Input numeric type="number" step="0.01" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) || 0 }))} /></Field>
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
