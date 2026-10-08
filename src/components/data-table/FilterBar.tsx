'use client';

import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from '../ui/Input';
import type { FilterChip } from './types';

export interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  /** Filter controls (selects, period pickers) rendered beside the search box. */
  controls?: React.ReactNode;
  chips?: FilterChip[];
  onRemoveChip?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder = 'Search records',
  controls,
  chips = [],
  onRemoveChip,
  onClearAll,
  className
}: FilterBarProps) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-wrap items-center gap-2', className)}>
      <Input
        className="w-full sm:w-56"
        icon={SearchIcon}
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onQueryChange(e.target.value)} />

      {controls}
      {chips.length > 0 &&
        <>
          <div className="mx-0.5 h-4 w-px bg-line" aria-hidden />
          {chips.map((chip) =>
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 rounded-control border border-line bg-surface-2 py-0.5 pl-2 pr-1 text-caption text-ink">

              <span className="text-ink-subtle">{chip.label}:</span>
              <span className="font-medium">{chip.value}</span>
              {onRemoveChip &&
                <button
                  type="button"
                  aria-label={`Remove filter ${chip.label}`}
                  onClick={() => onRemoveChip(chip.id)}
                  className="rounded-[3px] p-0.5 text-ink-subtle transition-colors duration-fast hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

                  <XIcon className="h-3 w-3" />
                </button>
              }
            </span>
          )}
          {onClearAll &&
            <button
              type="button"
              onClick={onClearAll}
              className="text-caption font-medium text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

              Clear all
            </button>
          }
        </>
      }
    </div>);

}