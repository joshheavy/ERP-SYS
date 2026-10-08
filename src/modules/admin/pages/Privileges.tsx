'use client';

import React, { useMemo, useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { FilterBar } from '../../../components/data-table/FilterBar';
import { Select } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { privilegesStore, type Privilege, type PrivilegeAction } from '../../../data/adminOps';
import { useCollection } from '../../../core/store/createCollection';
import { MODULES } from '../../../data/navigation';
import { ROUTE_META } from '../../../data/navigation';
import { cn } from '../../../utils/cn';
import type { Column } from '../../../components/data-table/types';
import type { ModuleId } from '../../../types/common';

const ACTION_STYLE: Record<PrivilegeAction, string> = {
  View: 'bg-info-soft text-info',
  Maintain: 'bg-warning-soft text-warning',
  Approve: 'bg-success-soft text-success'
};

function moduleLabel(id: ModuleId): string {
  return MODULES.find((m) => m.id === id)?.label ?? id;
}

/**
 * Privileges catalog — the read-only reference of the maker-checker privilege
 * strings the authorization model exposes (View / Maintain / Approve per
 * entity, per module). Mirrors the backend privilege list.
 */
export function Privileges() {
  const privileges = useCollection(privilegesStore);
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return privileges.filter((p) => {
      if (module && p.module !== module) return false;
      if (action && p.action !== action) return false;
      return !q || p.code.toLowerCase().includes(q) || p.entity.toLowerCase().includes(q);
    });
  }, [privileges, query, module, action]);

  const columns: Column<Privilege>[] = [
    { id: 'code', header: 'Privilege', width: 260, sortValue: (r) => r.code, cell: (r) => <span className="font-medium text-ink">{r.code}</span> },
    { id: 'module', header: 'Module', width: 160, sortValue: (r) => r.module, cell: (r) => moduleLabel(r.module) },
    { id: 'entity', header: 'Entity', width: 180, sortValue: (r) => r.entity, cell: (r) => r.entity },
    {
      id: 'action', header: 'Action', width: 130, sortValue: (r) => r.action, cell: (r) => (
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', ACTION_STYLE[r.action])}>{r.action}</span>
      )
    }
  ];

  const clearAll = () => { setQuery(''); setModule(''); setAction(''); };
  const moduleOptions = Array.from(new Set(privileges.map((p) => p.module)));

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/privileges']?.trail ?? ['Administration', 'Audit & security', 'Privileges']}
        title="Privileges"
        meta={<span className="tabular">{privileges.length} privileges across {moduleOptions.length} modules</span>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Privileges" value={String(privileges.length)} />
          <StatTile label="Entities" value={String(new Set(privileges.map((p) => p.entity)).size)} />
          <StatTile label="Actions per entity" value="3" footnote="View · Maintain · Approve" />
        </div>
        <div className="flex items-start gap-2 rounded-control border border-line bg-surface-2 px-3 py-2.5">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
          <p className="text-small text-ink-muted">
            This is the maker-checker privilege catalogue. Every entity carries View / Maintain / Approve privileges;
            roles are granted subsets of these. It mirrors the backend authorization model and is read-only here.
          </p>
        </div>
        <DataTable
          caption="Privileges catalogue"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(module) || Boolean(action) || query.length > 0}
          onClearFilters={clearAll}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search privilege or entity"
              chips={[
                ...(module ? [{ id: 'module', label: 'Module', value: moduleLabel(module as ModuleId) }] : []),
                ...(action ? [{ id: 'action', label: 'Action', value: action }] : [])
              ]}
              onRemoveChip={(id) => (id === 'module' ? setModule('') : setAction(''))}
              onClearAll={clearAll}
              controls={
                <>
                  <Select className="w-44" aria-label="Filter by module" value={module} onChange={(e) => setModule(e.target.value)} options={[{ value: '', label: 'All modules' }, ...moduleOptions.map((m) => ({ value: m, label: moduleLabel(m) }))]} />
                  <Select className="w-40" aria-label="Filter by action" value={action} onChange={(e) => setAction(e.target.value)} options={[{ value: '', label: 'All actions' }, ...(['View', 'Maintain', 'Approve'] as PrivilegeAction[]).map((a) => ({ value: a, label: a }))]} />
                </>
              }
            />
          }
        />
      </div>
    </div>
  );
}
