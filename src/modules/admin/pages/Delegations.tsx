'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, UserCheckIcon, UserXIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { useCan } from '../../../contexts/PreferencesContext';
import { useDelegation } from '../../../contexts/DelegationContext';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { delegationsStore, type Delegation } from '../../../data/users';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';
import type { Role } from '../../../types/common';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Approver' },
  { value: 'officer', label: 'Officer' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'employee', label: 'Employee' }
];

const STATUS_STYLE: Record<Delegation['status'], string> = {
  active: 'bg-success-soft text-success',
  revoked: 'bg-surface-3 text-ink-muted',
  expired: 'bg-warning-soft text-warning'
};

interface DelegationForm {
  from: string;
  role: string;
  roleId: Role;
  to: string;
  scope: string;
  until: string;
}
const emptyForm: DelegationForm = { from: '', role: '', roleId: 'manager', to: '', scope: '', until: '2026-09-30' };

export function Delegations() {
  const can = useCan();
  const { active, isActing, startActing, stopActing } = useDelegation();
  const delegations = useCollection(delegationsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<DelegationForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (d: Delegation) => { setForm({ from: d.from, role: d.role, roleId: d.roleId, to: d.to, scope: d.scope, until: d.until }); setEditing(d.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return delegations.filter((d) => {
      if (status && d.status !== status) return false;
      return !q || d.from.toLowerCase().includes(q) || d.to.toLowerCase().includes(q) || d.scope.toLowerCase().includes(q);
    });
  }, [delegations, query, status]);

  const activeCount = delegations.filter((d) => d.status === 'active').length;

  const save = () => {
    if (!form.from.trim() || !form.to.trim()) { toast.error('Both people are required'); return; }
    if (editing === 'new') { delegationsStore.create({ ...form, status: 'active' }); toast.success('Delegation created'); }
    else if (editing) { delegationsStore.update(editing, form); toast.success('Delegation updated'); }
    setEditing(null);
  };

  const revoke = (d: Delegation) => {
    if (active?.id === d.id) stopActing();
    delegationsStore.update(d.id, { status: 'revoked' });
    toast.success(`Delegation from ${d.from} revoked`);
  };

  const remove = (d: Delegation) => {
    if (active?.id === d.id) stopActing();
    delegationsStore.remove(d.id);
    toast.success('Delegation removed');
  };

  const columns: Column<Delegation>[] = [
    {
      id: 'from', header: 'Delegated by', width: 190, sortValue: (r) => r.from, cell: (r) => (
        <span className="min-w-0"><span className="block truncate font-medium text-ink">{r.from}</span><span className="block truncate text-caption text-ink-subtle">{r.role}</span></span>
      )
    },
    { id: 'to', header: 'Acts as', width: 160, sortValue: (r) => r.to, cell: (r) => <span className="block truncate">{r.to}</span> },
    { id: 'roleId', header: 'Role', width: 120, sortValue: (r) => r.roleId, cell: (r) => ROLE_OPTIONS.find((o) => o.value === r.roleId)?.label ?? r.roleId },
    { id: 'scope', header: 'Scope', width: 260, sortValue: (r) => r.scope, cell: (r) => <span className="block truncate text-ink-muted">{r.scope}</span> },
    { id: 'until', header: 'Until', width: 120, sortValue: (r) => r.until, cell: (r) => <span className="tabular">{formatDate(r.until)}</span> },
    {
      id: 'status', header: 'Status', width: 110, sortValue: (r) => r.status, cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium capitalize', STATUS_STYLE[r.status])}>{r.status}</span>
      )
    }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/delegations']?.trail ?? ['Administration', 'Access control', 'Delegations']}
        title="Role delegations"
        meta={<span className="tabular">{delegations.length} delegations · {activeCount} active</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New delegation</Button>}
      />

      {isActing && active && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-info-soft px-5 py-3">
          <p className="flex items-center gap-2 text-small text-info">
            <UserCheckIcon className="h-4 w-4" aria-hidden />
            You are acting for <strong className="font-semibold">{active.from}</strong> — {active.scope}
          </p>
          <Button size="sm" variant="secondary" icon={UserXIcon} onClick={stopActing}>Stop acting</Button>
        </div>
      )}

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Active delegations" value={String(activeCount)} />
          <StatTile label="Total" value={String(delegations.length)} />
          <StatTile label="Currently acting as" value={active ? active.from : 'Nobody'} />
        </div>

        <DataTable
          caption="Role delegations"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search person or scope"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={<Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'All statuses' }, ...(['active', 'revoked', 'expired'] as Delegation['status'][]).map((s) => ({ value: s, label: s }))]} />}
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              {r.status === 'active' && (
                active?.id === r.id ? (
                  <Button size="sm" variant="ghost" icon={UserXIcon} onClick={stopActing}>Stop</Button>
                ) : (
                  <Button size="sm" variant="ghost" icon={UserCheckIcon} onClick={() => startActing(r)}>Act as</Button>
                )
              )}
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label="Edit delegation" disabled={!can.create} onClick={() => openEdit(r)} />
              {r.status === 'active' && (
                <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label="Revoke delegation" disabled={!can.create} onClick={() => revoke(r)} />
              )}
              {r.status !== 'active' && (
                <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label="Delete delegation" disabled={!can.create} onClick={() => remove(r)} />
              )}
            </div>
          )}
        />
        <p className="text-caption text-ink-subtle">
          Acting under a delegation temporarily switches your role — the sidebar, dashboard and what you can approve
          all follow the delegated role until you stop.
        </p>
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New delegation' : 'Edit delegation'}
        subtitle="Delegate authority while someone is away"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create delegation' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Delegation" description="Who hands over authority, to whom, and for what.">
            <Field label="Delegated by" span={6} required><Input value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} placeholder="e.g. David Kimani" /></Field>
            <Field label="Their job title" span={6}><Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Head of Finance" /></Field>
            <Field label="Acts as (person)" span={6} required><Input value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="e.g. Faith Njoroge" /></Field>
            <Field label="Delegated role" span={6} required><Select value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value as Role }))} options={ROLE_OPTIONS} /></Field>
            <Field label="Scope" span={12}><Textarea rows={2} value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} placeholder="e.g. Requisitions up to KSh 5,000,000.00" /></Field>
            <Field label="Until" span={6}><Input type="date" value={form.until} onChange={(e) => setForm((f) => ({ ...f, until: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
