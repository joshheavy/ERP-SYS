'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
  meta?: string;
}

export interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  maxVisibleChips?: number;
  className?: string;
}

export function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  label,
  disabled,
  maxVisibleChips = 2,
  className
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.meta?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const selected = options.filter((o) => value.includes(o.value));
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-8 w-full items-center gap-1.5 rounded-control border border-line-strong bg-surface px-2 py-1 text-left',
          'transition-[border-color,box-shadow] duration-fast ease-exit',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
          'disabled:cursor-not-allowed disabled:bg-surface-3'
        )}>

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 && <span className="text-body text-ink-subtle">{placeholder}</span>}
          {selected.slice(0, maxVisibleChips).map((opt) =>
            <span
              key={opt.value}
              className="inline-flex max-w-[160px] items-center gap-1 rounded-[4px] bg-surface-3 px-1.5 py-0.5 text-caption text-ink">

              <span className="truncate">{opt.label}</span>
              <span
                role="button"
                tabIndex={-1}
                aria-label={`Remove ${opt.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(opt.value);
                }}
                className="text-ink-subtle hover:text-ink">

                <XIcon className="h-3 w-3" />
              </span>
            </span>
          )}
          {selected.length > maxVisibleChips &&
            <span className="tabular text-caption text-ink-muted">
              +{selected.length - maxVisibleChips} more
            </span>
          }
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
      </button>

      {open &&
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 animate-pop-in overflow-hidden rounded-control border border-line bg-surface shadow-pop">
          <div className="flex items-center gap-2 border-b border-line px-2.5 py-1.5">
            <SearchIcon className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter options"
              aria-label={`Filter ${label}`}
              className="w-full bg-transparent text-body text-ink placeholder:text-ink-subtle focus:outline-none" />

          </div>
          <ul role="listbox" aria-multiselectable className="thin-scroll max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 &&
              <li className="px-3 py-4 text-center text-small text-ink-muted">No options match “{query}”</li>
            }
            {filtered.map((opt) => {
              const active = value.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => toggle(opt.value)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-body text-ink hover:bg-surface-3 focus-visible:bg-surface-3 focus-visible:outline-none">

                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                        active ? 'border-primary bg-primary text-white' : 'border-line-strong'
                      )}>

                      {active && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {opt.meta && <span className="tabular shrink-0 text-caption text-ink-subtle">{opt.meta}</span>}
                  </button>
                </li>);

            })}
          </ul>
          <div className="flex items-center justify-between border-t border-line px-2.5 py-1.5">
            <span className="tabular text-caption text-ink-subtle">{value.length} selected</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-caption font-medium text-primary-text hover:underline">

              Clear all
            </button>
          </div>
        </div>
      }
    </div>);

}