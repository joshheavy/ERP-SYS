'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { useCan } from '../../../contexts/PreferencesContext';
import { applicationsStore, type Application, type ApplicationStage } from '../../../data/recruitment';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

const STAGES: ApplicationStage[] = ['applied', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];
const STAGE_LABEL: Record<ApplicationStage, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected'
};
const STAGE_PILL: Record<ApplicationStage, string> = {
  applied: 'bg-surface-3 text-ink-muted',
  shortlisted: 'bg-info-soft text-info',
  interview: 'bg-warning-soft text-warning',
  offer: 'bg-primary-soft text-primary-text',
  hired: 'bg-success-soft text-success',
  rejected: 'bg-danger-soft text-danger'
};

function StagePill({ stage }: { stage: ApplicationStage }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-caption font-medium ${STAGE_PILL[stage]}`}>
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function Applications() {
  const can = useCan();
  const applications = useCollection(applicationsStore);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = applications.find((a) => a.id === activeId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (stage && a.stage !== stage) return false;
      if (!q) return true;
      return a.applicant.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q);
    });
  }, [applications, query, stage]);

  const advance = (a: Application, next: ApplicationStage) => {
    applicationsStore.update(a.id, { stage: next });
    toast.success(`${a.applicant} moved to ${STAGE_LABEL[next]}`);
  };

  const columns: Column<Application>[] = [
    { id: 'applicant', header: 'Applicant', width: 200, sortValue: (r) => r.applicant, cell: (r) => <span className="font-medium text-ink">{r.applicant}</span> },
    { id: 'email', header: 'Email', width: 240, sortValue: (r) => r.email, cell: (r) => <span className="block truncate text-ink-muted">{r.email}</span> },
    { id: 'jobTitle', header: 'Applied for', width: 200, sortValue: (r) => r.jobTitle, cell: (r) => r.jobTitle },
    { id: 'appliedOn', header: 'Applied', width: 130, sortValue: (r) => r.appliedOn, cell: (r) => formatDate(r.appliedOn) },
    { id: 'rating', header: 'Rating', numeric: true, width: 90, sortValue: (r) => r.rating ?? 0, cell: (r) => (r.rating ? `${r.rating}/5` : '—') },
    { id: 'stage', header: 'Stage', width: 120, sortValue: (r) => r.stage, cell: (r) => <StagePill stage={r.stage} /> }
  ];

  const clearAll = () => { setQuery(''); setStage(''); };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/recruitment/applications']?.trail ?? ['Human Resources', 'Recruitment', 'Applications']}
        title="Applications"
        meta={<span className="tabular">{applications.length} applications</span>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Total applications" value={String(applications.length)} />
          <StatTile label="In interview" value={String(applications.filter((a) => a.stage === 'interview').length)} />
          <StatTile label="Hired" value={String(applications.filter((a) => a.stage === 'hired').length)} />
        </div>
        <DataTable
          caption="Applications"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          activeRowId={active?.id}
          filtered={Boolean(stage) || query.length > 0}
          onClearFilters={clearAll}
          onRowClick={(r) => setActiveId(r.id)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search applicant, email or job"
              chips={stage ? [{ id: 'stage', label: 'Stage', value: STAGE_LABEL[stage as ApplicationStage] }] : []}
              onRemoveChip={() => setStage('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  options={[{ value: '', label: 'All stages' }, ...STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s] }))]}
                />
              }
            />
          }
        />
      </div>
      <Drawer
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        width="md"
        title={active?.applicant ?? ''}
        subtitle={active ? `${active.jobTitle} · applied ${formatDate(active.appliedOn)}` : undefined}
        headerAccessory={active && <StagePill stage={active.stage} />}
        footer={
          active && (
            <>
              <Button variant="ghost" onClick={() => setActiveId(null)}>Close</Button>
            </>
          )
        }
      >
        {active && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-4">
              {[
                { label: 'Applicant', value: active.applicant },
                { label: 'Email', value: active.email },
                { label: 'Applied for', value: active.jobTitle },
                { label: 'Applied on', value: formatDate(active.appliedOn) },
                { label: 'Rating', value: active.rating ? `${active.rating}/5` : '—' },
                { label: 'Stage', value: STAGE_LABEL[active.stage] }
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{item.label}</dt>
                  <dd className="mt-0.5 text-body text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="p-4">
              <h3 className="mb-1 text-h3 text-ink">Advance stage</h3>
              <p className="mb-3 text-small text-ink-muted">Move this applicant to the next stage of the pipeline.</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === active.stage ? 'primary' : 'secondary'}
                    disabled={!can.create || s === active.stage}
                    onClick={() => advance(active, s)}
                  >
                    {STAGE_LABEL[s]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
