'use client';

import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CheckIcon,
  XCircleIcon
} from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { StatTile } from '../../../../components/ui/StatTile';
import { DataTable } from '../../../../components/data-table/DataTable';
import { cn } from '../../../../utils/cn';
import { PAYROLL_EXCEPTIONS, REGISTER_ROWS } from '../../../../data/payroll';
import { VARIANCE_COLUMNS } from '../../../../components/payroll/registerColumns';
import type { PayrollException } from '../../../../types/payroll';

/* ------------------------------------------------------------------ *
 * Step 13 — Exception report
 * ------------------------------------------------------------------ */

export interface ExceptionStepProps {
  complete: boolean;
  onComplete: () => void;
}

export function ExceptionStep({ complete, onComplete }: ExceptionStepProps) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const blocking = PAYROLL_EXCEPTIONS.filter((e) => e.severity === 'blocking');
  const warnings = PAYROLL_EXCEPTIONS.filter((e) => e.severity === 'warning');
  const resolved = (id: string) => complete || state[id];
  const openBlocking = blocking.filter((e) => !resolved(e.id)).length;
  const unackedWarnings = warnings.filter((e) => !resolved(e.id)).length;
  const gateClear = openBlocking === 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          emphasis
          label="Blocking exceptions open"
          value={String(openBlocking)}
          footnote={gateClear ? 'Gate is clear' : 'Must be cleared to continue'}
        />
        <StatTile label="Warnings to acknowledge" value={String(unackedWarnings)} />
        <StatTile label="Employees affected" value="5" footnote="of 1,248 in scope" />
      </div>

      {PAYROLL_EXCEPTIONS.map((ex) => (
        <ExceptionCard key={ex.id} exception={ex} resolved={resolved(ex.id)} onResolve={() => setState((s) => ({ ...s, [ex.id]: true }))} />
      ))}

      {!complete && (
        <div className="flex items-center justify-end gap-3">
          {!gateClear && (
            <p className="mr-auto flex items-center gap-1.5 text-small text-danger">
              <XCircleIcon className="h-4 w-4" aria-hidden />
              {openBlocking} blocking {openBlocking === 1 ? 'exception' : 'exceptions'} must be cleared first.
            </p>
          )}
          <Button variant="primary" disabled={!gateClear} onClick={onComplete}>
            All exceptions handled
          </Button>
        </div>
      )}
      {complete && (
        <p className="flex items-center gap-1.5 text-small text-success">
          <CheckCircle2Icon className="h-4 w-4" aria-hidden />
          All blocking exceptions cleared and warnings acknowledged.
        </p>
      )}
    </div>
  );
}

function ExceptionCard({
  exception,
  resolved,
  onResolve
}: {
  exception: PayrollException;
  resolved: boolean;
  onResolve: () => void;
}) {
  const blocking = exception.severity === 'blocking';
  return (
    <div
      className={cn(
        'rounded-surface border bg-surface p-4',
        resolved ? 'border-line opacity-70' : blocking ? 'border-danger/40' : 'border-warning/40'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              resolved ? 'bg-success-soft text-success' : blocking ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
            )}
          >
            {resolved ? <CheckIcon className="h-3.5 w-3.5" /> : blocking ? <XCircleIcon className="h-3.5 w-3.5" /> : <AlertTriangleIcon className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-caption font-semibold uppercase tracking-wide',
                  blocking ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
                )}
              >
                {blocking ? 'Blocking' : 'Warning'}
              </span>
              <span className="tabular text-caption text-ink-subtle">{exception.code}</span>
            </div>
            <h3 className="mt-1 text-h3 text-ink">{exception.title}</h3>
            <p className="mt-1 max-w-2xl text-small text-ink-muted">{exception.detail}</p>
            <p className="mt-2 text-small text-ink">
              <span className="font-medium">Affected:</span> {exception.employees.join(', ')}
            </p>
            <p className="mt-1 text-small text-ink-muted">
              <span className="font-medium text-ink">Resolution:</span> {exception.resolution}
            </p>
          </div>
        </div>
        {!resolved && (
          <Button size="sm" variant={blocking ? 'primary' : 'secondary'} onClick={onResolve}>
            {blocking ? 'Mark resolved' : 'Acknowledge'}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Step 14 — Variance vs. last period
 * ------------------------------------------------------------------ */

export interface VarianceStepProps {
  complete: boolean;
  onComplete: () => void;
}

export function VarianceStep({ complete, onComplete }: VarianceStepProps) {
  const outliers = REGISTER_ROWS.filter((r) => Math.abs(r.variance / r.previousNet) > 0.1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Outside ±10%" value={String(outliers.length)} footnote="Flagged for explanation" />
        <StatTile label="Net movement" value="+1.5%" footnote="vs. August" />
        <StatTile label="Largest single change" value="+18.4%" footnote="EMP-0031 · bonus" />
      </div>
      <Card>
        <CardHeader title="Net pay versus August 2026" description="Every employee whose net pay moved, largest change first." />
        <div className="p-3">
          <DataTable
            caption="Variance review"
            columns={VARIANCE_COLUMNS}
            rows={[...REGISTER_ROWS].sort((a, b) => Math.abs(b.variance / b.previousNet) - Math.abs(a.variance / a.previousNet))}
            getRowId={(r) => r.id}
            pageSize={8}
            pinFirstColumn
            showTotals
          />
        </div>
      </Card>
      {!complete ? (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onComplete}>
            Variance reviewed and explained
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-small text-success">
          <CheckCircle2Icon className="h-4 w-4" aria-hidden />
          {outliers.length} employees outside the threshold, all explained.
        </p>
      )}
    </div>
  );
}
