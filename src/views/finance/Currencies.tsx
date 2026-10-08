'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import { currenciesStore, type Currency } from '../../data/financeConfig';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

type CurrencyForm = Omit<Currency, 'id' | 'base'>;
const emptyForm: CurrencyForm = { code: '', name: '', rateToKES: 1, active: true };

export function Currencies() {
  const can = useCan();
  const currencies = useCollection(currenciesStore);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<CurrencyForm>(emptyForm);

  const rows = useMemo(() => [...currencies].sort((a, b) => Number(b.base) - Number(a.base) || a.code.localeCompare(b.code)), [currencies]);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (c: Currency) => { setForm({ code: c.code, name: c.name, rateToKES: c.rateToKES, active: c.active }); setEditing(c.id); };

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (form.rateToKES <= 0) { toast.error('Rate must be greater than zero'); return; }
    if (editing === 'new') { currenciesStore.create({ ...form, base: false }); toast.success(`${form.code} added`); }
    else if (editing) { currenciesStore.update(editing, form); toast.success(`${form.code} updated`); }
    setEditing(null);
  };

  const remove = (c: Currency) => {
    if (c.base) { toast.error('The base currency cannot be removed'); return; }
    currenciesStore.remove(c.id);
    toast.success(`${c.code} removed`);
  };

  const columns: Column<Currency>[] = [
    { id: 'code', header: 'Code', width: 90, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'name', header: 'Currency', width: 200, sortValue: (r) => r.name, cell: (r) => r.name },
    { id: 'rate', header: 'Rate to KES', numeric: true, width: 150, sortValue: (r) => r.rateToKES, cell: (r) => (r.base ? '—' : r.rateToKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })) },
    { id: 'base', header: 'Base', width: 90, sortValue: (r) => (r.base ? 1 : 0), cell: (r) => (r.base ? 'Yes' : '') },
    { id: 'active', header: 'Status', width: 100, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive') }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/currencies']?.trail ?? ['Finance', 'Configuration', 'Currencies']}
        title="Currencies"
        meta={<span className="tabular">{currencies.length} currencies</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New currency</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Base currency" value={currencies.find((c) => c.base)?.code ?? 'KES'} />
          <StatTile label="Currencies" value={String(currencies.length)} />
          <StatTile label="Active" value={String(currencies.filter((c) => c.active).length)} />
        </div>
        <DataTable
          caption="Currencies and FX rates"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          onRowClick={(r) => openEdit(r)}
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.code}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.code}`} disabled={!can.create || r.base} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New currency' : 'Edit currency'}
        subtitle={editing === 'new' ? 'Add a currency and its rate' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Add currency' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Currency" description="ISO code, name and its exchange rate to the base (KES).">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().slice(0, 3) }))} className="font-mono" placeholder="USD" /></Field>
            <Field label="Name" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="US Dollar" /></Field>
            <Field label="Rate to KES" span={6} required hint="1 unit = ? KES"><Input numeric type="number" step="0.0001" value={form.rateToKES} onChange={(e) => setForm((f) => ({ ...f, rateToKES: Number(e.target.value) || 0 }))} /></Field>
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
