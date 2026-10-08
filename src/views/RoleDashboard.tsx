'use client';

import React from 'react';
import { ArrowRightIcon, InboxIcon, SparklesIcon } from 'lucide-react';
import { useNav } from '../hooks/useNav';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AreaTrend, GroupedBars, DonutStat, DonutLegend, Sparkline } from '../components/charts/Charts';
import { usePreferences } from '../contexts/PreferencesContext';
import { useModuleAccess } from '../contexts/EntitlementsContext';
import { useDelegation } from '../contexts/DelegationContext';
import { APPROVAL_QUEUE } from '../data/approvals';
import { RECENT_ACTIVITY } from '../data/finance';
import {
  BUDGET_COMPOSITION,
  INCOME_EXPENSE,
  MODULE_SPARKLINES,
  REVENUE_TREND
} from '../data/dashboardCharts';
import { MODULE_SUMMARIES, type ModuleStat } from '../data/moduleSummaries';
import { relativeTime } from '../utils/format';
import { cn } from '../utils/cn';

import type { Role } from '../types/common';

const TONE_TEXT: Record<NonNullable<ModuleStat['tone']>, string> = {
  default: 'text-ink',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger'
};

const budgetTotal = BUDGET_COMPOSITION.reduce((s, c) => s + c.value, 0);

/** Role-specific dashboard framing — so each signed-in user gets their own view. */
const ROLE_INTRO: Record<Role, { blurb: string }> = {
  admin: { blurb: 'System health, users and every module across the organisation.' },
  manager: { blurb: 'What needs your approval and how your areas are tracking.' },
  officer: { blurb: 'Your day-to-day: records to raise, post and follow up.' },
  auditor: { blurb: 'A read-only view across the organisation with full history.' },
  employee: { blurb: 'Your self-service — leave, payslips and profile.' }
};

/** Finance-style charts only make sense for finance/budgeting users. */
const FINANCE_MODULES = new Set(['finance', 'budgeting']);

export function RoleDashboard() {
  const navigate = useNav();
  const { role } = usePreferences();
  const { usableModules } = useModuleAccess();
  const { isActing, effectiveIdentity } = useDelegation();

  const identity = effectiveIdentity;
  const firstName = identity.name.split(' ')[0];
  const hour = new Date('2026-09-14T17:00:00').getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const modules = usableModules(role);
  // Approvals relevant to this user's modules.
  const myApprovals = APPROVAL_QUEUE.filter((a) => modules.some((m) => m.id === a.module));
  // Finance-style charts only render for users who actually work in finance/budgeting.
  const hasFinanceView = modules.some((m) => FINANCE_MODULES.has(m.id));

  return (
    <div>
      <PageHeader
        trail={['Workspace', 'Dashboard']}
        title="Dashboard"
        meta={
          <>
            <span>{identity.jobTitle}</span>
            <span aria-hidden>·</span>
            <span>{modules.length} {modules.length === 1 ? 'module' : 'modules'} available to you</span>
          </>
        }
      />

      {/* Greeting band */}
      <div className="border-b border-line bg-gradient-to-br from-primary-soft/60 via-surface to-surface px-5 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-display text-ink">
              {greeting}, {firstName} <span aria-hidden>👋</span>
            </h2>
            <p className="mt-1 text-body text-ink-muted">
              {isActing ? `Acting for ${identity.name} — ${identity.jobTitle}.` : ROLE_INTRO[role].blurb}
            </p>
          </div>
          {myApprovals.length > 0 && (
            <Button variant="primary" icon={InboxIcon} onClick={() => navigate('/approvals')}>
              {myApprovals.length} awaiting approval
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {modules.length === 0 ? (
          <Card>
            <EmptyState
              icon={SparklesIcon}
              title="Your workspace is the self-service portal"
              description="Your role doesn’t include console modules. Head to the portal for your leave, payslips and profile."
              action={
                <Button variant="primary" onClick={() => navigate('/portal')}>
                  Open self-service portal
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            {/* KPI band — one headline per module THIS user can access, so the
                figures reflect their own work rather than a fixed finance set. */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {modules.slice(0, 4).map((module, i) => {
                const summary = MODULE_SUMMARIES[module.id];
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => navigate(summary.href)}
                    className="overflow-hidden rounded-surface border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <p className="text-caption uppercase tracking-wide text-ink-subtle">{module.label} · {summary.headline.label}</p>
                    <p className="tabular mt-1 text-h1 text-ink">{summary.headline.value}</p>
                    <div className="mt-2 -mx-1">
                      <Sparkline data={MODULE_SPARKLINES[module.id]} colorIndex={i % 5} />
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Chart row: revenue trend + budget composition — finance/budgeting users only */}
            {hasFinanceView && (
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                  <CardHeader
                    title="Revenue vs spend"
                    description="Last 12 months, in KSh millions."
                    actions={
                      <span className="inline-flex items-center gap-3 text-caption text-ink-muted">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--c-chart-1)' }} />Revenue</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--c-chart-2)' }} />Spend</span>
                      </span>
                    }
                  />
                  <div className="px-3 py-4">
                    <AreaTrend
                      data={REVENUE_TREND}
                      xKey="month"
                      format={(v) => `KSh ${v}M`}
                      series={[
                        { key: 'revenue', label: 'Revenue', colorIndex: 0 },
                        { key: 'spend', label: 'Spend', colorIndex: 1 }
                      ]}
                    />
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Budget composition" description="This year, by category." />
                  <div className="px-4 py-4">
                    <DonutStat data={BUDGET_COMPOSITION} centerValue={`KSh ${budgetTotal}M`} centerLabel="Total" height={180} />
                    <div className="mt-4">
                      <DonutLegend data={BUDGET_COMPOSITION} total={budgetTotal} format={(v) => `KSh ${v}M`} />
                    </div>
                  </div>
                </Card>
              </section>
            )}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {hasFinanceView && (
                <Card className="xl:col-span-1">
                  <CardHeader title="Income vs expense" description="This week, KSh millions." />
                  <div className="px-3 py-4">
                    <GroupedBars
                      data={INCOME_EXPENSE}
                      xKey="day"
                      height={220}
                      format={(v) => `KSh ${v}M`}
                      series={[
                        { key: 'income', label: 'Income', colorIndex: 1 },
                        { key: 'expense', label: 'Expense', colorIndex: 4 }
                      ]}
                    />
                  </div>
                </Card>
              )}

              {/* Per-module summary cards — span full width when no finance chart shows */}
              <div className={hasFinanceView ? 'xl:col-span-2' : 'xl:col-span-3'}>
                <h3 className="mb-3 text-h3 text-ink">Your modules</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {modules.map((module) => {
                    const s = MODULE_SUMMARIES[module.id];
                    const Icon = module.icon;
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => navigate(s.href)}
                        className="group flex flex-col rounded-surface border border-line bg-surface p-4 text-left transition-all duration-fast ease-exit hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-soft text-primary-text">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <ArrowRightIcon className="h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                        </div>
                        <h4 className="mt-2.5 text-h4 text-ink">{module.label}</h4>
                        <p className="tabular mt-1 text-h3 text-ink">{s.headline.value}</p>
                        <p className="text-caption text-ink-subtle">{s.headline.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Detailed per-module summary cards */}
            <section>
              <h3 className="mb-3 text-h3 text-ink">Module details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => {
                  const summary = MODULE_SUMMARIES[module.id];
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => navigate(summary.href)}
                      className="group flex flex-col rounded-surface border border-line bg-surface p-4 text-left transition-all duration-fast ease-exit hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-soft text-primary-text">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <ArrowRightIcon className="h-4 w-4 text-ink-subtle transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                      </div>

                      <h4 className="mt-3 text-h3 text-ink">{module.label}</h4>
                      <p className="mt-0.5 text-caption text-ink-subtle">{module.blurb}</p>

                      <div className="mt-3">
                        <p className="text-caption uppercase tracking-wide text-ink-subtle">{summary.headline.label}</p>
                        <p className="tabular mt-0.5 text-h1 text-ink">{summary.headline.value}</p>
                      </div>

                      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                        {summary.stats.map((stat) => (
                          <div key={stat.label} className="min-w-0">
                            <dt className="truncate text-caption text-ink-subtle" title={stat.label}>{stat.label}</dt>
                            <dd className={cn('tabular mt-0.5 text-small font-semibold', TONE_TEXT[stat.tone ?? 'default'])}>
                              {stat.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-12 gap-4">
              {/* Needs attention */}
              <Card className="col-span-12 xl:col-span-7">
                <CardHeader
                  title="Needs your attention"
                  description="Documents in your modules waiting on a decision."
                  actions={
                    <Button size="sm" variant="ghost" trailingIcon={ArrowRightIcon} onClick={() => navigate('/approvals')}>
                      Open inbox
                    </Button>
                  }
                />
                {myApprovals.length === 0 ? (
                  <EmptyState title="Nothing pending" description="You’re all caught up across your modules." />
                ) : (
                  <ul className="divide-y divide-line">
                    {myApprovals.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/approvals/${item.id}`)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-body text-ink">{item.title}</span>
                            <span className="tabular block text-caption text-ink-subtle">
                              {item.reference} · {item.moduleLabel} · {relativeTime(item.submittedAt)}
                            </span>
                          </span>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {/* Recent activity */}
              <Card className="col-span-12 xl:col-span-5">
                <CardHeader title="Recent activity" level={3} />
                <ul className="divide-y divide-line">
                  {RECENT_ACTIVITY.slice(0, 5).map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => navigate(event.path)}
                        className="flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                      >
                        <span className="min-w-0">
                          <span className="block text-body text-ink">
                            <span className="font-medium">{event.actor}</span>{' '}
                            <span className="text-ink-muted">{event.action}</span>
                          </span>
                          <span className="tabular mt-0.5 block text-caption text-ink-subtle">
                            {event.reference} · {relativeTime(event.at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
