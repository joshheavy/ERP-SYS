'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
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
  revaluationsStore,
  REVALUATION_BADGE,
  revaluationDelta,
  type AssetRevaluation,
  type RevaluationStatus
} from '../../data/assetsAdmin';
import { FIXED_ASSETS } from '../../data/registers';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface RevaluationForm {
  assetTag: string;
  revaluedAmount: number;
  basis: string;
}

const TODAY = '2026-09-17';
const emptyForm: RevaluationForm = { assetTag: '', revaluedAmount: 0, basis: '' };

/** A signed money figure with an up/down tone — reused in the table and preview. */
function DeltaValue({ value }: { value: number }) {
  if (value === 0) return <span className="tabular text-ink-subtle">—</span>;
  const gain = value > 0;
  return (
    <span className={gain ? 'tabular inline-flex items-center gap-1 text-success' : 'tabular inline-flex items-center gap-1 text-danger'}>
      {gain ? <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden /> : <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden />}
      {gain ? '+' : '−'}{formatMoney(Math.abs(value))}
    </span>
  );
}

export function AssetRevaluation() {
  const can = useCan();
  const revaluations = useCollection(revaluationsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RevaluationForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = revaluations.find((r) => r.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return revaluations.filter((r) => {
      if (status && r.status !== status) return false;
      return !q || r.reference.toLowerCase().includes(q) || r.assetDescription.toLowerCase().includes(q) || r.assetTag.toLowerCase().includes(q);
    });
  }, [revaluations, query, status]);

  const pendingCount = revaluations.filter((r) => r.status === 'pending').length;
  const approvedUplift = revaluations
    .filter((r) => r.status === 'approved')
    .reduce((s, r) => s + revaluationDelta(r), 0);

  const selectedAsset = FIXED_ASSETS.find((a) => a.tag === form.assetTag) ?? null;
  const previewDelta = selectedAsset ? form.revaluedAmount - selectedAsset.netBookValue : 0;

  const create = () => {
    if (!selectedAsset) { toast.error('Select an asset to revalue'); return; }
    if (form.revaluedAmount <= 0) { toast.error('Enter the new carrying value'); return; }
    if (!form.basis.trim()) { toast.error('Provide a basis for the revaluation'); return; }
    const next = revaluations.length + 1;
    revaluationsStore.create({
      reference: `REV-2026-${String(next).padStart(4, '0')}`,
      assetTag: selectedAsset.tag,
      assetDescription: selectedAsset.description,
      currentNbv: selectedAsset.netBookValue,
      revaluedAmount: form.revaluedAmount,
      basis: form.basis.trim(),
      revaluedOn: TODAY,
      status: 'pending',
      raisedBy: 'Nancy Wambui'
    });
    toast.success('Revaluation submitted for approval');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (r: AssetRevaluation, next: RevaluationStatus, msg: string) => {
    revaluationsStore.update(r.id, { status: next });
    toast.success(msg);
  };

  const columns: Column<AssetRevaluation>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    {
      id: 'asset', header: 'Asset', width: 240, sortValue: (r) => r.assetDescription, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{r.assetDescription}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.assetTag}</span>
        </span>
      )
    },
    { id: 'nbv', header: 'Current NBV', numeric: true, width: 150, sortValue: (r) => r.currentNbv, cell: (r) => formatMoney(r.currentNbv) },
    { id: 'revalued', header: 'Revalued to', numeric: true, width: 150, sortValue: (r) => r.revaluedAmount, cell: (r) => <span className="font-semibold">{formatMoney(r.revaluedAmount)}</span> },
    { id: 'delta', header: 'Uplift / (impairment)', numeric: true, width: 180, sortValue: (r) => revaluationDelta(r), cell: (r) => <DeltaValue value={revaluationDelta(r)} /> },
    { id: 'revaluedOn', header: 'Date', width: 120, defaultHidden: true, sortValue: (r) => r.revaluedOn, cell: (r) => <span className="tabular">{formatDate(r.revaluedOn)}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={REVALUATION_BADGE[r.status].status} label={REVALUATION_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/revaluation']?.trail ?? ['Fixed Assets', 'Transactions', 'Revaluation']}
        title="Asset revaluation"
        meta={<><span className="tabular">{revaluations.length} revaluations</span><span aria-hidden>·</span><span>{pendingCount} pending</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>New revaluation</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Pending" value={String(pendingCount)} />
          <StatTile label="Approved" value={String(revaluations.filter((r) => r.status === 'approved').length)} />
          <StatTile label="Net approved uplift" value={formatMoney(approvedUplift)} footnote={approvedUplift >= 0 ? 'Net revaluation gain' : 'Net impairment'} />
        </div>
        <DataTable
          caption="Asset revaluations"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          emptyTitle="No revaluations"
          emptyDescription="Raise a revaluation to restate an asset's carrying value."
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference or asset"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...(['pending', 'approved', 'rejected'] as RevaluationStatus[]).map((s) => ({ value: s, label: s }))]} />}
            />
          }
        />
      </div>

      {/* Detail / approval drawer */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active?.assetDescription}
        headerAccessory={active && <StatusBadge status={REVALUATION_BADGE[active.status].status} label={REVALUATION_BADGE[active.status].label} size="md" />}
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
          <div className="p-1">
            <div className="mx-1 mb-3 grid grid-cols-3 gap-3 rounded-control border border-line bg-surface-2 px-3 py-3 text-center">
              <div>
                <p className="text-caption uppercase tracking-wide text-ink-subtle">Current NBV</p>
                <p className="tabular mt-0.5 text-body text-ink">{formatMoney(active.currentNbv)}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wide text-ink-subtle">Revalued to</p>
                <p className="tabular mt-0.5 text-body font-semibold text-ink">{formatMoney(active.revaluedAmount)}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wide text-ink-subtle">Uplift / (impairment)</p>
                <p className="mt-0.5 text-body"><DeltaValue value={revaluationDelta(active)} /></p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-3">
              {[
                { label: 'Asset', value: `${active.assetDescription} (${active.assetTag})`, full: true },
                { label: 'Basis', value: active.basis, full: true },
                { label: 'Raised by', value: active.raisedBy },
                { label: 'Date', value: formatDate(active.revaluedOn) }
              ].map((item) => (
                <div key={item.label} className={item.full ? 'col-span-2' : undefined}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New revaluation"
        subtitle="Restate an asset's carrying value to a new fair value"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Submit for approval</Button></>}
      >
        <div className="p-1">
          <FormSection title="Revaluation" description="Pick the asset and the new carrying value.">
            <Field label="Asset" span={12} required>
              <Select
                value={form.assetTag}
                onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))}
                options={[{ value: '', label: 'Select an asset…' }, ...FIXED_ASSETS.filter((a) => a.condition !== 'retired').map((a) => ({ value: a.tag, label: `${a.tag} — ${a.description}` }))]}
              />
            </Field>
            <Field label="Current NBV" span={6} hint="From the register">
              <Input readOnly value={selectedAsset ? formatMoney(selectedAsset.netBookValue) : '—'} />
            </Field>
            <Field label="Revalued amount (KES)" span={6} required>
              <Input numeric type="number" value={form.revaluedAmount || ''} onChange={(e) => setForm((f) => ({ ...f, revaluedAmount: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="Basis" span={12} required hint="Market appraisal, impairment test, valuer report, etc.">
              <Input value={form.basis} onChange={(e) => setForm((f) => ({ ...f, basis: e.target.value }))} placeholder="e.g. Independent market appraisal — Sept 2026" />
            </Field>
          </FormSection>

          {selectedAsset && form.revaluedAmount > 0 && (
            <div className="mx-1 mb-1 flex items-center justify-between rounded-control border border-line bg-surface-2 px-3 py-2.5">
              <span className="text-small text-ink-muted">{previewDelta >= 0 ? 'Revaluation gain (uplift)' : 'Impairment loss'}</span>
              <DeltaValue value={previewDelta} />
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
