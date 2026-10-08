'use client';

import React, { useMemo, useState } from 'react';
import { TruckIcon } from 'lucide-react';
import { useNav } from '../../hooks/useNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Drawer } from '../../components/ui/Drawer';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { StatusTimeline } from '../../components/approval/StatusTimeline';
import { ProgressBar } from '../../components/ui/Progress';
import { PURCHASE_ORDERS } from '../../data/procurement';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { PurchaseOrder } from '../../types/procurement';

const orderValue = (po: PurchaseOrder) => po.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
const receivedPct = (po: PurchaseOrder) => {
  const ordered = po.lines.reduce((s, l) => s + l.quantity, 0);
  const received = po.lines.reduce((s, l) => s + l.receivedQuantity, 0);
  return ordered === 0 ? 0 : Math.round((received / ordered) * 100);
};

export function PurchaseOrders() {
  const navigate = useNav();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [active, setActive] = useState<PurchaseOrder | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PURCHASE_ORDERS.filter((po) => {
      if (status && po.status !== status) return false;
      if (!q) return true;
      return po.reference.toLowerCase().includes(q) || po.vendor.toLowerCase().includes(q);
    });
  }, [query, status]);

  const columns: Column<PurchaseOrder>[] = [
    { id: 'reference', header: 'PO', width: 150, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'vendor', header: 'Vendor', width: 240, sortValue: (r) => r.vendor, cell: (r) => <span className="block truncate">{r.vendor}</span> },
    { id: 'from', header: 'From requisition', width: 160, sortValue: (r) => r.fromRequisition, cell: (r) => <span className="tabular">{r.fromRequisition}</span> },
    { id: 'status', header: 'Status', width: 130, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'expected', header: 'Expected', width: 130, sortValue: (r) => r.expectedOn, cell: (r) => <span className="tabular">{formatDate(r.expectedOn)}</span> },
    {
      id: 'received',
      header: 'Received',
      width: 150,
      sortValue: (r) => receivedPct(r),
      cell: (r) => <ProgressBar value={receivedPct(r)} max={100} size="sm" tone={receivedPct(r) === 100 ? 'success' : 'primary'} caption={`${receivedPct(r)}%`} />
    },
    {
      id: 'value',
      header: 'Value',
      numeric: true,
      width: 150,
      sortValue: (r) => orderValue(r),
      cell: (r) => formatMoney(orderValue(r)),
      total: (all) => formatMoney(all.reduce((s, r) => s + orderValue(r), 0))
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/procurement/orders'].trail}
        title="Purchase orders"
        meta={
          <>
            <span className="tabular">{PURCHASE_ORDERS.length} orders</span>
            <span aria-hidden>·</span>
            <span>{PURCHASE_ORDERS.filter((p) => receivedPct(p) < 100).length} awaiting delivery</span>
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Open commitment" value={formatMoney(PURCHASE_ORDERS.reduce((s, p) => s + orderValue(p), 0))} />
          <StatTile label="Awaiting delivery" value={String(PURCHASE_ORDERS.filter((p) => receivedPct(p) < 100).length)} />
          <StatTile label="Fully received" value={String(PURCHASE_ORDERS.filter((p) => receivedPct(p) === 100).length)} />
        </div>

        <DataTable
          caption="Purchase orders"
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
          onRowClick={(po) => setActive(po)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search PO or vendor"
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
                    { value: 'approved', label: 'Issued' },
                    { value: 'posted', label: 'Completed' }
                  ]}
                />
              }
            />
          }
        />
      </div>

      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.reference ?? ''}
        subtitle={active?.vendor}
        width="lg"
        headerAccessory={active ? <StatusBadge status={active.status} /> : undefined}
        footer={
          active ? (
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setActive(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={TruckIcon}
                disabled={receivedPct(active) === 100}
                onClick={() => {
                  setActive(null);
                  navigate('/procurement/receipts');
                }}
              >
                Record goods receipt
              </Button>
            </div>
          ) : undefined
        }
      >
        {active && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Vendor code', value: active.vendorCode },
                { label: 'From requisition', value: active.fromRequisition },
                { label: 'Issued on', value: formatDate(active.issuedOn) },
                { label: 'Expected on', value: formatDate(active.expectedOn) },
                { label: 'Payment terms', value: active.paymentTerms },
                { label: 'Delivery', value: active.deliveryLocation }
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-caption uppercase tracking-wide text-ink-subtle">{row.label}</dt>
                  <dd className="mt-0.5 text-small font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="overflow-hidden rounded-control border border-line">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    {['Description', 'Ordered', 'Received', 'Unit price', 'Line total'].map((h, i) => (
                      <th key={h} className={`px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted ${i > 0 ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.lines.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-2 text-body text-ink">{l.description}</td>
                      <td className="tabular px-3 py-2 text-right text-body text-ink">{l.quantity} {l.unit}</td>
                      <td className={`tabular px-3 py-2 text-right text-body ${l.receivedQuantity < l.quantity ? 'text-warning' : 'text-ink'}`}>{l.receivedQuantity} {l.unit}</td>
                      <td className="tabular px-3 py-2 text-right text-body text-ink">{formatMoney(l.unitPrice)}</td>
                      <td className="tabular px-3 py-2 text-right text-body text-ink">{formatMoney(l.quantity * l.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="mb-2 text-h4 text-ink">Order timeline</h3>
              <StatusTimeline events={active.timeline} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
