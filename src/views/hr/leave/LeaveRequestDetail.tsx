'use client';

import React from 'react';
import { ArrowLeftIcon, CalendarClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../../hooks/useNav';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/approval/StatusBadge';
import { StatusTimeline } from '../../../components/approval/StatusTimeline';
import { DecisionPanel, MakerCheckerBanner } from '../../../components/approval/Decision';
import { useCan } from '../../../contexts/PreferencesContext';
import { LEAVE_BALANCES, LEAVE_REQUESTS } from '../../../data/leave';
import { formatDate, relativeTime } from '../../../utils/format';

export function LeaveRequestDetail({ id }: { id: string }) {
  const navigate = useNav();
  const can = useCan();
  const req = LEAVE_REQUESTS.find((r) => r.id === id);

  if (!req) {
    return (
      <div className="p-5">
        <Card>
          <EmptyState
            title="Leave request not found"
            description="It may have been withdrawn or already actioned."
            action={
              <Button variant="primary" onClick={() => navigate('/hr/leave/requests')}>
                Back to leave requests
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const balance = LEAVE_BALANCES.find((b) => b.type === req.type);
  const decided = req.status !== 'pending';
  const stageLabel = req.stage === 'supervisor' ? 'Supervisor approval' : req.stage === 'hr' ? 'HR approval' : '';

  const decide = (outcome: 'approved' | 'rejected', detail?: string) => {
    toast.success(`${req.reference} ${outcome}`, { description: detail });
    navigate('/hr/leave/requests');
  };

  return (
    <div>
      <PageHeader
        trail={['Human Resources', 'Leave', req.reference]}
        title={`${req.typeLabel} — ${req.employee}`}
        meta={
          <>
            <span className="tabular">{req.reference}</span>
            <span aria-hidden>·</span>
            <span>{req.department}</span>
            <span aria-hidden>·</span>
            <span>Submitted {relativeTime(req.submittedAt)}</span>
            <StatusBadge status={req.status} />
          </>
        }
        secondaryActions={
          <Button icon={ArrowLeftIcon} onClick={() => navigate('/hr/leave/requests')}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-12 gap-4 p-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          {req.raisedByCurrentUser && <MakerCheckerBanner documentReference={req.reference} reason="You submitted this request, so you cannot approve it yourself." />}

          <Card>
            <CardHeader title="Request" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-3">
              {[
                { label: 'Leave type', value: req.typeLabel },
                { label: 'From', value: formatDate(req.startDate) },
                { label: 'To', value: formatDate(req.endDate) },
                { label: 'Working days', value: `${req.days} days` },
                { label: 'Reliever', value: req.reliever },
                { label: 'Stage', value: stageLabel || (decided ? 'Complete' : '—') }
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{row.label}</dt>
                  <dd className="mt-0.5 text-body font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line px-4 py-3">
              <p className="text-caption uppercase tracking-wide text-ink-subtle">Reason</p>
              <p className="mt-1 text-body text-ink-muted">{req.reason}</p>
            </div>
          </Card>

          {balance && (
            <Card>
              <CardHeader title="Entitlement check" description={`${req.typeLabel} balance for ${req.employee}`} />
              <dl className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4">
                {[
                  { label: 'Entitlement', value: `${balance.entitlement} days` },
                  { label: 'Taken', value: `${balance.taken} days` },
                  { label: 'This request', value: `${req.days} days` },
                  { label: 'Remaining after', value: `${balance.entitlement - balance.taken - req.days} days` }
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="text-caption uppercase tracking-wide text-ink-subtle">{s.label}</dt>
                    <dd className="tabular mt-0.5 text-body font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card>
            <CardHeader title="History" />
            <div className="px-4 py-4">
              <StatusTimeline events={req.timeline} />
            </div>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-4">
          {decided ? (
            <Card>
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <CalendarClockIcon className="h-8 w-8 text-ink-subtle" aria-hidden />
                <p className="text-body font-medium text-ink">This request is {req.status}</p>
                <p className="text-small text-ink-muted">No further decision is required. See the history for the full trail.</p>
              </div>
            </Card>
          ) : (
            <DecisionPanel
              className="xl:sticky xl:top-4"
              documentReference={req.reference}
              canApprove={can.approve && !req.raisedByCurrentUser}
              blockedReason={
                req.raisedByCurrentUser
                  ? `You submitted ${req.reference}, so maker-checker prevents you from approving it.`
                  : !can.approve
                  ? 'Your current role can review this request but cannot approve it. Switch to the Approver role to decide.'
                  : undefined
              }
              context={[
                { label: 'Leave type', value: req.typeLabel },
                { label: 'Duration', value: `${req.days} days` },
                { label: 'Reliever', value: req.reliever },
                {
                  label: 'Remaining after',
                  value: balance ? `${balance.entitlement - balance.taken - req.days} days` : '—',
                  tone: balance && balance.entitlement - balance.taken - req.days < 0 ? 'danger' : undefined
                }
              ]}
              onApprove={(comment) => decide('approved', comment || (req.stage === 'supervisor' ? 'Approved — routed to HR.' : 'Approved and published to the team calendar.'))}
              onReject={({ category, reason }) => decide('rejected', `${category}: ${reason}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
