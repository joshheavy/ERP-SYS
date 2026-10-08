'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { nssfTiersStore, computeNssf, type NssfTier } from '../../../data/statutory';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

type TierForm = Omit<NssfTier, 'id'>;
const emptyForm: TierForm = { name: '', lowerLimit: 0, upperLimit: 0, rate: 6 };

export function NssfTiers() {
  const can = useCan();
  const tiers = useCollection(nssfTiersStore);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<TierForm>(emptyForm);

  const ordered = useMemo(() => [...tiers].sort((a, b) => a.lowerLimit - b.lowerLimit), [tiers]);
  const maxContribution = computeNssf(Number.MAX_SAFE_INTEGER, tiers);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (t: NssfTier) => { const { id, ...rest } = t; void id; setForm(rest); setEditing(t.id); };

  const save = () => {
    if (!form.name.trim()) { toast.error('Tier name is required'); return; }
    if (form.upperLimit <= form.lowerLimit) { toast.error('Upper limit must exceed the lower limit'); return; }
    if (editing === 'new') { nssfTiersStore.create(form); toast.success(`${form.name} added`); }
    else if (editing) { nssfTiersStore.update(editing, form); toast.success(`${form.name} updated`); }
    setEditing(null);
  };
  const remove = (t: NssfTier) => { nssfTiersStore.remove(t.id); toast.success(`${t.name} removed`); };

  const columns: Column<NssfTier>[] = [
    { id: 'name', header: 'Tier', width: 120, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'limits', header: 'Pensionable band', width: 240, sortValue: (r) => r.lowerLimit, cell: (r) => <span className="tabular">{formatMoney(r.lowerLimit)} – {formatMoney(r.upperLimit)}</span> },
    { id: 'rate', header: 'Rate', numeric: true, width: 100, sortValue: (r) => r.rate, cell: (r) => `${r.rate}%` },
    { id: 'max', header: 'Max / tier', numeric: true, width: 140, sortValue: (r) => (r.upperLimit - (r.lowerLimit === 0 ? 0 : r.lowerLimit - 1)) * r.rate / 100, cell: (r) => formatMoney(Math.round((r.upperLimit - (r.lowerLimit === 0 ? 0 : r.lowerLimit - 1)) * r.rate / 100)) }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/statutory/nssf']?.trail ?? ['Human Resources', 'Statutory', 'NSSF']}
        title="NSSF contribution tiers"
        meta={<span className="tabular">{tiers.length} tiers</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New tier</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Max employee NSSF" value={formatMoney(maxContribution)} footnote="Per month, all tiers" />
          <StatTile label="Tiers" value={String(tiers.length)} />
          <StatTile label="Employee rate" value={`${tiers[0]?.rate ?? 6}%`} />
        </div>
        <DataTable
          caption="NSSF contribution tiers"
          columns={columns}
          rows={ordered}
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
        <p className="text-caption text-ink-subtle">
          NSSF is matched by an equal employer contribution. The employer share is not deducted from the employee.
        </p>
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New NSSF tier' : 'Edit NSSF tier'}
        subtitle="Pensionable earnings tier"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Add tier' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Tier" description="The pensionable earnings band and its rate.">
            <Field label="Name" span={12} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Tier I" /></Field>
            <Field label="Lower limit (KES)" span={6} required><Input numeric type="number" value={form.lowerLimit} onChange={(e) => setForm((f) => ({ ...f, lowerLimit: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Upper limit (KES)" span={6} required><Input numeric type="number" value={form.upperLimit} onChange={(e) => setForm((f) => ({ ...f, upperLimit: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Employee rate (%)" span={6} required><Input numeric type="number" step="0.5" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
