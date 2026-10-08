'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  holidaysStore,
  HOLIDAY_TYPES,
  HOLIDAY_TYPE_LABEL,
  type Holiday,
  type HolidayType
} from '../../data/holidays';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

type HolidayForm = Omit<Holiday, 'id'>;
const emptyForm: HolidayForm = { name: '', date: '2026-01-01', type: 'public', recurring: false, notes: '' };

/** Weekday name for an ISO date, or '' if unparseable. */
function weekday(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { weekday: 'long' });
}

function TypePill({ type }: { type: HolidayType }) {
  const cls = type === 'public' ? 'bg-info-soft text-info' : 'bg-surface-3 text-ink-muted';
  return <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${cls}`}>{HOLIDAY_TYPE_LABEL[type]}</span>;
}

export function Holidays() {
  const can = useCan();
  const holidays = useCollection(holidaysStore);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<HolidayForm>(emptyForm);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (h: Holiday) => { const { id, ...rest } = h; void id; setForm(rest); setEditing(h.id); };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return holidays
      .filter((h) => {
        if (type && h.type !== type) return false;
        return !q || h.name.toLowerCase().includes(q);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, query, type]);

  const save = () => {
    if (!form.name.trim() || !form.date) { toast.error('Name and date are required'); return; }
    if (editing === 'new') { holidaysStore.create(form); toast.success(`${form.name} added`); }
    else if (editing) { holidaysStore.update(editing, form); toast.success(`${form.name} updated`); }
    setEditing(null);
  };
  const remove = (h: Holiday) => { holidaysStore.remove(h.id); toast.success(`${h.name} removed`); };

  const columns: Column<Holiday>[] = [
    { id: 'name', header: 'Holiday', width: 240, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'date', header: 'Date', width: 130, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    { id: 'weekday', header: 'Day', width: 120, sortValue: (r) => r.date, cell: (r) => weekday(r.date) },
    { id: 'type', header: 'Type', width: 110, sortValue: (r) => r.type, cell: (r) => <TypePill type={r.type} /> },
    { id: 'recurring', header: 'Recurring', width: 110, sortValue: (r) => (r.recurring ? 1 : 0), cell: (r) => (r.recurring ? 'Yes' : 'One-off') }
  ];

  const clearAll = () => { setQuery(''); setType(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/holidays']?.trail ?? ['Human Resources', 'Organization', 'Holidays']}
        title="Holidays"
        meta={<span className="tabular">{holidays.length} holidays</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New holiday</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Holidays" value={String(holidays.length)} footnote="This calendar year" />
          <StatTile label="Public" value={String(holidays.filter((h) => h.type === 'public').length)} />
          <StatTile label="Company" value={String(holidays.filter((h) => h.type === 'company').length)} />
        </div>
        <DataTable
          caption="Holiday calendar"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(type) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search holiday name"
              chips={type ? [{ id: 'type', label: 'Type', value: HOLIDAY_TYPE_LABEL[type as HolidayType] }] : []}
              onRemoveChip={() => setType('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-40"
                  aria-label="Filter by type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[{ value: '', label: 'All types' }, ...HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABEL[t] }))]}
                />
              }
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
        title={editing === 'new' ? 'New holiday' : 'Edit holiday'}
        subtitle={editing === 'new' ? 'Add a holiday to the calendar' : form.name}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Add holiday' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Holiday details" description="When it falls and whether it recurs each year.">
            <Field label="Name" span={12} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Madaraka Day" /></Field>
            <Field label="Date" span={6} required><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Type" span={6}>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as HolidayType }))} options={HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABEL[t] }))} />
            </Field>
            <div className="col-span-12">
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Recurring (same date every year)</span>
                <Toggle checked={form.recurring} onChange={() => setForm((f) => ({ ...f, recurring: !f.recurring }))} aria-label="Recurring" />
              </label>
            </div>
            <Field label="Notes" span={12}><Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional" /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
