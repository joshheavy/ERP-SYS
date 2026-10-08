'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import { fiscalPeriodsStore, type FiscalPeriod, type PeriodStatus } from '../../data/financeConfig';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { DocumentStatus } from '../../types/common';

const STATUS_MAP: Record<PeriodStatus, { status: DocumentStatus; label: string }> = {
  open: { status: 'approved', label: 'Open' },
  closed: { status: 'posted', label: 'Closed' },
  future: { status: 'draft', label: 'Future' }
};

type PeriodForm = Omit<FiscalPeriod, 'id'>;
const emptyForm: PeriodForm = { code: '', name: '', startDate: '', endDate: '', status: 'future' };

export function FiscalPeriods() {
  const can = useCan();
  const periods = useCollection(fiscalPeriodsStore);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<PeriodForm>(emptyForm);

  const rows = useMemo(() => [...periods].sort((a, b) => a.code.localeCompare(b.code)), [periods]);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (p: FiscalPeriod) => { const { id, ...rest } = p; void id; setForm(rest); setEditing(p.id); };

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return; }
    if (editing === 'new') { fiscalPeriodsStore.create(form); toast.success(`Period ${form.name} created`); }
    else if (editing) { fiscalPeriodsStore.update(editing, form); toast.success(`Period ${form.name} updated`); }
    setEditing(null);
  };

  const toggleClose = (p: FiscalPeriod) => {
    const next: PeriodStatus = p.status === 'closed' ? 'open' : 'closed';
    fiscalPeriodsStore.update(p.id, { status: next });
    toast.success(`${p.name} ${next === 'closed' ? 'closed' : 're-opened'}`);
  };

  const columns: Column<FiscalPeriod>[] = [
    { id: 'code', header: 'Code', width: 110, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    { id: 'name', header: 'Period', width: 170, sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: 'start', header: 'Start', width: 130, sortValue: (r) => r.startDate, cell: (r) => <span className="tabular">{formatDate(r.startDate)}</span> },
    { id: 'end', header: 'End', width: 130, sortValue: (r) => r.endDate, cell: (r) => <span className="tabular">{formatDate(r.endDate)}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={STATUS_MAP[r.status].status} label={STATUS_MAP[r.status].label} /> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/periods']?.trail ?? ['Finance', 'Configuration', 'Fiscal periods']}
        title="Fiscal periods"
        meta={<span className="tabular">{periods.length} periods · {periods.filter((p) => p.status === 'open').length} open</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New period</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open period" value={periods.find((p) => p.status === 'open')?.name ?? 'None'} />
          <StatTile label="Closed" value={String(periods.filter((p) => p.status === 'closed').length)} />
          <StatTile label="Future" value={String(periods.filter((p) => p.status === 'future').length)} />
        </div>
        <DataTable
          caption="Fiscal periods"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          onRowClick={(r) => openEdit(r)}
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              {r.status !== 'future' && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={r.status === 'closed' ? UnlockIcon : LockIcon}
                  disabled={!can.approve}
                  title={can.approve ? undefined : 'Only an approver can open/close periods'}
                  onClick={() => toggleClose(r)}
                >
                  {r.status === 'closed' ? 'Re-open' : 'Close'}
                </Button>
              )}
            </div>
          )}
        />
      </div>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New fiscal period' : 'Edit fiscal period'}
        subtitle={editing === 'new' ? 'Add an accounting period' : form.code}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Create period' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Period" description="Code, name and date range.">
            <Field label="Code" span={6} required hint="YYYY-MM"><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" placeholder="2026-10" /></Field>
            <Field label="Name" span={6} required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="October 2026" /></Field>
            <Field label="Start date" span={6}><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="End date" span={6}><Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
