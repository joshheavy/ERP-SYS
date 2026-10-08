'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useNav } from '../../hooks/useNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader } from '../../components/ui/Card';
import { GroupedBars, DonutStat, DonutLegend } from '../../components/charts/Charts';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import { REQUISITIONS } from '../../data/procurement';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { Requisition } from '../../types/procurement';

const value = (r: Requisition) => r.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

/** Requisition value by department, in KSh millions, for the bar chart. */
const valueByDept = Object.entries(
  REQUISITIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r.department] = (acc[r.department] ?? 0) + value(r);
    return acc;
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .map(([dept, v]) => ({ dept: dept.split(' ')[0], value: Math.round((v / 1_000_000) * 10) / 10 }));

/** Requisition count by status, for the composition donut. */
const byStatus = Object.entries(
  REQUISITIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {})
).map(([name, v], idx) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: v, colorIndex: idx }));

export function Requisitions() {
  const navigate = useNav();
  const can = useCan();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REQUISITIONS.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.requester.toLowerCase().includes(q)
      );
    });
  }, [query, status]);

  const pending = REQUISITIONS.filter((r) => r.status === 'pending').length;
  const totalValue = REQUISITIONS.reduce((s, r) => s + value(r), 0);

  const columns: Column<Requisition>[] = [
    { id: 'reference', header: 'Reference', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'title', header: 'Title', width: 280, sortValue: (r) => r.title, cell: (r) => <span className="block truncate">{r.title}</span> },
    { id: 'department', header: 'Department', width: 170, sortValue: (r) => r.department, cell: (r) => r.department },
    { id: 'requester', header: 'Requester', width: 160, sortValue: (r) => r.requester, cell: (r) => r.requester },
    { id: 'status', header: 'Status', width: 140, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'neededBy', header: 'Needed by', width: 130, sortValue: (r) => r.neededBy, cell: (r) => <span className="tabular">{formatDate(r.neededBy)}</span> },
    { id: 'budget', header: 'Budget line', width: 140, defaultHidden: true, sortValue: (r) => r.budgetLine, cell: (r) => <span className="tabular">{r.budgetLine}</span> },
    {
      id: 'value',
      header: 'Value',
      numeric: true,
      width: 150,
      sortValue: (r) => value(r),
      cell: (r) => formatMoney(value(r)),
      total: (all) => formatMoney(all.reduce((s, r) => s + value(r), 0))
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/procurement/requisitions'].trail}
        title="Requisitions"
        meta={
          <>
            <span className="tabular">{REQUISITIONS.length} requisitions</span>
            <span aria-hidden>·</span>
            <span>{pending} awaiting approval</span>
          </>
        }
        primaryAction={
          <Button
            variant="primary"
            icon={PlusIcon}
            disabled={!can.create}
            title={can.create ? undefined : 'Your role cannot raise requisitions'}
            onClick={() => navigate('/procurement/requisitions/new')}
          >
            New requisition
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open value" value={formatMoney(totalValue)} footnote="Across all statuses" />
          <StatTile label="Awaiting approval" value={String(pending)} />
          <StatTile label="Converted to PO" value={String(REQUISITIONS.filter((r) => r.convertedToPo).length)} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Requisition value by department" description="KSh millions." level={3} />
            <div className="px-3 py-4">
              <GroupedBars
                data={valueByDept}
                xKey="dept"
                height={200}
                format={(v) => `KSh ${v}M`}
                series={[{ key: 'value', label: 'Value', colorIndex: 0 }]}
              />
            </div>
          </Card>
          <Card>
            <CardHeader title="By status" level={3} />
            <div className="px-4 py-3">
              <DonutStat data={byStatus} height={160} />
              <div className="mt-3">
                <DonutLegend data={byStatus} total={REQUISITIONS.length} format={(v) => String(v)} />
              </div>
            </div>
          </Card>
        </div>

        <DataTable
          caption="Requisitions"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={() => {
            setStatus('');
            setQuery('');
          }}
          onRowClick={(r) => navigate(`/procurement/requisitions/${r.id}`)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search reference, title or requester"
              chips={status ? [{ id: 'status', label: 'Status', value: status }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={() => {
                setStatus('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: 'All statuses' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
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
