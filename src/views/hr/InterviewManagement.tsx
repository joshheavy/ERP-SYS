'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, CheckIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import {
  interviewsStore,
  INTERVIEW_MODES,
  INTERVIEW_MODE_LABEL,
  INTERVIEW_STATUSES,
  INTERVIEW_BADGE,
  INTERVIEW_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_PILL,
  type Interview,
  type InterviewStatus,
  type InterviewMode,
  type InterviewOutcome
} from '../../data/interviews';
import { applicationsStore } from '../../data/recruitment';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

const TODAY = '2026-09-17';

interface ScheduleForm {
  applicant: string;
  round: number;
  mode: InterviewMode;
  scheduledOn: string;
  panel: string;
}
const emptyForm: ScheduleForm = { applicant: '', round: 1, mode: 'video', scheduledOn: TODAY, panel: '' };

interface OutcomeForm {
  outcome: InterviewOutcome;
  score: number;
  notes: string;
}

function OutcomePill({ outcome }: { outcome: InterviewOutcome }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${OUTCOME_PILL[outcome]}`}>{OUTCOME_LABEL[outcome]}</span>;
}

export function InterviewManagement() {
  const can = useCan();
  const interviews = useCollection(interviewsStore);
  const applications = useCollection(applicationsStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm] = useState<OutcomeForm | null>(null);

  const active = interviews.find((i) => i.id === activeId) ?? null;

  // Candidates available to schedule: applications at the interview stage.
  const interviewCandidates = useMemo(
    () => applications.filter((a) => a.stage === 'interview'),
    [applications]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interviews.filter((i) => {
      if (status && i.status !== status) return false;
      if (!q) return true;
      return i.applicant.toLowerCase().includes(q) || i.reference.toLowerCase().includes(q) || i.jobTitle.toLowerCase().includes(q);
    });
  }, [interviews, query, status]);

  const counts = useMemo(() => ({
    scheduled: interviews.filter((i) => i.status === 'scheduled').length,
    completed: interviews.filter((i) => i.status === 'completed').length,
    recommended: interviews.filter((i) => i.outcome === 'recommend').length
  }), [interviews]);

  const openDetail = (i: Interview) => {
    setActiveId(i.id);
    setOutcomeForm({ outcome: i.outcome ?? 'recommend', score: i.score ?? 3, notes: i.notes });
  };
  const closeDetail = () => {
    setActiveId(null);
    setOutcomeForm(null);
  };

  const schedule = () => {
    const candidate = applications.find((a) => a.id === form.applicant);
    if (!candidate) { toast.error('Select a candidate at the interview stage'); return; }
    if (!form.scheduledOn) { toast.error('Set an interview date'); return; }
    const next = interviews.length + 1;
    interviewsStore.create({
      reference: `ITV-2026-${String(next).padStart(4, '0')}`,
      applicant: candidate.applicant,
      jobTitle: candidate.jobTitle,
      round: form.round,
      mode: form.mode,
      scheduledOn: form.scheduledOn,
      panel: form.panel.split(',').map((p) => p.trim()).filter(Boolean),
      status: 'scheduled',
      outcome: null,
      score: null,
      notes: ''
    });
    toast.success('Interview scheduled');
    setCreating(false);
    setForm(emptyForm);
  };

  /** Complete an interview: record outcome/score, and move the linked application. */
  const complete = () => {
    if (!active || !outcomeForm) return;
    interviewsStore.update(active.id, {
      status: 'completed',
      outcome: outcomeForm.outcome,
      score: outcomeForm.score,
      notes: outcomeForm.notes
    });
    // Advance / reject the linked application (first match on name + job).
    const app = applications.find((a) => a.applicant === active.applicant && a.jobTitle === active.jobTitle);
    if (app) {
      if (outcomeForm.outcome === 'recommend') applicationsStore.update(app.id, { stage: 'offer' });
      else if (outcomeForm.outcome === 'reject') applicationsStore.update(app.id, { stage: 'rejected' });
    }
    const msg =
      outcomeForm.outcome === 'recommend' ? 'completed — candidate moved to offer' :
      outcomeForm.outcome === 'reject' ? 'completed — application rejected' :
      'completed — on hold';
    toast.success(`${active.reference} ${msg}`);
    closeDetail();
  };

  const cancel = (i: Interview) => {
    interviewsStore.update(i.id, { status: 'cancelled' });
    toast.success(`${i.reference} cancelled`);
  };

  const columns: Column<Interview>[] = [
    { id: 'reference', header: 'Reference', width: 140, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    {
      id: 'applicant', header: 'Candidate', width: 210, sortValue: (r) => r.applicant, cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{r.applicant}</span>
          <span className="block truncate text-caption text-ink-subtle">{r.jobTitle}</span>
        </span>
      )
    },
    { id: 'round', header: 'Round', width: 90, sortValue: (r) => r.round, cell: (r) => `R${r.round}` },
    { id: 'mode', header: 'Mode', width: 120, sortValue: (r) => r.mode, cell: (r) => INTERVIEW_MODE_LABEL[r.mode] },
    { id: 'scheduledOn', header: 'Scheduled', width: 130, sortValue: (r) => r.scheduledOn, cell: (r) => <span className="tabular">{formatDate(r.scheduledOn)}</span> },
    { id: 'score', header: 'Score', width: 90, numeric: true, sortValue: (r) => r.score ?? -1, cell: (r) => (r.score == null ? '—' : `${r.score}/5`) },
    { id: 'outcome', header: 'Outcome', width: 120, sortValue: (r) => r.outcome ?? '', cell: (r) => (r.outcome ? <OutcomePill outcome={r.outcome} /> : <span className="text-ink-subtle">—</span>) },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={INTERVIEW_BADGE[r.status].status} label={INTERVIEW_BADGE[r.status].label} /> }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/recruitment/interviews']?.trail ?? ['Human Resources', 'Recruitment', 'Interviews']}
        title="Interviews"
        meta={<><span className="tabular">{interviews.length} interviews</span><span aria-hidden>·</span><span>{counts.scheduled} scheduled</span></>}
        primaryAction={
          <Button
            variant="primary"
            icon={PlusIcon}
            disabled={!can.create}
            title={can.create ? undefined : 'Your role cannot schedule interviews'}
            onClick={() => { setForm(emptyForm); setCreating(true); }}
          >
            Schedule interview
          </Button>
        }
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Scheduled" value={String(counts.scheduled)} />
          <StatTile label="Completed" value={String(counts.completed)} />
          <StatTile label="Recommended" value={String(counts.recommended)} />
        </div>
        <DataTable
          caption="Interviews"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => openDetail(r)}
          emptyTitle="No interviews"
          emptyDescription="Schedule an interview for a shortlisted candidate."
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search candidate, reference or job"
              chips={status ? [{ id: 'status', label: 'Status', value: INTERVIEW_BADGE[status as InterviewStatus].label }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-40"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...INTERVIEW_STATUSES.map((s) => ({ value: s, label: INTERVIEW_BADGE[s].label }))]}
                />
              }
            />
          }
        />
      </div>

      {/* Detail / outcome drawer */}
      <Drawer
        open={Boolean(active)}
        onClose={closeDetail}
        width="md"
        title={active?.reference ?? ''}
        subtitle={active ? `${active.applicant} · ${active.jobTitle}` : undefined}
        headerAccessory={active && <StatusBadge status={INTERVIEW_BADGE[active.status].status} label={INTERVIEW_BADGE[active.status].label} size="md" />}
        footer={
          active && active.status === 'scheduled' && outcomeForm && (
            <>
              <Button variant="ghost" onClick={closeDetail}>Close</Button>
              <Button variant="secondary" icon={XIcon} disabled={!can.create} onClick={() => cancel(active)}>Cancel interview</Button>
              <Button variant="primary" icon={CheckIcon} disabled={!can.approve} title={can.approve ? undefined : 'Only an approver can record the outcome'} onClick={complete}>
                Record outcome
              </Button>
            </>
          )
        }
      >
        {active && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-4">
              {[
                { label: 'Candidate', value: active.applicant },
                { label: 'Job', value: active.jobTitle },
                { label: 'Round', value: `Round ${active.round}` },
                { label: 'Mode', value: INTERVIEW_MODE_LABEL[active.mode] },
                { label: 'Scheduled', value: formatDate(active.scheduledOn) },
                { label: 'Panel', value: active.panel.length ? active.panel.join(', ') : '—' }
              ].map((item) => (
                <div key={item.label} className={item.label === 'Panel' ? 'col-span-2' : undefined}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>

            {active.status === 'scheduled' && outcomeForm ? (
              <div className="p-1">
                <FormSection title="Record outcome" description="Recommend moves the candidate to offer; reject closes the application.">
                  <Field label="Outcome" span={6}>
                    <Select value={outcomeForm.outcome} onChange={(e) => setOutcomeForm((f) => (f ? { ...f, outcome: e.target.value as InterviewOutcome } : f))} options={INTERVIEW_OUTCOMES.map((o) => ({ value: o, label: OUTCOME_LABEL[o] }))} />
                  </Field>
                  <Field label="Score (out of 5)" span={6}>
                    <Select value={String(outcomeForm.score)} onChange={(e) => setOutcomeForm((f) => (f ? { ...f, score: Number(e.target.value) } : f))} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} / 5` }))} />
                  </Field>
                  <Field label="Panel notes" span={12}>
                    <Textarea rows={3} value={outcomeForm.notes} onChange={(e) => setOutcomeForm((f) => (f ? { ...f, notes: e.target.value } : f))} placeholder="Summary of the panel's assessment." />
                  </Field>
                </FormSection>
              </div>
            ) : (
              <div className="p-4">
                {active.outcome && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-caption uppercase tracking-wide text-ink-subtle">Outcome</span>
                    <OutcomePill outcome={active.outcome} />
                    {active.score != null && <span className="tabular text-small text-ink-muted">· {active.score}/5</span>}
                  </div>
                )}
                <h3 className="mb-1 text-h4 text-ink">Panel notes</h3>
                <p className="text-small text-ink-muted">{active.notes || 'No notes recorded.'}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Schedule drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title="Schedule interview"
        subtitle="Book an interview for a candidate at the interview stage"
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={schedule} disabled={!can.create}>Schedule</Button></>}
      >
        <div className="p-1">
          <FormSection title="Interview" description="Candidate, when and how.">
            <Field label="Candidate" span={12} required hint={interviewCandidates.length === 0 ? 'No applications are at the interview stage yet.' : undefined}>
              <Select
                value={form.applicant}
                onChange={(e) => setForm((f) => ({ ...f, applicant: e.target.value }))}
                options={[{ value: '', label: 'Select candidate' }, ...interviewCandidates.map((a) => ({ value: a.id, label: `${a.applicant} — ${a.jobTitle}` }))]}
              />
            </Field>
            <Field label="Round" span={6}>
              <Select value={String(form.round)} onChange={(e) => setForm((f) => ({ ...f, round: Number(e.target.value) }))} options={[1, 2, 3].map((n) => ({ value: String(n), label: `Round ${n}` }))} />
            </Field>
            <Field label="Mode" span={6}>
              <Select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as InterviewMode }))} options={INTERVIEW_MODES.map((m) => ({ value: m, label: INTERVIEW_MODE_LABEL[m] }))} />
            </Field>
            <Field label="Date" span={6} required>
              <Input type="date" value={form.scheduledOn} onChange={(e) => setForm((f) => ({ ...f, scheduledOn: e.target.value }))} />
            </Field>
            <Field label="Panel" span={12} hint="Comma-separated names">
              <Input value={form.panel} onChange={(e) => setForm((f) => ({ ...f, panel: e.target.value }))} placeholder="e.g. Faith Chebet, Brian Otieno" />
            </Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
