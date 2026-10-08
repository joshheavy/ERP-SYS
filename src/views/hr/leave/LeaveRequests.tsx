'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDaysIcon } from 'lucide-react';
import { useNav } from '../../../hooks/useNav';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { StatusBadge } from '../../../components/approval/StatusBadge';
import { useCan } from '../../../contexts/PreferencesContext';
import { LEAVE_REQUESTS } from '../../../data/leave';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate, relativeTime } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';
import type { LeaveRequest } from '../../../types/leave';

const STAGE_LABEL: Record<LeaveRequest['stage'], string> = {
  supervisor: 'With supervisor',
  hr: 'With HR',
  complete: 'Complete',
  rejected: 'Rejected'
};

export function LeaveRequests() {
  const navigate = useNav();
  const can = useCan();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEAVE_REQUESTS.filter((r) => {
      if (stage && r.stage !== stage) return false;
      if (!q) return true;
      return r.employee.toLowerCase().includes(q) || r.reference.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    });
  }, [query, stage]);

  const pending = LEAVE_REQUESTS.filter((r) => r.status === 'pending').length;

  const columns: Column<LeaveRequest>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    {
      id: 'employee',
      header: 'Employee',
      width: 200,
      sortValue: (r) => r.employee,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate">{r.employee}</span>
          <span className="block text-caption text-ink-subtle">{r.department}</span>
        </span>
      )
    },
    { id: 'type', header: 'Type', width: 140, sortValue: (r) => r.typeLabel, cell: (r) => r.typeLabel },
    { id: 'dates', header: 'Dates', width: 200, sortValue: (r) => r.startDate, cell: (r) => <span className="tabular">{formatDate(r.startDate)} – {formatDate(r.endDate)}</span> },
    { id: 'days', header: 'Days', numeric: true, width: 80, sortValue: (r) => r.days, cell: (r) => r.days, total: (all) => all.reduce((s, r) => s + r.days, 0) },
    { id: 'stage', header: 'Stage', width: 150, sortValue: (r) => r.stage, cell: (r) => <span className="text-small text-ink-muted">{STAGE_LABEL[r.stage]}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'submitted', header: 'Submitted', width: 130, sortValue: (r) => r.submittedAt, cell: (r) => <span className="tabular">{relativeTime(r.submittedAt)}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/leave/requests'].trail}
        title="Leave requests"
        meta={
          <>
            <span className="tabular">{LEAVE_REQUESTS.length} requests</span>
            <span aria-hidden>·</span>
            <span>{pending} awaiting a decision</span>
          </>
        }
        secondaryActions={
          <Button icon={CalendarDaysIcon} onClick={() => navigate('/hr/leave/calendar')}>
            Team calendar
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatTile emphasis label="Awaiting decision" value={String(pending)} />
          <StatTile label="With supervisor" value={String(LEAVE_REQUESTS.filter((r) => r.stage === 'supervisor').length)} />
          <StatTile label="With HR" value={String(LEAVE_REQUESTS.filter((r) => r.stage === 'hr').length)} />
          <StatTile label="Approved this month" value={String(LEAVE_REQUESTS.filter((r) => r.status === 'approved').length)} />
        </div>

        <DataTable
          caption="Leave requests"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(stage) || query.length > 0}
          onClearFilters={() => {
            setStage('');
            setQuery('');
          }}
          onRowClick={(r) => navigate(`/hr/leave/requests/${r.id}`)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search employee or reference"
              chips={stage ? [{ id: 'stage', label: 'Stage', value: STAGE_LABEL[stage as LeaveRequest['stage']] }] : []}
              onRemoveChip={() => setStage('')}
              onClearAll={() => {
                setStage('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  options={[
                    { value: '', label: 'All stages' },
                    { value: 'supervisor', label: 'With supervisor' },
                    { value: 'hr', label: 'With HR' },
                    { value: 'complete', label: 'Complete' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                />
              }
            />
          }
        />
      </div>
    </div>
  );
}
