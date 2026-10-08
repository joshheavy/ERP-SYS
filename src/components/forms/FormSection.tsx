'use client';

import React from 'react';
import { AlertCircleIcon, LockIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export interface FormSectionProps {
  title: string;
  description?: string;
  /** Right-hand side content of the section header. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Heading + description on the left, fields on the right. */
export function FormSection({ title, description, aside, children, className }: FormSectionProps) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-4 border-b border-line px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(180px,240px)_1fr]',
        className
      )}>

      <div className="min-w-0">
        <h2 className="text-h3 text-ink">{title}</h2>
        {description && <p className="mt-1 text-small text-ink-muted">{description}</p>}
        {aside && <div className="mt-3">{aside}</div>}
      </div>
      <div className="grid grid-cols-12 gap-x-4 gap-y-4">{children}</div>
    </section>);

}

export interface FieldProps {
  label: string;
  htmlFor?: string;
  /** Column span on the 12-column field grid, so fields are sized to their content. */
  span?: 3 | 4 | 5 | 6 | 8 | 9 | 12;
  required?: boolean;
  hint?: string;
  error?: string;
  noPermission?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SPANS: Record<number, string> = {
  3: 'col-span-12 sm:col-span-3',
  4: 'col-span-12 sm:col-span-4',
  5: 'col-span-12 sm:col-span-5',
  6: 'col-span-12 sm:col-span-6',
  8: 'col-span-12 sm:col-span-8',
  9: 'col-span-12 sm:col-span-9',
  12: 'col-span-12'
};

export function Field({
  label,
  htmlFor,
  span = 6,
  required,
  hint,
  error,
  noPermission,
  children,
  className
}: FieldProps) {
  return (
    <div className={cn(SPANS[span], className)}>
      <label htmlFor={htmlFor} className="mb-1 flex items-center gap-1.5 text-small font-medium text-ink">
        {label}
        {required &&
          <span className="text-danger" aria-hidden>
            *
          </span>
        }
        {noPermission && <LockIcon className="h-3 w-3 text-ink-subtle" aria-label="Read only for your role" />}
      </label>
      {children}
      {error ?
        <p className="mt-1 flex items-start gap-1 text-caption text-danger">
          <AlertCircleIcon className="mt-px h-3 w-3 shrink-0" aria-hidden />
          {error}
        </p> :

        hint && <p className="mt-1 text-caption text-ink-subtle">{hint}</p>
      }
    </div>);

}

export interface ValidationSummaryProps {
  errors: { field: string; message: string; }[];
}

export function ValidationSummary({ errors }: ValidationSummaryProps) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      className="mx-5 mt-5 rounded-control border border-danger/40 bg-danger-soft px-3 py-2.5">

      <p className="flex items-center gap-1.5 text-h4 text-danger">
        <AlertCircleIcon className="h-4 w-4" aria-hidden />
        {errors.length} {errors.length === 1 ? 'field needs' : 'fields need'} attention
      </p>
      <ul className="mt-1.5 space-y-0.5 pl-5">
        {errors.map((err) =>
          <li key={err.field} className="list-disc text-small text-ink">
            <span className="font-medium">{err.field}</span> — {err.message}
          </li>
        )}
      </ul>
    </div>);

}

export interface FormActionsProps {
  primaryLabel: string;
  onPrimary: () => void;
  onCancel?: () => void;
  secondary?: React.ReactNode;
  /** Warns before leaving with unsaved edits. */
  dirty?: boolean;
  loading?: boolean;
  disabledReason?: string;
}

export function FormActions({
  primaryLabel,
  onPrimary,
  onCancel,
  secondary,
  dirty,
  loading,
  disabledReason
}: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur">
      {dirty &&
        <p className="mr-auto flex items-center gap-1.5 text-small text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
          Unsaved changes
        </p>
      }
      {!dirty && <span className="mr-auto" />}
      {secondary}
      {onCancel &&
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      }
      <Button
        variant="primary"
        onClick={onPrimary}
        loading={loading}
        disabled={Boolean(disabledReason)}
        title={disabledReason}>

        {primaryLabel}
      </Button>
    </div>);

}