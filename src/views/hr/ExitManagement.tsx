'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon, PlayIcon, FlagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { FormSection, Field } from '../../components/forms/FormSection';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import {
  exitsStore,
  defaultClearance,
  clearanceProgress,
  clearanceComplete,
  EXIT_TYPES,
  EXIT_TYPE_LABEL,
  EXIT_STATUSES,
  EXIT_BADGE,
  type ExitCase,
  type ExitStatus,
  type ExitType
} from '../../data/exits';
import { employeesStore } from '../../data/employees';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

const TODAY = '2026-09-17';

interface ExitForm {
  employee: string;
  type: ExitType;
  reason: string;
  noticeDate: string;
  lastWorkingDay: string;
}
const emptyForm: ExitForm = { employee: '', type: 'resignation', reason: '', noticeDate: TODAY, lastWorkingDay: '' };

export function ExitManagement() {
  const can = useCan();
  const exits = useCollection(exitsStore);
  const employees = useCollection(employeesStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ExitForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = exits.find((e) => e.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exits.filter((e) => {
      if (status && e.status !== status) return false;
      if (!q) return true;
      return e.employee.toLowerCase().includes(q) || e.reference.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    });
  }, [exits, query, status]);

  const counts = useMemo(() => ({
    inProgress: exits.filter((e) => e.status === 'initiated' || e.status === 'clearance').length,
    approved: exits.filter((e) => e.status === 'approved').length,
    completed: exits.filter((e) => e.status === 'completed').length
  }), [exits]);

  const create = () => {
    const emp = employees.find((e) => e.name === form.employee);
    if (!emp) { toast.error('Select the departing employee'); return; }
    if (!form.lastWorkingDay) { toast.error('Set the last working day'); return; }
    const next = exits.length + 1;
    exitsStore.create({
      reference: `EXT-2026-${String(next).padStart(4, '0')}`,
      employee: emp.name,
      department: emp.department,
      jobTitle: emp.jobTitle,
      type: form.type,
      reason: form.reason.trim(),
      noticeDate: form.noticeDate,
      lastWorkingDay: form.lastWorkingDay,
      status: 'initiated',
      clearance: defaultClearance(),
      raisedBy: 'Mary Wanjiru'
    });
    toast.success('Exit case initiated');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (e: ExitCase, next: ExitStatus, msg: string) => {
    exitsStore.update(e.id, { status: next });
    toast.success(msg);
  };

  /** Toggle one clearance item; entering clearance from 'initiated' happens on first toggle. */
  const toggleClearance = (e: ExitCase, itemId: string) => {
    const clearance = e.clearance.map((i) => (i.id === itemId ? { ...i, cleared: !i.cleared } : i));
    exitsStore.update(e.id, { clearance, status: e.status === 'initiated' ? 'clearance' : e.status });
  };

  const columns: Column<ExitCase>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    {
      id: 'employee', header: 'Employee', width: 210, sortValue: (r) => r.employee, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{r.employee}</span>
          <span className="block truncate text-caption text-ink-subtle">{r.jobTitle} · {r.department}</span>
        </span>
      )
    },
    { id: 'type', header: 'Type', width: 140, sortValue: (r) => r.type, cell: (r) => EXIT_TYPE_LABEL[r.type] },
    { id: 'lastDay', header: 'Last day', width: 120, sortValue: (r) => r.lastWorkingDay, cell: (r) => <span className="tabular">{formatDate(r.lastWorkingDay)}</span> },
    {
      id: 'clearance', header: 'Clearance', width: 170, sortValue: (r) => clearanceProgress(r),
      cell: (r) => <ProgressBar value={r.clearance.filter((i) => i.cleared).length} max={r.clearance.length} size="sm" tone={clearanceComplete(r) ? 'success' : 'primary'} caption={`${Math.round(clearanceProgress(r) * 100)}%`} />
    },
    { id: 'status', header: 'Status', width: 140, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={EXIT_BADGE[r.status].status} label={EXIT_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/exits']?.trail ?? ['Human Resources', 'Offboarding', 'Exit management']}
        title="Exit management"
        meta={<><span className="tabular">{exits.length} cases</span><span aria-hidden>·</span><span>{counts.inProgress} in progress</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>New exit</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="In progress" value={String(counts.inProgress)} footnote="Initiated or in clearance" />
          <StatTile label="Approved" value={String(counts.approved)} />
          <StatTile label="Completed" value={String(counts.completed)} />
        </div>
        <DataTable
          caption="Employee exit cases"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          emptyTitle="No exit cases"
          emptyDescription="Initiate an exit when an employee is leaving."
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search employee, reference or department"
              chips={status ? [{ id: 'status', label: 'Status', value: EXIT_BADGE[status as ExitStatus].label }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...EXIT_STATUSES.map((s) => ({ value: s, label: EXIT_BADGE[s].label }))]}
                />
              }
            />
          }
        />
      </div>

      {/* Detail drawer: summary + clearance checklist + workflow */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? `${active.employee} · ${EXIT_TYPE_LABEL[active.type]}` : undefined}
        headerAccessory={active && <StatusBadge status={EXIT_BADGE[active.status].status} label={EXIT_BADGE[active.status].label} size="md" />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              {(active.status === 'initiated' || active.status === 'clearance') && (
                <Button variant="secondary" icon={XIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'rejected', `${active.reference} rejected`)}>Reject</Button>
              )}
              {active.status === 'initiated' && (
                <Button variant="primary" icon={PlayIcon} disabled={!can.create} onClick={() => setStatusOf(active, 'clearance', `${active.reference} moved to clearance`)}>Start clearance</Button>
              )}
              {active.status === 'clearance' && (
                <Button
                  variant="primary"
                  icon={CheckIcon}
                  disabled={!can.approve || !clearanceComplete(active)}
                  title={clearanceComplete(active) ? undefined : 'Complete all clearance items first'}
                  onClick={() => setStatusOf(active, 'approved', `${active.reference} approved`)}
                >
                  Approve exit
                </Button>
              )}
              {active.status === 'approved' && (
                <Button variant="primary" icon={FlagIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'completed', `${active.reference} completed`)}>Mark completed</Button>
              )}
            </>
          )
        }
      >
        {active && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-4">
              {[
                { label: 'Employee', value: active.employee },
                { label: 'Department', value: active.department },
                { label: 'Type', value: EXIT_TYPE_LABEL[active.type] },
                { label: 'Notice date', value: formatDate(active.noticeDate) },
                { label: 'Last working day', value: formatDate(active.lastWorkingDay) },
                { label: 'Raised by', value: active.raisedBy }
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>

            {active.reason && (
              <div className="border-b border-line p-4">
                <h3 className="mb-1 text-h4 text-ink">Reason</h3>
                <p className="text-small text-ink-muted">{active.reason}</p>
              </div>
            )}

            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-h4 text-ink">Clearance checklist</h3>
                <span className="tabular text-small text-ink-muted">
                  {active.clearance.filter((i) => i.cleared).length}/{active.clearance.length}
                </span>
              </div>
              <ProgressBar value={active.clearance.filter((i) => i.cleared).length} max={active.clearance.length} tone={clearanceComplete(active) ? 'success' : 'primary'} />
              <ul className="mt-3 space-y-1">
                {active.clearance.map((item) => {
                  const locked = active.status === 'approved' || active.status === 'completed' || active.status === 'rejected';
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2">
                      <span className="min-w-0">
                        <span className={item.cleared ? 'block text-body text-ink line-through' : 'block text-body text-ink'}>{item.label}</span>
                        <span className="block text-caption text-ink-subtle">{item.owner}</span>
                      </span>
                      <Toggle
                        checked={item.cleared}
                        disabled={locked || !can.edit}
                        onChange={() => toggleClearance(active, item.id)}
                        aria-label={`Mark ${item.label} ${item.cleared ? 'not cleared' : 'cleared'}`}
                      />
                    </li>
                  );
                })}
              </ul>
              {active.status === 'clearance' && !clearanceComplete(active) && (
                <p className="mt-2 text-caption text-ink-subtle">All items must be cleared before the exit can be approved.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="New exit"
        subtitle="Initiate an employee offboarding case"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Initiate exit</Button></>}
      >
        <div className="p-1">
          <FormSection title="Exit details" description="Who is leaving, why and when.">
            <Field label="Employee" span={12} required>
              <Select
                value={form.employee}
                onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                options={[{ value: '', label: 'Select employee' }, ...employees.filter((emp) => emp.status !== 'exited').map((emp) => ({ value: emp.name, label: `${emp.name} — ${emp.jobTitle}` }))]}
              />
            </Field>
            <Field label="Type" span={6}>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ExitType }))} options={EXIT_TYPES.map((t) => ({ value: t, label: EXIT_TYPE_LABEL[t] }))} />
            </Field>
            <Field label="Notice date" span={6}>
              <Input type="date" value={form.noticeDate} onChange={(e) => setForm((f) => ({ ...f, noticeDate: e.target.value }))} />
            </Field>
            <Field label="Last working day" span={6} required>
              <Input type="date" value={form.lastWorkingDay} onChange={(e) => setForm((f) => ({ ...f, lastWorkingDay: e.target.value }))} />
            </Field>
            <Field label="Reason" span={12}>
              <Textarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for leaving" />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
