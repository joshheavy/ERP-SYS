'use client';

import React, { useState } from 'react';
import { CheckIcon, InfoIcon, ShieldAlertIcon, UserCheckIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Select } from '../ui/Input';

export interface MakerCheckerBannerProps {
  documentReference: string;
  /** Why this user cannot act — stated, never hidden. */
  reason?: string;
  className?: string;
}

export function MakerCheckerBanner({ documentReference, reason, className }: MakerCheckerBannerProps) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-control border border-warning/35 bg-warning-soft px-3 py-2.5',
        className
      )}>

      <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div className="min-w-0 text-small">
        <p className="font-semibold text-ink">Maker-checker applies to this document</p>
        <p className="mt-0.5 text-ink-muted">
          {reason ??
            `You raised ${documentReference}, so you cannot approve it. The approval action stays visible but disabled until a different authorised approver acts.`}
        </p>
      </div>
    </div>);

}

export interface RejectWithReasonProps {
  onCancel: () => void;
  onReject: (payload: { category: string; reason: string; }) => void;
  className?: string;
}

const REJECTION_CATEGORIES = [
  { value: 'budget', label: 'Budget line exhausted or incorrect' },
  { value: 'documentation', label: 'Supporting documentation missing' },
  { value: 'policy', label: 'Breaches procurement or HR policy' },
  { value: 'pricing', label: 'Pricing not competitive' },
  { value: 'other', label: 'Other — explained below' }];


/** The reject button stays disabled until a category and a written reason exist. */
export function RejectWithReason({ onCancel, onReject, className }: RejectWithReasonProps) {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const tooShort = reason.trim().length < 15;

  return (
    <div className={cn('rounded-control border border-danger/35 bg-danger-soft p-3', className)}>
      <p className="text-h4 text-ink">Reject and return to requester</p>
      <p className="mt-0.5 text-small text-ink-muted">
        The reason is written to the audit trail and shown to the requester.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-small font-medium text-ink">Rejection category</span>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: '', label: 'Select a category' }, ...REJECTION_CATEGORIES]} />

      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-small font-medium text-ink">Reason</span>
        <Textarea
          value={reason}
          rows={3}
          placeholder="Explain what must change before this can be resubmitted."
          onChange={(e) => setReason(e.target.value)} />

        <span
          className={cn('mt-1 block text-caption', tooShort ? 'text-ink-subtle' : 'text-success')}>

          {tooShort ? `At least 15 characters — ${reason.trim().length} so far.` : 'Reason accepted.'}
        </span>
      </label>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="danger"
          icon={XIcon}
          disabled={!category || tooShort}
          onClick={() => onReject({ category, reason })}>

          Reject document
        </Button>
      </div>
    </div>);

}

export interface DecisionPanelProps {
  documentReference: string;
  canApprove: boolean;
  blockedReason?: string;
  onApprove: (comment: string) => void;
  onReject: (payload: { category: string; reason: string; }) => void;
  onDelegate?: () => void;
  /** Facts the approver needs in front of them to decide. */
  context: { label: string; value: React.ReactNode; tone?: 'danger' | 'warning' | 'success'; }[];
  className?: string;
}

export function DecisionPanel({
  documentReference,
  canApprove,
  blockedReason,
  onApprove,
  onReject,
  onDelegate,
  context,
  className
}: DecisionPanelProps) {
  const [comment, setComment] = useState('');
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className={cn('rounded-surface border border-line bg-surface', className)}>
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-h3 text-ink">Your decision</h2>
        <p className="tabular mt-0.5 text-small text-ink-muted">{documentReference}</p>
      </div>

      <dl className="divide-y divide-line">
        {context.map((item) =>
          <div key={item.label} className="flex items-baseline justify-between gap-3 px-4 py-2">
            <dt className="text-small text-ink-muted">{item.label}</dt>
            <dd
              className={cn(
                'tabular text-right text-body font-medium',
                item.tone === 'danger' ?
                  'text-danger' :
                  item.tone === 'warning' ?
                    'text-warning' :
                    item.tone === 'success' ?
                      'text-success' :
                      'text-ink'
              )}>

              {item.value}
            </dd>
          </div>
        )}
      </dl>

      <div className="border-t border-line p-4">
        {!canApprove && blockedReason &&
          <MakerCheckerBanner className="mb-3" documentReference={documentReference} reason={blockedReason} />
        }

        {rejecting ?
          <RejectWithReason onCancel={() => setRejecting(false)} onReject={onReject} /> :

          <>
            <label className="block">
              <span className="mb-1 block text-small font-medium text-ink">
                Comment <span className="font-normal text-ink-subtle">(optional on approval)</span>
              </span>
              <Textarea
                value={comment}
                rows={2}
                placeholder="Add context for the next approver."
                onChange={(e) => setComment(e.target.value)} />

            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="primary"
                icon={CheckIcon}
                className="flex-1"
                disabled={!canApprove}
                title={canApprove ? undefined : blockedReason}
                onClick={() => onApprove(comment)}>

                Approve
              </Button>
              <Button variant="danger" icon={XIcon} className="flex-1" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </div>
            {onDelegate &&
              <Button className="mt-2 w-full" icon={UserCheckIcon} onClick={onDelegate}>
                Delegate to another approver
              </Button>
            }
            <p className="mt-3 flex items-start gap-1.5 text-caption text-ink-subtle">
              <InfoIcon className="mt-px h-3 w-3 shrink-0" aria-hidden />
              Every decision is written to the audit trail with your name, role and timestamp.
            </p>
          </>
        }
      </div>
    </div>);

}