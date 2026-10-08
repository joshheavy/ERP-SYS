'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { jobGradesStore, type JobGrade } from '../../../data/orgStructure';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

type GradeForm = Omit<JobGrade, 'id'>;
const emptyForm: GradeForm = { code: '', name: '', minSalary: 0, maxSalary: 0 };

export function JobGrades() {
  const can = useCan();
  const grades = useCollection(jobGradesStore);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<GradeForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (g: JobGrade) => { const { id, ...rest } = g; void id; setForm(rest); setEditing(g.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grades.filter((g) => !q || g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q));
  }, [grades, query]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (form.maxSalary < form.minSalary) { toast.error('Maximum must be at least the minimum'); return; }
    if (editing === 'new') { jobGradesStore.create(form); toast.success(`Grade ${form.code} created`); }
    else if (editing) { jobGradesStore.update(editing, form); toast.success(`Grade ${form.code} updated`); }
    setEditing(null);
  };
  const remove = (g: JobGrade) => { jobGradesStore.remove(g.id); toast.success(`Grade ${g.code} removed`); };

  const columns: Column<JobGrade>[] = [
    { id: 'code', header: 'Grade', width: 90, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'name', header: 'Title', width: 220, sortValue: (r) => r.name, cell: (r) => r.name },
    { id: 'min', header: 'Min salary', numeric: true, width: 150, sortValue: (r) => r.minSalary, cell: (r) => formatMoney(r.minSalary) },
    { id: 'max', header: 'Max salary', numeric: true, width: 150, sortValue: (r) => r.maxSalary, cell: (r) => formatMoney(r.maxSalary) },
    { id: 'band', header: 'Band width', numeric: true, width: 150, sortValue: (r) => r.maxSalary - r.minSalary, cell: (r) => formatMoney(r.maxSalary - r.minSalary) }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/org/grades']?.trail ?? ['Human Resources', 'Organization', 'Job grades']}
        title="Job grades"
        meta={<span className="tabular">{grades.length} grades</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New grade</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Grades" value={String(grades.length)} />
          <StatTile label="Lowest min" value={formatMoney(Math.min(...grades.map((g) => g.minSalary)))} />
          <StatTile label="Highest max" value={formatMoney(Math.max(...grades.map((g) => g.maxSalary)))} />
        </div>
        <DataTable
          caption="Job grades"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={query.length > 0}
          onClearFilters={() => setQuery('')}
          onRowClick={(r) => openEdit(r)}
          toolbar={<FilterBar query={query} onQueryChange={setQuery} placeholder="Search grade or title" chips={[]} onRemoveChip={() => {}} onClearAll={() => setQuery('')} />}
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.code}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete ${r.code}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New job grade' : 'Edit job grade'}
        subtitle={editing === 'new' ? 'Add a salary grade' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create grade' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Grade details" description="Grade code, title and salary band.">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" /></Field>
            <Field label="Title" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Minimum salary (KES)" span={6}><Input numeric type="number" value={form.minSalary} onChange={(e) => setForm((f) => ({ ...f, minSalary: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Maximum salary (KES)" span={6}><Input numeric type="number" value={form.maxSalary} onChange={(e) => setForm((f) => ({ ...f, maxSalary: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
