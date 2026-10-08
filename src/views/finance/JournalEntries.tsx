'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNav } from '../../hooks/useNav';
import { CheckIcon, MoreHorizontalIcon, PlusIcon, SendIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Drawer } from '../../components/ui/Drawer';
import { Field, FormSection } from '../../components/forms/FormSection';
import { Tooltip } from '../../components/ui/Tooltip';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { StatusTimeline } from '../../components/approval/StatusTimeline';
import { useCan } from '../../contexts/PreferencesContext';
import { useCollection } from '../../core/store/createCollection';
import { journalsStore, nextJournalReference, type JournalEntry, type JournalLine } from '../../data/ledger';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney, formatPeriod } from '../../utils/format';
import type { DocumentStatus, TimelineEvent } from '../../types/common';
import type { Column } from '../../components/data-table/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'posted', label: 'Posted' },
  { value: 'cancelled', label: 'Cancelled' }];


const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Fixed Assets', label: 'Fixed Assets' },
  { value: 'Bank reconciliation', label: 'Bank reconciliation' }];

const CURRENT_PERIOD = '2026-09';

/** A friendly actor name for timeline entries, by role. Front-end only demo. */
function actorFor(role: string): { name: string; title: string } {
  switch (role) {
    case 'manager':
      return { name: 'David Kimani', title: 'Head of Finance' };
    case 'officer':
      return { name: 'Faith Njoroge', title: 'Finance Officer' };
    case 'auditor':
      return { name: 'Samuel Kiprono', title: 'Auditor' };
    default:
      return { name: 'System Administrator', title: 'Administrator' };
  }
}

function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

function makeEvent(actor: { name: string; title: string }, action: string, outcome: TimelineEvent['outcome'], comment?: string): TimelineEvent {
  return {
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    actor: actor.name,
    actorRole: actor.title,
    action,
    at: nowIso(),
    outcome,
    ...(comment ? { comment } : {})
  };
}

/* ------------------------------------------------------------------ *
 * New-journal draft line editor state.
 * ------------------------------------------------------------------ */
interface DraftLine {
  id: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
}

let draftLineSeq = 0;
function blankLine(): DraftLine {
  draftLineSeq += 1;
  return { id: `dl-${draftLineSeq}`, account: '', accountName: '', debit: 0, credit: 0, memo: '' };
}

export function JournalEntries() {
  const navigate = useNav();
  const can = useCan();
  const journals = useCollection(journalsStore);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  // Read the active row live from the store so status/timeline changes reflect immediately.
  const active = useMemo(() => journals.find((j) => j.id === activeId) ?? null, [journals, activeId]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return journals.filter((entry) => {
      if (status && entry.status !== status) return false;
      if (source && entry.source !== source) return false;
      if (!q) return true;
      return (
        entry.reference.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.preparedBy.toLowerCase().includes(q));

    });
  }, [journals, query, status, source]);

  /* ---- Workflow transitions (persisted) --------------------------- */
  const submitForApproval = (j: JournalEntry) => {
    const actor = actorFor(can.role);
    journalsStore.update(j.id, {
      status: 'pending',
      timeline: [...j.timeline, makeEvent(actor, 'submitted for approval', 'submitted')]
    });
    toast.success(`${j.reference} submitted for approval`);
  };

  const approve = (j: JournalEntry) => {
    const actor = actorFor(can.role);
    journalsStore.update(j.id, {
      status: 'approved',
      approvedBy: actor.name,
      timeline: [...j.timeline, makeEvent(actor, 'approved the journal', 'approved')]
    });
    toast.success(`${j.reference} approved`);
  };

  const post = (j: JournalEntry) => {
    const actor = actorFor(can.role);
    journalsStore.update(j.id, {
      status: 'posted',
      postedOn: nowIso().slice(0, 10),
      timeline: [...j.timeline, makeEvent(actor, 'posted to the general ledger', 'posted')]
    });
    toast.success(`${j.reference} posted to the ledger`, {
      description: 'The trial balance and account activity now include this journal.'
    });
  };

  const returnToPreparer = (j: JournalEntry) => {
    const actor = actorFor(can.role);
    journalsStore.update(j.id, {
      status: 'draft',
      timeline: [...j.timeline, makeEvent(actor, 'returned the journal to the preparer', 'rejected', 'Returned for correction.')]
    });
    toast.success(`${j.reference} returned to preparer`);
  };

  const columns: Column<JournalEntry>[] = [
    { id: 'reference', header: 'Reference', width: 172, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'description', header: 'Description', width: 260, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'status', header: 'Status', width: 148, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'period', header: 'Period', width: 124, sortValue: (r) => r.period, cell: (r) => formatPeriod(r.period) },
    { id: 'source', header: 'Source', width: 150, sortValue: (r) => r.source, cell: (r) => r.source },
    { id: 'costCentre', header: 'Cost centre', width: 160, defaultHidden: true, sortValue: (r) => r.costCentre, cell: (r) => r.costCentre },
    { id: 'debit', header: 'Debit', numeric: true, width: 148, sortValue: (r) => r.debit, cell: (r) => formatMoney(r.debit), total: (all) => formatMoney(all.reduce((sum, r) => sum + r.debit, 0)) },
    { id: 'credit', header: 'Credit', numeric: true, width: 148, sortValue: (r) => r.credit, cell: (r) => formatMoney(r.credit), total: (all) => formatMoney(all.reduce((sum, r) => sum + r.credit, 0)) },
    { id: 'preparedBy', header: 'Prepared by', width: 150, sortValue: (r) => r.preparedBy, cell: (r) => r.preparedBy },
    { id: 'postedOn', header: 'Posted', width: 130, sortValue: (r) => r.postedOn, cell: (r) => <span className="tabular">{formatDate(r.postedOn)}</span> }];


  const chips = [
    status && { id: 'status', label: 'Status', value: STATUS_OPTIONS.find((o) => o.value === status)!.label },
    source && { id: 'source', label: 'Source', value: source }].
    filter(Boolean) as { id: string; label: string; value: string; }[];

  const clearAll = () => {
    setStatus('');
    setSource('');
    setQuery('');
  };

  const postedCount = journals.filter((j) => j.status === 'posted').length;
  const pendingCount = journals.filter((j) => j.status === 'pending').length;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/journals'].trail}
        title="Journal entries"
        meta={
          <>
            <span className="tabular">{journals.length} entries</span>
            <span aria-hidden>·</span>
            <span className="tabular">{postedCount} posted</span>
            <span aria-hidden>·</span>
            <span className="tabular">{pendingCount} pending</span>
          </>
        }
        primaryAction={
          <Button
            variant="primary"
            icon={PlusIcon}
            disabled={!can.create}
            title={can.create ? undefined : 'Your role cannot create journal entries'}
            onClick={() => setCreating(true)}>

            New journal
          </Button>
        } />


      <div className="p-5">
        <DataTable
          caption="Journal entries for the open period"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          state={can.viewPayroll ? loading ? 'loading' : 'ready' : 'no-permission'}
          filtered={chips.length > 0 || query.length > 0}
          onClearFilters={clearAll}
          selectable
          showTotals
          pinFirstColumn
          activeRowId={active?.id}
          onRowClick={(row) => setActiveId(row.id)}
          emptyTitle="No journals in this period"
          emptyDescription="Journals appear here once they are generated by a module or entered manually."
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference or description"
              chips={chips}
              onRemoveChip={(id) => id === 'status' ? setStatus('') : setSource('')}
              onClearAll={clearAll}
              controls={
                <>
                  <Select className="w-40" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
                  <Select className="w-44" aria-label="Filter by source" value={source} onChange={(e) => setSource(e.target.value)} options={SOURCE_OPTIONS} />
                </>
              } />

          }
          bulkActions={[
            {
              id: 'approve',
              label: 'Approve',
              icon: CheckIcon,
              disabled: !can.approve,
              disabledReason: can.approve ? undefined : 'Only the Approver role can approve journals',
              onRun: (ids) => {
                const eligible = journals.filter((j) => ids.includes(j.id) && j.status === 'pending');
                eligible.forEach(approve);
                if (eligible.length === 0) toast.info('No pending journals in the selection');
              }
            },
            {
              id: 'reject',
              label: 'Return to preparer',
              icon: XIcon,
              tone: 'danger',
              disabled: !can.approve,
              disabledReason: can.approve ? undefined : 'Only the Approver role can return journals',
              onRun: (ids) => {
                const eligible = journals.filter((j) => ids.includes(j.id) && j.status === 'pending');
                eligible.forEach(returnToPreparer);
                if (eligible.length === 0) toast.info('No pending journals in the selection');
              }
            }]
          }
          rowActions={(row) =>
            <Tooltip label="Row actions">
              <Button size="sm" variant="ghost" iconOnly icon={MoreHorizontalIcon} aria-label={`Actions for ${row.reference}`} onClick={() => setActiveId(row.id)} />
            </Tooltip>
          } />

      </div>

      {/* Detail drawer with workflow actions driven by status + role. */}
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="lg"
        title={active?.reference ?? ''}
        subtitle={active?.description}
        headerAccessory={active && <StatusBadge status={active.status} size="md" />}
        footer={
          active &&
          <>
            <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
            {active.status === 'draft' &&
              <Button
                icon={SendIcon}
                disabled={!can.create}
                title={can.create ? undefined : 'Your role cannot submit journals'}
                onClick={() => submitForApproval(active)}>
                Submit for approval
              </Button>
            }
            {active.status === 'pending' &&
              <Button
                variant="ghost"
                icon={XIcon}
                disabled={!can.approve}
                title={can.approve ? undefined : 'Only the Approver role can return journals'}
                onClick={() => returnToPreparer(active)}>
                Return
              </Button>
            }
            {active.status === 'pending' &&
              <Button
                variant="primary"
                icon={CheckIcon}
                disabled={!can.approve}
                title={can.approve ? undefined : 'Only the Approver role can approve journals'}
                onClick={() => approve(active)}>
                Approve
              </Button>
            }
            {active.status === 'approved' &&
              <Button
                variant="primary"
                icon={CheckIcon}
                disabled={!can.post}
                title={can.post ? undefined : 'Your role cannot post to the ledger'}
                onClick={() => post(active)}>
                Post to ledger
              </Button>
            }
          </>
        }>

        {active &&
          <div className="divide-y divide-line">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-3">
              {[
                { label: 'Period', value: formatPeriod(active.period) },
                { label: 'Source', value: active.source },
                { label: 'Cost centre', value: active.costCentre },
                { label: 'Prepared by', value: active.preparedBy },
                { label: 'Approved by', value: active.approvedBy },
                { label: 'Posted on', value: active.status === 'posted' ? formatDate(active.postedOn) : '—' }].
                map((item) =>
                  <div key={item.label}>
                    <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                    <dd className="tabular mt-0.5 text-body text-ink">{item.value}</dd>
                  </div>
                )}
            </dl>

            <div className="px-4 py-4">
              <h3 className="mb-2 text-h3 text-ink">Journal lines</h3>
              <div className="overflow-hidden rounded-control border border-line">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line bg-surface-2">
                      <th className="px-2.5 py-1.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">Account</th>
                      <th className="px-2.5 py-1.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">Memo</th>
                      <th className="px-2.5 py-1.5 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">Debit</th>
                      <th className="px-2.5 py-1.5 text-right text-caption font-semibold uppercase tracking-wide text-ink-muted">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.lines.map((line) =>
                      <tr key={line.id} className="border-b border-line last:border-b-0">
                        <td className="px-2.5 py-1.5 text-body text-ink">
                          <span className="tabular text-ink-muted">{line.account}</span> {line.accountName}
                        </td>
                        <td className="px-2.5 py-1.5 text-small text-ink-muted">{line.memo}</td>
                        <td className="tabular px-2.5 py-1.5 text-right text-body text-ink">{line.debit ? formatMoney(line.debit) : '—'}</td>
                        <td className="tabular px-2.5 py-1.5 text-right text-body text-ink">{line.credit ? formatMoney(line.credit) : '—'}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-2">
                      <td className="px-2.5 py-2 text-body font-semibold text-ink" colSpan={2}>Total</td>
                      <td className="tabular px-2.5 py-2 text-right text-body font-semibold text-ink">{formatMoney(active.debit)}</td>
                      <td className="tabular px-2.5 py-2 text-right text-body font-semibold text-ink">{formatMoney(active.credit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="px-4 py-4">
              <h3 className="mb-3 text-h3 text-ink">Audit history</h3>
              <StatusTimeline events={active.timeline} />
            </div>
          </div>
        }
      </Drawer>

      <NewJournalDrawer
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(created) => {
          setCreating(false);
          setActiveId(created.id);
        }}
        actor={actorFor(can.role)}
        existing={journals} />

    </div>);

}

/* ------------------------------------------------------------------ *
 * New-journal drawer: dynamic balanced lines, must balance to post.
 * ------------------------------------------------------------------ */
interface NewJournalDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (created: JournalEntry) => void;
  actor: { name: string; title: string };
  existing: JournalEntry[];
}

function NewJournalDrawer({ open, onClose, onCreated, actor, existing }: NewJournalDrawerProps) {
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Manual');
  const [costCentre, setCostCentre] = useState('CC-100 Corporate');
  const [lines, setLines] = useState<DraftLine[]>([blankLine(), blankLine()]);

  // Reset the form whenever the drawer opens.
  useEffect(() => {
    if (open) {
      setDescription('');
      setSource('Manual');
      setCostCentre('CC-100 Corporate');
      setLines([blankLine(), blankLine()]);
    }
  }, [open]);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;
  const hasAccounts = lines.every((l) => (l.debit || l.credit ? l.account.trim().length > 0 : true));
  const canSave = balanced && hasAccounts && description.trim().length > 0;

  const updateLine = (id: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) => setLines((prev) => (prev.length > 2 ? prev.filter((l) => l.id !== id) : prev));
  const addLine = () => setLines((prev) => [...prev, blankLine()]);

  const save = (submit: boolean) => {
    if (!canSave) return;
    const reference = nextJournalReference(existing, CURRENT_PERIOD);
    const journalLines: JournalLine[] = lines
      .filter((l) => l.debit || l.credit)
      .map((l, i) => ({
        id: `${reference}-l${i + 1}`,
        account: l.account.trim(),
        accountName: l.accountName.trim() || l.account.trim(),
        costCentre: costCentre.split(' ')[0],
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo.trim()
      }));

    const status: DocumentStatus = submit ? 'pending' : 'draft';
    const timeline: TimelineEvent[] = [makeEvent(actor, 'created the journal', 'created')];
    if (submit) timeline.push(makeEvent(actor, 'submitted for approval', 'submitted'));

    const created = journalsStore.create({
      reference,
      description: description.trim(),
      period: CURRENT_PERIOD,
      postedOn: '—',
      source,
      costCentre,
      debit: totalDebit,
      credit: totalCredit,
      currency: 'KES',
      preparedBy: actor.name,
      approvedBy: '—',
      status,
      lines: journalLines,
      timeline
    });

    toast.success(`${reference} ${submit ? 'submitted for approval' : 'saved as draft'}`);
    onCreated(created);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title="New journal entry"
      subtitle="Debits must equal credits before the journal can be submitted."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSave} onClick={() => save(false)}>Save draft</Button>
          <Button
            variant="primary"
            icon={SendIcon}
            disabled={!canSave}
            title={canSave ? undefined : 'Add a description and balance the lines first'}
            onClick={() => save(true)}>
            Submit for approval
          </Button>
        </>
      }>

      <div className="p-1">
        <FormSection title="Header" description="What the journal records and where it belongs.">
          <Field label="Description" span={12} required>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. September rent accrual" />
          </Field>
          <Field label="Source" span={6}>
            <Select value={source} onChange={(e) => setSource(e.target.value)} options={SOURCE_OPTIONS.filter((o) => o.value)} />
          </Field>
          <Field label="Cost centre" span={6}>
            <Select
              value={costCentre}
              onChange={(e) => setCostCentre(e.target.value)}
              options={[
                { value: 'CC-100 Corporate', label: 'CC-100 Corporate' },
                { value: 'CC-110 Human Resources', label: 'CC-110 Human Resources' },
                { value: 'CC-210 Information Technology', label: 'CC-210 Information Technology' },
                { value: 'CC-320 Facilities', label: 'CC-320 Facilities' },
                { value: 'CC-410 Operations', label: 'CC-410 Operations' }]
              } />
          </Field>
        </FormSection>

        <FormSection title="Lines" description="Enter an amount in either Debit or Credit for each line.">
          <div className="col-span-12 space-y-2">
            <div className="grid grid-cols-12 gap-2 px-1 text-caption font-semibold uppercase tracking-wide text-ink-subtle">
              <span className="col-span-2">Account</span>
              <span className="col-span-3">Account name</span>
              <span className="col-span-2">Memo</span>
              <span className="col-span-2 text-right">Debit</span>
              <span className="col-span-2 text-right">Credit</span>
              <span className="col-span-1" />
            </div>
            {lines.map((line) =>
              <div key={line.id} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-2">
                  <Input value={line.account} onChange={(e) => updateLine(line.id, { account: e.target.value })} placeholder="6410" className="font-mono" aria-label="Account code" />
                </div>
                <div className="col-span-3">
                  <Input value={line.accountName} onChange={(e) => updateLine(line.id, { accountName: e.target.value })} placeholder="Repairs & maintenance" aria-label="Account name" />
                </div>
                <div className="col-span-2">
                  <Input value={line.memo} onChange={(e) => updateLine(line.id, { memo: e.target.value })} placeholder="Memo" aria-label="Memo" />
                </div>
                <div className="col-span-2">
                  <Input numeric type="number" value={line.debit || ''} onChange={(e) => updateLine(line.id, { debit: Number(e.target.value) || 0, credit: 0 })} aria-label="Debit" />
                </div>
                <div className="col-span-2">
                  <Input numeric type="number" value={line.credit || ''} onChange={(e) => updateLine(line.id, { credit: Number(e.target.value) || 0, debit: 0 })} aria-label="Credit" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label="Remove line" disabled={lines.length <= 2} onClick={() => removeLine(line.id)} />
                </div>
              </div>
            )}
            <Button size="sm" variant="ghost" icon={PlusIcon} onClick={addLine}>Add line</Button>

            <div className="mt-2 flex items-center justify-between rounded-control border border-line bg-surface-2 px-3 py-2">
              <span className={balanced ? 'text-small font-medium text-success' : 'text-small font-medium text-warning'}>
                {balanced ? 'Balanced' : totalDebit === totalCredit ? 'Enter amounts to balance' : 'Out of balance'}
              </span>
              <span className="tabular flex gap-4 text-small text-ink">
                <span>Debit {formatMoney(totalDebit)}</span>
                <span>Credit {formatMoney(totalCredit)}</span>
                <span className={totalDebit === totalCredit ? 'text-ink-subtle' : 'text-danger'}>
                  Δ {formatMoney(Math.abs(totalDebit - totalCredit))}
                </span>
              </span>
            </div>
          </div>
        </FormSection>
      </div>
    </Drawer>
  );
}
