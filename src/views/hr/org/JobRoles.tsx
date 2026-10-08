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
import { jobRolesStore, jobGradesStore, departmentsStore, type JobRole } from '../../../data/orgStructure';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import type { Column } from '../../../components/data-table/types';

type RoleForm = Omit<JobRole, 'id'>;
const emptyForm: RoleForm = { title: '', grade: 'G3', department: 'Finance', headcount: 1 };

export function JobRoles() {
  const can = useCan();
  const roles = useCollection(jobRolesStore);
  const grades = useCollection(jobGradesStore);
  const departments = useCollection(departmentsStore);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (r: JobRole) => { const { id, ...rest } = r; void id; setForm(rest); setEditing(r.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => {
      if (department && r.department !== department) return false;
      return !q || r.title.toLowerCase().includes(q) || r.grade.toLowerCase().includes(q);
    });
  }, [roles, query, department]);

  const save = () => {
    if (!form.title.trim()) { toast.error('Role title is required'); return; }
    if (editing === 'new') { jobRolesStore.create(form); toast.success(`Role ${form.title} created`); }
    else if (editing) { jobRolesStore.update(editing, form); toast.success(`Role ${form.title} updated`); }
    setEditing(null);
  };
  const remove = (r: JobRole) => { jobRolesStore.remove(r.id); toast.success(`Role ${r.title} removed`); };

  const gradeCodes = grades.map((g) => g.code);
  const deptNames = departments.map((d) => d.name);
  const totalHeadcount = roles.reduce((s, r) => s + r.headcount, 0);

  const columns: Column<JobRole>[] = [
    { id: 'title', header: 'Role', width: 240, sortValue: (r) => r.title, cell: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { id: 'grade', header: 'Grade', width: 110, sortValue: (r) => r.grade, cell: (r) => <span className="tabular">{r.grade}</span> },
    { id: 'department', header: 'Department', width: 200, sortValue: (r) => r.department, cell: (r) => r.department },
    { id: 'headcount', header: 'Headcount', numeric: true, width: 120, sortValue: (r) => r.headcount, cell: (r) => r.headcount, total: (all) => all.reduce((s, r) => s + r.headcount, 0) }
  ];

  const clearAll = () => { setQuery(''); setDepartment(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/org/roles']?.trail ?? ['Human Resources', 'Organization', 'Job roles']}
        title="Job roles"
        meta={<><span className="tabular">{roles.length} roles</span><span aria-hidden>·</span><span className="tabular">{totalHeadcount} positions</span></>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New role</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Roles" value={String(roles.length)} />
          <StatTile label="Positions" value={String(totalHeadcount)} />
          <StatTile label="Departments" value={String(new Set(roles.map((r) => r.department)).size)} />
        </div>
        <DataTable
          caption="Job roles"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(department) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search role or grade"
              chips={department ? [{ id: 'dept', label: 'Department', value: department }] : []}
              onRemoveChip={() => setDepartment('')}
              onClearAll={clearAll}
              controls={<Select className="w-48" aria-label="Filter by department" value={department} onChange={(e) => setDepartment(e.target.value)} options={[{ value: '', label: 'All departments' }, ...deptNames.map((d) => ({ value: d, label: d }))]} />}
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
        title={editing === 'new' ? 'New job role' : 'Edit job role'}
        subtitle={editing === 'new' ? 'Add a titled position' : form.title}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create role' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Role details" description="A titled position mapped to a grade and department.">
            <Field label="Title" span={12} required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Payroll Officer" /></Field>
            <Field label="Grade" span={6}>
              <Select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} options={gradeCodes.map((c) => ({ value: c, label: c }))} />
            </Field>
            <Field label="Headcount" span={6}><Input numeric type="number" value={form.headcount} onChange={(e) => setForm((f) => ({ ...f, headcount: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Department" span={12}>
              <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} options={deptNames.map((d) => ({ value: d, label: d }))} />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
