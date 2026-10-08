'use client';

import React, { useState } from 'react';
import { useNav } from '../hooks/useNav';
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CheckCheckIcon,
  PlayIcon
} from
  'lucide-react';
import { AreaTrend } from '../components/charts/Charts';
import { toast } from 'sonner';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../components/ui/Card';
import { StatTile } from '../components/ui/StatTile';
import { Button } from '../components/ui/Button';
import { ApprovalCard } from '../components/approval/ApprovalCard';
import { ProgressBar } from '../components/ui/Progress';
import { useCan, usePreferences } from '../contexts/PreferencesContext';
import { APPROVAL_QUEUE } from '../data/approvals';
import { IDENTITIES } from '../data/users';
import { PERIOD_STATUS, RECENT_ACTIVITY, SPEND_TREND } from '../data/finance';
import { journalsStore } from '../data/ledger';
import { useCollection } from '../core/store/createCollection';
import { BUDGET_LINE_ROWS } from '../data/registers';
import { formatMoneyCompact, formatPeriod, relativeTime } from '../utils/format';
import { ROUTE_META } from '../data/navigation';

export function Dashboard() {
  const navigate = useNav();
  const can = useCan();
  const { role } = usePreferences();
  const [handled, setHandled] = useState<string[]>([]);
  const queue = APPROVAL_QUEUE.filter((item) => !handled.includes(item.id));

  // Live from the GL posting engine: journals awaiting posting (not posted/cancelled).
  const journals = useCollection(journalsStore);
  const unpostedJournals = journals.filter((j) => j.status !== 'posted' && j.status !== 'cancelled').length;

  const identity = IDENTITIES[role];
  const firstName = identity.name.split(' ')[0];
  // Derived from the fixed demo "now" (see relativeTime), so it never mismatches on hydration.
  const hour = new Date('2026-09-14T17:00:00').getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance'].trail}
        title="Finance overview"
        meta={
          <>
            <span>Period {formatPeriod(PERIOD_STATUS.current)}</span>
            <span aria-hidden>·</span>
            <span>Closes {PERIOD_STATUS.closesOn.slice(8)} Oct 2026</span>
          </>
        }
        primaryAction={
          can.viewPayroll &&
          <Button variant="primary" icon={PlayIcon} onClick={() => navigate('/hr/payroll/run')}>
            Run payroll
          </Button>

        }
        secondaryActions={
          <Button onClick={() => navigate('/finance/reports/trial-balance')}>Trial balance</Button>
        } />


      {/* Personalized greeting — a warm, human entry point to a dense console. */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
        <div>
          <h2 className="text-display text-ink">
            {greeting}, {firstName} <span aria-hidden>👋</span>
          </h2>
          <p className="mt-0.5 text-small text-ink-muted">Here’s what needs your attention today.</p>
        </div>
        <span className="tabular hidden rounded-full border border-line bg-surface px-3 py-1 text-caption text-ink-muted sm:inline-flex">
          {identity.jobTitle} · {formatPeriod(PERIOD_STATUS.current)}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4 p-5">
        {/* The primary panel: what this user has to act on today. */}
        <Card className="col-span-12 xl:col-span-8">
          <CardHeader
            title="Needs your attention"
            description={
              role === 'manager' ?
                'Documents waiting on your decision, most urgent first.' :
                'Documents in your workspace. Approvals require the Approver role.'
            }
            actions={
              <Button size="sm" variant="ghost" trailingIcon={ArrowRightIcon} onClick={() => navigate('/approvals')}>
                Open inbox
              </Button>
            } />

          {queue.length === 0 ?
            <EmptyState
              icon={CheckCheckIcon}
              title="Your queue is clear"
              description="Every document that needed a decision from you has been actioned."
              action={
                <Button size="sm" onClick={() => setHandled([])}>
                  Restore demo queue
                </Button>
              } /> :


            <div>
              {queue.slice(0, 4).map((item) =>
                <ApprovalCard
                  key={item.id}
                  item={item}
                  canApprove={can.approve}
                  onOpen={() => navigate('/approvals')}
                  onApprove={(approved) => {
                    setHandled((prev) => [...prev, approved.id]);
                    toast.success(`${approved.reference} approved`, {
                      description: 'Written to the audit trail and routed onward.'
                    });
                  }} />

              )}
              {queue.length > 4 &&
                <button
                  type="button"
                  onClick={() => navigate('/approvals')}
                  className="w-full border-t border-line px-4 py-2.5 text-left text-small font-medium text-primary-text hover:bg-surface-2">

                  {queue.length - 4} more waiting in your inbox
                </button>
              }
            </div>
          }
        </Card>

        <div className="col-span-12 grid grid-cols-2 gap-4 xl:col-span-4 xl:grid-cols-1">
          <StatTile
            emphasis
            className="col-span-2 xl:col-span-1"
            label="September payroll — net payable"
            value={formatMoneyCompact(357247800)}
            change={{ value: '+1.5%', direction: 'up', caption: 'vs. August', good: false }} />

          <StatTile
            label="Pending approvals"
            value={String(queue.length)}
            footnote="2 past their SLA" />

          <StatTile
            label="Unposted journals"
            value={String(unpostedJournals)}
            footnote="Blocking period close" />

        </div>

        <Card className="col-span-12 xl:col-span-8">
          <CardHeader
            title="Spend trend"
            description="Payroll against operating expenditure, in millions, last six periods." />

          <div className="px-3 py-4">
            <AreaTrend
              data={SPEND_TREND}
              xKey="month"
              format={(v) => `KSh ${v}M`}
              series={[
                { key: 'payroll', label: 'Payroll', colorIndex: 0 },
                { key: 'operating', label: 'Operating', colorIndex: 1 }
              ]}
            />
          </div>
        </Card>

        <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <Card>
            <CardHeader title="Budget utilisation" description="Lines above 85% committed." level={3} />
            <ul className="divide-y divide-line">
              {BUDGET_LINE_ROWS.slice(0, 4).map((line) =>
                <li key={line.id} className="px-4 py-2.5">
                  <ProgressBar
                    label={line.description}
                    caption={`${line.utilisation}%`}
                    value={line.utilisation}
                    max={100}
                    tone={line.utilisation > 85 ? 'danger' : line.utilisation > 70 ? 'warning' : 'primary'} />

                </li>
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Recent activity" level={3} />
            <ul className="divide-y divide-line">
              {RECENT_ACTIVITY.map((event) =>
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => navigate(event.path)}
                    className="flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors duration-fast hover:bg-surface-2">

                    <CalendarClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
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
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>);

}