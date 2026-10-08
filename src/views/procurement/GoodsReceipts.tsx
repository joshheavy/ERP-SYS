'use client';

import React, { useMemo, useState } from 'react';
import { PackageCheckIcon, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Input, Select } from '../../components/ui/Input';
import { Field } from '../../components/forms/FormSection';
import { StatTile } from '../../components/ui/StatTile';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { useCan } from '../../contexts/PreferencesContext';
import { GOODS_RECEIPTS, PURCHASE_ORDERS } from '../../data/procurement';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';
import type { GoodsReceipt, PurchaseOrder } from '../../types/procurement';

const grnValue = (g: GoodsReceipt) => g.lines.reduce((s, l) => s + l.receivedQuantity * l.unitPrice, 0);

interface ReceiveLine {
  id: string;
  description: string;
  outstanding: number;
  unit: string;
  unitPrice: number;
  receiving: number;
  condition: 'good' | 'damaged' | 'short';
}

export function GoodsReceipts() {
  const can = useCan();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [poRef, setPoRef] = useState<string>(PURCHASE_ORDERS.find((p) => p.status === 'approved')?.reference ?? PURCHASE_ORDERS[0].reference);
  const [warehouse, setWarehouse] = useState('Central store — Industrial Area');
  const [waybill, setWaybill] = useState('');
  const [receiveLines, setReceiveLines] = useState<ReceiveLine[]>([]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GOODS_RECEIPTS;
    return GOODS_RECEIPTS.filter((g) => g.reference.toLowerCase().includes(q) || g.vendor.toLowerCase().includes(q) || g.purchaseOrder.toLowerCase().includes(q));
  }, [query]);

  const openPo = (ref: string): PurchaseOrder | undefined => PURCHASE_ORDERS.find((p) => p.reference === ref);

  const startReceipt = () => {
    const po = openPo(poRef);
    if (po) {
      setReceiveLines(
        po.lines.map((l) => ({
          id: l.id,
          description: l.description,
          outstanding: l.quantity - l.receivedQuantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          receiving: l.quantity - l.receivedQuantity,
          condition: 'good'
        }))
      );
    }
    setWaybill('');
    setCreating(true);
  };

  const receivingTotal = receiveLines.reduce((s, l) => s + l.receiving * l.unitPrice, 0);

  const columns: Column<GoodsReceipt>[] = [
    { id: 'reference', header: 'GRN', width: 160, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'po', header: 'Purchase order', width: 160, sortValue: (r) => r.purchaseOrder, cell: (r) => <span className="tabular">{r.purchaseOrder}</span> },
    { id: 'vendor', header: 'Vendor', width: 220, sortValue: (r) => r.vendor, cell: (r) => <span className="block truncate">{r.vendor}</span> },
    { id: 'warehouse', header: 'Warehouse', width: 200, sortValue: (r) => r.warehouse, cell: (r) => r.warehouse },
    { id: 'receivedOn', header: 'Received on', width: 130, sortValue: (r) => r.receivedOn, cell: (r) => <span className="tabular">{formatDate(r.receivedOn)}</span> },
    { id: 'by', header: 'Received by', width: 150, sortValue: (r) => r.receivedBy, cell: (r) => r.receivedBy },
    { id: 'status', header: 'Status', width: 120, sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'value',
      header: 'Value',
      numeric: true,
      width: 150,
      sortValue: (r) => grnValue(r),
      cell: (r) => formatMoney(grnValue(r)),
      total: (all) => formatMoney(all.reduce((s, r) => s + grnValue(r), 0))
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/procurement/receipts'].trail}
        title="Goods receipts"
        meta={
          <>
            <span className="tabular">{GOODS_RECEIPTS.length} receipts</span>
            <span aria-hidden>·</span>
            <span>Received against issued purchase orders</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={TruckIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot record receipts'} onClick={startReceipt}>
            Record receipt
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Received value" value={formatMoney(GOODS_RECEIPTS.reduce((s, g) => s + grnValue(g), 0))} />
          <StatTile label="Receipts this month" value={String(GOODS_RECEIPTS.length)} />
          <StatTile label="Open POs to receive" value={String(PURCHASE_ORDERS.filter((p) => p.lines.some((l) => l.receivedQuantity < l.quantity)).length)} />
        </div>

        <DataTable
          caption="Goods receipts"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={query.length > 0}
          onClearFilters={() => setQuery('')}
          toolbar={<FilterBar query={query} onQueryChange={setQuery} placeholder="Search GRN, PO or vendor" />}
        />
      </div>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="Record goods receipt"
        subtitle="Enter the quantities actually delivered against the purchase order."
        width="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <span className="tabular text-small text-ink-muted">Receiving value: {formatMoney(receivingTotal)}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={PackageCheckIcon}
                disabled={!waybill.trim() || receivingTotal <= 0}
                onClick={() => {
                  setCreating(false);
                  toast.success('Goods receipt posted', { description: `Received against ${poRef}. Inventory balances updated.` });
                }}
              >
                Post receipt
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <Field label="Purchase order" span={6} required>
              <Select
                value={poRef}
                onChange={(e) => {
                  setPoRef(e.target.value);
                  const po = openPo(e.target.value);
                  if (po) {
                    setReceiveLines(
                      po.lines.map((l) => ({
                        id: l.id,
                        description: l.description,
                        outstanding: l.quantity - l.receivedQuantity,
                        unit: l.unit,
                        unitPrice: l.unitPrice,
                        receiving: l.quantity - l.receivedQuantity,
                        condition: 'good'
                      }))
                    );
                  }
                }}
                options={PURCHASE_ORDERS.map((p) => ({ value: p.reference, label: `${p.reference} — ${p.vendor}` }))}
              />
            </Field>
            <Field label="Warehouse" span={6} required>
              <Select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                options={['Central store — Industrial Area', 'ICT store — Upper Hill', 'Head office — Plant room'].map((w) => ({ value: w, label: w }))}
              />
            </Field>
            <Field label="Waybill / delivery note" span={6} required>
              <Input value={waybill} onChange={(e) => setWaybill(e.target.value)} placeholder="e.g. PFS-WB-11284" />
            </Field>
          </div>

          <div className="overflow-hidden rounded-control border border-line">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  {['Description', 'Outstanding', 'Receiving', 'Condition'].map((h, i) => (
                    <th key={h} className={`px-3 py-2 text-caption font-semibold uppercase tracking-wide text-ink-muted ${i === 1 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receiveLines.map((l) => (
                  <tr key={l.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2 text-body text-ink">{l.description}</td>
                    <td className="tabular px-3 py-2 text-right text-body text-ink">{l.outstanding} {l.unit}</td>
                    <td className="px-3 py-2">
                      <Input
                        numeric
                        type="number"
                        min={0}
                        max={l.outstanding}
                        value={l.receiving}
                        className="w-24"
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(l.outstanding, Number(e.target.value) || 0));
                          setReceiveLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, receiving: v } : x)));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        className="w-32"
                        value={l.condition}
                        onChange={(e) => setReceiveLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, condition: e.target.value as ReceiveLine['condition'] } : x)))}
                        options={[
                          { value: 'good', label: 'Good' },
                          { value: 'damaged', label: 'Damaged' },
                          { value: 'short', label: 'Short' }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {receiveLines.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-small text-ink-muted">
                      This purchase order has no outstanding lines to receive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
