'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon, StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  vendorsStore,
  VENDOR_STATUSES,
  VENDOR_CATEGORIES,
  type VendorStatus,
  type Vendor
} from '../../data/vendors';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

interface VendorForm {
  code: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  status: VendorStatus;
  rating: number;
}

const emptyForm: VendorForm = { code: '', name: '', category: VENDOR_CATEGORIES[0], contact: '', phone: '', email: '', status: 'prospect', rating: 3 };

const STATUS_LABELS: Record<VendorStatus, string> = { active: 'Active', prospect: 'Prospect', suspended: 'Suspended' };

export function Vendors() {
  const can = useCan();
  const vendors = useCollection(vendorsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<VendorForm>(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };
  const openEdit = (v: Vendor) => {
    setForm({ code: v.code, name: v.name, category: v.category, contact: v.contact, phone: v.phone, email: v.email, status: v.status, rating: v.rating });
    setEditing(v.id);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (status && v.status !== status) return false;
      if (category && v.category !== category) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q);
    });
  }, [vendors, query, status, category]);

  const activeCount = vendors.filter((v) => v.status === 'active').length;
  const avgRating = vendors.length ? vendors.reduce((s, v) => s + v.rating, 0) / vendors.length : 0;

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required');
      return;
    }
    if (editing === 'new') {
      vendorsStore.create(form);
      toast.success(`Vendor ${form.name} created`);
    } else if (editing) {
      vendorsStore.update(editing, form);
      toast.success(`Vendor ${form.name} updated`);
    }
    setEditing(null);
  };

  const remove = (v: Vendor) => {
    vendorsStore.remove(v.id);
    toast.success(`Vendor ${v.name} deleted`);
  };

  const chips = [
    status ? { id: 'status', label: 'Status', value: STATUS_LABELS[status as VendorStatus] } : null,
    category ? { id: 'category', label: 'Category', value: category } : null
  ].filter(Boolean) as { id: string; label: string; value: string }[];

  const clearAll = () => {
    setStatus('');
    setCategory('');
    setQuery('');
  };

  const columns: Column<Vendor>[] = [
    { id: 'code', header: 'Code', width: 100, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'Vendor', width: 220, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'category', header: 'Category', width: 160, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'contact', header: 'Contact', width: 160, sortValue: (r) => r.contact, cell: (r) => r.contact },
    { id: 'phone', header: 'Phone', width: 160, defaultHidden: true, sortValue: (r) => r.phone, cell: (r) => <span className="tabular">{r.phone}</span> },
    { id: 'email', header: 'Email', width: 220, defaultHidden: true, sortValue: (r) => r.email, cell: (r) => <span className="block truncate">{r.email}</span> },
    {
      id: 'rating', header: 'Rating', numeric: true, width: 110, sortValue: (r) => r.rating,
      cell: (r) => (
        <span className="inline-flex items-center gap-1 tabular">
          <StarIcon className="h-3.5 w-3.5 text-warning" aria-hidden />
          {r.rating.toFixed(1)}
        </span>
      )
    },
    {
      id: 'status', header: 'Status', width: 120, sortValue: (r) => r.status, cell: (r) => STATUS_LABELS[r.status],
      tone: (r) => (r.status === 'active' ? 'success' : r.status === 'suspended' ? 'danger' : 'warning')
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/procurement/vendors']?.trail ?? ['Procurement', 'Suppliers', 'Vendors']}
        title="Vendors"
        meta={
          <>
            <span className="tabular">{vendors.length} vendors</span>
            <span aria-hidden>·</span>
            <span>{activeCount} active</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot add vendors'} onClick={openNew}>
            New vendor
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Vendors" value={String(vendors.length)} />
          <StatTile label="Active" value={String(activeCount)} footnote="Approved to transact" />
          <StatTile label="Average rating" value={avgRating.toFixed(1)} footnote="Out of 5" />
        </div>

        <DataTable
          caption="Vendor master data"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(status) || Boolean(category) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search name, code or contact"
              chips={chips}
              onRemoveChip={(id) => {
                if (id === 'status') setStatus('');
                if (id === 'category') setCategory('');
              }}
              onClearAll={clearAll}
              controls={
                <>
                  <Select
                    className="w-40"
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[{ value: '', label: 'All statuses' }, ...VENDOR_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
                  />
                  <Select
                    className="w-48"
                    aria-label="Filter by category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[{ value: '', label: 'All categories' }, ...VENDOR_CATEGORIES.map((c) => ({ value: c, label: c }))]}
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
        title={editing === 'new' ? 'New vendor' : 'Edit vendor'}
        subtitle={editing === 'new' ? 'Add a supplier to the master data' : form.code}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              {editing === 'new' ? 'Create vendor' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Vendor details" description="Code, name and the category the supplier belongs to.">
            <Field label="Code" span={6} required>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" placeholder="e.g. V-0013" />
            </Field>
            <Field label="Category" span={6} required>
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                options={VENDOR_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="Name" span={12} required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Acme Suppliers Ltd" />
            </Field>
          </FormSection>

          <FormSection title="Contact" description="Who to reach and how.">
            <Field label="Contact person" span={12}>
              <Input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="e.g. Jane Mwikali" />
            </Field>
            <Field label="Phone" span={6}>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+254 7.." />
            </Field>
            <Field label="Email" span={6}>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="sales@vendor.co.ke" />
            </Field>
          </FormSection>

          <FormSection title="Standing" description="Status and performance rating.">
            <Field label="Status" span={6}>
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VendorStatus }))}
                options={VENDOR_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
            </Field>
            <Field label="Rating (1-5)" span={6}>
              <Input
                numeric
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) }))}
              />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
