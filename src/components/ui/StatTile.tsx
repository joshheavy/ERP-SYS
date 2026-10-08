import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Card';

export interface StatTileProps {
  label: string;
  value: string;
  /** Signed change vs. the comparison period, already formatted. */
  change?: { value: string; direction: 'up' | 'down' | 'flat'; caption: string; good?: boolean; };
  footnote?: string;
  /** Emphasis promotes one tile above its siblings — use for the figure the page is about. */
  emphasis?: boolean;
  loading?: boolean;
  className?: string;
}

export function StatTile({
  label,
  value,
  change,
  footnote,
  emphasis = false,
  loading = false,
  className
}: StatTileProps) {
  if (loading) {
    return (
      <div className={cn('rounded-surface border border-line bg-surface p-4', className)}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-32" />
        <Skeleton className="mt-3 h-3 w-20" />
      </div>);

  }

  const ChangeIcon =
    change?.direction === 'up' ? ArrowUpRightIcon : change?.direction === 'down' ? ArrowDownRightIcon : MinusIcon;
  const changeTone =
    change === undefined ?
      '' :
      change.good === undefined ?
        'text-ink-muted' :
        change.good ?
          'text-success' :
          'text-danger';

  return (
    <div
      className={cn(
        'rounded-surface border p-4',
        // The emphasis tile carries the brand: a soft primary wash + left accent
        // bar, so the figure the page is about reads at a glance in every module.
        emphasis
          ? 'relative overflow-hidden border-primary/25 bg-primary-soft/60'
          : 'border-line bg-surface',
        className
      )}>

      {emphasis && <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />}
      <p className={cn('text-caption font-medium uppercase tracking-wide', emphasis ? 'text-primary-text/80' : 'text-ink-subtle')}>{label}</p>
      <p className={cn('tabular mt-2', emphasis ? 'text-display text-primary-text' : 'text-h1 text-ink')}>{value}</p>
      {change &&
        <p className={cn('mt-2 flex items-center gap-1 text-small', changeTone)}>
          <ChangeIcon className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular font-medium">{change.value}</span>
          <span className="text-ink-subtle">{change.caption}</span>
        </p>
      }
      {footnote && !change && <p className={cn('mt-2 text-small', emphasis ? 'text-primary-text/70' : 'text-ink-subtle')}>{footnote}</p>}
    </div>);

}