'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, SendIcon, CheckIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  acquisitionsStore,
  assetCategoriesStore,
  ACQUISITION_BADGE,
  type Acquisition,
  type AcquisitionStatus
} from '../../data/assetsAdmin';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface AcquisitionForm {
  description: string;
  category: string;
  cost: number;
  supplier: string;
  acquiredOn: string;
  custodian: string;
  location: string;
}

const TODAY = '2026-09-17';
const emptyForm: AcquisitionForm = { description: '', category: '', cost: 0, supplier: '', acquiredOn: TODAY, custodian: '', location: '' };

export function Acquisitions() {
  const can = useCan();
  const acquisitions = useCollection(acquisitionsStore);
  const categories = useCollection(assetCategoriesStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AcquisitionForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = acquisitions.find((a) => a.id === activeId) ?? null;
  const categoryNames = categories.filter((c) => c.active).map((c) => c.name);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return acquisitions.filter((a) => {
      if (status && a.status !== status) return false;
      return !q || a.reference.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.supplier.toLowerCase().includes(q);
    });
  }, [acquisitions, query, status]);

  const pendingValue = acquisitions.filter((a) => a.status === 'pending').reduce((s, a) => s + a.cost, 0);
  const capitalisedCount = acquisitions.filter((a) => a.status === 'capitalised').length;

  const create = () => {
    if (!form.description.trim() || form.cost <= 0) { toast.error('Description and a positive cost are required'); return; }
    const next = acquisitions.length + 1;
    acquisitionsStore.create({
      ...form,
      category: form.category || categoryNames[0] || 'ICT equipment',
      reference: `ACQ-2026-${String(next).padStart(4, '0')}`,
      status: 'draft',
      raisedBy: 'Nancy Wambui'
    });
    toast.success('Acquisition created as draft');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (a: Acquisition, next: AcquisitionStatus, msg: string) => {
    acquisitionsStore.update(a.id, { status: next });
    toast.success(msg);
  };

  const columns: Column<Acquisition>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'description', header: 'Asset', width: 240, sortValue: (r) => r.description, cell: (r) => <span className="block truncate font-medium text-ink">{r.description}</span> },
    { id: 'category', header: 'Category', width: 160, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'supplier', header: 'Supplier', width: 180, sortValue: (r) => r.supplier, cell: (r) => <span className="block truncate">{r.supplier}</span> },
    { id: 'cost', header: 'Cost', numeric: true, width: 150, sortValue: (r) => r.cost, cell: (r) => formatMoney(r.cost), total: (all) => formatMoney(all.reduce((s, r) => s + r.cost, 0)) },
    { id: 'status', header: 'Status', width: 140, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={ACQUISITION_BADGE[r.status].status} label={ACQUISITION_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/acquisitions']?.trail ?? ['Fixed Assets', 'Transactions', 'Acquisitions']}
        title="Acquisitions"
        meta={<><span className="tabular">{acquisitions.length} acquisitions</span><span aria-hidden>·</span><span>{formatMoney(pendingValue)} pending</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>New acquisition</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Pending value" value={formatMoney(pendingValue)} />
          <StatTile label="Capitalised" value={String(capitalisedCount)} />
          <StatTile label="Total records" value={String(acquisitions.length)} />
        </div>
        <DataTable
          caption="Acquisitions"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference, asset or supplier"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...(['draft', 'pending', 'capitalised', 'rejected'] as AcquisitionStatus[]).map((s) => ({ value: s, label: s }))]} />}
            />
          }
        />
      </div>

      {/* Detail drawer with workflow */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? active.description : undefined}
        headerAccessory={active && <StatusBadge status={ACQUISITION_BADGE[active.status].status} label={ACQUISITION_BADGE[active.status].label} size="md" />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              {active.status === 'draft' && (
                <Button variant="primary" icon={SendIcon} disabled={!can.create} onClick={() => setStatusOf(active, 'pending', `${active.reference} submitted`)}>Submit</Button>
              )}
              {active.status === 'pending' && (
                <>
                  <Button variant="secondary" icon={XIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'rejected', `${active.reference} rejected`)}>Reject</Button>
                  <Button variant="primary" icon={CheckIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'capitalised', `${active.reference} capitalised into the register`)}>Capitalise</Button>
                </>
              )}
            </>
          )
        }
      >
        {active && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-3">
            {[
              { label: 'Category', value: active.category },
              { label: 'Cost', value: formatMoney(active.cost) },
              { label: 'Supplier', value: active.supplier },
              { label: 'Acquired', value: formatDate(active.acquiredOn) },
              { label: 'Custodian', value: active.custodian || '—' },
              { label: 'Location', value: active.location || '—' },
              { label: 'Raised by', value: active.raisedBy }
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New acquisition"
        subtitle="Record an asset acquisition"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Create acquisition</Button></>}
      >
        <div className="p-1">
          <FormSection title="Asset" description="What is being acquired.">
            <Field label="Description" span={12} required><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. HP ProLiant DL380 server" /></Field>
            <Field label="Category" span={6}><Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={categoryNames.map((c) => ({ value: c, label: c }))} /></Field>
            <Field label="Cost (KES)" span={6} required><Input numeric type="number" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Supplier" span={6}><Input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} /></Field>
            <Field label="Acquired on" span={6}><Input type="date" value={form.acquiredOn} onChange={(e) => setForm((f) => ({ ...f, acquiredOn: e.target.value }))} /></Field>
            <Field label="Custodian" span={6}><Input value={form.custodian} onChange={(e) => setForm((f) => ({ ...f, custodian: e.target.value }))} /></Field>
            <Field label="Location" span={6}><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
