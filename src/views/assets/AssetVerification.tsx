'use client';

import React, { useMemo, useState } from 'react';
import { CheckIcon, ClipboardCheckIcon, MapPinOffIcon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  verificationStore,
  VERIFICATION_BADGE,
  VERIFICATION_STATUSES,
  ASSET_CONDITIONS,
  CURRENT_VERIFICATION_RUN,
  verificationHasVariance,
  type VerificationLine,
  type VerificationStatus,
  type FixedAssetCondition
} from '../../data/assetsAdmin';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

const TODAY = '2026-09-17';
const VERIFIER = 'Beatrice Auma';

/** Editable "physical check" form state for the drawer. */
interface CheckForm {
  foundCustodian: string;
  foundLocation: string;
  foundCondition: FixedAssetCondition;
  note: string;
}

export function AssetVerification() {
  const can = useCan();
  const lines = useCollection(verificationStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<CheckForm | null>(null);

  const active = lines.find((l) => l.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter((l) => {
      if (status && l.status !== status) return false;
      return !q || l.assetTag.toLowerCase().includes(q) || l.assetDescription.toLowerCase().includes(q) || l.expectedCustodian.toLowerCase().includes(q);
    });
  }, [lines, query, status]);

  const counts = useMemo(() => ({
    total: lines.length,
    verified: lines.filter((l) => l.status === 'verified').length,
    pending: lines.filter((l) => l.status === 'pending').length,
    notFound: lines.filter((l) => l.status === 'not-found').length,
    attention: lines.filter((l) => l.status === 'attention').length,
    variances: lines.filter(verificationHasVariance).length
  }), [lines]);

  const checkedCount = counts.total - counts.pending;

  const openLine = (l: VerificationLine) => {
    setActiveId(l.id);
    setForm({
      foundCustodian: l.foundCustodian || l.expectedCustodian,
      foundLocation: l.foundLocation || l.expectedLocation,
      foundCondition: l.foundCondition,
      note: l.note
    });
  };

  const closeDrawer = () => {
    setActiveId(null);
    setForm(null);
  };

  /** Record the physical check with a resolution status. */
  const record = (next: Exclude<VerificationStatus, 'pending'>) => {
    if (!active || !form) return;
    verificationStore.update(active.id, {
      foundCustodian: next === 'not-found' ? '' : form.foundCustodian,
      foundLocation: next === 'not-found' ? '' : form.foundLocation,
      foundCondition: form.foundCondition,
      note: form.note,
      status: next,
      verifiedBy: VERIFIER,
      verifiedOn: TODAY
    });
    toast.success(`${active.assetTag} — ${VERIFICATION_BADGE[next].label.toLowerCase()}`);
    closeDrawer();
  };

  const resetLine = (l: VerificationLine) => {
    verificationStore.update(l.id, { status: 'pending', foundCustodian: '', foundLocation: '', verifiedBy: '', verifiedOn: '', note: '' });
    toast.success(`${l.assetTag} reset to pending`);
  };

  const columns: Column<VerificationLine>[] = [
    {
      id: 'asset', header: 'Asset', width: 240, sortValue: (r) => r.assetDescription, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{r.assetDescription}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.assetTag}</span>
        </span>
      )
    },
    { id: 'category', header: 'Category', width: 150, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'custodian', header: 'Expected custodian', width: 170, defaultHidden: true, sortValue: (r) => r.expectedCustodian, cell: (r) => r.expectedCustodian },
    { id: 'location', header: 'Expected location', width: 200, sortValue: (r) => r.expectedLocation, cell: (r) => <span className="block truncate">{r.expectedLocation}</span> },
    {
      id: 'variance', header: 'Variance', width: 110, sortValue: (r) => (verificationHasVariance(r) ? 1 : 0),
      cell: (r) => verificationHasVariance(r) ? <span className="text-warning">Yes</span> : <span className="text-ink-subtle">—</span>,
      tone: (r) => (verificationHasVariance(r) ? 'warning' : undefined)
    },
    { id: 'verifiedOn', header: 'Checked', width: 120, sortValue: (r) => r.verifiedOn, cell: (r) => r.verifiedOn ? <span className="tabular">{formatDate(r.verifiedOn)}</span> : '—' },
    { id: 'status', header: 'Status', width: 150, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={VERIFICATION_BADGE[r.status].status} label={VERIFICATION_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/verification']?.trail ?? ['Fixed Assets', 'Register', 'Verification']}
        title="Asset verification"
        meta={
          <>
            <span className="tabular">{CURRENT_VERIFICATION_RUN}</span>
            <span aria-hidden>·</span>
            <span className="tabular">{checkedCount}/{counts.total} checked</span>
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile emphasis label="Verified" value={String(counts.verified)} footnote={`of ${counts.total} assets`} />
          <StatTile label="Pending" value={String(counts.pending)} />
          <StatTile label="Needs attention" value={String(counts.attention)} />
          <StatTile label="Not found" value={String(counts.notFound)} footnote={counts.variances ? `${counts.variances} with variance` : undefined} />
        </div>

        <div className="rounded-control border border-line bg-surface px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-small font-medium text-ink">Verification progress</span>
            <span className="tabular text-small text-ink-muted">{Math.round((checkedCount / Math.max(counts.total, 1)) * 100)}%</span>
          </div>
          <ProgressBar value={checkedCount} max={counts.total} tone={checkedCount === counts.total ? 'success' : 'primary'} />
        </div>

        <DataTable
          caption="Asset verification lines"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openLine(r)}
          emptyTitle="No assets match"
          emptyDescription="Adjust the filters to see verification lines."
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search tag, asset or custodian"
              chips={status ? [{ id: 'status', label: 'Status', value: VERIFICATION_BADGE[status as VerificationStatus].label }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...VERIFICATION_STATUSES.map((s) => ({ value: s, label: VERIFICATION_BADGE[s].label }))]}
                />
              }
            />
          }
        />
      </div>

      <Drawer
        open={Boolean(active)}
        onClose={closeDrawer}
        width="md"
        title={active?.assetTag ?? ''}
        subtitle={active?.assetDescription}
        headerAccessory={active && <StatusBadge status={VERIFICATION_BADGE[active.status].status} label={VERIFICATION_BADGE[active.status].label} size="md" />}
        footer={
          active && form && (
            <>
              <Button variant="ghost" onClick={closeDrawer}>Close</Button>
              {active.status !== 'pending' && (
                <Button variant="ghost" disabled={!can.edit} onClick={() => resetLine(active)}>Reset</Button>
              )}
              <Button variant="secondary" icon={MapPinOffIcon} disabled={!can.edit} onClick={() => record('not-found')}>Not found</Button>
              <Button variant="secondary" icon={TriangleAlertIcon} disabled={!can.edit} onClick={() => record('attention')}>Attention</Button>
              <Button variant="primary" icon={CheckIcon} disabled={!can.edit} onClick={() => record('verified')}>Verify</Button>
            </>
          )
        }
      >
        {active && form && (
          <div className="p-1">
            <FormSection title="Register (expected)" description="What the fixed asset register says for this asset.">
              <dl className="col-span-12 grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: 'Category', value: active.category },
                  { label: 'Custodian', value: active.expectedCustodian },
                  { label: 'Location', value: active.expectedLocation },
                  { label: 'Condition', value: active.expectedCondition }
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                    <dd className="mt-0.5 text-body capitalize text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </FormSection>

            <FormSection title="Physical check (found)" description="Record what you actually found. Differences are flagged as a variance.">
              <Field label="Custodian" span={6}>
                <Input value={form.foundCustodian} onChange={(e) => setForm((f) => (f ? { ...f, foundCustodian: e.target.value } : f))} />
              </Field>
              <Field label="Condition" span={6}>
                <Select
                  value={form.foundCondition}
                  onChange={(e) => setForm((f) => (f ? { ...f, foundCondition: e.target.value as FixedAssetCondition } : f))}
                  options={ASSET_CONDITIONS.map((c) => ({ value: c, label: c }))}
                />
              </Field>
              <Field label="Location" span={12}>
                <Input value={form.foundLocation} onChange={(e) => setForm((f) => (f ? { ...f, foundLocation: e.target.value } : f))} />
              </Field>
              <Field label="Note" span={12} hint="Tag condition, serial check, or why it needs attention.">
                <Textarea rows={3} value={form.note} onChange={(e) => setForm((f) => (f ? { ...f, note: e.target.value } : f))} placeholder="e.g. Tag intact, serial matches register." />
              </Field>
            </FormSection>

            {active.status !== 'pending' && active.verifiedBy && (
              <div className="mx-1 mb-1 flex items-center gap-2 rounded-control border border-line bg-surface-2 px-3 py-2 text-small text-ink-muted">
                <ClipboardCheckIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                Checked by {active.verifiedBy} on {formatDate(active.verifiedOn)}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
