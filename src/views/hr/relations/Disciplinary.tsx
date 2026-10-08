'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, BanIcon, PlayIcon } from 'lucide-react';
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
import { disciplinaryStore, type DisciplinaryCase, type CaseStatus } from '../../../data/relations';
import { employeesStore } from '../../../data/employees';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate } from '../../../utils/format';
import type { DocumentStatus } from '../../../types/common';
import type { Column } from '../../../components/data-table/types';

const STATUSES: CaseStatus[] = ['open', 'reviewing', 'resolved', 'closed'];
const STATUS_LABEL: Record<CaseStatus, string> = { open: 'Open', reviewing: 'Reviewing', resolved: 'Resolved', closed: 'Closed' };
const STATUS_MAP: Record<CaseStatus, { status: DocumentStatus; label: string }> = {
  open: { status: 'submitted', label: 'Open' },
  reviewing: { status: 'pending', label: 'Reviewing' },
  resolved: { status: 'approved', label: 'Resolved' },
  closed: { status: 'cancelled', label: 'Closed' }
};

function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const m = STATUS_MAP[status];
  return <StatusBadge status={m.status} label={m.label} />;
}

interface CaseForm {
  reference: string;
  employee: string;
  violation: string;
  action: string;
  notes: string;
}
const emptyForm: CaseForm = { reference: '', employee: '', violation: '', action: '', notes: '' };

export function Disciplinary() {
  const can = useCan();
  const cases = useCollection(disciplinaryStore);
  const employees = useCollection(employeesStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CaseForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = cases.find((c) => c.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (status && c.status !== status) return false;
      if (!q) return true;
      return c.employee.toLowerCase().includes(q) || c.reference.toLowerCase().includes(q) || c.violation.toLowerCase().includes(q);
    });
  }, [cases, query, status]);

  const create = () => {
    if (!form.employee.trim() || !form.violation.trim()) { toast.error('Employee and violation are required'); return; }
    const next = cases.length + 1;
    disciplinaryStore.create({
      reference: form.reference.trim() || `DSC-2026-${String(next).padStart(4, '0')}`,
      employee: form.employee,
      violation: form.violation,
      action: form.action,
      status: 'open',
      raisedOn: new Date().toISOString().slice(0, 10),
      notes: form.notes
    });
    toast.success('Disciplinary case logged');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (c: DisciplinaryCase, nextStatus: CaseStatus, msg: string) => {
    disciplinaryStore.update(c.id, { status: nextStatus });
    toast.success(msg);
  };

  const columns: Column<DisciplinaryCase>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'employee', header: 'Employee', width: 170, sortValue: (r) => r.employee, cell: (r) => <span className="font-medium text-ink">{r.employee}</span> },
    { id: 'violation', header: 'Violation', width: 220, sortValue: (r) => r.violation, cell: (r) => <span className="block truncate">{r.violation}</span> },
    { id: 'action', header: 'Action', width: 180, sortValue: (r) => r.action, cell: (r) => <span className="block truncate text-ink-muted">{r.action || '—'}</span> },
    { id: 'raisedOn', header: 'Raised', width: 130, sortValue: (r) => r.raisedOn, cell: (r) => formatDate(r.raisedOn) },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <CaseStatusBadge status={r.status} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/relations/disciplinary']?.trail ?? ['Human Resources', 'Employee relations', 'Disciplinary']}
        title="Disciplinary"
        meta={<span className="tabular">{cases.length} cases</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>Log case</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open" value={String(cases.filter((c) => c.status === 'open').length)} />
          <StatTile label="Reviewing" value={String(cases.filter((c) => c.status === 'reviewing').length)} />
          <StatTile label="Resolved" value={String(cases.filter((c) => c.status === 'resolved').length)} />
        </div>
        <DataTable
          caption="Disciplinary cases"
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
              placeholder="Search employee, reference or violation"
              chips={status ? [{ id: 'status', label: 'Status', value: STATUS_LABEL[status as CaseStatus] }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-40"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
                />
              }
            />
          }
        />
      </div>

      {/* Detail drawer with workflow */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? `${active.employee} · ${active.violation}` : undefined}
        headerAccessory={active && <CaseStatusBadge status={active.status} />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              {active.status === 'open' && (
                <Button variant="primary" icon={PlayIcon} disabled={!can.create} onClick={() => setStatusOf(active, 'reviewing', `${active.reference} moved to review`)}>
                  Start review
                </Button>
              )}
              {active.status === 'reviewing' && (
                <>
                  <Button variant="secondary" icon={BanIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'closed', `${active.reference} closed`)}>
                    Close
                  </Button>
                  <Button variant="primary" icon={CheckIcon} disabled={!can.approve} onClick={() => setStatusOf(active, 'resolved', `${active.reference} resolved`)}>
                    Resolve
                  </Button>
                </>
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
                { label: 'Violation', value: active.violation },
                { label: 'Action', value: active.action || '—' },
                { label: 'Raised on', value: formatDate(active.raisedOn) },
                { label: 'Status', value: STATUS_LABEL[active.status] }
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="p-4">
              <h3 className="mb-1 text-h3 text-ink">Notes</h3>
              <p className="text-small text-ink-muted">{active.notes || 'No notes recorded.'}</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="Log disciplinary case"
        subtitle="Record a disciplinary matter"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Log case</Button></>}
      >
        <div className="p-1">
          <FormSection title="Case details" description="Employee, the violation and intended action.">
            <Field label="Reference" span={6} hint="Auto if left blank"><Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="font-mono" /></Field>
            <Field label="Employee" span={6} required><Select value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))} options={[{ value: '', label: 'Select employee' }, ...employees.map((emp) => ({ value: emp.name, label: emp.name }))]} /></Field>
            <Field label="Violation" span={12} required><Input value={form.violation} onChange={(e) => setForm((f) => ({ ...f, violation: e.target.value }))} /></Field>
            <Field label="Action" span={12}><Input value={form.action} onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))} placeholder="e.g. Verbal warning" /></Field>
            <Field label="Notes" span={12}><Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
