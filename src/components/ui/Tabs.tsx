'use client';

import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  'aria-label': string;
}

export function Tabs({ items, value, onChange, className, ...aria }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={aria['aria-label']}
      className={cn('flex items-end gap-4 border-b border-line', className)}>

      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative -mb-px flex items-center gap-1.5 border-b-2 px-0.5 pb-2 pt-1 text-body font-medium',
              'transition-colors duration-fast ease-exit',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              'disabled:cursor-not-allowed disabled:opacity-45',
              active ?
                'border-primary text-ink' :
                'border-transparent text-ink-muted hover:border-line-strong hover:text-ink'
            )}>

            {item.label}
            {item.count !== undefined &&
              <span
                className={cn(
                  'tabular rounded-full px-1.5 py-0.5 text-caption font-medium',
                  active ? 'bg-primary-soft text-primary-text' : 'bg-surface-3 text-ink-muted'
                )}>

                {item.count}
              </span>
            }
          </button>);

      })}
    </div>);

}

export interface SegmentedProps {
  items: { id: string; label: string; icon?: React.ComponentType<{ className?: string; }>; }[];
  value: string;
  onChange: (id: string) => void;
  'aria-label': string;
  className?: string;
}

export function Segmented({ items, value, onChange, className, ...aria }: SegmentedProps) {
  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      className={cn('inline-flex rounded-control border border-line-strong bg-surface p-0.5', className)}>

      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex h-6 items-center gap-1.5 rounded-[4px] px-2 text-small font-medium',
              'transition-colors duration-fast ease-exit',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:text-ink'
            )}>

            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
            {item.label}
          </button>);

      })}
    </div>);

}