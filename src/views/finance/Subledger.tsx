'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, BanknoteIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  invoiceStatus,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_STYLE,
  type InvoiceStatus,
  type SubledgerInvoice
} from '../../data/subledgers';
import { useCollection, type Collection } from '../../core/store/createCollection';
import { formatMoney, formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { Column } from '../../components/data-table/types';

export interface SubledgerProps {
  /** The store to render (payables or receivables). */
  store: Collection<SubledgerInvoice>;
  /** Page title, e.g. 'Accounts payable'. */
  title: string;
  /** Breadcrumb trail. */
  trail: string[];
  /** Word for the counterparty — 'Vendor' (AP) or 'Customer' (AR). */
  partyLabel: string;
  /** Word for a record — 'bill' (AP) or 'invoice' (AR). */
  docLabel: string;
  /** Reference prefix for new records, e.g. 'BILL' or 'INV'. */
  refPrefix: string;
}

interface InvoiceForm {
  reference: string;
  party: string;
  date: string;
  dueDate: string;
  amount: number;
}

const TODAY = '2026-09-17';

/**
 * A generic sub-ledger screen shared by Accounts Payable and Accounts
 * Receivable — identical shape (invoices with a running paid balance), only the
 * labels and store differ. List → filter by status → create → record payment,
 * with aging stat tiles. Persisted through the injected store.
 */
export function Subledger({ store, title, trail, partyLabel, docLabel, refPrefix }: SubledgerProps) {
  const can = useCan();
  const invoices = useCollection(store);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<InvoiceForm>({ reference: '', party: '', date: TODAY, dueDate: TODAY, amount: 0 });

  // Record-payment drawer.
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const paying = invoices.find((i) => i.id === payingId) ?? null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (status && invoiceStatus(inv, TODAY) !== status) return false;
      return !q || inv.reference.toLowerCase().includes(q) || inv.party.toLowerCase().includes(q);
    });
  }, [invoices, query, status]);

  const outstanding = invoices.reduce((s, i) => s + Math.max(0, i.amount - i.paid), 0);
  const overdueValue = invoices
    .filter((i) => invoiceStatus(i, TODAY) === 'overdue')
    .reduce((s, i) => s + (i.amount - i.paid), 0);
  const paidCount = invoices.filter((i) => invoiceStatus(i, TODAY) === 'paid').length;

  const create = () => {
    if (!form.party.trim() || form.amount <= 0) {
      toast.error(`${partyLabel} and a positive amount are required`);
      return;
    }
    const next = invoices.length + 1;
    store.create({
      reference: form.reference.trim() || `${refPrefix}-2026-${String(next).padStart(4, '0')}`,
      party: form.party,
      date: form.date,
      dueDate: form.dueDate,
      amount: form.amount,
      paid: 0
    });
    toast.success(`${docLabel[0].toUpperCase()}${docLabel.slice(1)} created`);
    setCreating(false);
    setForm({ reference: '', party: '', date: TODAY, dueDate: TODAY, amount: 0 });
  };

  const openPay = (inv: SubledgerInvoice) => {
    setPayAmount(inv.amount - inv.paid);
    setPayingId(inv.id);
  };

  const recordPayment = () => {
    if (!paying) return;
    const balance = paying.amount - paying.paid;
    if (payAmount <= 0 || payAmount > balance) {
      toast.error(`Payment must be between 0 and ${formatMoney(balance)}`);
      return;
    }
    store.update(paying.id, { paid: paying.paid + payAmount });
    toast.success(`Payment of ${formatMoney(payAmount)} recorded on ${paying.reference}`);
    setPayingId(null);
  };

  const columns: Column<SubledgerInvoice>[] = [
    { id: 'reference', header: 'Reference', width: 160, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'party', header: partyLabel, width: 220, sortValue: (r) => r.party, cell: (r) => <span className="block truncate font-medium text-ink">{r.party}</span> },
    { id: 'date', header: 'Date', width: 120, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    { id: 'dueDate', header: 'Due', width: 120, sortValue: (r) => r.dueDate, cell: (r) => <span className="tabular">{formatDate(r.dueDate)}</span> },
    { id: 'amount', header: 'Amount', numeric: true, width: 150, sortValue: (r) => r.amount, cell: (r) => formatMoney(r.amount), total: (all) => formatMoney(all.reduce((s, r) => s + r.amount, 0)) },
    { id: 'balance', header: 'Outstanding', numeric: true, width: 150, sortValue: (r) => r.amount - r.paid, cell: (r) => formatMoney(r.amount - r.paid), total: (all) => formatMoney(all.reduce((s, r) => s + (r.amount - r.paid), 0)) },
    {
      id: 'status', header: 'Status', width: 130, sortValue: (r) => invoiceStatus(r, TODAY), cell: (r) => {
        const st = invoiceStatus(r, TODAY);
        return <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', INVOICE_STATUS_STYLE[st])}>{INVOICE_STATUS_LABEL[st]}</span>;
      }
    }
  ];

  const clearAll = () => { setQuery(''); setStatus(''); };

  return (
    <div>
      <PageHeader
        trail={trail}
        title={title}
        meta={
          <>
            <span className="tabular">{invoices.length} {docLabel}s</span>
            <span aria-hidden>·</span>
            <span>{formatMoney(outstanding)} outstanding</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={() => setCreating(true)}>
            New {docLabel}
          </Button>
        }
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Outstanding" value={formatMoney(outstanding)} />
          <StatTile label="Overdue" value={formatMoney(overdueValue)} footnote="Past due date" />
          <StatTile label="Settled" value={String(paidCount)} />
        </div>
        <DataTable
          caption={title}
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          showTotals
          filtered={Boolean(status) || query.length > 0}
          onClearFilters={clearAll}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder={`Search reference or ${partyLabel.toLowerCase()}`}
              chips={status ? [{ id: 'status', label: 'Status', value: INVOICE_STATUS_LABEL[status as InvoiceStatus] }] : []}
              onRemoveChip={() => setStatus('')}
              onClearAll={clearAll}
              controls={
                <Select
                  className="w-40"
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[{ value: '', label: 'All statuses' }, ...(['open', 'partpaid', 'paid', 'overdue'] as InvoiceStatus[]).map((s) => ({ value: s, label: INVOICE_STATUS_LABEL[s] }))]}
                />
              }
            />
          }
          rowActions={(r) => invoiceStatus(r, TODAY) !== 'paid' ? (
            <Button size="sm" variant="ghost" icon={BanknoteIcon} disabled={!can.create} onClick={() => openPay(r)}>
              Record payment
            </Button>
          ) : null}
        />
      </div>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        width="md"
        title={`New ${docLabel}`}
        subtitle={`Record a ${docLabel} from a ${partyLabel.toLowerCase()}`}
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" onClick={create} disabled={!can.create}>Create {docLabel}</Button></>}
      >
        <div className="p-1">
          <FormSection title={`${docLabel[0].toUpperCase()}${docLabel.slice(1)} details`} description={`Who it is from and when it is due.`}>
            <Field label="Reference" span={6} hint="Blank to auto-number"><Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="font-mono" /></Field>
            <Field label={partyLabel} span={6} required><Input value={form.party} onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))} /></Field>
            <Field label="Date" span={6}><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Due date" span={6}><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></Field>
            <Field label="Amount (KES)" span={6} required><Input numeric type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
        </div>
      </Drawer>

      {/* Record-payment drawer */}
      <Drawer
        open={paying !== null}
        onClose={() => setPayingId(null)}
        width="sm"
        title="Record payment"
        subtitle={paying?.reference}
        footer={<><Button variant="ghost" onClick={() => setPayingId(null)}>Cancel</Button><Button variant="primary" onClick={recordPayment} disabled={!can.create}>Record payment</Button></>}
      >
        {paying && (
          <div className="p-1">
            <FormSection title="Payment" description={`Outstanding: ${formatMoney(paying.amount - paying.paid)}`}>
              <Field label="Amount (KES)" span={12} required>
                <Input numeric type="number" min={0} max={paying.amount - paying.paid} value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value) || 0)} />
              </Field>
            </FormSection>
          </div>
        )}
      </Drawer>
    </div>
  );
}
