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
import { jobStepsStore, jobGradesStore, type JobStep } from '../../../data/orgStructure';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

interface StepForm {
  grade: string;
  notch: number;
  salary: number;
}
const emptyForm: StepForm = { grade: 'G3', notch: 1, salary: 0 };

export function JobSteps() {
  const can = useCan();
  const steps = useCollection(jobStepsStore);
  const grades = useCollection(jobGradesStore);
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<StepForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (s: JobStep) => { setForm({ grade: s.grade, notch: s.notch, salary: s.salary }); setEditing(s.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return steps
      .filter((s) => {
        if (grade && s.grade !== grade) return false;
        return !q || s.code.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.grade === b.grade ? a.notch - b.notch : a.grade.localeCompare(b.grade)));
  }, [steps, query, grade]);

  const save = () => {
    if (!form.grade.trim() || form.salary <= 0) { toast.error('Grade and a salary are required'); return; }
    const code = `${form.grade}/${form.notch}`;
    if (editing === 'new') { jobStepsStore.create({ ...form, code }); toast.success(`Step ${code} created`); }
    else if (editing) { jobStepsStore.update(editing, { ...form, code }); toast.success(`Step ${code} updated`); }
    setEditing(null);
  };
  const remove = (s: JobStep) => { jobStepsStore.remove(s.id); toast.success(`Step ${s.code} removed`); };

  const gradeCodes = grades.map((g) => g.code);

  const columns: Column<JobStep>[] = [
    { id: 'code', header: 'Step', width: 110, sortValue: (r) => r.code, cell: (r) => <span className="tabular font-medium text-ink">{r.code}</span> },
    { id: 'grade', header: 'Grade', width: 110, sortValue: (r) => r.grade, cell: (r) => <span className="tabular">{r.grade}</span> },
    { id: 'notch', header: 'Notch', numeric: true, width: 100, sortValue: (r) => r.notch, cell: (r) => r.notch },
    { id: 'salary', header: 'Salary', numeric: true, width: 170, sortValue: (r) => r.salary, cell: (r) => formatMoney(r.salary) }
  ];

  const clearAll = () => { setQuery(''); setGrade(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/org/steps']?.trail ?? ['Human Resources', 'Organization', 'Job steps']}
        title="Job steps"
        meta={<span className="tabular">{steps.length} steps</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New step</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Steps" value={String(steps.length)} />
          <StatTile label="Grades covered" value={String(new Set(steps.map((s) => s.grade)).size)} />
          <StatTile label="Top step salary" value={steps.length ? formatMoney(Math.max(...steps.map((s) => s.salary))) : '—'} />
        </div>
        <DataTable
          caption="Job steps"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(grade) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search step code"
              chips={grade ? [{ id: 'grade', label: 'Grade', value: grade }] : []}
              onRemoveChip={() => setGrade('')}
              onClearAll={clearAll}
              controls={<Select className="w-36" aria-label="Filter by grade" value={grade} onChange={(e) => setGrade(e.target.value)} options={[{ value: '', label: 'All grades' }, ...gradeCodes.map((c) => ({ value: c, label: c }))]} />}
            />
          }
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
        title={editing === 'new' ? 'New job step' : 'Edit job step'}
        subtitle={editing === 'new' ? 'Add a salary step within a grade' : `${form.grade}/${form.notch}`}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create step' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Step details" description="A step is a salary notch within a grade.">
            <Field label="Grade" span={6} required>
              <Select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} options={gradeCodes.map((c) => ({ value: c, label: c }))} />
            </Field>
            <Field label="Notch" span={6} required><Input numeric type="number" value={form.notch} onChange={(e) => setForm((f) => ({ ...f, notch: Number(e.target.value) || 1 }))} /></Field>
            <Field label="Salary (KES)" span={12} required><Input numeric type="number" value={form.salary || ''} onChange={(e) => setForm((f) => ({ ...f, salary: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
