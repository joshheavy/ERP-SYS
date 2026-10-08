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
import { Toggle } from '../../../components/ui/Choice';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { branchesStore, type Branch } from '../../../data/orgStructure';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import type { Column } from '../../../components/data-table/types';

type BranchForm = Omit<Branch, 'id'>;
const emptyForm: BranchForm = { code: '', name: '', town: '', manager: '', active: true };

export function Branches() {
  const can = useCan();
  const branches = useCollection(branchesStore);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (b: Branch) => { const { id, ...rest } = b; void id; setForm(rest); setEditing(b.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.town.toLowerCase().includes(q));
  }, [branches, query]);

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { branchesStore.create(form); toast.success(`Branch ${form.name} created`); }
    else if (editing) { branchesStore.update(editing, form); toast.success(`Branch ${form.name} updated`); }
    setEditing(null);
  };
  const remove = (b: Branch) => { branchesStore.remove(b.id); toast.success(`Branch ${b.name} removed`); };

  const columns: Column<Branch>[] = [
    { id: 'code', header: 'Code', width: 90, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'Branch', width: 240, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'town', header: 'Town', width: 150, sortValue: (r) => r.town, cell: (r) => r.town },
    { id: 'manager', header: 'Manager', width: 180, sortValue: (r) => r.manager, cell: (r) => r.manager },
    { id: 'active', header: 'Status', width: 110, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Closed') }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/org/branches']?.trail ?? ['Human Resources', 'Organization', 'Branches']}
        title="Branches"
        meta={<span className="tabular">{branches.length} branches</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New branch</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Branches" value={String(branches.length)} />
          <StatTile label="Active" value={String(branches.filter((b) => b.active).length)} />
          <StatTile label="Towns" value={String(new Set(branches.map((b) => b.town)).size)} />
        </div>
        <DataTable
          caption="Branches"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={query.length > 0}
          onClearFilters={() => setQuery('')}
          onRowClick={(r) => openEdit(r)}
          toolbar={<FilterBar query={query} onQueryChange={setQuery} placeholder="Search branch, code or town" chips={[]} onRemoveChip={() => {}} onClearAll={() => setQuery('')} />}
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
        title={editing === 'new' ? 'New branch' : 'Edit branch'}
        subtitle={editing === 'new' ? 'Add a branch' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create branch' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Branch details" description="Identify the branch and who runs it.">
            <Field label="Code" span={4} required><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" /></Field>
            <Field label="Name" span={8} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Town" span={6}><Input value={form.town} onChange={(e) => setForm((f) => ({ ...f, town: e.target.value }))} /></Field>
            <Field label="Manager" span={6}><Input value={form.manager} onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))} /></Field>
            <div className="col-span-12">
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Active</span>
                <Toggle checked={form.active} onChange={() => setForm((f) => ({ ...f, active: !f.active }))} aria-label="Active" />
              </label>
            </div>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
