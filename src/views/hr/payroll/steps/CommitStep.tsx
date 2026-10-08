'use client';

import React, { useState } from 'react';
import {
  BanknoteIcon,
  CheckCircle2Icon,
  LandmarkIcon,
  LockIcon
} from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { StatTile } from '../../../../components/ui/StatTile';
import { ConfirmDialog } from '../../../../components/ui/Modal';
import { MakerCheckerBanner } from '../../../../components/approval/Decision';
import { formatMoney } from '../../../../utils/format';
import type { PayrollStep } from '../../../../types/payroll';

export interface CommitStepProps {
  step: PayrollStep;
  complete: boolean;
  canApprove: boolean;
  onComplete: () => void;
}

const DETAIL: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; reference: string; confirmLabel: string; requireReference: string; done: string; facts: { label: string; value: string }[] }
> = {
  approve: {
    icon: LandmarkIcon,
    reference: 'PR-2026-09',
    confirmLabel: 'Post to general ledger',
    requireReference: 'PR-2026-09',
    done: 'Posted to GL as JE-2026-09-0114.',
    facts: [
      { label: 'Ledger period', value: 'September 2026' },
      { label: 'Journal', value: 'Payroll — JE-2026-09-0114' },
      { label: 'Net payable', value: formatMoney(357247800) }
    ]
  },
  disburse: {
    icon: BanknoteIcon,
    reference: 'PR-2026-09',
    confirmLabel: 'Generate payslips & transfer file',
    requireReference: 'PR-2026-09',
    done: 'Payslips published and PesaLink/RTGS transfer file generated.',
    facts: [
      { label: 'Payslips published', value: '1,248' },
      { label: 'Transfer file', value: 'PesaLink — 1,247 instructions' },
      { label: 'Withheld', value: '1 · missing bank account' }
    ]
  }
};

/** The irreversible steps. Both are gated behind maker-checker and a typed confirmation. */
export function CommitStep({ step, complete, canApprove, onComplete }: CommitStepProps) {
  const detail = DETAIL[step.id] ?? DETAIL.approve;
  const Icon = detail.icon;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <MakerCheckerBanner
        documentReference={detail.reference}
        reason={
          canApprove
            ? undefined
            : 'Your current role can prepare this run but cannot post or disburse it. Switch to the Approver role to commit.'
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {detail.facts.map((fact, i) => (
          <StatTile key={fact.label} emphasis={i === 0} label={fact.label} value={fact.value} />
        ))}
      </div>

      <Card>
        <CardHeader
          title={step.title}
          description={step.willChange}
        />
        <div className="px-4 py-4">
          {complete ? (
            <p className="flex items-center gap-1.5 text-body text-success">
              <CheckCircle2Icon className="h-5 w-5" aria-hidden />
              {detail.done}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft text-danger">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="min-w-0 flex-1 text-small text-ink-muted">
                This action is irreversible. You will be asked to type the run reference to confirm.
              </p>
              <Button
                variant="primary"
                icon={canApprove ? Icon : LockIcon}
                disabled={!canApprove}
                title={canApprove ? undefined : 'Requires the Approver role'}
                onClick={() => setDialogOpen(true)}
              >
                {detail.confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          onComplete();
        }}
        title={detail.confirmLabel}
        tone="danger"
        confirmLabel={detail.confirmLabel}
        requireReference={detail.requireReference}
        message={
          <span>
            {step.id === 'approve' ? (
              <>
                This posts the payroll journal to the September 2026 ledger period. It cannot be reversed
                once posted. Type <strong className="tabular">{detail.requireReference}</strong> to confirm.
              </>
            ) : (
              <>
                This publishes 1,248 payslips and produces the bank transfer file for treasury. Type{' '}
                <strong className="tabular">{detail.requireReference}</strong> to confirm.
              </>
            )}
          </span>
        }
      />
    </div>
  );
}
