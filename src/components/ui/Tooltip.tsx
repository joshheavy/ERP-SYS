'use client';

import React, { useId, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  label: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  shortcut?: string;
}

/** Keyboard-reachable tooltip. Opens on hover and on focus, never on click. */
export function Tooltip({ label, children, side = 'top', shortcut }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const position =
    side === 'bottom' ?
      'top-full mt-1.5 left-1/2 -translate-x-1/2' :
      side === 'left' ?
        'right-full mr-1.5 top-1/2 -translate-y-1/2' :
        side === 'right' ?
          'left-full ml-1.5 top-1/2 -translate-y-1/2' :
          'bottom-full mb-1.5 left-1/2 -translate-x-1/2';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}>

      {React.cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      {open &&
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-50 flex items-center gap-1.5 whitespace-nowrap rounded-control',
            'bg-ink px-2 py-1 text-caption font-medium text-ink-inverse shadow-pop',
            'animate-pop-in',
            position
          )}>

          {label}
          {shortcut &&
            <kbd className="tabular rounded-[3px] bg-white/15 px-1 py-px text-caption font-medium">
              {shortcut}
            </kbd>
          }
        </span>
      }
    </span>);

}