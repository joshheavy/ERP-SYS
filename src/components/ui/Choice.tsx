'use client';

import React from 'react';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  description,
  disabled,
  className,
  ...aria
}: CheckboxProps) {
  const box =
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
        'transition-[background-color,border-color] duration-fast ease-exit',
        checked || indeterminate ?
          'border-primary bg-primary text-white' :
          'border-line-strong bg-surface',
        disabled && 'opacity-45'
      )}>

      {indeterminate ?
        <MinusIcon className="h-3 w-3" strokeWidth={3} /> :
        checked ?
          <CheckIcon className="h-3 w-3" strokeWidth={3} /> :
          null}
    </span>;


  return (
    <label
      className={cn(
        'group inline-flex items-start gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className
      )}>

      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-label={aria['aria-label'] ?? label}
        onChange={(e) => onChange(e.target.checked)} />

      <span className="mt-0.5 rounded-[5px] peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
        {box}
      </span>
      {(label || description) &&
        <span className="min-w-0">
          {label && <span className="block text-body text-ink">{label}</span>}
          {description && <span className="block text-small text-ink-muted">{description}</span>}
        </span>
      }
    </label>);

}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string; disabled?: boolean; }[];
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical'
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn('flex', orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-x-5 gap-y-2')}>

      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'inline-flex items-start gap-2',
              opt.disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
            )}>

            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={active}
              disabled={opt.disabled}
              onChange={() => onChange(opt.value)} />

            <span className="mt-0.5 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-fast ease-exit',
                  active ? 'border-primary' : 'border-line-strong bg-surface'
                )}>

                {active && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-body text-ink">{opt.label}</span>
              {opt.description &&
                <span className="block text-small text-ink-muted">{opt.description}</span>
              }
            </span>
          </label>);

      })}
    </div>);

}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Toggle({ checked, onChange, label, disabled, ...aria }: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={aria['aria-label'] ?? label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-8 shrink-0 rounded-full border transition-colors duration-fast ease-exit',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          checked ? 'border-primary bg-primary' : 'border-line-strong bg-surface-3'
        )}
        style={{ height: 18 }}>

        <span
          className={cn(
            'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-sm',
            'transition-[left] duration-fast ease-exit'
          )}
          style={{ left: checked ? 15 : 1 }} />

      </button>
      {label && <span className="text-body text-ink">{label}</span>}
    </label>);

}