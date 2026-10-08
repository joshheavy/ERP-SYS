'use client';

import React, { useMemo, useState } from 'react';
import { ShieldCheckIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../../hooks/useNav';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { Avatar } from '../../../components/approval/StatusTimeline';
import { usePermissions } from '../../../contexts/PermissionsContext';
import { SYSTEM_USERS, type SystemUser } from '../../../data/users';
import { ROUTE_META } from '../../../data/navigation';
import { formatDateTime } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';
import type { Role } from '../../../types/common';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  manager: 'Approver',
  officer: 'Officer',
  auditor: 'Auditor',
  employee: 'Employee'
};

const STATUS_STYLE: Record<SystemUser['status'], string> = {
  active: 'bg-success-soft text-success',
  invited: 'bg-info-soft text-info',
  suspended: 'bg-danger-soft text-danger'
};

export function AdminUsers() {
  const navigate = useNav();
  const { modulesFor } = usePermissions();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYSTEM_USERS.filter((u) => {
      if (role && u.role !== role) return false;
      if (status && u.status !== status) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    });
  }, [query, role, status]);

  const columns: Column<SystemUser>[] = [
    {
      id: 'name',
      header: 'User',
      width: 260,
      sortValue: (u) => u.name,
      cell: (u) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={u.name} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{u.name}</span>
            <span className="block truncate text-caption text-ink-subtle">{u.email}</span>
          </span>
        </span>
      )
    },
    { id: 'jobTitle', header: 'Job title', width: 180, sortValue: (u) => u.jobTitle, cell: (u) => u.jobTitle },
    { id: 'department', header: 'Department', width: 170, sortValue: (u) => u.department, cell: (u) => u.department },
    {
      id: 'role',
      header: 'Role',
      width: 140,
      sortValue: (u) => u.role,
      cell: (u) => <span className="rounded-full bg-primary-soft px-2 py-0.5 text-caption font-medium text-primary-text">{ROLE_LABEL[u.role]}</span>
    },
    {
      id: 'modules',
      header: 'Modules',
      width: 110,
      numeric: true,
      sortValue: (u) => modulesFor(u.role).length,
      cell: (u) => modulesFor(u.role).length
    },
    {
      id: 'status',
      header: 'Status',
      width: 120,
      sortValue: (u) => u.status,
      cell: (u) => (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium capitalize', STATUS_STYLE[u.status])}>
          {u.status}
        </span>
      )
    },
    { id: 'lastActive', header: 'Last active', width: 170, sortValue: (u) => u.lastActive, cell: (u) => <span className="tabular">{formatDateTime(u.lastActive)}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/users'].trail}
        title="Users"
        meta={
          <>
            <span className="tabular">{SYSTEM_USERS.length} users</span>
            <span aria-hidden>·</span>
            <span>{SYSTEM_USERS.filter((u) => u.status === 'active').length} active</span>
          </>
        }
        secondaryActions={
          <Button icon={ShieldCheckIcon} onClick={() => navigate('/admin/roles')}>
            Roles & permissions
          </Button>
        }
        primaryAction={
          <Button variant="primary" icon={UserPlusIcon} onClick={() => toast.info('Invite user', { description: 'User invitations would be sent here in production.' })}>
            Invite user
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatTile emphasis label="Total users" value={String(SYSTEM_USERS.length)} />
          <StatTile label="Active" value={String(SYSTEM_USERS.filter((u) => u.status === 'active').length)} />
          <StatTile label="Invited" value={String(SYSTEM_USERS.filter((u) => u.status === 'invited').length)} />
          <StatTile label="Suspended" value={String(SYSTEM_USERS.filter((u) => u.status === 'suspended').length)} />
        </div>

        <DataTable
          caption="System users"
          columns={columns}
          rows={rows}
          getRowId={(u) => u.id}
          pinFirstColumn
          filtered={Boolean(role) || Boolean(status) || query.length > 0}
          onClearFilters={() => {
            setRole('');
            setStatus('');
            setQuery('');
          }}
          rowActions={(u) => (
            <Button size="sm" variant="ghost" onClick={() => toast.info(`Manage ${u.name}`, { description: 'Editing a user’s profile and role would open here.' })}>
              Manage
            </Button>
          )}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search name, email or department"
              chips={[
                ...(role ? [{ id: 'role', label: 'Role', value: ROLE_LABEL[role as Role] }] : []),
                ...(status ? [{ id: 'status', label: 'Status', value: status }] : [])
              ]}
              onRemoveChip={(id) => (id === 'role' ? setRole('') : setStatus(''))}
              onClearAll={() => {
                setRole('');
                setStatus('');
                setQuery('');
              }}
              controls={
                <>
                  <Select
                    className="w-40"
                    aria-label="Filter by role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    options={[
                      { value: '', label: 'All roles' },
                      { value: 'admin', label: 'Administrator' },
                      { value: 'manager', label: 'Approver' },
                      { value: 'officer', label: 'Officer' },
                      { value: 'auditor', label: 'Auditor' },
                      { value: 'employee', label: 'Employee' }
                    ]}
                  />
                  <Select
                    className="w-36"
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: '', label: 'All statuses' },
                      { value: 'active', label: 'Active' },
                      { value: 'invited', label: 'Invited' },
                      { value: 'suspended', label: 'Suspended' }
                    ]}
                  />
                </>
              }
            />
          }
        />
      </div>
    </div>
  );
}
