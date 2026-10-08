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
import { StatusBadge } from '../../../components/approval/StatusBadge';
import { useCan } from '../../../contexts/PreferencesContext';
import { goalsStore, kpisStore, type Goal, type GoalStatus } from '../../../data/performance';
import { employeesStore } from '../../../data/employees';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import type { DocumentStatus } from '../../../types/common';
import type { Column } from '../../../components/data-table/types';

const STATUSES: GoalStatus[] = ['draft', 'active', 'reviewed'];
const STATUS_LABEL: Record<GoalStatus, string> = { draft: 'Draft', active: 'Active', reviewed: 'Reviewed' };
const STATUS_MAP: Record<GoalStatus, { status: DocumentStatus; label: string }> = {
  draft: { status: 'draft', label: 'Draft' },
  active: { status: 'pending', label: 'Active' },
  reviewed: { status: 'approved', label: 'Reviewed' }
};

function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const m = STATUS_MAP[status];
  return <StatusBadge status={m.status} label={m.label} />;
}

type GoalForm = Omit<Goal, 'id'>;
const emptyForm: GoalForm = { employee: '', kpi: '', target: 100, score: 0, period: '2026-Q1', status: 'draft' };

export function Goals() {
  const can = useCan();
  const goals = useCollection(goalsStore);
  const kpis = useCollection(kpisStore);
  const employees = useCollection(employeesStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = goals.find((g) => g.id === activeId) ?? null;
  const periods = useMemo(() => Array.from(new Set(goals.map((g) => g.period))).sort(), [goals]);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (g: Goal) => { const { id, ...rest } = g; void id; setForm(rest); setEditing(g.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return goals.filter((g) => {
      if (status && g.status !== status) return false;
      if (period && g.period !== period) return false;
      if (!q) return true;
      return g.employee.toLowerCase().includes(q) || g.kpi.toLowerCase().includes(q);
    });
  }, [goals, query, status, period]);

  const save = () => {
    if (!form.employee.trim() || !form.kpi.trim()) { toast.error('Employee and KPI are required'); return; }
    if (editing === 'new') { goalsStore.create(form); toast.success(`Goal for ${form.employee} created`); }
    else if (editing) { goalsStore.update(editing, form); toast.success(`Goal for ${form.employee} updated`); }
    setEditing(null);
  };
  const remove = (g: Goal) => { goalsStore.remove(g.id); toast.success(`Goal for ${g.employee} removed`); };

  const columns: Column<Goal>[] = [
    { id: 'employee', header: 'Employee', width: 180, sortValue: (r) => r.employee, cell: (r) => <span className="font-medium text-ink">{r.employee}</span> },
    { id: 'kpi', header: 'KPI', width: 280, sortValue: (r) => r.kpi, cell: (r) => <span className="block truncate">{r.kpi}</span> },
    { id: 'score', header: 'Score', numeric: true, width: 110, sortValue: (r) => r.score, cell: (r) => <span className="tabular">{r.score}/{r.target}</span> },
    { id: 'period', header: 'Period', width: 110, sortValue: (r) => r.period, cell: (r) => <span className="tabular">{r.period}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <GoalStatusBadge status={r.status} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); setPeriod(''); };

  const scored = goals.filter((g) => g.target > 0);
  const avgScore = scored.length ? Math.round(scored.reduce((s, g) => s + (g.score / g.target) * 100, 0) / scored.length) : 0;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/performance/goals']?.trail ?? ['Human Resources', 'Performance', 'Goals']}
        title="Goals"
        meta={<span className="tabular">{goals.length} goals</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New goal</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Goals" value={String(goals.length)} />
          <StatTile label="Average score" value={`${avgScore}%`} />
          <StatTile label="Reviewed" value={String(goals.filter((g) => g.status === 'reviewed').length)} />
        </div>
        <DataTable
          caption="Goals"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || Boolean(period) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search employee or KPI"
              chips={[
                ...(status ? [{ id: 'status', label: 'Status', value: STATUS_LABEL[status as GoalStatus] }] : []),
                ...(period ? [{ id: 'period', label: 'Period', value: period }] : [])
              ]}
              onRemoveChip={(id) => { if (id === 'status') setStatus(''); if (id === 'period') setPeriod(''); }}
              onClearAll={clearAll}
              controls={
                <div className="flex items-center gap-2">
                  <Select
                    className="w-36"
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))]}
                  />
                  <Select
                    className="w-36"
                    aria-label="Filter by period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    options={[{ value: '', label: 'All periods' }, ...periods.map((p) => ({ value: p, label: p }))]}
                  />
                </div>
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit goal for ${r.employee}`} onClick={() => openEdit(r)} />
              <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label={`Delete goal for ${r.employee}`} disabled={!can.create} onClick={() => remove(r)} />
            </div>
          )}
        />
      </div>

      {/* Detail drawer */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.employee ?? ''}
        subtitle={active ? `${active.kpi} · ${active.period}` : undefined}
        headerAccessory={active && <GoalStatusBadge status={active.status} />}
        footer={active && (<><Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button><Button variant="primary" onClick={() => { openEdit(active); setActiveId(null); }} disabled={!can.create}>Edit goal</Button></>)}
      >
        {active && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
            {[
              { label: 'Employee', value: active.employee },
              { label: 'KPI', value: active.kpi },
              { label: 'Score', value: `${active.score}/${active.target}` },
              { label: 'Achievement', value: `${active.target > 0 ? Math.round((active.score / active.target) * 100) : 0}%` },
              { label: 'Period', value: active.period },
              { label: 'Status', value: STATUS_LABEL[active.status] }
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Drawer>

      {/* Create/edit drawer */}
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New goal' : 'Edit goal'}
        subtitle={editing === 'new' ? 'Assign a KPI goal to an employee' : form.employee}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create goal' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Goal details" description="Employee, KPI, target and score.">
            <Field label="Employee" span={12} required>
              <Select value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))} options={[{ value: '', label: 'Select employee' }, ...employees.map((emp) => ({ value: emp.name, label: emp.name }))]} />
            </Field>
            <Field label="KPI" span={12} required>
              <Select value={form.kpi} onChange={(e) => setForm((f) => ({ ...f, kpi: e.target.value }))} options={[{ value: '', label: 'Select KPI' }, ...kpis.map((k) => ({ value: k.name, label: k.name }))]} />
            </Field>
            <Field label="Target" span={4}><Input numeric type="number" min={0} value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Score" span={4}><Input numeric type="number" min={0} value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Period" span={4}><Input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="2026-Q1" className="font-mono" /></Field>
            <Field label="Status" span={6}><Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as GoalStatus }))} options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
