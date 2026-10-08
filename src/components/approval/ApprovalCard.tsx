'use client';

import React from 'react';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatMoney, relativeTime } from '../../utils/format';
import { Button } from '../ui/Button';
import type { ApprovalItem } from '../../types/common';
import { Avatar } from './StatusTimeline';

export interface ApprovalCardProps {
  item: ApprovalItem;
  onOpen: (item: ApprovalItem) => void;
  onApprove?: (item: ApprovalItem) => void;
  canApprove: boolean;
  className?: string;
}

export function ApprovalCard({ item, onOpen, onApprove, canApprove, className }: ApprovalCardProps) {
  const overdue = item.slaHours <= 0;
  return (
    <article
      className={cn(
        'flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0',
        'transition-colors duration-fast ease-exit hover:bg-surface-2',
        className
      )}>

      <Avatar name={item.requester} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="truncate text-body font-medium text-ink hover:text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

            {item.title}
          </button>
          <span className="tabular text-caption text-ink-subtle">{item.reference}</span>
          {item.priority === 'urgent' &&
            <span className="rounded-full bg-danger-soft px-1.5 py-0.5 text-caption font-medium text-danger">
              Urgent
            </span>
          }
        </div>
        <p className="mt-0.5 truncate text-small text-ink-muted">{item.summary}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-ink-subtle">
          <span>{item.moduleLabel}</span>
          <span aria-hidden>·</span>
          <span>
            {item.requester}, {item.requesterRole}
          </span>
          <span aria-hidden>·</span>
          <span className="tabular">{relativeTime(item.submittedAt)}</span>
          <span aria-hidden>·</span>
          <span className={cn('tabular inline-flex items-center gap-1', overdue ? 'text-danger' : '')}>
            <ClockIcon className="h-3 w-3" aria-hidden />
            {overdue ? 'Past SLA' : `${item.slaHours}h left`}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {item.amount !== undefined &&
          <span className="tabular text-body font-semibold text-ink">{formatMoney(item.amount)}</span>
        }
        <div className="flex items-center gap-1.5">
          {onApprove &&
            <Button
              size="sm"
              disabled={!canApprove || item.raisedByCurrentUser}
              title={
                item.raisedByCurrentUser ?
                  'You raised this document — maker-checker prevents self-approval' :
                  !canApprove ?
                    'Your role cannot approve documents' :
                    undefined
              }
              onClick={() => onApprove(item)}>

              Approve
            </Button>
          }
          <Button size="sm" variant="ghost" trailingIcon={ArrowRightIcon} onClick={() => onOpen(item)}>
            Review
          </Button>
        </div>
      </div>
    </article>);

}