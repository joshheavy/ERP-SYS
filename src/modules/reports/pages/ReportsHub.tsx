'use client';

import React, { useMemo, useState } from 'react';
import {
  ScaleIcon,
  ListTreeIcon,
  UsersIcon,
  TruckIcon,
  BoxesIcon,
  PlayIcon,
  DownloadIcon,
  ArrowLeftIcon,
  ClockIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { DataTable } from '../../../components/data-table/DataTable';
import { useCollection } from '../../../core/store/createCollection';
import { employeesStore, DEPARTMENTS, type Employee } from '../../../data/employees';
import { vendorsStore, type Vendor } from '../../../data/vendors';
import { accountsStore, type LedgerAccount } from '../../../data/accounts';
import { INVENTORY_ITEMS } from '../../../data/registers';
import { formatMoney } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

type ReportId =
  | 'trial-balance'
  | 'coa-summary'
  | 'headcount'
  | 'vendor-spend'
  | 'stock-valuation';

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Reports that render real data. Others show a "coming soon" runner. */
  live: boolean;
}

const REPORTS: ReportDef[] = [
  { id: 'headcount', title: 'Employee headcount by department', description: 'Active and total staff grouped by department.', icon: UsersIcon, live: true },
  { id: 'coa-summary', title: 'Chart of accounts summary', description: 'Total balance by account classification.', icon: ScaleIcon, live: true },
  { id: 'stock-valuation', title: 'Stock valuation', description: 'On-hand quantity and value by inventory item.', icon: BoxesIcon, live: true },
  { id: 'vendor-spend', title: 'Vendor spend', description: 'Indicative spend and rating by active vendor.', icon: TruckIcon, live: true },
  { id: 'trial-balance', title: 'Trial balance', description: 'Full debit/credit trial balance for the period.', icon: ListTreeIcon, live: false }
];

const PERIODS = [
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-07', label: 'July 2026' },
  { value: '2026-Q3', label: 'Q3 2026' },
  { value: '2026', label: 'FY 2026' }
];

/* ----------------------------- Report views ----------------------------- */

interface HeadcountRow {
  id: string;
  department: string;
  total: number;
  active: number;
  onLeave: number;
}

function HeadcountReport({ employees }: { employees: Employee[] }) {
  const rows = useMemo<HeadcountRow[]>(
    () =>
      DEPARTMENTS.map((dept) => {
        const inDept = employees.filter((e) => e.department === dept);
        return {
          id: dept,
          department: dept,
          total: inDept.length,
          active: inDept.filter((e) => e.status === 'active').length,
          onLeave: inDept.filter((e) => e.status === 'onLeave').length
        };
      }).filter((r) => r.total > 0),
    [employees]
  );

  const columns: Column<HeadcountRow>[] = [
    { id: 'department', header: 'Department', width: 220, sortValue: (r) => r.department, cell: (r) => r.department },
    { id: 'total', header: 'Total', numeric: true, width: 100, sortValue: (r) => r.total, cell: (r) => r.total, total: (all) => all.reduce((s, r) => s + r.total, 0) },
    { id: 'active', header: 'Active', numeric: true, width: 100, sortValue: (r) => r.active, cell: (r) => r.active, total: (all) => all.reduce((s, r) => s + r.active, 0) },
    { id: 'onLeave', header: 'On leave', numeric: true, width: 100, sortValue: (r) => r.onLeave, cell: (r) => r.onLeave, total: (all) => all.reduce((s, r) => s + r.onLeave, 0) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Total headcount" value={String(employees.length)} />
        <StatTile label="Active" value={String(employees.filter((e) => e.status === 'active').length)} />
        <StatTile label="Departments" value={String(rows.length)} />
      </div>
      <DataTable
        caption="Headcount by department"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        pinFirstColumn
        showTotals
      />
    </div>
  );
}

interface ClassSummaryRow {
  id: string;
  type: string;
  accounts: number;
  balance: number;
}

function CoaSummaryReport({ accounts }: { accounts: LedgerAccount[] }) {
  const rows = useMemo<ClassSummaryRow[]>(() => {
    const map = new Map<string, ClassSummaryRow>();
    for (const a of accounts) {
      if (!a.postable) continue;
      const row = map.get(a.type) ?? { id: a.type, type: a.type, accounts: 0, balance: 0 };
      row.accounts += 1;
      row.balance += a.balance;
      map.set(a.type, row);
    }
    return [...map.values()];
  }, [accounts]);

  const total = rows.reduce((s, r) => s + r.balance, 0);

  const columns: Column<ClassSummaryRow>[] = [
    { id: 'type', header: 'Classification', width: 180, sortValue: (r) => r.type, cell: (r) => r.type },
    { id: 'accounts', header: 'Accounts', numeric: true, width: 110, sortValue: (r) => r.accounts, cell: (r) => r.accounts, total: (all) => all.reduce((s, r) => s + r.accounts, 0) },
    { id: 'balance', header: 'Balance', numeric: true, width: 180, sortValue: (r) => r.balance, cell: (r) => formatMoney(r.balance), total: (all) => formatMoney(all.reduce((s, r) => s + r.balance, 0)) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Postable accounts" value={String(accounts.filter((a) => a.postable).length)} />
        <StatTile label="Classifications" value={String(rows.length)} />
        <StatTile label="Combined balance" value={formatMoney(total)} />
      </div>
      <DataTable
        caption="Chart of accounts summary"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        pinFirstColumn
        showTotals
      />
    </div>
  );
}

function StockValuationReport() {
  const rows = useMemo(
    () => INVENTORY_ITEMS.map((i) => ({ ...i, value: i.onHand * i.unitCost })),
    []
  );
  const total = rows.reduce((s, r) => s + r.value, 0);

  const columns: Column<(typeof rows)[number]>[] = [
    { id: 'code', header: 'Code', width: 110, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'description', header: 'Item', width: 260, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'category', header: 'Category', width: 130, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'onHand', header: 'On hand', numeric: true, width: 100, sortValue: (r) => r.onHand, cell: (r) => r.onHand },
    { id: 'unitCost', header: 'Unit cost', numeric: true, width: 140, sortValue: (r) => r.unitCost, cell: (r) => formatMoney(r.unitCost) },
    { id: 'value', header: 'Value', numeric: true, width: 160, sortValue: (r) => r.value, cell: (r) => formatMoney(r.value), total: (all) => formatMoney(all.reduce((s, r) => s + r.value, 0)) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Total stock value" value={formatMoney(total)} />
        <StatTile label="Line items" value={String(rows.length)} />
        <StatTile label="Below reorder" value={String(rows.filter((r) => r.onHand <= r.reorderLevel).length)} />
      </div>
      <DataTable
        caption="Stock valuation"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        pinFirstColumn
        showTotals
      />
    </div>
  );
}

function VendorSpendReport({ vendors }: { vendors: Vendor[] }) {
  // Indicative spend derived deterministically from rating (demo — no invoice store yet).
  const rows = useMemo(
    () =>
      vendors
        .filter((v) => v.status === 'active')
        .map((v) => ({ ...v, spend: v.rating * 1_200_000 + v.name.length * 40_000 })),
    [vendors]
  );
  const total = rows.reduce((s, r) => s + r.spend, 0);

  const columns: Column<(typeof rows)[number]>[] = [
    { id: 'code', header: 'Code', width: 100, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'Vendor', width: 220, sortValue: (r) => r.name, cell: (r) => <span className="block truncate font-medium text-ink">{r.name}</span> },
    { id: 'category', header: 'Category', width: 150, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'rating', header: 'Rating', numeric: true, width: 90, sortValue: (r) => r.rating, cell: (r) => `${r.rating}/5` },
    { id: 'spend', header: 'Spend', numeric: true, width: 170, sortValue: (r) => r.spend, cell: (r) => formatMoney(r.spend), total: (all) => formatMoney(all.reduce((s, r) => s + r.spend, 0)) }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Total spend" value={formatMoney(total)} />
        <StatTile label="Active vendors" value={String(rows.length)} />
        <StatTile label="Top vendor" value={rows.length ? [...rows].sort((a, b) => b.spend - a.spend)[0].name : '—'} />
      </div>
      <DataTable
        caption="Vendor spend"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        pinFirstColumn
        showTotals
      />
    </div>
  );
}

/* -------------------------------- Page --------------------------------- */

export function ReportsHub() {
  const employees = useCollection(employeesStore);
  const vendors = useCollection(vendorsStore);
  const accounts = useCollection(accountsStore);

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
      setGeneratedAt('14 Sep 2026, 17:02');
    }, 400);
  };

  const renderReport = () => {
    switch (selected) {
      case 'headcount':
        return <HeadcountReport employees={employees} />;
      case 'coa-summary':
        return <CoaSummaryReport accounts={accounts} />;
      case 'stock-valuation':
        return <StockValuationReport />;
      case 'vendor-spend':
        return <VendorSpendReport vendors={vendors} />;
      default:
        return (
          <Card>
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning">
                <ClockIcon className="h-4 w-4" />
              </span>
              <p className="text-h3 text-ink">Coming soon in this hub</p>
              <p className="mt-1 max-w-sm text-small text-ink-muted">
                This report is available in its own module. It will surface here in a future release.
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div>
      <PageHeader
        trail={def ? ['Reports', def.title] : ['Reports']}
        title={def ? def.title : 'Reports'}
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
            <span>Run read-only reports across your modules.</span>
          )
        }
        secondaryActions={
          def && (
            <Button icon={ArrowLeftIcon} onClick={back}>
              All reports
            </Button>
          )
        }
        primaryAction={
          def &&
          def.live &&
          (generatedAt ? (
            <Button variant="primary" icon={DownloadIcon} onClick={() => toast.success('Export queued', { description: `${def.title} — XLSX.` })}>
              Export
            </Button>
          ) : (
            <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
              Generate report
            </Button>
          ))
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
                  {!r.live && <p className="mt-2 text-caption text-ink-subtle">Coming soon in this hub</p>}
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
              {def.live ? (
                <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
                  Generate report
                </Button>
              ) : (
                <p className="text-small text-ink-muted">This report is coming soon in the hub.</p>
              )}
            </div>
          </Card>
        ) : (
          renderReport()
        )}
      </div>
    </div>
  );
}
