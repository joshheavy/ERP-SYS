import React from 'react';
import {
  BanIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileEditIcon,
  LandmarkIcon,
  SendIcon,
  XCircleIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import type { DocumentStatus } from '../../types/common';

interface BadgeSpec {
  label: string;
  className: string;
  icon: React.ComponentType<{className?: string;}>;
}

const SPECS: Record<DocumentStatus, BadgeSpec> = {
  draft: { label: 'Draft', className: 'bg-neutralsoft text-ink-muted', icon: FileEditIcon },
  submitted: { label: 'Submitted', className: 'bg-info-soft text-info', icon: SendIcon },
  pending: { label: 'Pending approval', className: 'bg-warning-soft text-warning', icon: ClockIcon },
  approved: { label: 'Approved', className: 'bg-success-soft text-success', icon: CheckCircle2Icon },
  rejected: { label: 'Rejected', className: 'bg-danger-soft text-danger', icon: XCircleIcon },
  posted: { label: 'Posted', className: 'bg-primary-soft text-primary-text', icon: LandmarkIcon },
  cancelled: { label: 'Cancelled', className: 'bg-neutralsoft text-ink-subtle', icon: BanIcon }
};

export interface StatusBadgeProps {
  status: DocumentStatus;
  /** Overrides the default label, e.g. "Pending HR". */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Status is never carried by color alone — the icon and word always travel with it. */
export function StatusBadge({ status, label, size = 'sm', className }: StatusBadgeProps) {
  const spec = SPECS[status];
  const Icon = spec.icon;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-caption' : 'px-2 py-1 text-small',
        spec.className,
        className
      )}>
      
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {label ?? spec.label}
    </span>);

}