'use client';

import React from 'react';
import { LockIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const BASE =
  'w-full rounded-control border bg-surface text-ink placeholder:text-ink-subtle ' +
  'transition-[border-color,box-shadow] duration-fast ease-exit ' +
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 ' +
  'disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  numeric?: boolean;
  icon?: React.ComponentType<{ className?: string; }>;
  suffix?: React.ReactNode;
  /** Read-only because of permissions, not because of form state. */
  noPermission?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, numeric, icon: Icon, suffix, noPermission, className, disabled, ...rest },
  ref) {
  return (
    <div className="relative">
      {Icon &&
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      }
      <input
        ref={ref}
        disabled={disabled || noPermission}
        aria-invalid={invalid || undefined}
        className={cn(
          BASE,
          'h-8 text-body',
          Icon ? 'pl-8 pr-2.5' : 'px-2.5',
          suffix ? 'pr-14' : undefined,
          numeric && 'tabular text-right',
          invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-line-strong',
          className
        )}
        {...rest} />

      {suffix &&
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-ink-subtle">
          {suffix}
        </span>
      }
      {noPermission &&
        <LockIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
      }
    </div>);

});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 3, ...rest },
  ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        BASE,
        'px-2.5 py-2 text-body leading-5 resize-y',
        invalid ? 'border-danger focus:border-danger focus:ring-danger/25' : 'border-line-strong',
        className
      )}
      {...rest} />);


});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options: { value: string; label: string; disabled?: boolean; }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, options, className, ...rest },
  ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        BASE,
        'h-8 appearance-none bg-[length:14px] bg-[right_0.5rem_center] bg-no-repeat pl-2.5 pr-7 text-body',
        "bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b97a8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        invalid ? 'border-danger' : 'border-line-strong',
        className
      )}
      {...rest}>

      {options.map((opt) =>
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      )}
    </select>);

});