'use client';

import React, { useMemo, useState } from 'react';
import { useNav } from '../../hooks/useNav';
import { ArrowRightIcon, PlayIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import { PAYROLL_RUNS, PAYROLL_STEPS } from '../../data/payroll';
import { ROUTE_META } from '../../data/navigation';
import { formatDateTime, formatMoney, formatPeriod } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { PayrollRun } from '../../types/payroll';

export function PayrollRuns() {
  const navigate = useNav();
  const can = useCan();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PAYROLL_RUNS.filter((run) => {
      if (status && run.status !== status) return false;
      if (!q) return true;
      return run.reference.toLowerCase().includes(q) || run.payGroup.toLowerCase().includes(q);
    });
  }, [query, status]);

  const draft = PAYROLL_RUNS.find((run) => run.status === 'draft');

  const columns: Column<PayrollRun>[] = [
    { id: 'reference', header: 'Run', width: 160, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'period', header: 'Period', width: 140, sortValue: (r) => r.period, cell: (r) => formatPeriod(r.period) },
    { id: 'payGroup', header: 'Pay group', width: 220, sortValue: (r) => r.payGroup, cell: (r) => <span className="block truncate">{r.payGroup}</span> },
    { id: 'status', header: 'Status', width: 148, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'progress',
      header: 'Progress',
      width: 160,
      sortValue: (r) => r.stepsComplete,
      cell: (r) =>
        <ProgressBar
          value={r.stepsComplete}
          max={PAYROLL_STEPS.length}
          size="sm"
          tone={r.status === 'rejected' ? 'danger' : r.stepsComplete === PAYROLL_STEPS.length ? 'success' : 'primary'}
          caption={`${r.stepsComplete}/${PAYROLL_STEPS.length}`} />


    },
    { id: 'employees', header: 'Employees', numeric: true, width: 118, sortValue: (r) => r.employees, cell: (r) => r.employees.toLocaleString(), total: (all) => all.reduce((s, r) => s + r.employees, 0).toLocaleString() },
    { id: 'gross', header: 'Gross', numeric: true, width: 158, sortValue: (r) => r.gross, cell: (r) => formatMoney(r.gross), total: (all) => formatMoney(all.reduce((s, r) => s + r.gross, 0)) },
    { id: 'net', header: 'Net', numeric: true, width: 158, sortValue: (r) => r.net, cell: (r) => formatMoney(r.net), total: (all) => formatMoney(all.reduce((s, r) => s + r.net, 0)) },
    { id: 'owner', header: 'Owner', width: 140, sortValue: (r) => r.owner, cell: (r) => r.owner },
    { id: 'updated', header: 'Last updated', width: 170, sortValue: (r) => r.updatedAt, cell: (r) => <span className="tabular">{formatDateTime(r.updatedAt)}</span> }];


  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/payroll'].trail}
        title="Payroll runs"
        meta={
          <>
            <span className="tabular">{PAYROLL_RUNS.length} runs</span>
            <span aria-hidden>·</span>
            <span>September 2026 run in progress</span>
          </>
        }
        primaryAction={
          <Button
            variant="primary"
            icon={PlayIcon}
            disabled={!can.viewPayroll}
            title={can.viewPayroll ? undefined : 'Your role cannot access payroll'}
            onClick={() => navigate('/hr/payroll/run')}>

            {draft ? 'Continue run' : 'Run payroll'}
          </Button>
        } />


      <div className="space-y-4 p-5">
        {draft && can.viewPayroll &&
          <section className="rounded-surface border border-line-strong bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                  Run in progress
                </p>
                <h2 className="mt-1 text-h1 text-ink">
                  {formatPeriod(draft.period)} · {draft.reference}
                </h2>
                <p className="mt-1 text-small text-ink-muted">
                  Paused at step {draft.stepsComplete + 1} of {PAYROLL_STEPS.length} —{' '}
                  {PAYROLL_STEPS[draft.stepsComplete].title}. 2 blocking exceptions must be cleared before
                  the register can be signed off.
                </p>
              </div>
              <Button variant="primary" trailingIcon={ArrowRightIcon} onClick={() => navigate('/hr/payroll/run')}>
                Resume run
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile emphasis label="Net payable" value={formatMoney(draft.net)} change={{ value: '+1.5%', direction: 'up', caption: 'vs. August', good: false }} />
              <StatTile label="Gross pay" value={formatMoney(draft.gross)} />
              <StatTile label="Employees in scope" value={draft.employees.toLocaleString()} footnote="14 joiners, 6 leavers" />
              <StatTile label="Blocking exceptions" value="2" footnote="Both in the inputs phase" />
            </div>
            <ProgressBar
              className="mt-4"
              label="Run progress"
              caption={`${draft.stepsComplete} of ${PAYROLL_STEPS.length} steps complete`}
              value={draft.stepsComplete}
              max={PAYROLL_STEPS.length} />

          </section>
        }

        <DataTable
          caption="Payroll runs"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          state={can.viewPayroll ? 'ready' : 'no-permission'}
          pinFirstColumn
          showTotals
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={() => {
            setStatus('');
            setQuery('');
          }}
          onRowClick={(row) =>
            row.status === 'draft' ?
              navigate('/hr/payroll/run') :
              toast.info(`${row.reference} is ${row.status}`, {
                description: 'Posted runs open read-only with their register and audit trail.'
              })
          }
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search run or pay group"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={() => {
                setStatus('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: 'All statuses' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'posted', label: 'Posted' },
                    { value: 'rejected', label: 'Rejected' }]
                  } />

              } />

          } />

      </div>
    </div>);

}