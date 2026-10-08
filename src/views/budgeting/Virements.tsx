'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, SendIcon, CheckCircle2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import {
  virementsStore,
  VIREMENT_STATUSES,
  type VirementStatus,
  type Virement
} from '../../data/virements';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface VirementForm {
  fromLine: string;
  toLine: string;
  amount: number;
  reason: string;
}

const emptyForm: VirementForm = { fromLine: '', toLine: '', amount: 0, reason: '' };

const STATUS_LABELS: Record<VirementStatus, string> = {
  draft: 'Draft',
  pending: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected'
};

export function Virements() {
  const can = useCan();
  const virements = useCollection(virementsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<VirementForm>(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return virements.filter((v) => {
      if (status && v.status !== status) return false;
      if (!q) return true;
      return (
        v.reference.toLowerCase().includes(q) ||
        v.fromLine.toLowerCase().includes(q) ||
        v.toLine.toLowerCase().includes(q) ||
        v.raisedBy.toLowerCase().includes(q)
      );
    });
  }, [virements, query, status]);

  const pendingCount = virements.filter((v) => v.status === 'pending').length;
  const approvedTotal = virements.filter((v) => v.status === 'approved').reduce((s, v) => s + v.amount, 0);

  const nextReference = () => {
    const max = virements.reduce((m, v) => {
      const n = Number(v.reference.split('-').pop());
      return Number.isFinite(n) && n > m ? n : m;
    }, 40);
    return `VIR-2026-${String(max + 1).padStart(4, '0')}`;
  };

  const save = () => {
    if (!form.fromLine.trim() || !form.toLine.trim()) {
      toast.error('From and to lines are required');
      return;
    }
    virementsStore.create({
      reference: nextReference(),
      fromLine: form.fromLine,
      toLine: form.toLine,
      amount: form.amount,
      reason: form.reason,
      status: 'draft',
      raisedBy: 'Current user',
      raisedOn: '2026-09-14'
    });
    toast.success('Virement drafted');
    setCreating(false);
  };

  const submit = (v: Virement) => {
    virementsStore.update(v.id, { status: 'pending' });
    toast.success(`${v.reference} submitted for approval`);
  };

  const approve = (v: Virement) => {
    virementsStore.update(v.id, { status: 'approved' });
    toast.success(`${v.reference} approved`);
  };

  const columns: Column<Virement>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular font-medium text-ink">{r.reference}</span> },
    { id: 'fromLine', header: 'From line', width: 190, sortValue: (r) => r.fromLine, cell: (r) => <span className="block truncate">{r.fromLine}</span> },
    { id: 'toLine', header: 'To line', width: 190, sortValue: (r) => r.toLine, cell: (r) => <span className="block truncate">{r.toLine}</span> },
    { id: 'amount', header: 'Amount', numeric: true, width: 150, sortValue: (r) => r.amount, cell: (r) => formatMoney(r.amount), total: (all) => formatMoney(all.reduce((s, r) => s + r.amount, 0)) },
    { id: 'raisedBy', header: 'Raised by', width: 150, defaultHidden: true, sortValue: (r) => r.raisedBy, cell: (r) => r.raisedBy },
    { id: 'raisedOn', header: 'Raised on', width: 130, sortValue: (r) => r.raisedOn, cell: (r) => <span className="tabular">{formatDate(r.raisedOn)}</span> },
    { id: 'status', header: 'Status', width: 150, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/budgeting/virements']?.trail ?? ['Budgeting', 'Plan', 'Virements']}
        title="Virements"
        meta={
          <>
            <span className="tabular">{virements.length} virements</span>
            <span aria-hidden>·</span>
            <span>{pendingCount} pending approval</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot raise virements'} onClick={openNew}>
            New virement
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Virements" value={String(virements.length)} />
          <StatTile label="Pending approval" value={String(pendingCount)} footnote="Awaiting a decision" />
          <StatTile label="Approved value" value={formatMoney(approvedTotal)} />
        </div>

        <DataTable
          caption="Budget virements"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={() => {
            setStatus('');
            setQuery('');
          }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference, line or requester"
              chips={status ? [{ id: 'status', label: 'Status', value: STATUS_LABELS[status as VirementStatus] }] : []}
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
                  options={[{ value: '', label: 'All statuses' }, ...VIREMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
                />
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              {r.status === 'draft' && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={SendIcon}
                  disabled={!can.create}
                  title={can.create ? undefined : 'Your role cannot submit virements'}
                  onClick={() => submit(r)}
                >
                  Submit
                </Button>
              )}
              {r.status === 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={CheckCircle2Icon}
                  disabled={!can.approve}
                  title={can.approve ? undefined : 'Your role cannot approve virements'}
                  onClick={() => approve(r)}
                >
                  Approve
                </Button>
              )}
            </div>
          )}
        />
      </div>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New virement"
        subtitle="Move budget between two lines"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              Create draft
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Transfer" description="The budget line to reduce and the line to increase.">
            <Field label="From line" span={12} required>
              <Input value={form.fromLine} onChange={(e) => setForm((f) => ({ ...f, fromLine: e.target.value }))} placeholder="e.g. Travel & subsistence" />
            </Field>
            <Field label="To line" span={12} required>
              <Input value={form.toLine} onChange={(e) => setForm((f) => ({ ...f, toLine: e.target.value }))} placeholder="e.g. ICT equipment" />
            </Field>
            <Field label="Amount" span={6}>
              <Input numeric type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} />
            </Field>
          </FormSection>

          <FormSection title="Justification" description="Why the reallocation is needed.">
            <Field label="Reason" span={12}>
              <Textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Explain the reallocation" />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
