import React from 'react';
import {
  CheckIcon,
  ClockIcon,
  FilePlusIcon,
  LandmarkIcon,
  MessageSquareIcon,
  SendIcon,
  XIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import { formatDateTime, initials } from '../../utils/format';
import type { ApprovalStage, TimelineEvent } from '../../types/common';

const OUTCOME: Record<
  TimelineEvent['outcome'],
  {className: string;icon: React.ComponentType<{className?: string;}>;}> =
{
  created: { className: 'bg-neutralsoft text-ink-muted', icon: FilePlusIcon },
  submitted: { className: 'bg-info-soft text-info', icon: SendIcon },
  approved: { className: 'bg-success-soft text-success', icon: CheckIcon },
  rejected: { className: 'bg-danger-soft text-danger', icon: XIcon },
  posted: { className: 'bg-primary-soft text-primary-text', icon: LandmarkIcon },
  note: { className: 'bg-neutralsoft text-ink-muted', icon: MessageSquareIcon },
  pending: { className: 'bg-warning-soft text-warning', icon: ClockIcon }
};

export interface StatusTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

/** Who did what, when, and what they said — the auditor's primary surface. */
export function StatusTimeline({ events, className }: StatusTimelineProps) {
  return (
    <ol className={cn('relative', className)}>
      {events.map((event, i) => {
        const spec = OUTCOME[event.outcome];
        const Icon = spec.icon;
        const last = i === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-line" aria-hidden />}
            <span
              className={cn('z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', spec.className)}
              aria-hidden>
              
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body text-ink">
                <span className="font-medium">{event.actor}</span>{' '}
                <span className="text-ink-muted">{event.action}</span>
              </p>
              <p className="tabular text-caption text-ink-subtle">
                {event.actorRole} · {formatDateTime(event.at)}
              </p>
              {event.comment &&
              <p className="mt-1.5 rounded-control border border-line bg-surface-2 px-2 py-1.5 text-small text-ink">
                  “{event.comment}”
                </p>
              }
            </div>
          </li>);

      })}
    </ol>);

}

export interface ApprovalChainProps {
  stages: ApprovalStage[];
  className?: string;
}

/** The route a document still has to travel, and where it is right now. */
export function ApprovalChain({ stages, className }: ApprovalChainProps) {
  return (
    <ol className={cn('flex flex-col gap-0', className)}>
      {stages.map((stage, i) => {
        const last = i === stages.length - 1;
        const tone =
        stage.state === 'complete' ?
        'border-success bg-success text-white' :
        stage.state === 'current' ?
        'border-primary bg-primary text-white' :
        stage.state === 'rejected' ?
        'border-danger bg-danger text-white' :
        'border-line-strong bg-surface text-ink-subtle';
        return (
          <li key={stage.id} className="relative flex gap-3 pb-3 last:pb-0">
            {!last && <span className="absolute left-[9px] top-5 bottom-0 w-px bg-line" aria-hidden />}
            <span
              className={cn('z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-caption font-semibold', tone)}>
              
              {stage.state === 'complete' ?
              <CheckIcon className="h-3 w-3" strokeWidth={3} /> :
              stage.state === 'rejected' ?
              <XIcon className="h-3 w-3" strokeWidth={3} /> :

              i + 1
              }
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p
                  className={cn(
                    'text-body',
                    stage.state === 'current' ? 'font-semibold text-ink' : 'font-medium text-ink'
                  )}>
                  
                  {stage.label}
                </p>
                {stage.state === 'current' &&
                <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-caption font-medium text-warning">
                    Awaiting decision
                  </span>
                }
                {stage.state === 'skipped' &&
                <span className="text-caption text-ink-subtle">Not required at this value</span>
                }
              </div>
              <p className="text-caption text-ink-subtle">
                {stage.approver} · {stage.approverRole}
                {stage.at && ` · ${formatDateTime(stage.at)}`}
              </p>
              {stage.comment &&
              <p className="mt-1 text-small text-ink-muted">“{stage.comment}”</p>
              }
            </div>
          </li>);

      })}
    </ol>);

}

export function Avatar({ name, className }: {name: string;className?: string;}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-caption font-semibold text-ink-muted',
        className
      )}>
      
      {initials(name)}
    </span>);

}