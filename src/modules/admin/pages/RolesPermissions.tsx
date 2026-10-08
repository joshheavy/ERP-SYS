'use client';

import React from 'react';
import { RotateCcwIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Choice';
import { StatTile } from '../../../components/ui/StatTile';
import { usePermissions } from '../../../contexts/PermissionsContext';
import { MODULES, ALL_MODULE_IDS } from '../../../data/navigation';
import { IDENTITIES, SYSTEM_USERS } from '../../../data/users';
import { ROUTE_META } from '../../../data/navigation';
import { cn } from '../../../utils/cn';
import type { ModuleId, Role } from '../../../types/common';

const ROLES: { id: Role; label: string; note: string }[] = [
  { id: 'admin', label: 'Administrator', note: 'Full system access' },
  { id: 'manager', label: 'Approver', note: 'Approves across the org' },
  { id: 'officer', label: 'Officer', note: 'Creates and posts records' },
  { id: 'auditor', label: 'Auditor', note: 'Read-only visibility' },
  { id: 'employee', label: 'Employee', note: 'Self-service only' }
];

function moduleLabel(id: ModuleId): string {
  return MODULES.find((m) => m.id === id)?.label ?? id;
}

export function RolesPermissions() {
  const { access, toggle, reset } = usePermissions();

  const usersPerRole = (role: Role) => SYSTEM_USERS.filter((u) => u.role === role).length;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/roles'].trail}
        title="Roles & permissions"
        meta={<span>Control which modules each role can open. Changes apply immediately, everywhere.</span>}
        secondaryActions={
          <Button
            icon={RotateCcwIcon}
            onClick={() => {
              reset();
              toast.success('Permissions reset to defaults');
            }}
          >
            Reset to defaults
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Roles" value={String(ROLES.length)} />
          <StatTile label="Modules" value={String(ALL_MODULE_IDS.length)} />
          <StatTile label="Managed users" value={String(SYSTEM_USERS.length)} />
        </div>

        <Card>
          <CardHeader
            title="Module access matrix"
            description="Toggle a module on or off for a role. The sidebar, dashboard and command palette update instantly for anyone with that role."
          />
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="sticky left-0 z-10 bg-surface-2 px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Module
                  </th>
                  {ROLES.map((r) => (
                    <th key={r.id} className="px-3 py-2.5 text-center">
                      <span className="block text-small font-semibold text-ink">{r.label}</span>
                      <span className="block text-caption font-normal text-ink-subtle">{usersPerRole(r.id)} users</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_MODULE_IDS.map((moduleId, i) => {
                  const Icon = MODULES.find((m) => m.id === moduleId)?.icon;
                  return (
                    <tr key={moduleId} className={cn('border-b border-line last:border-b-0', i % 2 === 1 && 'bg-surface-2/40')}>
                      <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5">
                        <span className="flex items-center gap-2.5">
                          {Icon && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-control bg-primary-soft text-primary-text">
                              <Icon className="h-3.5 w-3.5" aria-hidden />
                            </span>
                          )}
                          <span className="text-body font-medium text-ink">{moduleLabel(moduleId)}</span>
                        </span>
                      </td>
                      {ROLES.map((r) => {
                        const enabled = (access[r.id] ?? []).includes(moduleId);
                        // The admin role always keeps the admin module — guard against locking yourself out.
                        const locked = r.id === 'admin' && moduleId === 'admin';
                        return (
                          <td key={r.id} className="px-3 py-2.5 text-center">
                            <div className="flex justify-center">
                              <Toggle
                                checked={enabled}
                                disabled={locked}
                                onChange={() => {
                                  toggle(r.id, moduleId);
                                  toast.success(
                                    `${moduleLabel(moduleId)} ${enabled ? 'removed from' : 'granted to'} ${r.label}`
                                  );
                                }}
                                aria-label={`${moduleLabel(moduleId)} for ${r.label}`}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="flex items-center gap-1.5 border-t border-line bg-surface-2 px-4 py-2.5 text-caption text-ink-muted">
            <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Changes are saved to this browser. The Administrator’s access to this screen is always kept on.
          </p>
        </Card>

        {/* Role summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((r) => {
            const mods = access[r.id] ?? [];
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 text-ink">{r.label}</h3>
                  <span className="tabular rounded-full bg-surface-3 px-2 py-0.5 text-caption text-ink-muted">
                    {mods.length} modules
                  </span>
                </div>
                <p className="mt-0.5 text-caption text-ink-subtle">{r.note} · {IDENTITIES[r.id].name}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mods.length === 0 ? (
                    <span className="text-small text-ink-subtle">No console modules — portal only.</span>
                  ) : (
                    mods.map((m) => (
                      <span key={m} className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-caption text-ink-muted">
                        {moduleLabel(m)}
                      </span>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
