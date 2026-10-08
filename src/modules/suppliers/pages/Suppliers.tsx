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
import {
  suppliersStore,
  SUPPLIER_CATEGORIES,
  PREQUAL_STATUSES,
  type PrequalStatus,
  type Supplier
} from '../../../data/suppliers';
import { useCollection } from '../../../core/store/createCollection';
import { formatDate } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

interface SupplierForm {
  registryNo: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  taxCompliant: boolean;
  prequalStatus: PrequalStatus;
  evaluationScore: number;
  registeredOn: string;
}

const emptyForm: SupplierForm = {
  registryNo: '',
  name: '',
  category: SUPPLIER_CATEGORIES[0],
  contact: '',
  phone: '',
  email: '',
  taxCompliant: true,
  prequalStatus: 'pending',
  evaluationScore: 0,
  registeredOn: new Date().toISOString().slice(0, 10)
};

const PREQUAL_LABELS: Record<PrequalStatus, string> = {
  prequalified: 'Prequalified',
  pending: 'Pending',
  disqualified: 'Disqualified'
};

const PREQUAL_PILL: Record<PrequalStatus, string> = {
  prequalified: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  disqualified: 'bg-danger-soft text-danger'
};

function PrequalPill({ status }: { status: PrequalStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${PREQUAL_PILL[status]}`}>
      {PREQUAL_LABELS[status]}
    </span>
  );
}

export function Suppliers() {
  const can = useCan();
  const suppliers = useCollection(suppliersStore);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [prequal, setPrequal] = useState('');

  // Drawer state: null = closed; 'new' = create; else the id being edited.
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);

  const openNew = () => {
    setForm({ ...emptyForm, registeredOn: new Date().toISOString().slice(0, 10) });
    setEditing('new');
  };
  const openEdit = (s: Supplier) => {
    setForm({
      registryNo: s.registryNo,
      name: s.name,
      category: s.category,
      contact: s.contact,
      phone: s.phone,
      email: s.email,
      taxCompliant: s.taxCompliant,
      prequalStatus: s.prequalStatus,
      evaluationScore: s.evaluationScore,
      registeredOn: s.registeredOn
    });
    setEditing(s.id);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (category && s.category !== category) return false;
      if (prequal && s.prequalStatus !== prequal) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.registryNo.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q)
      );
    });
  }, [suppliers, query, category, prequal]);

  const prequalifiedCount = suppliers.filter((s) => s.prequalStatus === 'prequalified').length;
  const avgScore = suppliers.length
    ? Math.round(suppliers.reduce((sum, s) => sum + s.evaluationScore, 0) / suppliers.length)
    : 0;

  const save = () => {
    if (!form.registryNo.trim() || !form.name.trim()) {
      toast.error('Registry no. and name are required');
      return;
    }
    if (form.evaluationScore < 0 || form.evaluationScore > 100) {
      toast.error('Evaluation score must be between 0 and 100');
      return;
    }
    if (editing === 'new') {
      suppliersStore.create(form);
      toast.success(`Supplier ${form.name} registered`);
    } else if (editing) {
      suppliersStore.update(editing, form);
      toast.success(`Supplier ${form.name} updated`);
    }
    setEditing(null);
  };

  const remove = (s: Supplier) => {
    suppliersStore.remove(s.id);
    toast.success(`Supplier ${s.name} removed`);
  };

  const columns: Column<Supplier>[] = [
    { id: 'registryNo', header: 'Registry no.', width: 130, sortValue: (r) => r.registryNo, cell: (r) => <span className="tabular">{r.registryNo}</span> },
    { id: 'name', header: 'Supplier', width: 220, sortValue: (r) => r.name, cell: (r) => <span className="block truncate font-medium text-ink">{r.name}</span> },
    { id: 'category', header: 'Category', width: 150, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'contact', header: 'Contact', width: 160, defaultHidden: true, sortValue: (r) => r.contact, cell: (r) => <span className="block truncate text-ink-muted">{r.contact}</span> },
    { id: 'tax', header: 'Tax compliant', width: 120, sortValue: (r) => (r.taxCompliant ? 1 : 0), cell: (r) => (r.taxCompliant ? 'Yes' : 'No') },
    { id: 'prequal', header: 'Prequalification', width: 150, sortValue: (r) => r.prequalStatus, cell: (r) => <PrequalPill status={r.prequalStatus} /> },
    { id: 'score', header: 'Evaluation', numeric: true, width: 110, sortValue: (r) => r.evaluationScore, cell: (r) => `${r.evaluationScore}/100` }
  ];

  const clearAll = () => {
    setQuery('');
    setCategory('');
    setPrequal('');
  };

  const chips = [
    ...(category ? [{ id: 'category', label: 'Category', value: category }] : []),
    ...(prequal ? [{ id: 'prequal', label: 'Prequalification', value: PREQUAL_LABELS[prequal as PrequalStatus] }] : [])
  ];

  return (
    <div>
      <PageHeader
        trail={['Suppliers', 'Supplier registry']}
        title="Supplier registry"
        meta={
          <>
            <span className="tabular">{suppliers.length} suppliers</span>
            <span aria-hidden>·</span>
            <span>{prequalifiedCount} prequalified</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot register suppliers'} onClick={openNew}>
            New supplier
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Suppliers" value={String(suppliers.length)} />
          <StatTile label="Prequalified" value={String(prequalifiedCount)} footnote="Cleared to transact" />
          <StatTile label="Avg evaluation score" value={`${avgScore}/100`} />
        </div>

        <DataTable
          caption="Supplier registry"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(category) || Boolean(prequal) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search name, registry no. or contact"
              chips={chips}
              onRemoveChip={(id) => {
                if (id === 'category') setCategory('');
                if (id === 'prequal') setPrequal('');
              }}
              onClearAll={clearAll}
              controls={
                <>
                  <Select
                    className="w-44"
                    aria-label="Filter by category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[{ value: '', label: 'All categories' }, ...SUPPLIER_CATEGORIES.map((c) => ({ value: c, label: c }))]}
                  />
                  <Select
                    className="w-44"
                    aria-label="Filter by prequalification"
                    value={prequal}
                    onChange={(e) => setPrequal(e.target.value)}
                    options={[{ value: '', label: 'All prequal statuses' }, ...PREQUAL_STATUSES.map((s) => ({ value: s, label: PREQUAL_LABELS[s] }))]}
                  />
                </>
              }
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
        title={editing === 'new' ? 'New supplier' : 'Edit supplier'}
        subtitle={editing === 'new' ? 'Register a supplier' : form.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              {editing === 'new' ? 'Register supplier' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Supplier details" description="Registry identity and category.">
            <Field label="Registry no." span={6} required>
              <Input value={form.registryNo} onChange={(e) => setForm((f) => ({ ...f, registryNo: e.target.value }))} className="font-mono" placeholder="e.g. SR-2026-013" />
            </Field>
            <Field label="Category" span={6} required>
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                options={SUPPLIER_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="Name" span={12} required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Acme Distributors Ltd" />
            </Field>
            <Field label="Registered on" span={6}>
              <Input type="date" value={form.registeredOn} onChange={(e) => setForm((f) => ({ ...f, registeredOn: e.target.value }))} />
            </Field>
          </FormSection>

          <FormSection title="Contact" description="Primary point of contact for the supplier.">
            <Field label="Contact person" span={12}>
              <Input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="e.g. Jane Doe" />
            </Field>
            <Field label="Phone" span={6}>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" />
            </Field>
            <Field label="Email" span={6}>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="orders@supplier.co.ke" />
            </Field>
          </FormSection>

          <FormSection title="Prequalification & evaluation" description="Compliance and scoring against tender criteria.">
            <Field label="Prequalification status" span={6} required>
              <Select
                value={form.prequalStatus}
                onChange={(e) => setForm((f) => ({ ...f, prequalStatus: e.target.value as PrequalStatus }))}
                options={PREQUAL_STATUSES.map((s) => ({ value: s, label: PREQUAL_LABELS[s] }))}
              />
            </Field>
            <Field label="Evaluation score (0-100)" span={6}>
              <Input numeric type="number" min={0} max={100} value={form.evaluationScore} onChange={(e) => setForm((f) => ({ ...f, evaluationScore: Number(e.target.value) || 0 }))} />
            </Field>
            <div className="col-span-12">
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Tax compliant (valid KRA compliance certificate)</span>
                <Toggle checked={form.taxCompliant} onChange={() => setForm((f) => ({ ...f, taxCompliant: !f.taxCompliant }))} aria-label="Tax compliant" />
              </label>
            </div>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
