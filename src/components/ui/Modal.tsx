'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Input } from './Input';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' };

export function Modal({ open, onClose, title, description, footer, width = 'md', children }: ModalProps) {
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
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <motion.div
            className="fixed inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative my-auto w-full rounded-surface border border-line bg-surface shadow-overlay',
              WIDTHS[width]
            )}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>

            <header className="flex items-start gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-h2 text-ink">{title}</h2>
                {description && <p className="mt-0.5 text-small text-ink-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="sm" iconOnly icon={XIcon} aria-label="Close dialog" onClick={onClose} />
            </header>
            {children && <div className="px-4 py-4">{children}</div>}
            {footer &&
              <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-2 px-4 py-3">
                {footer}
              </footer>
            }
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  /** When set, the confirm button stays disabled until this exact reference is typed. */
  requireReference?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
  tone = 'primary',
  requireReference,
  loading
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const gated = Boolean(requireReference) && typed.trim() !== requireReference;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm} disabled={gated} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }>

      <div className="flex gap-3">
        {tone === 'danger' &&
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangleIcon className="h-4 w-4" aria-hidden />
          </span>
        }
        <div className="min-w-0 text-body text-ink-muted">{message}</div>
      </div>
      {requireReference &&
        <label className="mt-4 block">
          <span className="block text-small font-medium text-ink">
            Type <span className="tabular font-semibold text-ink">{requireReference}</span> to confirm
          </span>
          <Input
            className="mt-1.5"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireReference}
            autoComplete="off" />

          <span className="mt-1 block text-caption text-ink-subtle">
            This action posts to the general ledger and cannot be reversed.
          </span>
        </label>
      }
    </Modal>);

}