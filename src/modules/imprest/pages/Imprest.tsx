'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, SendIcon, CheckIcon, HandCoinsIcon } from 'lucide-react';
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
  imprestStore,
  IMPREST_STATUS_BADGE,
  IMPREST_STATUSES,
  type Imprest,
  type ImprestStatus
} from '../../../data/imprest';
import { useCollection } from '../../../core/store/createCollection';
import { formatMoney, formatDate } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

interface ImprestForm {
  holder: string;
  purpose: string;
  amount: number;
}

const emptyForm: ImprestForm = { holder: '', purpose: '', amount: 0 };

const STATUS_LABELS: Record<ImprestStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  pendingSurrender: 'Pending surrender',
  retired: 'Retired'
};

function ImprestStatusBadge({ status, size }: { status: ImprestStatus; size?: 'sm' | 'md' }) {
  const spec = IMPREST_STATUS_BADGE[status];
  return <StatusBadge status={spec.status} label={spec.label} size={size} />;
}

export function Imprest() {
  const can = useCan();
  const imprests = useCollection(imprestStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ImprestForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [surrendering, setSurrendering] = useState(false);
  const [surrenderAmount, setSurrenderAmount] = useState(0);

  const active = imprests.find((p) => p.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return imprests.filter((p) => {
      if (status && p.status !== status) return false;
      if (!q) return true;
      return (
        p.holder.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q)
      );
    });
  }, [imprests, query, status]);

  const issuedValue = imprests
    .filter((p) => p.status === 'issued' || p.status === 'pendingSurrender' || p.status === 'retired')
    .reduce((s, p) => s + p.amount, 0);
  const pendingSurrenderCount = imprests.filter((p) => p.status === 'pendingSurrender').length;
  const retiredCount = imprests.filter((p) => p.status === 'retired').length;

  const create = () => {
    if (!form.holder.trim() || form.amount <= 0) {
      toast.error('Holder and a positive amount are required');
      return;
    }
    const next = imprests.length + 1;
    imprestStore.create({
      reference: `IMP-2026-${String(next).padStart(4, '0')}`,
      holder: form.holder,
      purpose: form.purpose,
      amount: form.amount,
      issuedOn: new Date().toISOString().slice(0, 10),
      status: 'draft',
      raisedBy: 'David Kimani'
    });
    toast.success('Imprest created as draft');
    setCreating(false);
    setForm(emptyForm);
  };

  const issue = (p: Imprest) => {
    imprestStore.update(p.id, { status: 'issued', issuedOn: new Date().toISOString().slice(0, 10) });
    toast.success(`${p.reference} issued`);
  };

  const openSurrender = (p: Imprest) => {
    setSurrenderAmount(p.surrenderedAmount ?? p.amount);
    setSurrendering(true);
  };

  const recordSurrender = (p: Imprest) => {
    if (surrenderAmount < 0 || surrenderAmount > p.amount) {
      toast.error('Surrendered amount must be between 0 and the imprest amount');
      return;
    }
    imprestStore.update(p.id, {
      status: 'pendingSurrender',
      surrenderedAmount: surrenderAmount,
      balance: p.amount - surrenderAmount
    });
    toast.success(`Surrender recorded for ${p.reference}`);
    setSurrendering(false);
  };

  const retire = (p: Imprest) => {
    imprestStore.update(p.id, { status: 'retired' });
    toast.success(`${p.reference} retired`);
  };

  const columns: Column<Imprest>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'holder', header: 'Holder', width: 170, sortValue: (r) => r.holder, cell: (r) => <span className="block truncate">{r.holder}</span> },
    { id: 'purpose', header: 'Purpose', width: 260, sortValue: (r) => r.purpose, cell: (r) => <span className="block truncate text-ink-muted">{r.purpose}</span> },
    { id: 'amount', header: 'Amount', numeric: true, width: 150, sortValue: (r) => r.amount, cell: (r) => formatMoney(r.amount) },
    { id: 'balance', header: 'Balance', numeric: true, width: 130, sortValue: (r) => r.balance ?? 0, cell: (r) => (r.balance === undefined ? '—' : formatMoney(r.balance)) },
    { id: 'issuedOn', header: 'Issued', width: 120, sortValue: (r) => r.issuedOn, cell: (r) => formatDate(r.issuedOn) },
    { id: 'status', header: 'Status', width: 160, sortValue: (r) => r.status, cell: (r) => <ImprestStatusBadge status={r.status} /> }
  ];

  const clearAll = () => {
    setQuery('');
    setStatus('');
  };

  return (
    <div>
      <PageHeader
        trail={['Imprest', 'Imprest requests']}
        title="Imprest requests"
        meta={
          <>
            <span className="tabular">{imprests.length} imprests</span>
            <span aria-hidden>·</span>
            <span>{pendingSurrenderCount} pending surrender</span>
          </>
        }
        primaryAction={
          <Button
            variant="primary"
            icon={PlusIcon}
            disabled={!can.create}
            title={can.create ? undefined : 'Your role cannot raise imprests'}
            onClick={() => {
              setForm(emptyForm);
              setCreating(true);
            }}
          >
            New imprest
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Total issued value" value={formatMoney(issuedValue)} footnote="Issued, pending & retired" />
          <StatTile label="Pending surrender" value={String(pendingSurrenderCount)} />
          <StatTile label="Retired" value={String(retiredCount)} />
        </div>

        <DataTable
          caption="Imprests"
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
              placeholder="Search holder, reference or purpose"
              chips={status ? [{ id: 'status', label: 'Status', value: STATUS_LABELS[status as ImprestStatus] }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-48"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: 'All statuses' },
                    ...IMPREST_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))
                  ]}
                />
              }
            />
          }
        />
      </div>

      {/* Detail drawer with workflow actions */}
      <Drawer
        open={Boolean(active)}
        onClose={() => {
          setActiveId(null);
          setSurrendering(false);
        }}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? `${active.holder} · ${formatMoney(active.amount)}` : undefined}
        headerAccessory={active && <ImprestStatusBadge status={active.status} size="md" />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => { setActiveId(null); setSurrendering(false); }}>Close</Button>
              {active.status === 'draft' && (
                <Button variant="primary" icon={SendIcon} disabled={!can.create} onClick={() => issue(active)}>
                  Issue
                </Button>
              )}
              {active.status === 'issued' && !surrendering && (
                <Button variant="primary" icon={HandCoinsIcon} disabled={!can.create} onClick={() => openSurrender(active)}>
                  Record surrender
                </Button>
              )}
              {active.status === 'issued' && surrendering && (
                <>
                  <Button variant="secondary" onClick={() => setSurrendering(false)}>Cancel surrender</Button>
                  <Button variant="primary" icon={CheckIcon} disabled={!can.create} onClick={() => recordSurrender(active)}>
                    Save surrender
                  </Button>
                </>
              )}
              {active.status === 'pendingSurrender' && (
                <Button variant="primary" icon={CheckIcon} disabled={!can.approve} onClick={() => retire(active)}>
                  Retire
                </Button>
              )}
            </>
          )
        }
      >
        {active && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-4 sm:grid-cols-3">
              {[
                { label: 'Holder', value: active.holder },
                { label: 'Amount', value: formatMoney(active.amount) },
                { label: 'Issued on', value: formatDate(active.issuedOn) },
                { label: 'Surrendered', value: active.surrenderedAmount === undefined ? '—' : formatMoney(active.surrenderedAmount) },
                { label: 'Balance', value: active.balance === undefined ? '—' : formatMoney(active.balance) },
                { label: 'Raised by', value: active.raisedBy }
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="p-4">
              <h3 className="mb-2 text-h3 text-ink">Purpose</h3>
              <p className="text-small text-ink-muted">{active.purpose}</p>
            </div>
            {active.status === 'issued' && surrendering && (
              <div className="border-t border-line p-1">
                <FormSection title="Record surrender" description="How much of the imprest was accounted for.">
                  <Field label="Surrendered amount (KES)" span={12} required hint={`Balance to recover: ${formatMoney(active.amount - surrenderAmount)}`}>
                    <Input
                      numeric
                      type="number"
                      min={0}
                      max={active.amount}
                      value={surrenderAmount}
                      onChange={(e) => setSurrenderAmount(Number(e.target.value) || 0)}
                    />
                  </Field>
                </FormSection>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New imprest"
        subtitle="Raise a cash imprest for a holder"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} disabled={!can.create}>Create imprest</Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Imprest" description="Who holds it, what it is for and how much.">
            <Field label="Holder" span={12} required>
              <Input value={form.holder} onChange={(e) => setForm((f) => ({ ...f, holder: e.target.value }))} placeholder="e.g. Nancy Wambui" />
            </Field>
            <Field label="Purpose" span={12}>
              <Textarea rows={2} value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Field audit per diem — Mombasa branch" />
            </Field>
            <Field label="Amount (KES)" span={6} required>
              <Input numeric type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
