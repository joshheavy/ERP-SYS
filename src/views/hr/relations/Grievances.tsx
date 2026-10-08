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
import {
  grievancesStore,
  type Grievance,
  type CaseStatus,
  type GrievanceCategory,
  type GrievanceSeverity
} from '../../../data/relations';
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

const CATEGORIES: GrievanceCategory[] = ['Workplace', 'Pay', 'Harassment', 'Other'];
const SEVERITIES: GrievanceSeverity[] = ['low', 'medium', 'high'];
const SEVERITY_LABEL: Record<GrievanceSeverity, string> = { low: 'Low', medium: 'Medium', high: 'High' };
const SEVERITY_PILL: Record<GrievanceSeverity, string> = {
  low: 'bg-surface-3 text-ink-muted',
  medium: 'bg-warning-soft text-warning',
  high: 'bg-danger-soft text-danger'
};

function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const m = STATUS_MAP[status];
  return <StatusBadge status={m.status} label={m.label} />;
}
function SeverityPill({ severity }: { severity: GrievanceSeverity }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${SEVERITY_PILL[severity]}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

interface GrievanceForm {
  reference: string;
  employee: string;
  category: GrievanceCategory;
  severity: GrievanceSeverity;
  summary: string;
}
const emptyForm: GrievanceForm = { reference: '', employee: '', category: 'Workplace', severity: 'low', summary: '' };

export function Grievances() {
  const can = useCan();
  const grievances = useCollection(grievancesStore);
  const employees = useCollection(employeesStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<GrievanceForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = grievances.find((g) => g.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grievances.filter((g) => {
      if (status && g.status !== status) return false;
      if (!q) return true;
      return g.employee.toLowerCase().includes(q) || g.reference.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q);
    });
  }, [grievances, query, status]);

  const create = () => {
    if (!form.employee.trim() || !form.summary.trim()) { toast.error('Employee and summary are required'); return; }
    const next = grievances.length + 1;
    grievancesStore.create({
      reference: form.reference.trim() || `GRV-2026-${String(next).padStart(4, '0')}`,
      employee: form.employee,
      category: form.category,
      severity: form.severity,
      status: 'open',
      raisedOn: new Date().toISOString().slice(0, 10),
      summary: form.summary
    });
    toast.success('Grievance logged');
    setCreating(false);
    setForm(emptyForm);
  };

  const setStatusOf = (g: Grievance, nextStatus: CaseStatus, msg: string) => {
    grievancesStore.update(g.id, { status: nextStatus });
    toast.success(msg);
  };

  const columns: Column<Grievance>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'employee', header: 'Employee', width: 170, sortValue: (r) => r.employee, cell: (r) => <span className="font-medium text-ink">{r.employee}</span> },
    { id: 'category', header: 'Category', width: 130, sortValue: (r) => r.category, cell: (r) => r.category },
    { id: 'severity', header: 'Severity', width: 110, sortValue: (r) => r.severity, cell: (r) => <SeverityPill severity={r.severity} /> },
    { id: 'raisedOn', header: 'Raised', width: 130, sortValue: (r) => r.raisedOn, cell: (r) => formatDate(r.raisedOn) },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <CaseStatusBadge status={r.status} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/relations/grievances']?.trail ?? ['Human Resources', 'Employee relations', 'Grievances']}
        title="Grievances"
        meta={<span className="tabular">{grievances.length} cases</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => { setForm(emptyForm); setCreating(true); }}>Log grievance</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open" value={String(grievances.filter((g) => g.status === 'open').length)} />
          <StatTile label="Reviewing" value={String(grievances.filter((g) => g.status === 'reviewing').length)} />
          <StatTile label="High severity" value={String(grievances.filter((g) => g.severity === 'high').length)} />
        </div>
        <DataTable
          caption="Grievances"
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
              placeholder="Search employee, reference or summary"
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
        subtitle={active ? `${active.employee} · ${active.category}` : undefined}
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
                { label: 'Category', value: active.category },
                { label: 'Severity', value: SEVERITY_LABEL[active.severity] },
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
              <h3 className="mb-1 text-h3 text-ink">Summary</h3>
              <p className="text-small text-ink-muted">{active.summary}</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="Log grievance"
        subtitle="Record an employee grievance"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Log grievance</Button></>}
      >
        <div className="p-1">
          <FormSection title="Grievance details" description="Who raised it, its nature and severity.">
            <Field label="Reference" span={6} hint="Auto if left blank"><Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="font-mono" /></Field>
            <Field label="Employee" span={6} required><Select value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))} options={[{ value: '', label: 'Select employee' }, ...employees.map((emp) => ({ value: emp.name, label: emp.name }))]} /></Field>
            <Field label="Category" span={6}><Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GrievanceCategory }))} options={CATEGORIES.map((c) => ({ value: c, label: c }))} /></Field>
            <Field label="Severity" span={6}><Select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as GrievanceSeverity }))} options={SEVERITIES.map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))} /></Field>
            <Field label="Summary" span={12} required><Textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
