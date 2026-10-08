'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, UsersIcon, LayoutGridIcon, TargetIcon, ListChecksIcon, PlayIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { DataTable } from '../../components/data-table/DataTable';
import { useCollection } from '../../core/store/createCollection';
import { kpisStore, goalsStore, type Kpi, type Goal, type KpiPerspective } from '../../data/performance';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

type ReportId = 'employee' | 'scorecard' | 'kpi' | 'status';

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REPORTS: ReportDef[] = [
  { id: 'employee', title: 'Employee performance', description: 'Average score and rating band per employee.', icon: UsersIcon },
  { id: 'scorecard', title: 'Balanced scorecard', description: 'Weighted score rolled up by the four BSC perspectives.', icon: LayoutGridIcon },
  { id: 'kpi', title: 'KPI performance', description: 'Average score and number of goals per KPI.', icon: TargetIcon },
  { id: 'status', title: 'Goal status summary', description: 'Goals grouped by review status.', icon: ListChecksIcon }
];

const PERIODS = [
  { value: '2026-Q1', label: 'Q1 2026' },
  { value: '2026-Q2', label: 'Q2 2026' },
  { value: 'all', label: 'All periods' }
];

const PERSPECTIVES: KpiPerspective[] = ['Financial', 'Customer', 'Internal', 'Learning'];

/** Rating band for an average score out of 100. */
function ratingBand(score: number): string {
  if (score >= 90) return 'Outstanding';
  if (score >= 75) return 'Exceeds';
  if (score >= 60) return 'Meets';
  if (score > 0) return 'Below';
  return 'Not scored';
}

function bandTone(score: number): 'success' | 'primary' | 'warning' | 'danger' {
  if (score >= 90) return 'success';
  if (score >= 75) return 'primary';
  if (score >= 60) return 'warning';
  return 'danger';
}

/* ------------------------------ Report views --------------------------- */

interface EmployeeRow {
  id: string;
  employee: string;
  goals: number;
  avgScore: number;
  band: string;
}

function EmployeePerformanceReport({ goals }: { goals: Goal[] }) {
  const rows = useMemo<EmployeeRow[]>(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const g of goals) {
      if (g.score <= 0) continue; // only scored goals count
      const cur = map.get(g.employee) ?? { total: 0, count: 0 };
      cur.total += g.score;
      cur.count += 1;
      map.set(g.employee, cur);
    }
    return [...map.entries()]
      .map(([employee, v]) => ({ id: employee, employee, goals: v.count, avgScore: Math.round(v.total / v.count), band: ratingBand(Math.round(v.total / v.count)) }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [goals]);

  const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.avgScore, 0) / rows.length) : 0;

  const columns: Column<EmployeeRow>[] = [
    { id: 'employee', header: 'Employee', width: 200, sortValue: (r) => r.employee, cell: (r) => <span className="font-medium text-ink">{r.employee}</span> },
    { id: 'goals', header: 'Goals', numeric: true, width: 90, sortValue: (r) => r.goals, cell: (r) => r.goals, total: (all) => all.reduce((s, r) => s + r.goals, 0) },
    {
      id: 'avg', header: 'Average score', width: 200, sortValue: (r) => r.avgScore,
      cell: (r) => <ProgressBar value={r.avgScore} max={100} size="sm" tone={bandTone(r.avgScore)} caption={`${r.avgScore}%`} />
    },
    { id: 'band', header: 'Rating', width: 130, sortValue: (r) => r.avgScore, cell: (r) => r.band }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Overall average" value={`${overall}%`} footnote={ratingBand(overall)} />
        <StatTile label="Employees scored" value={String(rows.length)} />
        <StatTile label="Top performer" value={rows.length ? rows[0].employee : '—'} />
      </div>
      <DataTable caption="Employee performance" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals />
    </div>
  );
}

interface ScorecardRow {
  id: string;
  perspective: KpiPerspective;
  weight: number;
  goals: number;
  avgScore: number;
  weightedScore: number;
}

function BalancedScorecardReport({ kpis, goals }: { kpis: Kpi[]; goals: Goal[] }) {
  const rows = useMemo<ScorecardRow[]>(() => {
    return PERSPECTIVES.map((p) => {
      const kpiNames = new Set(kpis.filter((k) => k.perspective === p).map((k) => k.name));
      const weight = kpis.filter((k) => k.perspective === p).reduce((s, k) => s + k.weight, 0);
      const scored = goals.filter((g) => g.score > 0 && kpiNames.has(g.kpi));
      const avg = scored.length ? Math.round(scored.reduce((s, g) => s + g.score, 0) / scored.length) : 0;
      return {
        id: p,
        perspective: p,
        weight,
        goals: scored.length,
        avgScore: avg,
        weightedScore: Math.round((avg * weight) / 100)
      };
    });
  }, [kpis, goals]);

  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const compositeScore = rows.reduce((s, r) => s + r.weightedScore, 0);

  const columns: Column<ScorecardRow>[] = [
    { id: 'perspective', header: 'Perspective', width: 160, sortValue: (r) => r.perspective, cell: (r) => r.perspective },
    { id: 'weight', header: 'Weight %', numeric: true, width: 110, sortValue: (r) => r.weight, cell: (r) => `${r.weight}%`, total: (all) => `${all.reduce((s, r) => s + r.weight, 0)}%` },
    { id: 'goals', header: 'Goals', numeric: true, width: 90, sortValue: (r) => r.goals, cell: (r) => r.goals, total: (all) => all.reduce((s, r) => s + r.goals, 0) },
    {
      id: 'avg', header: 'Avg score', width: 180, sortValue: (r) => r.avgScore,
      cell: (r) => <ProgressBar value={r.avgScore} max={100} size="sm" tone={bandTone(r.avgScore)} caption={`${r.avgScore}%`} />
    },
    { id: 'weighted', header: 'Weighted contribution', numeric: true, width: 190, sortValue: (r) => r.weightedScore, cell: (r) => `${r.weightedScore}`, total: (all) => `${all.reduce((s, r) => s + r.weightedScore, 0)}` }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Composite score" value={`${compositeScore}%`} footnote={ratingBand(compositeScore)} />
        <StatTile label="Total weight" value={`${totalWeight}%`} />
        <StatTile label="Perspectives" value={String(rows.length)} />
      </div>
      <DataTable caption="Balanced scorecard" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals />
    </div>
  );
}

interface KpiRow {
  id: string;
  code: string;
  name: string;
  perspective: KpiPerspective;
  goals: number;
  avgScore: number;
}

function KpiPerformanceReport({ kpis, goals }: { kpis: Kpi[]; goals: Goal[] }) {
  const rows = useMemo<KpiRow[]>(() => {
    return kpis.map((k) => {
      const scored = goals.filter((g) => g.kpi === k.name && g.score > 0);
      const avg = scored.length ? Math.round(scored.reduce((s, g) => s + g.score, 0) / scored.length) : 0;
      return { id: k.id, code: k.code, name: k.name, perspective: k.perspective, goals: scored.length, avgScore: avg };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [kpis, goals]);

  const columns: Column<KpiRow>[] = [
    { id: 'code', header: 'Code', width: 100, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'KPI', width: 280, sortValue: (r) => r.name, cell: (r) => <span className="block truncate">{r.name}</span> },
    { id: 'perspective', header: 'Perspective', width: 130, sortValue: (r) => r.perspective, cell: (r) => r.perspective },
    { id: 'goals', header: 'Goals', numeric: true, width: 90, sortValue: (r) => r.goals, cell: (r) => r.goals, total: (all) => all.reduce((s, r) => s + r.goals, 0) },
    {
      id: 'avg', header: 'Avg score', width: 180, sortValue: (r) => r.avgScore,
      cell: (r) => (r.goals === 0 ? <span className="text-ink-subtle">—</span> : <ProgressBar value={r.avgScore} max={100} size="sm" tone={bandTone(r.avgScore)} caption={`${r.avgScore}%`} />)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="KPIs" value={String(kpis.length)} />
        <StatTile label="With scored goals" value={String(rows.filter((r) => r.goals > 0).length)} />
        <StatTile label="Active KPIs" value={String(kpis.filter((k) => k.active).length)} />
      </div>
      <DataTable caption="KPI performance" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals pageSize={20} />
    </div>
  );
}

interface StatusRow {
  id: string;
  status: string;
  goals: number;
  avgScore: number;
}

function GoalStatusReport({ goals }: { goals: Goal[] }) {
  const rows = useMemo<StatusRow[]>(() => {
    const labels: Record<Goal['status'], string> = { draft: 'Draft', active: 'Active', reviewed: 'Reviewed' };
    const order: Goal['status'][] = ['draft', 'active', 'reviewed'];
    return order.map((st) => {
      const inStatus = goals.filter((g) => g.status === st);
      const scored = inStatus.filter((g) => g.score > 0);
      const avg = scored.length ? Math.round(scored.reduce((s, g) => s + g.score, 0) / scored.length) : 0;
      return { id: st, status: labels[st], goals: inStatus.length, avgScore: avg };
    }).filter((r) => r.goals > 0);
  }, [goals]);

  const columns: Column<StatusRow>[] = [
    { id: 'status', header: 'Status', width: 160, sortValue: (r) => r.status, cell: (r) => r.status },
    { id: 'goals', header: 'Goals', numeric: true, width: 110, sortValue: (r) => r.goals, cell: (r) => r.goals, total: (all) => all.reduce((s, r) => s + r.goals, 0) },
    { id: 'avg', header: 'Avg score', numeric: true, width: 130, sortValue: (r) => r.avgScore, cell: (r) => (r.avgScore ? `${r.avgScore}%` : '—') }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Total goals" value={String(goals.length)} />
        <StatTile label="Reviewed" value={String(goals.filter((g) => g.status === 'reviewed').length)} />
        <StatTile label="Draft" value={String(goals.filter((g) => g.status === 'draft').length)} />
      </div>
      <DataTable caption="Goal status summary" columns={columns} rows={rows} getRowId={(r) => r.id} pinFirstColumn showTotals />
    </div>
  );
}

/* -------------------------------- Page --------------------------------- */

export function PerformanceReports() {
  const kpis = useCollection(kpisStore);
  const allGoals = useCollection(goalsStore);

  const [selected, setSelected] = useState<ReportId | null>(null);
  const [period, setPeriod] = useState('2026-Q1');
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const def = REPORTS.find((r) => r.id === selected) ?? null;

  // Goals scoped to the chosen period ('all' = every period).
  const goals = useMemo(
    () => (period === 'all' ? allGoals : allGoals.filter((g) => g.period === period)),
    [allGoals, period]
  );

  const openReport = (id: ReportId) => {
    setSelected(id);
    setPeriod('2026-Q1');
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
      setGeneratedAt('17 Sep 2026, 09:20');
    }, 400);
  };

  const renderReport = () => {
    switch (selected) {
      case 'employee':
        return <EmployeePerformanceReport goals={goals} />;
      case 'scorecard':
        return <BalancedScorecardReport kpis={kpis} goals={goals} />;
      case 'kpi':
        return <KpiPerformanceReport kpis={kpis} goals={goals} />;
      case 'status':
        return <GoalStatusReport goals={goals} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        trail={def ? ['Human Resources', 'Performance', def.title] : (ROUTE_META['/hr/performance/reports']?.trail ?? ['Human Resources', 'Performance', 'Reports'])}
        title={def ? def.title : 'Performance reports'}
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
            <span>Read-only reports over KPIs and staff goals.</span>
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
