import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbProps {
  trail: string[];
  className?: string;
}

export function Breadcrumb({ trail, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-caption text-ink-subtle">
        {trail.map((crumb, i) =>
        <li key={`${crumb}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRightIcon className="h-3 w-3" aria-hidden />}
            <span className={i === trail.length - 1 ? 'text-ink-muted' : undefined}>{crumb}</span>
          </li>
        )}
      </ol>
    </nav>);

}

export interface PageHeaderProps {
  trail: string[];
  title: string;
  /** Short facts about the record or list — count, period, owner. */
  meta?: React.ReactNode;
  /** Exactly one primary action per page. */
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  trail,
  title,
  meta,
  primaryAction,
  secondaryActions,
  tabs,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-line bg-surface px-5 pt-3', className)}>
      <Breadcrumb trail={trail} />
      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink">{title}</h1>
          {meta && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-ink-muted">{meta}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>
      {tabs && <div className="-mb-px">{tabs}</div>}
    </div>);

}