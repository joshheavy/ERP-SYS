import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  /** Right-hand caption, e.g. "812 of 1,248 employees". */
  caption?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const TONES: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

export function ProgressBar({
  value,
  max,
  label,
  caption,
  tone = 'primary',
  size = 'md',
  className
}: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, value / max * 100));
  return (
    <div className={className}>
      {(label || caption) &&
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && <span className="text-small font-medium text-ink">{label}</span>}
          {caption && <span className="tabular text-small text-ink-muted">{caption}</span>}
        </div>
      }
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={cn('w-full overflow-hidden rounded-full bg-surface-3', size === 'sm' ? 'h-1' : 'h-1.5')}>
        
        <div
          className={cn('h-full rounded-full transition-[width] duration-200 ease-exit', TONES[tone])}
          style={{ width: `${pct}%` }} />
        
      </div>
    </div>);

}