'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { Avatar } from '../../../components/approval/StatusTimeline';
import { auditStore, type AuditEntry } from '../../../data/adminOps';
import { useCollection } from '../../../core/store/createCollection';
import { MODULES, ROUTE_META } from '../../../data/navigation';
import { formatDateTime } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';
import type { ModuleId } from '../../../types/common';

const OUTCOME_STYLE: Record<AuditEntry['outcome'], string> = {
  created: 'bg-info-soft text-info',
  updated: 'bg-surface-3 text-ink-muted',
  approved: 'bg-success-soft text-success',
  rejected: 'bg-danger-soft text-danger',
  deleted: 'bg-danger-soft text-danger',
  login: 'bg-primary-soft text-primary-text',
  logout: 'bg-surface-3 text-ink-muted'
};

function moduleLabel(id: ModuleId): string {
  return MODULES.find((m) => m.id === id)?.label ?? id;
}

/** Audit trail — read-only record of who did what, across every module. */
export function AuditTrail() {
  const entries = useCollection(auditStore);
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((e) => {
        if (outcome && e.outcome !== outcome) return false;
        return !q || e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q);
      });
  }, [entries, query, outcome]);

  const columns: Column<AuditEntry>[] = [
    { id: 'at', header: 'When', width: 170, sortValue: (r) => r.at, cell: (r) => <span className="tabular">{formatDateTime(r.at)}</span> },
    {
      id: 'actor', header: 'Actor', width: 220, sortValue: (r) => r.actor, cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={r.actor} />
          <span className="min-w-0">
            <span className="block truncate text-ink">{r.actor}</span>
            <span className="block truncate text-caption text-ink-subtle">{r.actorRole}</span>
          </span>
        </span>
      )
    },
    { id: 'action', header: 'Action', width: 200, sortValue: (r) => r.action, cell: (r) => r.action },
    { id: 'entity', header: 'Record', width: 160, sortValue: (r) => r.entity, cell: (r) => <span className="tabular">{r.entity}</span> },
    { id: 'module', header: 'Module', width: 140, sortValue: (r) => r.module, cell: (r) => moduleLabel(r.module) },
    {
      id: 'outcome', header: 'Outcome', width: 120, sortValue: (r) => r.outcome, cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium capitalize', OUTCOME_STYLE[r.outcome])}>{r.outcome}</span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/audit']?.trail ?? ['Administration', 'Audit & security', 'Audit trail']}
        title="Audit trail"
        meta={<span className="tabular">{entries.length} recorded events</span>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Events" value={String(entries.length)} />
          <StatTile label="Approvals" value={String(entries.filter((e) => e.outcome === 'approved').length)} />
          <StatTile label="Actors" value={String(new Set(entries.map((e) => e.actor)).size)} />
        </div>
        <DataTable
          caption="Audit trail"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(outcome) || query.length > 0}
          onClearFilters={() => { setOutcome(''); setQuery(''); }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search actor, action or record"
              chips={outcome ? [{ id: 'outcome', label: 'Outcome', value: outcome }] : []}
              onRemoveChip={() => setOutcome('')}
              onClearAll={() => { setOutcome(''); setQuery(''); }}
              controls={
                <Select className="w-44" aria-label="Filter by outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} options={[{ value: '', label: 'All outcomes' }, ...(['created', 'updated', 'approved', 'rejected', 'deleted', 'login', 'logout'] as AuditEntry['outcome'][]).map((o) => ({ value: o, label: o }))]} />
              }
            />
          }
        />
      </div>
    </div>
  );
}
