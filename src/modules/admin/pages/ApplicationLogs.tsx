'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { logsStore, type AppLog } from '../../../data/adminOps';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDateTime } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';

const LEVEL_STYLE: Record<AppLog['level'], string> = {
  info: 'bg-info-soft text-info',
  warn: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger'
};

/** Application logs — read-only technical event log. */
export function ApplicationLogs() {
  const logs = useCollection(logsStore);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...logs]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((l) => {
        if (level && l.level !== level) return false;
        return !q || l.message.toLowerCase().includes(q) || l.source.toLowerCase().includes(q);
      });
  }, [logs, query, level]);

  const columns: Column<AppLog>[] = [
    { id: 'at', header: 'Timestamp', width: 180, sortValue: (r) => r.at, cell: (r) => <span className="tabular">{formatDateTime(r.at)}</span> },
    {
      id: 'level', header: 'Level', width: 100, sortValue: (r) => r.level, cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium uppercase', LEVEL_STYLE[r.level])}>{r.level}</span>
      )
    },
    { id: 'source', header: 'Source', width: 170, sortValue: (r) => r.source, cell: (r) => <span className="tabular text-ink-muted">{r.source}</span> },
    { id: 'message', header: 'Message', width: 420, sortValue: (r) => r.message, cell: (r) => <span className="block truncate">{r.message}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/logs']?.trail ?? ['Administration', 'Audit & security', 'Application logs']}
        title="Application logs"
        meta={<span className="tabular">{logs.length} entries</span>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Entries" value={String(logs.length)} />
          <StatTile label="Warnings" value={String(logs.filter((l) => l.level === 'warn').length)} />
          <StatTile label="Errors" value={String(logs.filter((l) => l.level === 'error').length)} />
        </div>
        <DataTable
          caption="Application logs"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(level) || query.length > 0}
          onClearFilters={() => { setLevel(''); setQuery(''); }}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search message or source"
              chips={level ? [{ id: 'level', label: 'Level', value: level }] : []}
              onRemoveChip={() => setLevel('')}
              onClearAll={() => { setLevel(''); setQuery(''); }}
              controls={
                <Select className="w-40" aria-label="Filter by level" value={level} onChange={(e) => setLevel(e.target.value)} options={[{ value: '', label: 'All levels' }, ...(['info', 'warn', 'error'] as AppLog['level'][]).map((l) => ({ value: l, label: l }))]} />
              }
            />
          }
        />
      </div>
    </div>
  );
}
