'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { jobsStore, type Job, type JobStatus } from '../../../data/recruitment';
import { DEPARTMENTS, GRADES } from '../../../data/employees';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

type JobForm = Omit<Job, 'id'>;
const emptyForm: JobForm = {
  reference: '',
  title: '',
  department: DEPARTMENTS[0],
  grade: GRADES[0],
  positions: 1,
  status: 'open',
  postedOn: new Date().toISOString().slice(0, 10),
  closingOn: new Date().toISOString().slice(0, 10)
};

const STATUS_LABEL: Record<JobStatus, string> = { open: 'Open', closed: 'Closed', onHold: 'On hold' };
const STATUS_PILL: Record<JobStatus, string> = {
  open: 'bg-success-soft text-success',
  closed: 'bg-surface-3 text-ink-muted',
  onHold: 'bg-warning-soft text-warning'
};

function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${STATUS_PILL[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Jobs() {
  const can = useCan();
  const jobs = useCollection(jobsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (j: Job) => { const { id, ...rest } = j; void id; setForm(rest); setEditing(j.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status && j.status !== status) return false;
      if (!q) return true;
      return j.title.toLowerCase().includes(q) || j.reference.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
    });
  }, [jobs, query, status]);

  const save = () => {
    if (!form.reference.trim() || !form.title.trim()) { toast.error('Reference and title are required'); return; }
    if (form.positions < 1) { toast.error('Positions must be at least 1'); return; }
    if (editing === 'new') { jobsStore.create(form); toast.success(`Job ${form.title} created`); }
    else if (editing) { jobsStore.update(editing, form); toast.success(`Job ${form.title} updated`); }
    setEditing(null);
  };
  const remove = (j: Job) => { jobsStore.remove(j.id); toast.success(`Job ${j.title} removed`); };

  const openJobs = jobs.filter((j) => j.status === 'open');
  const columns: Column<Job>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'title', header: 'Title', width: 220, sortValue: (r) => r.title, cell: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { id: 'department', header: 'Department', width: 180, sortValue: (r) => r.department, cell: (r) => r.department },
    { id: 'grade', header: 'Grade', width: 90, sortValue: (r) => r.grade, cell: (r) => <span className="tabular">{r.grade}</span> },
    { id: 'positions', header: 'Positions', numeric: true, width: 100, sortValue: (r) => r.positions, cell: (r) => r.positions },
    { id: 'closingOn', header: 'Closing', width: 130, sortValue: (r) => r.closingOn, cell: (r) => formatDate(r.closingOn) },
    { id: 'status', header: 'Status', width: 110, sortValue: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/recruitment/jobs']?.trail ?? ['Human Resources', 'Recruitment', 'Jobs']}
        title="Jobs"
        meta={<span className="tabular">{jobs.length} requisitions</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New job</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open jobs" value={String(openJobs.length)} />
          <StatTile label="Total positions" value={String(openJobs.reduce((s, j) => s + j.positions, 0))} />
          <StatTile label="Closed" value={String(jobs.filter((j) => j.status === 'closed').length)} />
        </div>
        <DataTable
          caption="Jobs"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search title, reference or department"
              chips={status ? [{ id: 'status', label: 'Status', value: STATUS_LABEL[status as JobStatus] }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-40"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...(['open', 'closed', 'onHold'] as JobStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
                />
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.title}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.title}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New job' : 'Edit job'}
        subtitle={editing === 'new' ? 'Raise a job requisition' : form.reference}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create job' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Job details" description="Position, department and posting window.">
            <Field label="Reference" span={4} required><Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="font-mono" /></Field>
            <Field label="Title" span={8} required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Department" span={6}><Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} /></Field>
            <Field label="Grade" span={3}><Select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} options={GRADES.map((g) => ({ value: g, label: g }))} /></Field>
            <Field label="Positions" span={3}><Input numeric type="number" min={1} value={form.positions} onChange={(e) => setForm((f) => ({ ...f, positions: Number(e.target.value) || 1 }))} /></Field>
            <Field label="Posted on" span={4}><Input type="date" value={form.postedOn} onChange={(e) => setForm((f) => ({ ...f, postedOn: e.target.value }))} /></Field>
            <Field label="Closing on" span={4}><Input type="date" value={form.closingOn} onChange={(e) => setForm((f) => ({ ...f, closingOn: e.target.value }))} /></Field>
            <Field label="Status" span={4}><Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as JobStatus }))} options={(['open', 'closed', 'onHold'] as JobStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
