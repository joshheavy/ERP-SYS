'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LogOutIcon } from 'lucide-react';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Button } from '../../../components/ui/Button';
import { StatTile } from '../../../components/ui/StatTile';
import { Avatar } from '../../../components/approval/StatusTimeline';
import { useCan } from '../../../contexts/PreferencesContext';
import { sessionsStore, type LoginSession } from '../../../data/adminOps';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatDateTime } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';

/** Login sessions — active and recent sessions. An admin can end an active one. */
export function LoginSessions() {
  const can = useCan();
  const sessions = useCollection(sessionsStore);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...sessions]
      .sort((a, b) => Number(b.active) - Number(a.active) || b.lastSeen.localeCompare(a.lastSeen))
      .filter((s) => !q || s.user.toLowerCase().includes(q) || s.ipAddress.includes(q) || s.device.toLowerCase().includes(q));
  }, [sessions, query]);

  const endSession = (s: LoginSession) => {
    sessionsStore.update(s.id, { active: false });
    toast.success(`Ended ${s.user}'s session`);
  };

  const columns: Column<LoginSession>[] = [
    {
      id: 'user', header: 'User', width: 220, sortValue: (r) => r.user, cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={r.user} />
          <span className="min-w-0">
            <span className="block truncate text-ink">{r.user}</span>
            <span className="block truncate text-caption text-ink-subtle">{r.role}</span>
          </span>
        </span>
      )
    },
    { id: 'ip', header: 'IP address', width: 150, sortValue: (r) => r.ipAddress, cell: (r) => <span className="tabular">{r.ipAddress}</span> },
    { id: 'device', header: 'Device', width: 180, sortValue: (r) => r.device, cell: (r) => r.device },
    { id: 'startedAt', header: 'Started', width: 170, sortValue: (r) => r.startedAt, cell: (r) => <span className="tabular">{formatDateTime(r.startedAt)}</span> },
    { id: 'lastSeen', header: 'Last seen', width: 170, sortValue: (r) => r.lastSeen, cell: (r) => <span className="tabular">{formatDateTime(r.lastSeen)}</span> },
    {
      id: 'active', header: 'Status', width: 110, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', r.active ? 'bg-success-soft text-success' : 'bg-surface-3 text-ink-muted')}>
          {r.active ? 'Active' : 'Ended'}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/sessions']?.trail ?? ['Administration', 'Audit & security', 'Login sessions']}
        title="Login sessions"
        meta={<span className="tabular">{sessions.filter((s) => s.active).length} active now</span>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Active sessions" value={String(sessions.filter((s) => s.active).length)} />
          <StatTile label="Total tracked" value={String(sessions.length)} />
          <StatTile label="Distinct users" value={String(new Set(sessions.map((s) => s.user)).size)} />
        </div>
        <DataTable
          caption="Login sessions"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={query.length > 0}
          onClearFilters={() => setQuery('')}
          toolbar={<FilterBar query={query} onQueryChange={setQuery} placeholder="Search user, IP or device" chips={[]} onRemoveChip={() => {}} onClearAll={() => setQuery('')} />}
          rowActions={(r) => r.active ? (
            <Button size="sm" variant="ghost" icon={LogOutIcon} disabled={!can.create} title={can.create ? 'End session' : 'Only an administrator can end sessions'} onClick={() => endSession(r)}>
              End
            </Button>
          ) : null}
        />
      </div>
    </div>
  );
}
