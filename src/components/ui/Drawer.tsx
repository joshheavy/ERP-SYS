'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  /** Right-aligned header actions (status badge, overflow menu). */
  headerAccessory?: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  /** 1 = base drawer, 2 = drill-down stacked on top of it. */
  level?: 1 | 2;
  children: React.ReactNode;
}

const WIDTHS = {
  sm: 'w-full max-w-[380px]',
  md: 'w-full max-w-[560px]',
  lg: 'w-full max-w-[860px]'
};

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  headerAccessory,
  footer,
  width = 'md',
  level = 1,
  children
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
        <div className={cn('fixed inset-0', level === 2 ? 'z-[60]' : 'z-50')}>
          <motion.div
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose} />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'absolute inset-y-0 right-0 flex flex-col border-l border-line bg-surface shadow-overlay',
              WIDTHS[width],
              level === 2 && 'right-6 top-6 bottom-6 rounded-surface border'
            )}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>

            <header className="flex items-start gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-h2 text-ink">{title}</h2>
                {subtitle && <div className="mt-0.5 text-small text-ink-muted">{subtitle}</div>}
              </div>
              {headerAccessory}
              <Button variant="ghost" size="sm" iconOnly icon={XIcon} aria-label="Close panel" onClick={onClose} />
            </header>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer &&
              <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-2 px-4 py-3">
                {footer}
              </footer>
            }
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}