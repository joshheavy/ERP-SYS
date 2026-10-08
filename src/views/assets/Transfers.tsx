'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon, ArrowRightIcon } from 'lucide-react';
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
  transfersStore,
  TRANSFER_BADGE,
  type AssetTransfer,
  type TransferStatus
} from '../../data/assetsAdmin';
import { FIXED_ASSETS } from '../../data/registers';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface TransferForm {
  assetTag: string;
  toCustodian: string;
  toLocation: string;
}

const TODAY = '2026-09-17';
const emptyForm: TransferForm = { assetTag: '', toCustodian: '', toLocation: '' };

export function Transfers() {
  const can = useCan();
  const transfers = useCollection(transfersStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TransferForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = transfers.find((t) => t.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transfers.filter((t) => {
      if (status && t.status !== status) return false;
      return !q || t.reference.toLowerCase().includes(q) || t.assetDescription.toLowerCase().includes(q) || t.toCustodian.toLowerCase().includes(q);
    });
  }, [transfers, query, status]);

  const pendingCount = transfers.filter((t) => t.status === 'pending').length;

  const create = () => {
    const asset = FIXED_ASSETS.find((a) => a.tag === form.assetTag);
    if (!asset) { toast.error('Select an asset to transfer'); return; }
    if (!form.toCustodian.trim() && !form.toLocation.trim()) { toast.error('Provide a new custodian or location'); return; }
    const next = transfers.length + 1;
    transfersStore.create({
      reference: `TRF-2026-${String(next).padStart(4, '0')}`,
      assetTag: asset.tag,
      assetDescription: asset.description,
      fromCustodian: asset.custodian,
      toCustodian: form.toCustodian || asset.custodian,
      fromLocation: asset.location,
      toLocation: form.toLocation || asset.location,
      requestedOn: TODAY,
      status: 'pending',
      raisedBy: 'Nancy Wambui'
    });
    toast.success('Transfer requested');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (t: AssetTransfer, next: TransferStatus, msg: string) => {
    transfersStore.update(t.id, { status: next });
    toast.success(msg);
  };

  const columns: Column<AssetTransfer>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'asset', header: 'Asset', width: 220, sortValue: (r) => r.assetDescription, cell: (r) => (
      <span className="min-w-0"><span className="block truncate font-medium text-ink">{r.assetDescription}</span><span className="tabular block text-caption text-ink-subtle">{r.assetTag}</span></span>
    ) },
    { id: 'custodian', header: 'Custodian', width: 220, sortValue: (r) => r.toCustodian, cell: (r) => (
      <span className="flex items-center gap-1 text-small"><span className="text-ink-subtle">{r.fromCustodian}</span><ArrowRightIcon className="h-3 w-3 text-ink-subtle" aria-hidden /><span className="text-ink">{r.toCustodian}</span></span>
    ) },
    { id: 'location', header: 'Location', width: 240, defaultHidden: true, sortValue: (r) => r.toLocation, cell: (r) => `${r.fromLocation} → ${r.toLocation}` },
    { id: 'requestedOn', header: 'Requested', width: 130, sortValue: (r) => r.requestedOn, cell: (r) => <span className="tabular">{formatDate(r.requestedOn)}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={TRANSFER_BADGE[r.status].status} label={TRANSFER_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/transfers']?.trail ?? ['Fixed Assets', 'Transactions', 'Transfers']}
        title="Asset transfers"
        meta={<><span className="tabular">{transfers.length} transfers</span><span aria-hidden>·</span><span>{pendingCount} pending</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>New transfer</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Pending" value={String(pendingCount)} />
          <StatTile label="Approved" value={String(transfers.filter((t) => t.status === 'approved').length)} />
          <StatTile label="Total" value={String(transfers.length)} />
        </div>
        <DataTable
          caption="Asset transfers"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference, asset or custodian"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...(['pending', 'approved', 'rejected'] as TransferStatus[]).map((s) => ({ value: s, label: s }))]} />}
            />
          }
        />
      </div>

      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? active.assetDescription : undefined}
        headerAccessory={active && <StatusBadge status={TRANSFER_BADGE[active.status].status} label={TRANSFER_BADGE[active.status].label} size="md" />}
        footer={
          active && active.status === 'pending' && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              <Button variant="secondary" icon={XIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'rejected', `${active.reference} rejected`)}>Reject</Button>
              <Button variant="primary" icon={CheckIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'approved', `${active.reference} approved`)}>Approve</Button>
            </>
          )
        }
      >
        {active && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
            {[
              { label: 'Asset', value: `${active.assetDescription} (${active.assetTag})` },
              { label: 'From custodian', value: active.fromCustodian },
              { label: 'To custodian', value: active.toCustodian },
              { label: 'From location', value: active.fromLocation },
              { label: 'To location', value: active.toLocation },
              { label: 'Requested', value: `${active.raisedBy} · ${formatDate(active.requestedOn)}` }
            ].map((item) => (
              <div key={item.label} className={item.label === 'Asset' ? 'col-span-2' : undefined}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Drawer>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New transfer"
        subtitle="Move an asset to a new custodian or location"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Request transfer</Button></>}
      >
        <div className="p-1">
          <FormSection title="Transfer" description="Pick the asset and where it is going.">
            <Field label="Asset" span={12} required>
              <Select value={form.assetTag} onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))} options={[{ value: '', label: 'Select an asset…' }, ...FIXED_ASSETS.filter((a) => a.condition !== 'retired').map((a) => ({ value: a.tag, label: `${a.tag} — ${a.description}` }))]} />
            </Field>
            <Field label="New custodian" span={6} hint="Blank to keep current"><Input value={form.toCustodian} onChange={(e) => setForm((f) => ({ ...f, toCustodian: e.target.value }))} /></Field>
            <Field label="New location" span={6} hint="Blank to keep current"><Input value={form.toLocation} onChange={(e) => setForm((f) => ({ ...f, toLocation: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
