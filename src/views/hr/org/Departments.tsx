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
import { departmentsStore, branchesStore, type Department } from '../../../data/orgStructure';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import type { Column } from '../../../components/data-table/types';

type DepartmentForm = Omit<Department, 'id'>;
const emptyForm: DepartmentForm = { code: '', name: '', head: '', branch: '' };

export function Departments() {
  const can = useCan();
  const departments = useCollection(departmentsStore);
  const branches = useCollection(branchesStore);
  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);

  const branchNames = branches.map((b) => b.name);
  const openNew = () => { setForm({ ...emptyForm, branch: branchNames[0] ?? '' }); setEditing('new'); };
  const openEdit = (d: Department) => { const { id, ...rest } = d; void id; setForm(rest); setEditing(d.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return departments.filter((d) => {
      if (branch && d.branch !== branch) return false;
      return !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.head.toLowerCase().includes(q);
    });
  }, [departments, query, branch]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { departmentsStore.create(form); toast.success(`Department ${form.name} created`); }
    else if (editing) { departmentsStore.update(editing, form); toast.success(`Department ${form.name} updated`); }
    setEditing(null);
  };
  const remove = (d: Department) => { departmentsStore.remove(d.id); toast.success(`Department ${d.name} removed`); };

  const columns: Column<Department>[] = [
    { id: 'code', header: 'Code', width: 90, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'Department', width: 220, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'head', header: 'Head', width: 180, sortValue: (r) => r.head, cell: (r) => r.head },
    { id: 'branch', header: 'Branch', width: 200, sortValue: (r) => r.branch, cell: (r) => r.branch }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/org/departments']?.trail ?? ['Human Resources', 'Organization', 'Departments']}
        title="Departments"
        meta={<span className="tabular">{departments.length} departments</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New department</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Departments" value={String(departments.length)} />
          <StatTile label="Branches covered" value={String(new Set(departments.map((d) => d.branch)).size)} />
          <StatTile label="Heads assigned" value={String(departments.filter((d) => d.head).length)} />
        </div>
        <DataTable
          caption="Departments"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(branch) || query.length > 0}
          onClearFilters={() => { setBranch(''); setQuery(''); }}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search department, code or head"
              chips={branch ? [{ id: 'branch', label: 'Branch', value: branch }] : []}
              onRemoveChip={() => setBranch('')}
              onClearAll={() => { setBranch(''); setQuery(''); }}
              controls={<Select className="w-52" aria-label="Filter by branch" value={branch} onChange={(e) => setBranch(e.target.value)} options={[{ value: '', label: 'All branches' }, ...branchNames.map((b) => ({ value: b, label: b }))]} />}
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.name}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New department' : 'Edit department'}
        subtitle={editing === 'new' ? 'Add a department' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create department' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Department details" description="Identify the department, its head and branch.">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" /></Field>
            <Field label="Name" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Head of department" span={6}><Input value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} /></Field>
            <Field label="Branch" span={6}><Select value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} options={branchNames.map((b) => ({ value: b, label: b }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
