'use client';

import React, { useMemo, useState } from 'react';
import { useNav } from '../../hooks/useNav';
import { CheckCheckIcon, ClockIcon, InboxIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { StatTile } from '../../components/ui/StatTile';
import { ApprovalCard } from '../../components/approval/ApprovalCard';
import { MakerCheckerBanner } from '../../components/approval/Decision';
import { useCan, usePreferences } from '../../contexts/PreferencesContext';
import { APPROVAL_QUEUE } from '../../data/approvals';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney } from '../../utils/format';

export function ApprovalInbox() {
  const navigate = useNav();
  const can = useCan();
  const { role } = usePreferences();
  const [tab, setTab] = useState('all');
  const [handled, setHandled] = useState<string[]>([]);

  const open = APPROVAL_QUEUE.filter((item) => !handled.includes(item.id));

  const filtered = useMemo(() => {
    if (tab === 'all') return open;
    if (tab === 'overdue') return open.filter((i) => i.slaHours <= 0);
    if (tab === 'mine') return open.filter((i) => i.raisedByCurrentUser);
    return open.filter((i) => i.module === tab);
  }, [tab, open]);

  const totalValue = open.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const overdue = open.filter((i) => i.slaHours <= 0).length;
  const selfRaised = open.filter((i) => i.raisedByCurrentUser).length;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/approvals'].trail}
        title="My approvals"
        meta={
          <>
            <span className="tabular">{open.length} waiting</span>
            <span aria-hidden>·</span>
            <span className="tabular">{formatMoney(totalValue)} in value</span>
          </>
        }
        secondaryActions={
          <Button
            disabled={!can.approve || filtered.length === 0}
            title={can.approve ? undefined : 'Only the Approver role can approve documents'}
            onClick={() => {
              const ids = filtered.filter((i) => !i.raisedByCurrentUser).map((i) => i.id);
              setHandled((prev) => [...prev, ...ids]);
              toast.success(`${ids.length} documents approved`, {
                description: 'Each decision was written to its own audit trail.'
              });
            }}>

            Approve all in view
          </Button>
        }
        tabs={
          <Tabs
            aria-label="Approval queues"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'all', label: 'All', count: open.length },
              { id: 'overdue', label: 'Past SLA', count: overdue },
              { id: 'procurement', label: 'Procurement', count: open.filter((i) => i.module === 'procurement').length },
              { id: 'hr', label: 'Human Resources', count: open.filter((i) => i.module === 'hr').length },
              { id: 'finance', label: 'Finance', count: open.filter((i) => i.module === 'finance').length },
              { id: 'mine', label: 'Raised by me', count: selfRaised }]
            } />

        } />


      <div className="grid grid-cols-12 gap-4 p-5">
        <div className="col-span-12 xl:col-span-8">
          {selfRaised > 0 && tab === 'mine' &&
            <MakerCheckerBanner
              className="mb-4"
              documentReference="these documents"
              reason="You raised these documents. They stay visible here so you can track their progress, but the approve action is disabled for you." />

          }
          <Card>
            <CardHeader
              title={tab === 'overdue' ? 'Past their SLA' : 'Waiting on a decision'}
              description={
                role === 'manager' ?
                  'Ordered by remaining SLA. Opening a document shows full context beside the decision panel.' :
                  'You can review any document here. Approving requires the Approver role.'
              } />

            {filtered.length === 0 ?
              <EmptyState
                icon={tab === 'overdue' ? ClockIcon : CheckCheckIcon}
                title={tab === 'overdue' ? 'Nothing is past its SLA' : 'Nothing waiting here'}
                description={
                  tab === 'overdue' ?
                    'Every document in your queue still has time on the clock.' :
                    'When a document reaches your stage of an approval chain it will appear in this list.'
                }
                action={
                  handled.length > 0 &&
                  <Button size="sm" onClick={() => setHandled([])}>
                    Restore demo queue
                  </Button>

                } /> :


              <div>
                {[...filtered].
                  sort((a, b) => a.slaHours - b.slaHours).
                  map((item) =>
                    <ApprovalCard
                      key={item.id}
                      item={item}
                      canApprove={can.approve}
                      onOpen={(doc) => navigate(`/approvals/${doc.id}`)}
                      onApprove={(doc) => {
                        setHandled((prev) => [...prev, doc.id]);
                        toast.success(`${doc.reference} approved`);
                      }} />

                  )}
              </div>
            }
          </Card>
        </div>

        <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <StatTile
            emphasis
            label="Past SLA"
            value={String(overdue)}
            footnote={overdue > 0 ? 'Oldest is 2 days over' : 'Queue is within SLA'} />

          <StatTile label="Total value in queue" value={formatMoney(totalValue)} />
          <Card>
            <CardHeader title="How approval works here" level={3} />
            <ul className="space-y-2.5 px-4 py-3 text-small text-ink-muted">
              <li className="flex gap-2">
                <InboxIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
                Documents arrive at your stage only when every earlier stage has approved.
              </li>
              <li className="flex gap-2">
                <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
                The SLA clock starts when the document reaches your stage, not when it was raised.
              </li>
              <li className="flex gap-2">
                <CheckCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
                Rejection always requires a category and a written reason.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>);

}