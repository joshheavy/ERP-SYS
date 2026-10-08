'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, SendIcon, ShoppingCartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../hooks/useNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { ProgressBar } from '../../components/ui/Progress';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { ApprovalChain, StatusTimeline } from '../../components/approval/StatusTimeline';
import { MakerCheckerBanner } from '../../components/approval/Decision';
import { useCan } from '../../contexts/PreferencesContext';
import { REQUISITIONS } from '../../data/procurement';
import { formatDate, formatMoney, relativeTime } from '../../utils/format';

export function RequisitionDetail({ id }: { id: string }) {
  const navigate = useNav();
  const can = useCan();
  const [tab, setTab] = useState('document');
  const req = REQUISITIONS.find((r) => r.id === id);

  if (!req) {
    return (
      <div className="p-5">
        <Card>
          <EmptyState
            title="Requisition not found"
            description="It may have been withdrawn or converted. Return to the list to find the current record."
            action={
              <Button variant="primary" onClick={() => navigate('/procurement/requisitions')}>
                Back to requisitions
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const lineTotal = req.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const remainingAfter = req.budgetAllocated - req.budgetSpent - lineTotal;
  const used = (req.budgetSpent + lineTotal) / req.budgetAllocated;

  return (
    <div>
      <PageHeader
        trail={['Procurement', 'Requisitions', req.reference]}
        title={req.title}
        meta={
          <>
            <span className="tabular">{req.reference}</span>
            <span aria-hidden>·</span>
            <span>{req.department}</span>
            <span aria-hidden>·</span>
            <span>Raised by {req.requester}, {relativeTime(req.raisedOn + 'T09:00:00')}</span>
            <StatusBadge status={req.status} />
          </>
        }
        secondaryActions={
          <Button icon={ArrowLeftIcon} onClick={() => navigate('/procurement/requisitions')}>
            Back
          </Button>
        }
        primaryAction={
          req.status === 'draft' ? (
            <Button
              variant="primary"
              icon={SendIcon}
              disabled={!can.create}
              onClick={() => toast.success(`${req.reference} submitted for approval`, { description: 'Routed to the head of department.' })}
            >
              Submit for approval
            </Button>
          ) : req.status === 'approved' && !req.convertedToPo ? (
            <Button
              variant="primary"
              icon={ShoppingCartIcon}
              disabled={!can.create}
              onClick={() => toast.success('Purchase order created', { description: `${req.reference} converted to a new PO.` })}
            >
              Convert to purchase order
            </Button>
          ) : req.convertedToPo ? (
            <Button icon={ShoppingCartIcon} onClick={() => navigate('/procurement/orders')}>
              View {req.convertedToPo}
            </Button>
          ) : undefined
        }
        tabs={
          <Tabs
            aria-label="Requisition views"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'document', label: 'Document' },
              { id: 'chain', label: 'Approval chain' },
              { id: 'audit', label: 'Audit history' }
            ]}
          />
        }
      />

      <div className="grid grid-cols-12 gap-4 p-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          {tab === 'document' && (
            <>
              {req.raisedByCurrentUser && <MakerCheckerBanner documentReference={req.reference} reason="You raised this requisition. A different approver must decide on it." />}
              <Card>
                <CardHeader title="Justification" />
                <p className="px-4 py-3 text-body text-ink-muted">{req.justification}</p>
              </Card>

              <Card>
                <CardHeader title="Line items" description={`${req.lines.length} lines · budget line ${req.budgetLine}`} />
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-line bg-surface-2">
                        {['Description', 'Category', 'Qty', 'Unit price', 'Line total'].map((h, i) => (
                          <th key={h} className={`px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted ${i > 1 ? 'text-right' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {req.lines.map((line) => (
                        <tr key={line.id} className="border-b border-line">
                          <td className="px-3 py-2 text-body text-ink">{line.description}</td>
                          <td className="px-3 py-2 text-small text-ink-muted">{line.category}</td>
                          <td className="tabular px-3 py-2 text-right text-body text-ink">{line.quantity} {line.unit}</td>
                          <td className="tabular px-3 py-2 text-right text-body text-ink">{formatMoney(line.unitPrice)}</td>
                          <td className="tabular px-3 py-2 text-right text-body text-ink">{formatMoney(line.quantity * line.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-surface-2">
                        <td className="px-3 py-2.5 text-body font-semibold text-ink" colSpan={4}>Total requisition value</td>
                        <td className="tabular px-3 py-2.5 text-right text-body font-semibold text-ink">{formatMoney(lineTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHeader title="Budget impact" description={`${req.budgetLine} · fiscal year 2026`} />
                <div className="space-y-3 px-4 py-4">
                  <ProgressBar
                    label="Committed after this requisition"
                    caption={`${Math.round(used * 100)}% used`}
                    value={req.budgetSpent + lineTotal}
                    max={req.budgetAllocated}
                    tone={used > 0.85 ? 'warning' : 'primary'}
                  />
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Allocated', value: formatMoney(req.budgetAllocated) },
                      { label: 'Spent to date', value: formatMoney(req.budgetSpent) },
                      { label: 'This requisition', value: formatMoney(lineTotal) },
                      { label: 'Remaining after', value: formatMoney(remainingAfter) }
                    ].map((stat) => (
                      <div key={stat.label}>
                        <dt className="text-caption uppercase tracking-wide text-ink-subtle">{stat.label}</dt>
                        <dd className="tabular mt-0.5 text-body font-medium text-ink">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>
            </>
          )}

          {tab === 'chain' && (
            <Card>
              <CardHeader title="Approval chain" description="Threshold-based routing. Stages above the document value are skipped." />
              <div className="px-4 py-4">
                <ApprovalChain stages={req.chain} />
              </div>
            </Card>
          )}

          {tab === 'audit' && (
            <Card>
              <CardHeader title="Audit history" description="Every action on this requisition, in order." />
              <div className="px-4 py-4">
                <StatusTimeline events={req.timeline} />
              </div>
            </Card>
          )}
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-4">
          <Card>
            <CardHeader title="Summary" level={3} />
            <dl className="divide-y divide-line">
              {[
                { label: 'Reference', value: req.reference },
                { label: 'Needed by', value: formatDate(req.neededBy) },
                { label: 'Raised on', value: formatDate(req.raisedOn) },
                { label: 'Value', value: formatMoney(lineTotal) },
                { label: 'Converted PO', value: req.convertedToPo ?? 'Not converted' }
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-small text-ink-muted">{row.label}</dt>
                  <dd className="tabular text-small font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
