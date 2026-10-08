'use client';

import React, { useMemo, useState } from 'react';
import { PlayIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import { FIXED_ASSETS } from '../../data/registers';
import {
  depreciationStore,
  type DepreciationRun,
  type DepreciationStatus
} from '../../data/depreciation';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

/** Straight-line monthly depreciation for an asset still holding book value. */
function monthlyDepreciation(cost: number, usefulLifeYears: number, nbv: number): number {
  if (nbv <= 0 || usefulLifeYears <= 0) return 0;
  const perMonth = cost / (usefulLifeYears * 12);
  return Math.min(perMonth, nbv);
}

const DEPRECIABLE = FIXED_ASSETS.map((a) => ({
  tag: a.tag,
  description: a.description,
  category: a.category,
  charge: Math.round(monthlyDepreciation(a.cost, a.usefulLife, a.netBookValue))
})).filter((a) => a.charge > 0);

const PREVIEW_TOTAL = DEPRECIABLE.reduce((s, a) => s + a.charge, 0);

/** The next period after the most recent run, naive month increment. */
function nextPeriod(runs: DepreciationRun[]): string {
  const latest = runs.map((r) => r.period).sort().at(-1) ?? '2026-08';
  const [y, m] = latest.split('-').map(Number);
  const d = new Date(y, m, 1); // m is 1-based; Date month is 0-based → this is next month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const STATUS_MAP: Record<DepreciationStatus, 'draft' | 'pending' | 'posted'> = {
  draft: 'draft',
  pending: 'pending',
  posted: 'posted'
};

export function DepreciationRuns() {
  const can = useCan();
  const runs = useCollection(depreciationStore);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = runs.find((r) => r.id === activeId) ?? null;
  const period = useMemo(() => nextPeriod(runs), [runs]);

  const totalPosted = runs.filter((r) => r.status === 'posted').reduce((s, r) => s + r.totalDepreciation, 0);

  const generate = () => {
    const created = depreciationStore.create({
      reference: `DEP-${period}`,
      period,
      runOn: new Date().toISOString().slice(0, 10),
      assetsCount: DEPRECIABLE.length,
      totalDepreciation: PREVIEW_TOTAL,
      status: 'pending'
    });
    setPreviewOpen(false);
    toast.success(`Depreciation run ${created.reference} generated`, { description: 'Review and post it to the ledger.' });
    setActiveId(created.id);
  };

  const post = (run: DepreciationRun) => {
    depreciationStore.update(run.id, { status: 'posted', postedBy: 'David Kimani' });
    toast.success(`${run.reference} posted to the general ledger`);
    setActiveId(null);
  };

  const columns: Column<DepreciationRun>[] = [
    { id: 'reference', header: 'Run', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'period', header: 'Period', width: 110, sortValue: (r) => r.period, cell: (r) => r.period },
    { id: 'runOn', header: 'Generated', width: 130, sortValue: (r) => r.runOn, cell: (r) => <span className="tabular">{formatDate(r.runOn)}</span> },
    { id: 'assetsCount', header: 'Assets', numeric: true, width: 90, sortValue: (r) => r.assetsCount, cell: (r) => r.assetsCount },
    { id: 'total', header: 'Depreciation', numeric: true, width: 160, sortValue: (r) => r.totalDepreciation, cell: (r) => formatMoney(r.totalDepreciation) },
    { id: 'status', header: 'Status', width: 140, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={STATUS_MAP[r.status]} /> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/assets/depreciation']?.trail ?? ['Fixed Assets', 'Register', 'Depreciation runs']}
        title="Depreciation runs"
        meta={
          <>
            <span className="tabular">{runs.length} runs</span>
            <span aria-hidden>·</span>
            <span>Next period {period}</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlayIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot run depreciation'} onClick={() => setPreviewOpen(true)}>
            Run depreciation
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Posted to date" value={formatMoney(totalPosted)} />
          <StatTile label="Depreciable assets" value={String(DEPRECIABLE.length)} footnote="Still holding book value" />
          <StatTile label="Next charge" value={formatMoney(PREVIEW_TOTAL)} footnote={`Period ${period}`} />
        </div>

        <DataTable
          caption="Monthly depreciation runs"
          columns={columns}
          rows={runs}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          onRowClick={(r) => setActiveId(r.id)}
        />
      </div>

      {/* Preview drawer — the "wizard" step before generating */}
      <Drawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        width="lg"
        title={`Run depreciation — ${period}`}
        subtitle="Straight-line, monthly. Review the charge before generating."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={PlayIcon} onClick={generate} disabled={!can.create}>Generate run</Button>
          </>
        }
      >
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between rounded-control border border-line-strong bg-surface px-3 py-2.5">
            <span className="text-small font-medium text-ink">Total depreciation for {period}</span>
            <span className="tabular text-h3 text-ink">{formatMoney(PREVIEW_TOTAL)}</span>
          </div>
          <div className="overflow-hidden rounded-control border border-line">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Asset</th>
                  <th className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Category</th>
                  <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">Charge</th>
                </tr>
              </thead>
              <tbody>
                {DEPRECIABLE.map((a) => (
                  <tr key={a.tag} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2">
                      <span className="block text-small text-ink">{a.description}</span>
                      <span className="tabular block text-caption text-ink-subtle">{a.tag}</span>
                    </td>
                    <td className="px-3 py-2 text-small text-ink-muted">{a.category}</td>
                    <td className="tabular px-3 py-2 text-right text-small text-ink">{formatMoney(a.charge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>

      {/* Run detail drawer — post to ledger */}
      <Drawer
        open={Boolean(active) && !previewOpen}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? `Period ${active.period}` : undefined}
        headerAccessory={active && <StatusBadge status={STATUS_MAP[active.status]} />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              {active.status !== 'posted' && (
                <Button variant="primary" icon={CheckIcon} onClick={() => post(active)} disabled={!can.approve} title={can.approve ? undefined : 'Only an approver can post a run'}>
                  Post to ledger
                </Button>
              )}
            </>
          )
        }
      >
        {active && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
            {[
              { label: 'Period', value: active.period },
              { label: 'Generated', value: formatDate(active.runOn) },
              { label: 'Assets', value: String(active.assetsCount) },
              { label: 'Total depreciation', value: formatMoney(active.totalDepreciation) },
              { label: 'Status', value: active.status },
              { label: 'Posted by', value: active.postedBy ?? '—' }
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Drawer>
    </div>
  );
}
