'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { StatusBadge } from '../../../components/approval/StatusBadge';
import { useCan } from '../../../contexts/PreferencesContext';
import {
  prepaymentsStore,
  amortizationSchedule,
  type Prepayment,
  type PrepaymentStatus
} from '../../../data/prepayments';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney, formatDate } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

interface PrepaymentForm {
  payee: string;
  description: string;
  amount: number;
  startDate: string;
  months: number;
  account: string;
}

const emptyForm: PrepaymentForm = { payee: '', description: '', amount: 0, startDate: '2026-09', months: 12, account: '' };

export function Prepayments() {
  const can = useCan();
  const prepayments = useCollection(prepaymentsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PrepaymentForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = prepayments.find((p) => p.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prepayments.filter((p) => {
      if (status && p.status !== status) return false;
      if (!q) return true;
      return p.payee.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [prepayments, query, status]);

  const outstanding = prepayments.filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
  const pendingCount = prepayments.filter((p) => p.status === 'pending').length;

  const create = () => {
    if (!form.payee.trim() || form.amount <= 0) {
      toast.error('Payee and a positive amount are required');
      return;
    }
    const next = prepayments.length + 1;
    prepaymentsStore.create({
      ...form,
      reference: `PPD-2026-${String(next).padStart(4, '0')}`,
      status: 'draft',
      raisedBy: 'Nancy Wambui',
      raisedOn: new Date().toISOString().slice(0, 10)
    });
    toast.success('Prepayment created as draft');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (p: Prepayment, next: PrepaymentStatus, msg: string) => {
    prepaymentsStore.update(p.id, { status: next });
    toast.success(msg);
  };

  const columns: Column<Prepayment>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'payee', header: 'Payee', width: 180, sortValue: (r) => r.payee, cell: (r) => <span className="block truncate">{r.payee}</span> },
    { id: 'description', header: 'Description', width: 240, sortValue: (r) => r.description, cell: (r) => <span className="block truncate text-ink-muted">{r.description}</span> },
    { id: 'amount', header: 'Amount', numeric: true, width: 150, sortValue: (r) => r.amount, cell: (r) => formatMoney(r.amount) },
    { id: 'months', header: 'Months', numeric: true, width: 90, sortValue: (r) => r.months, cell: (r) => r.months },
    { id: 'status', header: 'Status', width: 150, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> }
  ];

  const clearAll = () => {
    setQuery('');
    setStatus('');
  };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/prepayment/requests']?.trail ?? ['Prepayments', 'Prepayment requests']}
        title="Prepayment requests"
        meta={
          <>
            <span className="tabular">{prepayments.length} prepayments</span>
            <span aria-hidden>·</span>
            <span>{pendingCount} pending</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot raise prepayments'} onClick={() => { setForm(emptyForm); setCreating(true); }}>
            New prepayment
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Approved value" value={formatMoney(outstanding)} footnote="Being amortized" />
          <StatTile label="Pending approval" value={String(pendingCount)} />
          <StatTile label="Total records" value={String(prepayments.length)} />
        </div>

        <DataTable
          caption="Prepayments"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search payee, reference or description"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...(['draft', 'pending', 'approved', 'rejected'] as PrepaymentStatus[]).map((s) => ({ value: s, label: s }))]}
                />
              }
            />
          }
        />
      </div>

      {/* Detail drawer with amortization schedule + workflow actions */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="lg"
        title={active?.reference ?? ''}
        subtitle={active ? `${active.payee} · ${formatMoney(active.amount)}` : undefined}
        headerAccessory={active && <StatusBadge status={active.status} size="md" />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              {active.status === 'draft' && (
                <Button variant="primary" icon={SendIcon} disabled={!can.create} onClick={() => { setStatusOf(active, 'pending', `${active.reference} submitted for approval`); }}>
                  Submit for approval
                </Button>
              )}
              {active.status === 'pending' && (
                <>
                  <Button variant="secondary" icon={XIcon} disabled={!can.approve} onClick={() => { setStatusOf(active, 'rejected', `${active.reference} rejected`); }}>
                    Reject
                  </Button>
                  <Button variant="primary" icon={CheckIcon} disabled={!can.approve} onClick={() => { setStatusOf(active, 'approved', `${active.reference} approved`); }}>
                    Approve
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {active && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-4 sm:grid-cols-3">
              {[
                { label: 'Payee', value: active.payee },
                { label: 'Amount', value: formatMoney(active.amount) },
                { label: 'Account', value: active.account || '—' },
                { label: 'Start', value: active.startDate },
                { label: 'Months', value: String(active.months) },
                { label: 'Raised by', value: `${active.raisedBy} · ${formatDate(active.raisedOn)}` }
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="p-4">
              <h3 className="mb-2 text-h3 text-ink">Amortization schedule</h3>
              <p className="mb-3 text-small text-ink-muted">{active.description}</p>
              <div className="overflow-hidden rounded-control border border-line">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line bg-surface-2">
                      <th className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Period</th>
                      <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">Charge</th>
                      <th className="px-3 py-2 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule(active).map((r) => (
                      <tr key={r.period} className="border-b border-line last:border-b-0">
                        <td className="tabular px-3 py-1.5 text-small text-ink">{r.period}</td>
                        <td className="tabular px-3 py-1.5 text-right text-small text-ink">{formatMoney(r.charge)}</td>
                        <td className="tabular px-3 py-1.5 text-right text-small text-ink-muted">{formatMoney(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New prepayment"
        subtitle="Record a prepaid expense to amortize"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} disabled={!can.create}>Create prepayment</Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Prepayment" description="What was paid and over how long it should be amortized.">
            <Field label="Payee" span={12} required>
              <Input value={form.payee} onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))} placeholder="e.g. Britam Insurance" />
            </Field>
            <Field label="Description" span={12}>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field label="Amount (KES)" span={6} required>
              <Input numeric type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} />
            </Field>
            <Field label="Amortize over (months)" span={6} required>
              <Input numeric type="number" min={1} value={form.months} onChange={(e) => setForm((f) => ({ ...f, months: Number(e.target.value) || 1 }))} />
            </Field>
            <Field label="Start period" span={6} hint="YYYY-MM">
              <Input value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} placeholder="2026-09" className="font-mono" />
            </Field>
            <Field label="Prepaid account" span={6}>
              <Input value={form.account} onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))} placeholder="1400 Prepaid insurance" />
            </Field>
          </FormSection>
          {form.amount > 0 && form.months > 0 && (
            <p className="px-5 pb-4 text-small text-ink-muted">
              Monthly charge: <span className="tabular font-medium text-ink">{formatMoney(Math.round(form.amount / form.months))}</span> over {form.months} months.
            </p>
          )}
        </div>
      </Drawer>
    </div>
  );
}
