'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { Avatar } from '../../components/approval/StatusTimeline';
import { useCan } from '../../contexts/PreferencesContext';
import {
  employeesStore,
  DEPARTMENTS,
  GRADES,
  type Employee,
  type EmployeeStatus
} from '../../data/employees';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { Column } from '../../components/data-table/types';

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: 'Active',
  probation: 'Probation',
  onLeave: 'On leave',
  exited: 'Exited'
};

const STATUS_STYLE: Record<EmployeeStatus, string> = {
  active: 'bg-success-soft text-success',
  probation: 'bg-warning-soft text-warning',
  onLeave: 'bg-info-soft text-info',
  exited: 'bg-surface-3 text-ink-muted'
};

type EmployeeForm = Omit<Employee, 'id'>;

const emptyForm: EmployeeForm = {
  staffNo: '', name: '', email: '', phone: '', department: 'Finance', jobTitle: '',
  grade: 'G1', station: 'Nairobi HQ', joinedOn: '2026-01-01', status: 'probation',
  basicSalary: 0, kraPin: '', nssfNo: ''
};

export function Employees() {
  const can = useCan();
  const employees = useCollection(employeesStore);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Right drawer shows a detail view; editing swaps it to a form.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const active = employees.find((e) => e.id === activeId) ?? null;

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };
  const openEdit = (e: Employee) => {
    const { id, ...rest } = e;
    void id;
    setForm(rest);
    setEditing(e.id);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (department && e.department !== department) return false;
      if (status && e.status !== status) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || e.staffNo.toLowerCase().includes(q) || e.jobTitle.toLowerCase().includes(q);
    });
  }, [employees, query, department, status]);

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const onProbation = employees.filter((e) => e.status === 'probation').length;
  const payrollCost = employees.filter((e) => e.status !== 'exited').reduce((s, e) => s + e.basicSalary, 0);

  const save = () => {
    if (!form.name.trim() || !form.staffNo.trim()) {
      toast.error('Staff number and name are required');
      return;
    }
    if (editing === 'new') {
      const created = employeesStore.create(form);
      toast.success(`${form.name} added`);
      setEditing(null);
      setActiveId(created.id);
    } else if (editing) {
      employeesStore.update(editing, form);
      toast.success(`${form.name} updated`);
      setEditing(null);
    }
  };

  const remove = (e: Employee) => {
    employeesStore.remove(e.id);
    if (activeId === e.id) setActiveId(null);
    toast.success(`${e.name} removed`);
  };

  const columns: Column<Employee>[] = [
    {
      id: 'name', header: 'Employee', width: 240, sortValue: (r) => r.name, cell: (r) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={r.name} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{r.name}</span>
            <span className="tabular block text-caption text-ink-subtle">{r.staffNo}</span>
          </span>
        </span>
      )
    },
    { id: 'jobTitle', header: 'Job title', width: 180, sortValue: (r) => r.jobTitle, cell: (r) => <span className="block truncate">{r.jobTitle}</span> },
    { id: 'department', header: 'Department', width: 160, sortValue: (r) => r.department, cell: (r) => r.department },
    { id: 'grade', header: 'Grade', width: 80, sortValue: (r) => r.grade, cell: (r) => r.grade },
    { id: 'station', header: 'Station', width: 150, defaultHidden: true, sortValue: (r) => r.station, cell: (r) => r.station },
    {
      id: 'status', header: 'Status', width: 120, sortValue: (r) => r.status, cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', STATUS_STYLE[r.status])}>{STATUS_LABEL[r.status]}</span>
      )
    },
    { id: 'basicSalary', header: 'Basic salary', numeric: true, width: 150, sortValue: (r) => r.basicSalary, cell: (r) => formatMoney(r.basicSalary) }
  ];

  const clearAll = () => {
    setQuery('');
    setDepartment('');
    setStatus('');
  };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/employees']?.trail ?? ['Human Resources', 'People', 'Employees']}
        title="Employees"
        meta={
          <>
            <span className="tabular">{employees.length} employees</span>
            <span aria-hidden>·</span>
            <span>{activeCount} active</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot add employees'} onClick={openNew}>
            Add employee
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Monthly basic payroll" value={formatMoney(payrollCost)} footnote="Excludes exited staff" />
          <StatTile label="Active" value={String(activeCount)} />
          <StatTile label="On probation" value={String(onProbation)} />
        </div>

        <DataTable
          caption="Employee register"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(department) || Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search name, staff no or title"
              chips={[
                ...(department ? [{ id: 'dept', label: 'Department', value: department }] : []),
                ...(status ? [{ id: 'status', label: 'Status', value: STATUS_LABEL[status as EmployeeStatus] }] : [])
              ]}
              onRemoveChip={(id) => (id === 'dept' ? setDepartment('') : setStatus(''))}
              onClearAll={clearAll}
              controls={
                <>
                  <Select
                    className="w-44"
                    aria-label="Filter by department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    options={[{ value: '', label: 'All departments' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
                  />
                  <Select
                    className="w-40"
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[{ value: '', label: 'All statuses' }, ...(Object.keys(STATUS_LABEL) as EmployeeStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
                  />
                </>
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Remove ${r.name}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>

      {/* Detail drawer */}
      <Drawer
        open={Boolean(active) && editing === null}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.name ?? ''}
        subtitle={active ? `${active.jobTitle} · ${active.staffNo}` : undefined}
        headerAccessory={active && <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', STATUS_STYLE[active.status])}>{STATUS_LABEL[active.status]}</span>}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
              <Button variant="secondary" icon={PencilIcon} onClick={() => openEdit(active)} disabled={!can.create}>Edit</Button>
            </>
          )
        }
      >
        {active && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
            {[
              { label: 'Department', value: active.department },
              { label: 'Grade', value: active.grade },
              { label: 'Station', value: active.station },
              { label: 'Joined', value: formatDate(active.joinedOn) },
              { label: 'Email', value: active.email },
              { label: 'Phone', value: active.phone },
              { label: 'Basic salary', value: formatMoney(active.basicSalary) },
              { label: 'KRA PIN', value: active.kraPin },
              { label: 'NSSF no.', value: active.nssfNo }
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Drawer>

      {/* Create / edit drawer */}
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="lg"
        title={editing === 'new' ? 'Add employee' : 'Edit employee'}
        subtitle={editing === 'new' ? 'Create an employee record' : form.staffNo}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              {editing === 'new' ? 'Add employee' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Identity" description="Basic identification and contact details.">
            <Field label="Staff number" span={6} required>
              <Input value={form.staffNo} onChange={(e) => setForm((f) => ({ ...f, staffNo: e.target.value }))} className="font-mono" placeholder="EMT-0014" />
            </Field>
            <Field label="Full name" span={6} required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Email" span={6}>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Phone" span={6}>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+254…" />
            </Field>
          </FormSection>

          <FormSection title="Position" description="Where they sit in the organisation.">
            <Field label="Job title" span={6}>
              <Input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} />
            </Field>
            <Field label="Department" span={6}>
              <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
            </Field>
            <Field label="Grade" span={4}>
              <Select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} options={GRADES.map((g) => ({ value: g, label: g }))} />
            </Field>
            <Field label="Station" span={4}>
              <Input value={form.station} onChange={(e) => setForm((f) => ({ ...f, station: e.target.value }))} />
            </Field>
            <Field label="Status" span={4}>
              <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EmployeeStatus }))} options={(Object.keys(STATUS_LABEL) as EmployeeStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
            </Field>
            <Field label="Joined on" span={6}>
              <Input type="date" value={form.joinedOn} onChange={(e) => setForm((f) => ({ ...f, joinedOn: e.target.value }))} />
            </Field>
            <Field label="Basic salary (KES)" span={6}>
              <Input numeric type="number" value={form.basicSalary} onChange={(e) => setForm((f) => ({ ...f, basicSalary: Number(e.target.value) || 0 }))} />
            </Field>
          </FormSection>

          <FormSection title="Statutory" description="Kenyan tax and social security identifiers.">
            <Field label="KRA PIN" span={6}>
              <Input value={form.kraPin} onChange={(e) => setForm((f) => ({ ...f, kraPin: e.target.value }))} className="font-mono" />
            </Field>
            <Field label="NSSF number" span={6}>
              <Input value={form.nssfNo} onChange={(e) => setForm((f) => ({ ...f, nssfNo: e.target.value }))} className="font-mono" />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
