'use client';

import React, { useState } from 'react';
import { CheckIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { useCan } from '../../contexts/PreferencesContext';
import { ROUTE_META } from '../../data/navigation';

const GROUPS = [
  { id: 'periods', label: 'Accounting periods' },
  { id: 'approvals', label: 'Approval thresholds' },
  { id: 'numbering', label: 'Document numbering' },
  { id: 'payroll', label: 'Payroll posting' },
  { id: 'integrations', label: 'Bank integrations' }];


interface SettingRow {
  id: string;
  label: string;
  description: string;
  control: React.ReactNode;
}

export function FinanceSettings() {
  const can = useCan();
  const [group, setGroup] = useState('periods');
  const [dirtyGroups, setDirtyGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [autoClose, setAutoClose] = useState(true);
  const [lockOnClose, setLockOnClose] = useState(true);
  const [closeDay, setCloseDay] = useState('5');
  const [hodThreshold, setHodThreshold] = useState('1000000');
  const [financeThreshold, setFinanceThreshold] = useState('5000000');
  const [execThreshold, setExecThreshold] = useState('10000000');
  const [makerChecker, setMakerChecker] = useState(true);
  const [prefix, setPrefix] = useState('JE');
  const [resetAnnually, setResetAnnually] = useState(true);
  const [payrollAccount, setPayrollAccount] = useState('6100');
  const [splitByCostCentre, setSplitByCostCentre] = useState(true);
  const [pesalinkEnabled, setPesalinkEnabled] = useState(true);

  const markDirty = () => setDirtyGroups((prev) => prev.includes(group) ? prev : [...prev, group]);

  const wrap = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    markDirty();
  };

  const SETTINGS: Record<string, { title: string; description: string; rows: SettingRow[]; }> = {
    periods: {
      title: 'Accounting periods',
      description: 'When periods close and what happens to documents still open at that point.',
      rows: [
        {
          id: 'closeDay',
          label: 'Period close day',
          description: 'Calendar day of the following month when the period is closed for posting.',
          control:
            <Input
              className="w-20"
              numeric
              value={closeDay}
              aria-label="Period close day"
              onChange={(e) => wrap(setCloseDay)(e.target.value)}
              disabled={!can.edit} />


        },
        {
          id: 'autoClose',
          label: 'Close periods automatically',
          description: 'Closes the period on the close day without waiting for a manual action.',
          control: <Toggle checked={autoClose} onChange={wrap(setAutoClose)} aria-label="Close periods automatically" disabled={!can.edit} />
        },
        {
          id: 'lockOnClose',
          label: 'Lock back-dated postings',
          description: 'Rejects any journal dated into a closed period, including reversals.',
          control: <Toggle checked={lockOnClose} onChange={wrap(setLockOnClose)} aria-label="Lock back-dated postings" disabled={!can.edit} />
        }]

    },
    approvals: {
      title: 'Approval thresholds',
      description: 'The value at which each approval stage is introduced into the chain.',
      rows: [
        {
          id: 'hod',
          label: 'Head of Department up to',
          description: 'Requisitions at or below this value stop at the HOD.',
          control:
            <Input className="w-40" numeric suffix="KSh" value={hodThreshold} aria-label="HOD threshold" onChange={(e) => wrap(setHodThreshold)(e.target.value)} disabled={!can.edit} />

        },
        {
          id: 'finance',
          label: 'Finance approval above',
          description: 'Adds Head of Finance to the chain above this value.',
          control:
            <Input className="w-40" numeric suffix="KSh" value={financeThreshold} aria-label="Finance threshold" onChange={(e) => wrap(setFinanceThreshold)(e.target.value)} disabled={!can.edit} />

        },
        {
          id: 'exec',
          label: 'Executive approval above',
          description: 'Adds the Executive Committee to the chain above this value.',
          control:
            <Input className="w-40" numeric suffix="KSh" value={execThreshold} aria-label="Executive threshold" onChange={(e) => wrap(setExecThreshold)(e.target.value)} disabled={!can.edit} />

        },
        {
          id: 'makerChecker',
          label: 'Enforce maker-checker',
          description: 'Prevents any user from approving a document they raised or last edited.',
          control: <Toggle checked={makerChecker} onChange={wrap(setMakerChecker)} aria-label="Enforce maker-checker" disabled={!can.edit} />
        }]

    },
    numbering: {
      title: 'Document numbering',
      description: 'How references are generated for journals and related documents.',
      rows: [
        {
          id: 'prefix',
          label: 'Journal prefix',
          description: 'Appears at the start of every generated journal reference.',
          control: <Input className="w-24" value={prefix} aria-label="Journal prefix" onChange={(e) => wrap(setPrefix)(e.target.value)} disabled={!can.edit} />
        },
        {
          id: 'format',
          label: 'Reference format',
          description: 'Pattern applied after the prefix.',
          control:
            <Select
              className="w-56"
              aria-label="Reference format"
              value="year-period-sequence"
              onChange={() => markDirty()}
              disabled={!can.edit}
              options={[
                { value: 'year-period-sequence', label: 'YYYY-PP-NNNN' },
                { value: 'year-sequence', label: 'YYYY-NNNNN' },
                { value: 'sequence', label: 'NNNNNN' }]
              } />


        },
        {
          id: 'reset',
          label: 'Reset sequence annually',
          description: 'Restarts numbering at 0001 at the beginning of each fiscal year.',
          control: <Toggle checked={resetAnnually} onChange={wrap(setResetAnnually)} aria-label="Reset sequence annually" disabled={!can.edit} />
        }]

    },
    payroll: {
      title: 'Payroll posting',
      description: 'How the payroll run maps onto the general ledger.',
      rows: [
        {
          id: 'account',
          label: 'Gross pay expense account',
          description: 'Debited with total gross pay when a run is posted.',
          control:
            <Select
              className="w-64"
              aria-label="Gross pay expense account"
              value={payrollAccount}
              onChange={(e) => wrap(setPayrollAccount)(e.target.value)}
              disabled={!can.edit}
              options={[
                { value: '6100', label: '6100 — Salaries & wages' },
                { value: '6110', label: '6110 — Contract staff costs' }]
              } />


        },
        {
          id: 'split',
          label: 'Split posting by cost centre',
          description: 'Produces one journal line per cost centre instead of a single consolidated line.',
          control: <Toggle checked={splitByCostCentre} onChange={wrap(setSplitByCostCentre)} aria-label="Split posting by cost centre" disabled={!can.edit} />
        }]

    },
    integrations: {
      title: 'Bank integrations',
      description: 'Where the payroll transfer file is sent and in what format.',
      rows: [
        {
          id: 'pesalink',
          label: 'PesaLink / RTGS transfer file',
          description: 'Generates the PesaLink/RTGS bulk transfer file at the end of a payroll run.',
          control: <Toggle checked={pesalinkEnabled} onChange={wrap(setPesalinkEnabled)} aria-label="PesaLink transfer file" disabled={!can.edit} />
        },
        {
          id: 'sftp',
          label: 'Delivery endpoint',
          description: 'Managed by IT Operations. Changes require a service request.',
          control:
            <span className="tabular inline-flex items-center gap-1.5 rounded-control border border-line bg-surface-2 px-2 py-1 text-small text-ink-muted">
              <LockIcon className="h-3 w-3" aria-hidden />
              sftp://treasury.emtech.internal
            </span>

        }]

    }
  };

  const active = SETTINGS[group];
  const dirty = dirtyGroups.includes(group);

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/settings'].trail}
        title="Finance settings"
        meta={
          can.edit ?
            <span>Changes apply to every finance document created after saving.</span> :

            <span className="flex items-center gap-1.5">
              <LockIcon className="h-3.5 w-3.5" aria-hidden /> Read-only for your role
            </span>

        } />


      <div className="grid grid-cols-12 gap-4 p-5">
        <nav aria-label="Setting groups" className="col-span-12 lg:col-span-3">
          <ul className="space-y-0.5">
            {GROUPS.map((item) =>
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={item.id === group ? 'true' : undefined}
                  onClick={() => setGroup(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-body transition-colors duration-fast ease-exit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    item.id === group ?
                      'bg-primary-soft font-medium text-primary-text' :
                      'text-ink-muted hover:bg-surface-3 hover:text-ink'
                  )}>

                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {dirtyGroups.includes(item.id) &&
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-label="Unsaved changes" />
                  }
                </button>
              </li>
            )}
          </ul>
        </nav>

        <Card className="col-span-12 lg:col-span-9">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-h2 text-ink">{active.title}</h2>
            <p className="mt-0.5 text-small text-ink-muted">{active.description}</p>
          </div>
          <dl className="divide-y divide-line">
            {active.rows.map((row) =>
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">

                <div className="min-w-0 max-w-xl">
                  <dt className="text-body font-medium text-ink">{row.label}</dt>
                  <dd className="mt-0.5 text-small text-ink-muted">{row.description}</dd>
                </div>
                <div className="shrink-0">{row.control}</div>
              </div>
            )}
          </dl>
          <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3">
            {dirty &&
              <p className="mr-auto flex items-center gap-1.5 text-small text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                Unsaved changes in this section
              </p>
            }
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => setDirtyGroups((prev) => prev.filter((g) => g !== group))}>

              Discard
            </Button>
            <Button
              variant="primary"
              icon={CheckIcon}
              disabled={!dirty || !can.edit}
              loading={saving}
              title={can.edit ? undefined : 'Your role cannot change finance settings'}
              onClick={() => {
                setSaving(true);
                setTimeout(() => {
                  setSaving(false);
                  setDirtyGroups((prev) => prev.filter((g) => g !== group));
                  toast.success(`${active.title} saved`);
                }, 400);
              }}>

              Save section
            </Button>
          </div>
        </Card>
      </div>
    </div>);

}