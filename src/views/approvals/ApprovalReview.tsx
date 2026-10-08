'use client';

import React, { useState } from 'react';
import { useNav } from '../../hooks/useNav';
import { ArrowLeftIcon, PaperclipIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { ApprovalChain, StatusTimeline } from '../../components/approval/StatusTimeline';
import { DecisionPanel } from '../../components/approval/Decision';
import { ProgressBar } from '../../components/ui/Progress';
import { useCan } from '../../contexts/PreferencesContext';
import { APPROVAL_QUEUE } from '../../data/approvals';
import { REQUISITIONS } from '../../data/procurement';
import { formatDate, formatMoney, relativeTime } from '../../utils/format';

export function ApprovalReview({ id }: { id: string }) {
  const navigate = useNav();
  const can = useCan();
  const [tab, setTab] = useState('document');
  const item = APPROVAL_QUEUE.find((i) => i.id === id);
  const requisition = item ? REQUISITIONS.find((r) => r.reference === item.reference) : undefined;

  if (!item) {
    return (
      <div className="p-5">
        <Card>
          <EmptyState
            title="This document is no longer in your queue"
            description="It was actioned by another approver or withdrawn by the requester."
            action={
              <Button variant="primary" onClick={() => navigate('/approvals')}>
                Back to my approvals
              </Button>
            } />

        </Card>
      </div>);

  }

  const lineTotal = requisition ?
    requisition.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) :
    item.amount ?? 0;
  const budgetRemaining = requisition ?
    requisition.budgetAllocated - requisition.budgetSpent - lineTotal :
    undefined;

  const decide = (outcome: 'approved' | 'rejected', detail?: string) => {
    toast.success(`${item.reference} ${outcome}`, { description: detail });
    navigate('/approvals');
  };

  return (
    <div>
      <PageHeader
        trail={['Workspace', 'My approvals', item.reference]}
        title={item.title}
        meta={
          <>
            <span className="tabular">{item.reference}</span>
            <span aria-hidden>·</span>
            <span>
              {item.documentType} · {item.moduleLabel}
            </span>
            <span aria-hidden>·</span>
            <span>
              Raised by {item.requester}, {relativeTime(item.submittedAt)}
            </span>
            <StatusBadge status="pending" label={`Stage ${requisition ? 3 : 1} · awaiting you`} />
          </>
        }
        secondaryActions={
          <Button icon={ArrowLeftIcon} onClick={() => navigate('/approvals')}>
            Back to inbox
          </Button>
        }
        tabs={
          <Tabs
            aria-label="Document views"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'document', label: 'Document' },
              { id: 'chain', label: 'Approval chain' },
              { id: 'audit', label: 'Audit history' }]
            } />

        } />


      <div className="grid grid-cols-12 gap-4 p-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          {tab === 'document' &&
            <>
              <Card>
                <CardHeader title="Justification" />
                <p className="px-4 py-3 text-body text-ink-muted">
                  {requisition?.justification ?? item.summary}
                </p>
              </Card>

              {requisition &&
                <Card>
                  <CardHeader
                    title="Line items"
                    description={`${requisition.lines.length} lines · budget line ${requisition.budgetLine}`} />

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-line bg-surface-2">
                          <th className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                            Description
                          </th>
                          <th className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                            Category
                          </th>
                          <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">
                            Unit price
                          </th>
                          <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">
                            Line total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {requisition.lines.map((line) =>
                          <tr key={line.id} className="border-b border-line">
                            <td className="px-3 py-2 text-body text-ink">{line.description}</td>
                            <td className="px-3 py-2 text-small text-ink-muted">{line.category}</td>
                            <td className="tabular px-3 py-2 text-right text-body text-ink">
                              {line.quantity} {line.unit}
                            </td>
                            <td className="tabular px-3 py-2 text-right text-body text-ink">
                              {formatMoney(line.unitPrice)}
                            </td>
                            <td className="tabular px-3 py-2 text-right text-body text-ink">
                              {formatMoney(line.quantity * line.unitPrice)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-surface-2">
                          <td className="px-3 py-2.5 text-body font-semibold text-ink" colSpan={4}>
                            Total requisition value
                          </td>
                          <td className="tabular px-3 py-2.5 text-right text-body font-semibold text-ink">
                            {formatMoney(lineTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              }

              {requisition &&
                <Card>
                  <CardHeader title="Budget impact" description={`${requisition.budgetLine} · fiscal year 2026`} />
                  <div className="space-y-3 px-4 py-4">
                    <ProgressBar
                      label="Allocated versus committed after this document"
                      caption={`${Math.round((requisition.budgetSpent + lineTotal) / requisition.budgetAllocated * 100)}% used`}
                      value={requisition.budgetSpent + lineTotal}
                      max={requisition.budgetAllocated}
                      tone={
                        (requisition.budgetSpent + lineTotal) / requisition.budgetAllocated > 0.85 ?
                          'warning' :
                          'primary'
                      } />

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: 'Allocated', value: formatMoney(requisition.budgetAllocated) },
                        { label: 'Spent to date', value: formatMoney(requisition.budgetSpent) },
                        { label: 'This document', value: formatMoney(lineTotal) },
                        { label: 'Remaining after', value: formatMoney(budgetRemaining ?? 0) }].
                        map((stat) =>
                          <div key={stat.label}>
                            <dt className="text-caption uppercase tracking-wide text-ink-subtle">{stat.label}</dt>
                            <dd className="tabular mt-0.5 text-body font-medium text-ink">{stat.value}</dd>
                          </div>
                        )}
                    </dl>
                  </div>
                </Card>
              }

              <Card>
                <CardHeader title="Attachments" />
                <ul className="divide-y divide-line">
                  {['Quotation — Nairobi Systems.pdf', 'Quotation — Savannah Office Supplies.pdf', 'Technical specification.pdf'].map(
                    (file) =>
                      <li key={file} className="flex items-center gap-2.5 px-4 py-2.5">
                        <PaperclipIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-body text-ink">{file}</span>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </li>

                  )}
                </ul>
              </Card>
            </>
          }

          {tab === 'chain' &&
            <Card>
              <CardHeader
                title="Approval chain"
                description="Threshold-based routing. Stages above the document value are skipped." />

              <div className="px-4 py-4">
                <ApprovalChain
                  stages={
                    requisition?.chain ?? [
                      {
                        id: 's1',
                        label: 'Head of Finance',
                        approver: 'David Kimani',
                        approverRole: 'Head of Finance',
                        state: 'current'
                      }]

                  } />

              </div>
            </Card>
          }

          {tab === 'audit' &&
            <Card>
              <CardHeader title="Audit history" description="Every action on this document, in order." />
              <div className="px-4 py-4">
                <StatusTimeline
                  events={
                    requisition?.timeline ?? [
                      {
                        id: 'g1',
                        actor: item.requester,
                        actorRole: item.requesterRole,
                        action: 'submitted the document for approval',
                        at: item.submittedAt,
                        outcome: 'submitted'
                      }]

                  } />

              </div>
            </Card>
          }
        </div>

        <div className="col-span-12 xl:col-span-4">
          <DecisionPanel
            className="xl:sticky xl:top-4"
            documentReference={item.reference}
            canApprove={can.approve && !item.raisedByCurrentUser}
            blockedReason={
              item.raisedByCurrentUser ?
                `You raised ${item.reference}, so maker-checker prevents you from approving it. A different authorised approver must act.` :
                !can.approve ?
                  'Your current role can review this document but cannot approve it. Switch to the Approver role to decide.' :
                  undefined
            }
            context={[
              { label: 'Document value', value: formatMoney(lineTotal) },
              { label: 'Requester', value: item.requester },
              { label: 'Needed by', value: requisition ? formatDate(requisition.neededBy) : '—' },
              {
                label: 'SLA remaining',
                value: item.slaHours <= 0 ? 'Past SLA' : `${item.slaHours} hours`,
                tone: item.slaHours <= 0 ? 'danger' : item.slaHours < 8 ? 'warning' : undefined
              },
              ...(budgetRemaining !== undefined ?
                [
                  {
                    label: 'Budget left after',
                    value: formatMoney(budgetRemaining),
                    tone: budgetRemaining < 0 ? 'danger' as const : undefined
                  }] :

                [])]
            }
            onApprove={(comment) => decide('approved', comment || 'Routed to the next stage.')}
            onReject={({ category, reason }) => decide('rejected', `${category}: ${reason}`)}
            onDelegate={() =>
              toast.info('Delegation', {
                description: 'Delegated authority is managed from the profile menu in the top bar.'
              })
            } />

        </div>
      </div>
    </div>);

}