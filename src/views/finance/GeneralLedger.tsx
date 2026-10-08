'use client';

import React, { useMemo, useState } from 'react';
import { useNav } from '../../hooks/useNav';
import { BookOpenIcon, ExternalLinkIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { Field } from '../../components/forms/FormSection';
import { StatTile } from '../../components/ui/StatTile';
import { DataTable } from '../../components/data-table/DataTable';
import { useCollection } from '../../core/store/createCollection';
import {
  journalsStore,
  ledgerAccounts,
  deriveAccountActivity,
  isDebitNatured,
  type LedgerPosting
} from '../../data/ledger';
import { ROUTE_META } from '../../data/navigation';
import { formatDate, formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

/** General Ledger — per-account posted activity with a running balance. */
export function GeneralLedger() {
  const navigate = useNav();
  const journals = useCollection(journalsStore);

  const accounts = useMemo(() => ledgerAccounts(journals), [journals]);
  const [code, setCode] = useState<string>(() => accounts[0]?.account ?? '');

  // Keep the selection valid if the account set changes.
  const selected = accounts.find((a) => a.account === code)?.account ?? accounts[0]?.account ?? '';
  const activity = useMemo(
    () => (selected ? deriveAccountActivity(journals, selected) : null),
    [journals, selected]
  );

  const naturalSide = activity ? (isDebitNatured(activity.classification) ? 'Dr' : 'Cr') : '';

  const columns: Column<LedgerPosting>[] = [
    { id: 'date', header: 'Date', width: 116, sortValue: (r) => r.date, cell: (r) => <span className="tabular">{formatDate(r.date)}</span> },
    { id: 'reference', header: 'Journal', width: 168, sortValue: (r) => r.reference, cell: (r) => <span className="tabular">{r.reference}</span> },
    { id: 'description', header: 'Description', width: 240, sortValue: (r) => r.description, cell: (r) => <span className="block truncate">{r.description}</span> },
    { id: 'memo', header: 'Memo', width: 200, sortValue: (r) => r.memo, cell: (r) => <span className="block truncate text-ink-muted">{r.memo}</span> },
    { id: 'debit', header: 'Debit', numeric: true, width: 140, sortValue: (r) => r.debit, cell: (r) => r.debit ? formatMoney(r.debit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.debit, 0)) },
    { id: 'credit', header: 'Credit', numeric: true, width: 140, sortValue: (r) => r.credit, cell: (r) => r.credit ? formatMoney(r.credit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.credit, 0)) },
    { id: 'running', header: `Balance (${naturalSide})`, numeric: true, width: 160, sortValue: (r) => r.runningBalance, cell: (r) => <span className="tabular font-medium">{formatMoney(r.runningBalance)}</span> }];


  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/ledger'].trail}
        title="General ledger"
        meta={<span>Posted journals only — drafts and pending entries do not affect balances.</span>} />


      <div className="space-y-4 p-5">
        <Card>
          <CardHeader title="Account" description="Pick an account to see every posted movement and its running balance." />
          <div className="grid grid-cols-12 gap-4 px-5 pb-4">
            <Field label="Ledger account" span={6}>
              <Select
                value={selected}
                onChange={(e) => setCode(e.target.value)}
                options={accounts.map((a) => ({ value: a.account, label: `${a.account} — ${a.accountName}` }))} />
            </Field>
          </div>
        </Card>

        {activity ?
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatTile label="Opening balance" value={formatMoney(activity.opening)} />
              <StatTile label="Period debits" value={formatMoney(activity.totalDebit)} />
              <StatTile label="Period credits" value={formatMoney(activity.totalCredit)} />
              <StatTile emphasis label={`Closing balance (${naturalSide})`} value={formatMoney(activity.closing)} footnote={activity.classification} />
            </div>

            <DataTable
              caption={`Posted activity for ${activity.account} — ${activity.accountName}`}
              columns={columns}
              rows={activity.postings}
              getRowId={(r) => r.id}
              showTotals
              pinFirstColumn
              emptyTitle="No posted movements"
              emptyDescription="This account has an opening balance but no posted journal lines in this period."
              rowActions={(row) =>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-small text-primary-text hover:underline"
                  onClick={() => navigate('/finance/journals')}
                  aria-label={`Open ${row.reference}`}>
                  Open <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden />
                </button>
              } />
          </div> :

          <Card>
            <EmptyState
              icon={BookOpenIcon}
              title="No ledger accounts yet"
              description="Post a journal from the Journal entries screen and its accounts will appear here." />
          </Card>
        }
      </div>
    </div>);

}
