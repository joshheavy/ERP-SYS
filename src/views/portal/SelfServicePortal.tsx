'use client';

import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileTextIcon,
  LogOutIcon,
  MoonIcon,
  PlaneIcon,
  SunIcon,
  WalletIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../hooks/useNav';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { ProgressBar } from '../../components/ui/Progress';
import { Avatar } from '../../components/approval/StatusTimeline';
import { usePreferences } from '../../contexts/PreferencesContext';
import { cn } from '../../utils/cn';
import {
  LEAVE_BALANCES,
  LEAVE_REQUESTS,
  LEAVE_TYPE_OPTIONS,
  MY_PAYSLIPS,
  PUBLIC_HOLIDAYS,
  RELIEVER_OPTIONS
} from '../../data/leave';
import { formatDate, formatMoney, formatPeriod, workingDaysBetween } from '../../utils/format';
import { StatusBadge } from '../../components/approval/StatusBadge';

type View = 'home' | 'request' | 'payslips';

export function SelfServicePortal() {
  const navigate = useNav();
  const { theme, setTheme } = usePreferences();
  const [view, setView] = useState<View>('home');

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-canvas">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          {view !== 'home' ? (
            <button type="button" aria-label="Back" onClick={() => setView('home')} className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-3">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-caption font-bold text-white">EM</span>
          )}
          <div>
            <p className="text-h4 leading-tight text-ink">{view === 'home' ? 'My workspace' : view === 'request' ? 'Request leave' : 'My payslips'}</p>
            <p className="text-caption leading-tight text-ink-subtle">EMTECH self-service</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-3">
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <button type="button" aria-label="Back to console" onClick={() => navigate('/finance')} className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-3">
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="thin-scroll flex-1 overflow-y-auto p-4 pb-24">
        {view === 'home' && <PortalHome onRequest={() => setView('request')} onPayslips={() => setView('payslips')} />}
        {view === 'request' && <RequestLeave onDone={() => setView('home')} />}
        {view === 'payslips' && <Payslips />}
      </main>
    </div>
  );
}

function PortalHome({ onRequest, onPayslips }: { onRequest: () => void; onPayslips: () => void }) {
  const latest = MY_PAYSLIPS[0];
  const mine = LEAVE_REQUESTS.filter((r) => r.raisedByCurrentUser || r.employee === 'Wanjiku Kamau');
  const annual = LEAVE_BALANCES.find((b) => b.type === 'annual');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-surface border border-line bg-surface p-4">
        <Avatar name="Wanjiku Kamau" className="h-11 w-11 text-body" />
        <div className="min-w-0">
          <p className="text-h3 text-ink">Wanjiku Kamau</p>
          <p className="text-small text-ink-muted">Procurement Analyst · EMP-0391</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onRequest} className="flex flex-col items-start gap-2 rounded-surface border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-text">
            <CalendarPlusIcon className="h-4 w-4" />
          </span>
          <span className="text-body font-medium text-ink">Request leave</span>
          {annual && <span className="text-caption text-ink-subtle">{annual.entitlement - annual.taken} annual days left</span>}
        </button>
        <button type="button" onClick={onPayslips} className="flex flex-col items-start gap-2 rounded-surface border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
            <WalletIcon className="h-4 w-4" />
          </span>
          <span className="text-body font-medium text-ink">My payslips</span>
          <span className="tabular text-caption text-ink-subtle">{formatPeriod(latest.period)}</span>
        </button>
      </div>

      <section className="rounded-surface border border-line bg-surface p-4">
        <h2 className="text-h4 text-ink">Leave balances</h2>
        <div className="mt-3 space-y-3">
          {LEAVE_BALANCES.map((b) => (
            <div key={b.type}>
              <ProgressBar
                label={b.label}
                caption={`${b.entitlement - b.taken - b.pending} of ${b.entitlement} left`}
                value={b.taken + b.pending}
                max={b.entitlement}
                tone={b.entitlement - b.taken - b.pending <= 2 ? 'warning' : 'primary'}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-surface border border-line bg-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-h4 text-ink">My requests</h2>
        </div>
        <ul className="divide-y divide-line">
          {mine.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-muted">
                <PlaneIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{r.typeLabel}</p>
                <p className="tabular text-caption text-ink-subtle">{formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days}d</p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
          {mine.length === 0 && <li className="px-4 py-6 text-center text-small text-ink-muted">No requests yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function RequestLeave({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState('annual');
  const [start, setStart] = useState('2026-09-28');
  const [end, setEnd] = useState('2026-10-02');
  const [reliever, setReliever] = useState(RELIEVER_OPTIONS[0].value);
  const [reason, setReason] = useState('');

  const days = workingDaysBetween(start, end, PUBLIC_HOLIDAYS);
  const balance = LEAVE_BALANCES.find((b) => b.type === type);
  const remaining = balance ? balance.entitlement - balance.taken - days : 0;
  const invalidRange = end < start;
  const overBalance = balance ? remaining < 0 : false;
  const canSubmit = !invalidRange && !overBalance && days > 0 && reason.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-surface border border-line bg-surface p-4">
        <label className="block">
          <span className="mb-1 block text-small font-medium text-ink">Leave type</span>
          <Select value={type} onChange={(e) => setType(e.target.value)} options={LEAVE_TYPE_OPTIONS} />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-small font-medium text-ink">From</span>
            <DatePicker label="From" value={start} onChange={setStart} min="2026-09-15" markedDates={PUBLIC_HOLIDAYS} />
          </label>
          <label className="block">
            <span className="mb-1 block text-small font-medium text-ink">To</span>
            <DatePicker label="To" value={end} onChange={setEnd} min={start} markedDates={PUBLIC_HOLIDAYS} invalid={invalidRange} />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-small font-medium text-ink">Reliever</span>
          <Select value={reliever} onChange={(e) => setReliever(e.target.value)} options={RELIEVER_OPTIONS} />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-small font-medium text-ink">Reason</span>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A short note for your supervisor." />
        </label>
      </div>

      <div className={cn('rounded-surface border p-4', overBalance ? 'border-danger/40 bg-danger-soft' : 'border-line bg-surface')}>
        <div className="flex items-center justify-between text-body">
          <span className="text-ink-muted">Working days requested</span>
          <span className="tabular font-semibold text-ink">{days} days</span>
        </div>
        {balance && (
          <div className="mt-1 flex items-center justify-between text-small">
            <span className="text-ink-muted">{balance.label} remaining after</span>
            <span className={cn('tabular font-medium', overBalance ? 'text-danger' : 'text-ink')}>{remaining} days</span>
          </div>
        )}
        {invalidRange && <p className="mt-2 text-small text-danger">The end date is before the start date.</p>}
        {overBalance && <p className="mt-2 text-small text-danger">This exceeds your remaining balance.</p>}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!canSubmit}
        onClick={() => {
          toast.success('Leave request submitted', { description: 'Routed to your supervisor for approval.' });
          onDone();
        }}
      >
        Submit request
      </Button>
    </div>
  );
}

function Payslips() {
  return (
    <div className="space-y-3">
      {MY_PAYSLIPS.map((p, i) => (
        <div key={p.id} className={cn('rounded-surface border bg-surface p-4', i === 0 ? 'border-primary/40' : 'border-line')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-ink-muted">
                <FileTextIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-body font-medium text-ink">{formatPeriod(p.period)}</p>
                <p className="tabular text-caption text-ink-subtle">Paid {formatDate(p.paidOn)}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" iconOnly icon={DownloadIcon} aria-label={`Download ${formatPeriod(p.period)} payslip`} onClick={() => toast.success('Payslip downloaded')} />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
            {[
              { label: 'Gross', value: formatMoney(p.gross, { symbol: false }) },
              { label: 'Deductions', value: formatMoney(p.deductions, { symbol: false }) },
              { label: 'Net', value: formatMoney(p.net, { symbol: false }) }
            ].map((s, idx) => (
              <div key={s.label}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{s.label}</dt>
                <dd className={cn('tabular mt-0.5 text-small font-semibold', idx === 2 ? 'text-ink' : 'text-ink-muted')}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
