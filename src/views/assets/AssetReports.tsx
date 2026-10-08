'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  BuildingIcon,
  LayersIcon,
  FileBarChartIcon,
  ArrowLeftRightIcon,
  PlayIcon
} from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { DataTable } from '../../components/data-table/DataTable';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCollection } from '../../core/store/createCollection';
import { FIXED_ASSETS, type FixedAsset } from '../../data/registers';
import {
  acquisitionsStore,
  transfersStore,
  disposalsStore,
  revaluationsStore,
  ACQUISITION_BADGE,
  TRANSFER_BADGE,
  DISPOSAL_BADGE,
  REVALUATION_BADGE,
  DISPOSAL_METHOD_LABEL,
  disposalGainLoss,
  revaluationDelta
} from '../../data/assetsAdmin';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

type ReportId = 'register' | 'nbv-category' | 'depreciation' | 'movements';

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REPORTS: ReportDef[] = [
  { id: 'register', title: 'Asset register listing', description: 'Every asset with cost, accumulated depreciation and net book value.', icon: BuildingIcon },
  { id: 'nbv-category', title: 'Net book value by category', description: 'Cost, depreciation and NBV summarised by asset category.', icon: LayersIcon },
  { id: 'depreciation', title: 'Depreciation summary', description: 'How far each asset is depreciated against its cost.', icon: FileBarChartIcon },
  { id: 'movements', title: 'Asset movements', description: 'Acquisitions, transfers, disposals and revaluations for the period.', icon: ArrowLeftRightIcon }
];

const PERIODS = [
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-Q3', label: 'Q3 2026' },
  { value: '2026', label: 'FY 2026' }
];

/* ------------------------------ Report views --------------------------- */

function RegisterListingReport() {
  const totalCost = FIXED_ASSETS.reduce((s, a) => s + a.cost, 0);
  const totalNbv = FIXED_ASSETS.reduce((s, a) => s + a.netBookValue, 0);

  const columns: Column<FixedAsset>[] = [
    { id: 'tag', header: 'Tag', width: 130, sortValue: (r) => r.tag, cell: (r) => <span className="tabular">{r.tag}</span> },
    { id: 'description', header: 'Asset', width: 240, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'category', header: 'Category', width: 150, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'custodian', header: 'Custodian', width: 150, defaultHidden: true, sortValue: (r) => r.custodian, cell: (r) => r.custodian },
    { id: 'cost', header: 'Cost', numeric: true, width: 150, sortValue: (r) => r.cost, cell: (r) => formatMoney(r.cost), total: (all) => formatMoney(all.reduce((s, r) => s + r.cost, 0)) },
    { id: 'accum', header: 'Accum. dep.', numeric: true, width: 150, sortValue: (r) => r.accumulatedDepreciation, cell: (r) => formatMoney(r.accumulatedDepreciation), total: (all) => formatMoney(all.reduce((s, r) => s + r.accumulatedDepreciation, 0)) },
    { id: 'nbv', header: 'Net book value', numeric: true, width: 160, sortValue: (r) => r.netBookValue, cell: (r) => <span className="font-semibold">{formatMoney(r.netBookValue)}</span>, total: (all) => formatMoney(all.reduce((s, r) => s + r.netBookValue, 0)) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Net book value" value={formatMoney(totalNbv)} />
        <StatTile label="Acquisition cost" value={formatMoney(totalCost)} />
        <StatTile label="Assets" value={String(FIXED_ASSETS.length)} />
      </div>
      <DataTable caption="Asset register listing" columns={columns} rows={FIXED_ASSETS} getRowId={(r) => r.id} pinFirstColumn showTotals pageSize={20} />
    </div>
  );
}

interface CategoryRow {
  id: string;
  category: string;
  assets: number;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

function NbvByCategoryReport() {
  const rows = useMemo<CategoryRow[]>(() => {
    const map = new Map<string, CategoryRow>();
    for (const a of FIXED_ASSETS) {
      const row = map.get(a.category) ?? { id: a.category, category: a.category, assets: 0, cost: 0, accumulatedDepreciation: 0, netBookValue: 0 };
      row.assets += 1;
      row.cost += a.cost;
      row.accumulatedDepreciation += a.accumulatedDepreciation;
      row.netBookValue += a.netBookValue;
      map.set(a.category, row);
    }
    return [...map.values()].sort((a, b) => b.netBookValue - a.netBookValue);
  }, []);

  const totalNbv = rows.reduce((s, r) => s + r.netBookValue, 0);

  const columns: Column<CategoryRow>[] = [
    { id: 'category', header: 'Category', width: 200, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'assets', header: 'Assets', numeric: true, width: 100, sortValue: (r) => r.assets, cell: (r) => r.assets, total: (all) => all.reduce((s, r) => s + r.assets, 0) },
    { id: 'cost', header: 'Cost', numeric: true, width: 160, sortValue: (r) => r.cost, cell: (r) => formatMoney(r.cost), total: (all) => formatMoney(all.reduce((s, r) => s + r.cost, 0)) },
    { id: 'accum', header: 'Accum. dep.', numeric: true, width: 160, sortValue: (r) => r.accumulatedDepreciation, cell: (r) => formatMoney(r.accumulatedDepreciation), total: (all) => formatMoney(all.reduce((s, r) => s + r.accumulatedDepreciation, 0)) },
    { id: 'nbv', header: 'Net book value', numeric: true, width: 170, sortValue: (r) => r.netBookValue, cell: (r) => <span className="font-semibold">{formatMoney(r.netBookValue)}</span>, total: (all) => formatMoney(all.reduce((s, r) => s + r.netBookValue, 0)) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Net book value" value={formatMoney(totalNbv)} />
        <StatTile label="Categories" value={String(rows.length)} />
        <StatTile label="Assets" value={String(FIXED_ASSETS.length)} />
      </div>
      <DataTable caption="Net book value by category" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals />
    </div>
  );
}

interface DepreciationRow extends FixedAsset {
  pct: number;
}

function DepreciationSummaryReport() {
  const rows = useMemo<DepreciationRow[]>(
    () => FIXED_ASSETS.map((a) => ({ ...a, pct: a.cost ? a.accumulatedDepreciation / a.cost : 0 })),
    []
  );
  const fullyDepreciated = rows.filter((r) => r.netBookValue === 0).length;
  const totalDep = rows.reduce((s, r) => s + r.accumulatedDepreciation, 0);

  const columns: Column<DepreciationRow>[] = [
    { id: 'tag', header: 'Tag', width: 130, sortValue: (r) => r.tag, cell: (r) => <span className="tabular">{r.tag}</span> },
    { id: 'description', header: 'Asset', width: 240, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'cost', header: 'Cost', numeric: true, width: 150, sortValue: (r) => r.cost, cell: (r) => formatMoney(r.cost), total: (all) => formatMoney(all.reduce((s, r) => s + r.cost, 0)) },
    { id: 'accum', header: 'Accum. dep.', numeric: true, width: 150, sortValue: (r) => r.accumulatedDepreciation, cell: (r) => formatMoney(r.accumulatedDepreciation), total: (all) => formatMoney(all.reduce((s, r) => s + r.accumulatedDepreciation, 0)) },
    {
      id: 'progress', header: 'Depreciated', width: 190, sortValue: (r) => r.pct,
      cell: (r) => <ProgressBar value={r.accumulatedDepreciation} max={r.cost} size="sm" tone={r.netBookValue === 0 ? 'danger' : 'primary'} caption={`${Math.round(r.pct * 100)}%`} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Accumulated depreciation" value={formatMoney(totalDep)} />
        <StatTile label="Fully depreciated" value={String(fullyDepreciated)} footnote={`of ${rows.length} assets`} />
        <StatTile label="Assets" value={String(rows.length)} />
      </div>
      <DataTable caption="Depreciation summary" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals pageSize={20} />
    </div>
  );
}

interface MovementRow {
  id: string;
  type: 'Acquisition' | 'Transfer' | 'Disposal' | 'Revaluation';
  reference: string;
  asset: string;
  date: string;
  amount: number;
  statusLabel: string;
  statusTone: React.ComponentProps<typeof StatusBadge>['status'];
}

function AssetMovementsReport() {
  const acquisitions = useCollection(acquisitionsStore);
  const transfers = useCollection(transfersStore);
  const disposals = useCollection(disposalsStore);
  const revaluations = useCollection(revaluationsStore);

  const rows = useMemo<MovementRow[]>(() => {
    const out: MovementRow[] = [];
    for (const a of acquisitions) {
      out.push({ id: a.id, type: 'Acquisition', reference: a.reference, asset: a.description, date: a.acquiredOn, amount: a.cost, statusLabel: ACQUISITION_BADGE[a.status].label, statusTone: ACQUISITION_BADGE[a.status].status });
    }
    for (const t of transfers) {
      out.push({ id: t.id, type: 'Transfer', reference: t.reference, asset: `${t.assetDescription} (${t.assetTag})`, date: t.requestedOn, amount: 0, statusLabel: TRANSFER_BADGE[t.status].label, statusTone: TRANSFER_BADGE[t.status].status });
    }
    for (const d of disposals) {
      out.push({ id: d.id, type: 'Disposal', reference: d.reference, asset: `${d.assetDescription} (${d.assetTag})`, date: d.disposedOn, amount: disposalGainLoss(d), statusLabel: DISPOSAL_BADGE[d.status].label, statusTone: DISPOSAL_BADGE[d.status].status });
    }
    for (const r of revaluations) {
      out.push({ id: r.id, type: 'Revaluation', reference: r.reference, asset: `${r.assetDescription} (${r.assetTag})`, date: r.revaluedOn, amount: revaluationDelta(r), statusLabel: REVALUATION_BADGE[r.status].label, statusTone: REVALUATION_BADGE[r.status].status });
    }
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [acquisitions, transfers, disposals, revaluations]);

  const columns: Column<MovementRow>[] = [
    { id: 'date', header: 'Date', width: 120, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    { id: 'type', header: 'Type', width: 130, sortValue: (r) => r.type, cell: (r) => r.type },
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'asset', header: 'Asset', width: 260, sortValue: (r) => r.asset, cell: (r) => <span className="block truncate">{r.asset}</span> },
    { id: 'amount', header: 'Value / gain-loss', numeric: true, width: 170, sortValue: (r) => r.amount, cell: (r) => (r.amount === 0 ? <span className="text-ink-subtle">—</span> : formatMoney(r.amount)) },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.statusLabel, cell: (r) => <StatusBadge status={r.statusTone} label={r.statusLabel} /> }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile emphasis label="Acquisitions" value={String(acquisitions.length)} />
        <StatTile label="Transfers" value={String(transfers.length)} />
        <StatTile label="Disposals" value={String(disposals.length)} />
        <StatTile label="Revaluations" value={String(revaluations.length)} />
      </div>
      <DataTable caption="Asset movements" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn pageSize={20} />
    </div>
  );
}

/* -------------------------------- Page --------------------------------- */

export function AssetReports() {
  const [selected, setSelected] = useState<ReportId | null>(null);
  const [period, setPeriod] = useState('2026-09');
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const def = REPORTS.find((r) => r.id === selected) ?? null;

  const openReport = (id: ReportId) => {
    setSelected(id);
    setPeriod('2026-09');
    setGenerating(false);
    setGeneratedAt(null);
  };

  const back = () => {
    setSelected(null);
    setGeneratedAt(null);
    setGenerating(false);
  };

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedAt('17 Sep 2026, 09:14');
    }, 400);
  };

  const renderReport = () => {
    switch (selected) {
      case 'register':
        return <RegisterListingReport />;
      case 'nbv-category':
        return <NbvByCategoryReport />;
      case 'depreciation':
        return <DepreciationSummaryReport />;
      case 'movements':
        return <AssetMovementsReport />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        trail={def ? ['Fixed Assets', 'Reporting', def.title] : (ROUTE_META['/assets/reports']?.trail ?? ['Fixed Assets', 'Reporting', 'Reports'])}
        title={def ? def.title : 'Asset reports'}
        meta={
          def ? (
            generatedAt ? (
              <>
                <span>{PERIODS.find((p) => p.value === period)?.label ?? period}</span>
                <span aria-hidden>·</span>
                <span>Generated {generatedAt}</span>
              </>
            ) : (
              <span>Choose a period, then generate the report.</span>
            )
          ) : (
            <span>Read-only reports over the fixed asset register.</span>
          )
        }
        secondaryActions={def && <Button icon={ArrowLeftIcon} onClick={back}>All reports</Button>}
        primaryAction={
          def && !generatedAt && (
            <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
              Generate report
            </Button>
          )
        }
      />

      <div className="p-5">
        {!def ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REPORTS.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openReport(r.id)}
                  className="rounded-surface border border-line bg-surface p-4 text-left transition-colors duration-fast hover:border-line-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-text">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-h4 text-ink">{r.title}</p>
                  <p className="mt-1 text-small text-ink-muted">{r.description}</p>
                </button>
              );
            })}
          </div>
        ) : !generatedAt ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader title="Report parameters" description="Nothing is generated until you run the report." />
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-small font-medium text-ink">Period</label>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIODS} />
              </div>
              <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
                Generate report
              </Button>
            </div>
          </Card>
        ) : (
          renderReport()
        )}
      </div>
    </div>
  );
}
