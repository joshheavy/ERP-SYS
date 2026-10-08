'use client';

import React, { useMemo, useState } from 'react';
import { CheckIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { useCan } from '../../contexts/PreferencesContext';
import { reconciliationStore, type StatementLine } from '../../data/reconciliation';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

/** Signed amount: credits add to the balance, debits reduce it. */
const signed = (l: StatementLine) => (l.type === 'credit' ? l.amount : -l.amount);

export function BankReconciliation() {
  const can = useCan();
  const lines = useCollection(reconciliationStore);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter((l) => {
      if (status === 'matched' && !l.matched) return false;
      if (status === 'unmatched' && l.matched) return false;
      if (!q) return true;
      return l.description.toLowerCase().includes(q) || l.reference.toLowerCase().includes(q);
    });
  }, [lines, query, status]);

  const matchedCount = lines.filter((l) => l.matched).length;
  const unmatchedCount = lines.length - matchedCount;
  const unreconciled = lines.filter((l) => !l.matched).reduce((s, l) => s + signed(l), 0);

  const toggleMatch = (l: StatementLine) => {
    if (l.matched) {
      reconciliationStore.update(l.id, { matched: false, matchedTo: undefined });
      toast.success(`${l.reference} unmatched`);
    } else {
      reconciliationStore.update(l.id, { matched: true, matchedTo: `MATCH-${l.reference}` });
      toast.success(`${l.reference} marked matched`);
    }
  };

  const columns: Column<StatementLine>[] = [
    { id: 'date', header: 'Date', width: 120, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    { id: 'description', header: 'Description', width: 260, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'reference', header: 'Reference', width: 140, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'type', header: 'Type', width: 90, sortValue: (r) => r.type, cell: (r) => (r.type === 'credit' ? 'Credit' : 'Debit') },
    {
      id: 'amount', header: 'Amount', numeric: true, width: 150, sortValue: (r) => signed(r),
      cell: (r) => formatMoney(signed(r)), tone: (r) => (r.type === 'credit' ? 'pos' : 'neg'),
      total: (all) => formatMoney(all.reduce((s, r) => s + signed(r), 0))
    },
    { id: 'matched', header: 'Status', width: 120, sortValue: (r) => (r.matched ? 1 : 0), cell: (r) => (r.matched ? 'Matched' : 'Unmatched'), tone: (r) => (r.matched ? 'success' : 'warning') },
    { id: 'matchedTo', header: 'Matched to', width: 160, defaultHidden: true, sortValue: (r) => r.matchedTo ?? '', cell: (r) => <span className="tabular">{r.matchedTo ?? '—'}</span> }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/reconciliation']?.trail ?? ['Finance', 'General ledger', 'Bank reconciliation']}
        title="Bank reconciliation"
        meta={
          <>
            <span className="tabular">{lines.length} statement lines</span>
            <span aria-hidden>·</span>
            <span>{unmatchedCount} unmatched</span>
          </>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Statement lines" value={String(lines.length)} />
          <StatTile label="Matched" value={String(matchedCount)} footnote={`${unmatchedCount} still to clear`} />
          <StatTile
            emphasis
            label="Unreconciled difference"
            value={formatMoney(unreconciled)}
            footnote={unreconciled === 0 ? 'Fully reconciled' : 'Clear the outstanding lines'}
          />
        </div>

        <DataTable
          caption="Bank statement lines"
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
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search description or reference"
              chips={status ? [{ id: 'status', label: 'Status', value: status === 'matched' ? 'Matched' : 'Unmatched' }] : []}
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
                    { value: '', label: 'All lines' },
                    { value: 'matched', label: 'Matched' },
                    { value: 'unmatched', label: 'Unmatched' }
                  ]}
                />
              }
            />
          }
          rowActions={(r) => (
            <Button
              size="sm"
              variant="ghost"
              icon={r.matched ? Undo2Icon : CheckIcon}
              disabled={!can.create}
              title={can.create ? undefined : 'Your role cannot reconcile lines'}
              onClick={() => toggleMatch(r)}
            >
              {r.matched ? 'Unmatch' : 'Mark matched'}
            </Button>
          )}
        />
      </div>
    </div>
  );
}
