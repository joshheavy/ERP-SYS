'use client';

import React, { useMemo, useState } from 'react';
import { DownloadIcon, FileBarChartIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { PeriodPicker, type PeriodGranularity } from '../../components/ui/DatePicker';
import { SearchableMultiSelect } from '../../components/ui/SearchableMultiSelect';
import { DataTable } from '../../components/data-table/DataTable';
import { Field, FormSection } from '../../components/forms/FormSection';
import { StatTile } from '../../components/ui/StatTile';
import { useCollection } from '../../core/store/createCollection';
import { journalsStore, deriveTrialBalance, type TrialBalanceRow } from '../../data/ledger';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatPeriod } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

const COST_CENTRES = [
  { value: 'CC-100', label: 'CC-100 Corporate' },
  { value: 'CC-110', label: 'CC-110 Human Resources' },
  { value: 'CC-210', label: 'CC-210 Information Technology' },
  { value: 'CC-320', label: 'CC-320 Facilities' },
  { value: 'CC-410', label: 'CC-410 Operations' }];


const CLASSIFICATIONS = [
  { value: '', label: 'All classifications' },
  { value: 'Asset', label: 'Assets' },
  { value: 'Liability', label: 'Liabilities' },
  { value: 'Expense', label: 'Expenses' }];


export function TrialBalanceReport() {
  const [period, setPeriod] = useState('2026-09');
  const [granularity, setGranularity] = useState<PeriodGranularity>('month');
  const [costCentres, setCostCentres] = useState<string[]>([]);
  const [classification, setClassification] = useState('');
  const [basis, setBasis] = useState('accrual');
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const journals = useCollection(journalsStore);
  const allRows = useMemo(() => deriveTrialBalance(journals), [journals]);
  const rows = useMemo(
    () => allRows.filter((row) => !classification || row.classification === classification),
    [allRows, classification]
  );

  const totals = useMemo(
    () => ({
      debit: rows.reduce((sum, r) => sum + r.closingDebit, 0),
      credit: rows.reduce((sum, r) => sum + r.closingCredit, 0)
    }),
    [rows]
  );

  const columns: Column<TrialBalanceRow>[] = [
    { id: 'account', header: 'Account', width: 96, sortValue: (r) => r.account, cell: (r) => <span className="tabular">{r.account}</span> },
    { id: 'name', header: 'Account name', width: 230, sortValue: (r) => r.accountName, cell: (r) => r.accountName },
    { id: 'class', header: 'Classification', width: 130, sortValue: (r) => r.classification, cell: (r) => r.classification },
    { id: 'od', header: 'Debit', group: 'Opening balance', numeric: true, width: 140, sortValue: (r) => r.openingDebit, cell: (r) => r.openingDebit ? formatMoney(r.openingDebit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.openingDebit, 0)) },
    { id: 'oc', header: 'Credit', group: 'Opening balance', numeric: true, width: 140, sortValue: (r) => r.openingCredit, cell: (r) => r.openingCredit ? formatMoney(r.openingCredit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.openingCredit, 0)) },
    { id: 'pd', header: 'Debit', group: 'Period movement', numeric: true, width: 140, sortValue: (r) => r.periodDebit, cell: (r) => r.periodDebit ? formatMoney(r.periodDebit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.periodDebit, 0)) },
    { id: 'pc', header: 'Credit', group: 'Period movement', numeric: true, width: 140, sortValue: (r) => r.periodCredit, cell: (r) => r.periodCredit ? formatMoney(r.periodCredit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.periodCredit, 0)) },
    { id: 'cd', header: 'Debit', group: 'Closing balance', numeric: true, width: 148, sortValue: (r) => r.closingDebit, cell: (r) => r.closingDebit ? formatMoney(r.closingDebit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.closingDebit, 0)) },
    { id: 'cc', header: 'Credit', group: 'Closing balance', numeric: true, width: 148, sortValue: (r) => r.closingCredit, cell: (r) => r.closingCredit ? formatMoney(r.closingCredit) : '—', total: (all) => formatMoney(all.reduce((s, r) => s + r.closingCredit, 0)) }];


  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedAt('14 Sep 2026, 17:02');
    }, 700);
  };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/reports/trial-balance'].trail}
        title="Trial balance"
        meta={
          generatedAt ?
            <>
              <span>{formatPeriod(period)}</span>
              <span aria-hidden>·</span>
              <span>Generated {generatedAt}</span>
            </> :

            <span>Choose the parameters, then generate the report.</span>

        }
        primaryAction={
          generatedAt ?
            <Button
              variant="primary"
              icon={DownloadIcon}
              onClick={() => toast.success('Export queued', { description: 'Trial balance, September 2026 — XLSX.' })}>

              Export
            </Button> :

            <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
              Generate report
            </Button>

        }
        secondaryActions={
          generatedAt &&
          <Button icon={RotateCcwIcon} onClick={() => setGeneratedAt(null)}>
            Change parameters
          </Button>

        } />


      <div className="p-5">
        {!generatedAt ?
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 xl:col-span-8">
              <CardHeader title="Report parameters" description="Nothing is generated until you run the report." />
              <FormSection title="Scope" description="Which period and which parts of the organisation the report covers.">
                <Field label="Period" span={6} required>
                  <PeriodPicker
                    label="Reporting period"
                    value={period}
                    granularity={granularity}
                    onChange={(p, g) => {
                      setPeriod(p);
                      setGranularity(g);
                    }} />

                </Field>
                <Field label="Basis" span={6} required>
                  <Select
                    value={basis}
                    onChange={(e) => setBasis(e.target.value)}
                    options={[
                      { value: 'accrual', label: 'Accrual basis' },
                      { value: 'cash', label: 'Cash basis' }]
                    } />

                </Field>
                <Field
                  label="Cost centres"
                  span={12}
                  hint={costCentres.length === 0 ? 'Leave empty to include every cost centre.' : undefined}>

                  <SearchableMultiSelect
                    label="Cost centres"
                    options={COST_CENTRES}
                    value={costCentres}
                    onChange={setCostCentres}
                    placeholder="All cost centres" />

                </Field>
                <Field label="Classification" span={6}>
                  <Select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    options={CLASSIFICATIONS} />

                </Field>
              </FormSection>
              <div className="flex items-center justify-end gap-2 px-5 py-4">
                <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
                  Generate report
                </Button>
              </div>
            </Card>

            <Card className="col-span-12 xl:col-span-4">
              <EmptyState
                icon={FileBarChartIcon}
                title="No report generated yet"
                description="Reports in this system are never run automatically — you choose the parameters, generate, then export. The last five runs stay available for 30 days." />

            </Card>
          </div> :

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Total closing debits" value={formatMoney(totals.debit)} />
              <StatTile label="Total closing credits" value={formatMoney(totals.credit)} />
              <StatTile
                emphasis
                label="Difference"
                value={formatMoney(totals.debit - totals.credit)}
                footnote={totals.debit === totals.credit ? 'Balanced' : 'Investigate before period close'} />

            </div>
            <DataTable
              caption={`Trial balance for ${formatPeriod(period)}`}
              columns={columns}
              rows={rows}
              getRowId={(r) => r.id}
              pinFirstColumn
              showTotals
              pageSize={20}
              toolbar={
                <p className="text-small text-ink-muted">
                  {formatPeriod(period)} · {basis === 'accrual' ? 'Accrual basis' : 'Cash basis'} ·{' '}
                  {costCentres.length === 0 ? 'All cost centres' : `${costCentres.length} cost centres`}
                </p>
              } />

          </div>
        }
      </div>
    </div>);

}