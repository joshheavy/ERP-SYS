'use client';

import React from 'react';
import { ArrowRightIcon, ArrowUpRightIcon, ArrowDownRightIcon, MinusIcon, InboxIcon } from 'lucide-react';
import { useNav } from '../hooks/useNav';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, EmptyState } from '../components/ui/Card';
import { AreaTrend, GroupedBars, DonutStat, DonutLegend, Sparkline } from '../components/charts/Charts';
import { MODULES } from '../data/navigation';
import { MODULE_DASHBOARDS } from '../data/moduleDashboards';
import { MODULE_SPARKLINES } from '../data/dashboardCharts';
import { APPROVAL_QUEUE } from '../data/approvals';
import { relativeTime } from '../utils/format';
import { cn } from '../utils/cn';
import type { ModuleId } from '../types/common';

export interface ModuleDashboardProps {
  moduleId: ModuleId;
}

/**
 * The landing dashboard for a single business module — the screen a user sees
 * when they open the module (like the legacy Angular ERP's module dashboards).
 * Driven entirely by MODULE_DASHBOARDS config so all modules stay consistent.
 */
export function ModuleDashboard({ moduleId }: ModuleDashboardProps) {
  const navigate = useNav();
  const config = MODULE_DASHBOARDS[moduleId];
  const module = MODULES.find((m) => m.id === moduleId);

  if (!config || !module) {
    return (
      <div className="p-5">
        <EmptyState title="No dashboard" description="This module has no dashboard configured." />
      </div>
    );
  }

  const Icon = module.icon;
  const moneyFmt = (v: number) => `KSh ${v}M`;
  const approvals = APPROVAL_QUEUE.filter((a) => a.module === moduleId);
  const totalSlice = config.chart.kind === 'donut' ? config.chart.data.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <div>
      <PageHeader
        trail={[module.label, 'Dashboard']}
        title={`${module.label} dashboard`}
        meta={<span>{config.tagline}</span>}
        primaryAction={
          approvals.length > 0 ? (
            <Button variant="primary" icon={InboxIcon} onClick={() => navigate('/approvals')}>
              {approvals.length} awaiting approval
            </Button>
          ) : undefined
        }
      />

      {/* Module hero band */}
      <div className="border-b border-line bg-gradient-to-br from-primary-soft/60 via-surface to-surface px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary text-white">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-h1 text-ink">{module.label}</h2>
            <p className="text-body text-ink-muted">{module.blurb}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* KPI band */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {config.kpis.map((kpi) => {
            const good = kpi.direction === 'flat' || kpi.direction === undefined ? undefined : (kpi.direction === 'up') === kpi.goodUp;
            const DeltaIcon = kpi.direction === 'up' ? ArrowUpRightIcon : kpi.direction === 'down' ? ArrowDownRightIcon : MinusIcon;
            return (
              <div key={kpi.label} className="overflow-hidden rounded-surface border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-caption uppercase tracking-wide text-ink-subtle">{kpi.label}</p>
                    <p className="tabular mt-1 text-h1 text-ink">{kpi.value}</p>
                  </div>
                  {kpi.delta && (
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-caption font-medium',
                        good === undefined ? 'bg-surface-3 text-ink-muted' : good ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      )}
                    >
                      <DeltaIcon className="h-3 w-3" aria-hidden />
                      {kpi.delta}
                    </span>
                  )}
                </div>
                <div className="mt-2 -mx-1">
                  <Sparkline data={MODULE_SPARKLINES[moduleId]} colorIndex={kpi.colorIndex} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Chart + quick links */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title={config.chart.title} description={config.chart.description} />
            <div className="px-3 py-4">
              {config.chart.kind === 'area' && (
                <AreaTrend data={config.chart.data} xKey={config.chart.xKey} series={config.chart.series} format={config.chart.format === 'money' ? moneyFmt : undefined} />
              )}
              {config.chart.kind === 'bars' && (
                <GroupedBars data={config.chart.data} xKey={config.chart.xKey} series={config.chart.series} format={config.chart.format === 'money' ? moneyFmt : undefined} />
              )}
              {config.chart.kind === 'donut' && (
                <>
                  <DonutStat data={config.chart.data} centerLabel={config.chart.centerLabel} centerValue={String(totalSlice)} height={200} />
                  <div className="mt-4">
                    <DonutLegend data={config.chart.data} total={totalSlice} />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Quick links" description={`Jump into ${module.label}.`} level={3} />
            <ul className="divide-y divide-line">
              {config.quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => navigate(link.href)}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium text-ink">{link.label}</span>
                      <span className="block truncate text-caption text-ink-subtle">{link.description}</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Module approvals */}
        <Card>
          <CardHeader
            title="Needs attention"
            description={`${module.label} documents waiting on a decision.`}
            actions={
              approvals.length > 0 ? (
                <Button size="sm" variant="ghost" trailingIcon={ArrowRightIcon} onClick={() => navigate('/approvals')}>
                  Open inbox
                </Button>
              ) : undefined
            }
          />
          {approvals.length === 0 ? (
            <EmptyState title="Nothing pending" description={`No ${module.label} documents are awaiting approval.`} />
          ) : (
            <ul className="divide-y divide-line">
              {approvals.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/approvals/${item.id}`)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body text-ink">{item.title}</span>
                      <span className="tabular block text-caption text-ink-subtle">
                        {item.reference} · {relativeTime(item.submittedAt)}
                      </span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
