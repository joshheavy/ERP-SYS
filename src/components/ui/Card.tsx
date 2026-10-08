import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={cn('rounded-surface border border-line bg-surface', className)}>{children}</Tag>);

}

export interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Heading level so page hierarchy stays correct. */
  level?: 2 | 3;
  className?: string;
}

export function CardHeader({ title, description, actions, level = 2, className }: CardHeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-line px-4 py-3',
        className
      )}>
      
      <div className="min-w-0">
        <Heading className="text-h3 text-ink">{title}</Heading>
        {description && <p className="mt-0.5 text-small text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>);

}

export function Skeleton({ className }: {className?: string;}) {
  return <div className={cn('animate-shimmer rounded-[4px] bg-surface-3', className)} />;
}

export interface EmptyStateProps {
  icon?: React.ComponentType<{className?: string;}>;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: 'neutral' | 'error' | 'locked';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  className
}: EmptyStateProps) {
  const toneRing =
  tone === 'error' ?
  'bg-danger-soft text-danger' :
  tone === 'locked' ?
  'bg-warning-soft text-warning' :
  'bg-surface-3 text-ink-subtle';
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {Icon &&
      <span className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-full', toneRing)}>
          <Icon className="h-4 w-4" />
        </span>
      }
      <p className="text-h3 text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-small text-ink-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>);

}