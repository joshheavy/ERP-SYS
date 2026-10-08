'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon } from 'lucide-react';
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
  disposalsStore,
  disposalGainLoss,
  DISPOSAL_METHODS,
  DISPOSAL_METHOD_LABEL,
  DISPOSAL_BADGE,
  type AssetDisposal,
  type DisposalMethod,
  type DisposalStatus
} from '../../data/assetsAdmin';
import { FIXED_ASSETS } from '../../data/registers';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { Column } from '../../components/data-table/types';

interface DisposalForm {
  assetTag: string;
  method: DisposalMethod;
  proceeds: number;
}

const TODAY = '2026-09-17';
const emptyForm: DisposalForm = { assetTag: '', method: 'sale', proceeds: 0 };

export function Disposals() {
  const can = useCan();
  const disposals = useCollection(disposalsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<DisposalForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = disposals.find((d) => d.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return disposals.filter((d) => {
      if (status && d.status !== status) return false;
      return !q || d.reference.toLowerCase().includes(q) || d.assetDescription.toLowerCase().includes(q);
    });
  }, [disposals, query, status]);

  const netGainLoss = disposals.filter((d) => d.status === 'approved').reduce((s, d) => s + disposalGainLoss(d), 0);
  const pendingCount = disposals.filter((d) => d.status === 'pending').length;

  const create = () => {
    const asset = FIXED_ASSETS.find((a) => a.tag === form.assetTag);
    if (!asset) { toast.error('Select an asset to dispose'); return; }
    const next = disposals.length + 1;
    disposalsStore.create({
      reference: `DSP-2026-${String(next).padStart(4, '0')}`,
      assetTag: asset.tag,
      assetDescription: asset.description,
      method: form.method,
      netBookValue: asset.netBookValue,
      proceeds: form.proceeds,
      disposedOn: TODAY,
      status: 'pending',
      raisedBy: 'Nancy Wambui'
    });
    toast.success('Disposal requested');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (d: AssetDisposal, next: DisposalStatus, msg: string) => {
    disposalsStore.update(d.id, { status: next });
    toast.success(msg);
  };

  const gainLossCell = (r: AssetDisposal) => {
    const gl = disposalGainLoss(r);
    return <span className={cn('tabular', gl >= 0 ? 'text-numeric-positive' : 'text-numeric-negative')}>{gl >= 0 ? '+' : ''}{formatMoney(gl)}</span>;
  };

  const columns: Column<AssetDisposal>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'asset', header: 'Asset', width: 220, sortValue: (r) => r.assetDescription, cell: (r) => (
      <span className="min-w-0"><span className="block truncate font-medium text-ink">{r.assetDescription}</span><span className="tabular block text-caption text-ink-subtle">{r.assetTag}</span></span>
    ) },
    { id: 'method', header: 'Method', width: 120, sortValue: (r) => r.method, cell: (r) => DISPOSAL_METHOD_LABEL[r.method] },
    { id: 'nbv', header: 'NBV', numeric: true, width: 140, sortValue: (r) => r.netBookValue, cell: (r) => formatMoney(r.netBookValue) },
    { id: 'proceeds', header: 'Proceeds', numeric: true, width: 140, sortValue: (r) => r.proceeds, cell: (r) => formatMoney(r.proceeds) },
    { id: 'gainloss', header: 'Gain / (loss)', numeric: true, width: 150, sortValue: (r) => disposalGainLoss(r), cell: gainLossCell },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={DISPOSAL_BADGE[r.status].status} label={DISPOSAL_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };
  const selectedAsset = FIXED_ASSETS.find((a) => a.tag === form.assetTag);
  const previewGL = selectedAsset ? form.proceeds - selectedAsset.netBookValue : 0;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/disposals']?.trail ?? ['Fixed Assets', 'Transactions', 'Disposals']}
        title="Asset disposals"
        meta={<><span className="tabular">{disposals.length} disposals</span><span aria-hidden>·</span><span>{pendingCount} pending</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>New disposal</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Net gain / (loss)" value={`${netGainLoss >= 0 ? '+' : ''}${formatMoney(netGainLoss)}`} footnote="Approved disposals" />
          <StatTile label="Pending" value={String(pendingCount)} />
          <StatTile label="Total" value={String(disposals.length)} />
        </div>
        <DataTable
          caption="Asset disposals"
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
              placeholder="Search reference or asset"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...(['pending', 'approved', 'rejected'] as DisposalStatus[]).map((s) => ({ value: s, label: s }))]} />}
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
        headerAccessory={active && <StatusBadge status={DISPOSAL_BADGE[active.status].status} label={DISPOSAL_BADGE[active.status].label} size="md" />}
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
              { label: 'Method', value: DISPOSAL_METHOD_LABEL[active.method] },
              { label: 'Net book value', value: formatMoney(active.netBookValue) },
              { label: 'Proceeds', value: formatMoney(active.proceeds) },
              { label: 'Gain / (loss)', value: `${disposalGainLoss(active) >= 0 ? '+' : ''}${formatMoney(disposalGainLoss(active))}` },
              { label: 'Disposed', value: `${active.raisedBy} · ${formatDate(active.disposedOn)}` }
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
        title="New disposal"
        subtitle="Retire, sell or scrap an asset"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Request disposal</Button></>}
      >
        <div className="p-1">
          <FormSection title="Disposal" description="Pick the asset, method and any proceeds.">
            <Field label="Asset" span={12} required>
              <Select value={form.assetTag} onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))} options={[{ value: '', label: 'Select an asset…' }, ...FIXED_ASSETS.map((a) => ({ value: a.tag, label: `${a.tag} — ${a.description}` }))]} />
            </Field>
            <Field label="Method" span={6}><Select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as DisposalMethod }))} options={DISPOSAL_METHODS.map((m) => ({ value: m, label: DISPOSAL_METHOD_LABEL[m] }))} /></Field>
            <Field label="Proceeds (KES)" span={6}><Input numeric type="number" value={form.proceeds} onChange={(e) => setForm((f) => ({ ...f, proceeds: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
          {selectedAsset && (
            <p className="px-5 pb-4 text-small text-ink-muted">
              NBV <span className="tabular font-medium text-ink">{formatMoney(selectedAsset.netBookValue)}</span> · projected{' '}
              <span className={cn('tabular font-medium', previewGL >= 0 ? 'text-numeric-positive' : 'text-numeric-negative')}>
                {previewGL >= 0 ? 'gain ' : 'loss '}{formatMoney(Math.abs(previewGL))}
              </span>.
            </p>
          )}
        </div>
      </Drawer>
    </div>
  );
}
