'use client';

import React, { useMemo, useState } from 'react';
import { DownloadIcon, FileBarChartIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Field, FormSection } from '../../components/forms/FormSection';
import { DataTable } from '../../components/data-table/DataTable';
import { StatTile } from '../../components/ui/StatTile';
import {
  incomeStatementStore,
  INCOME_CATEGORIES,
  type IncomeCategory,
  type IncomeStatementLine
} from '../../data/incomeStatement';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney, formatPeriod } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

/** A rendered statement row: either an account line or a computed subtotal. */
interface ReportRow {
  id: string;
  label: string;
  amount: number;
  kind: 'line' | 'subtotal';
  category?: IncomeCategory;
}

const PERIODS = [
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-07', label: 'July 2026' }
];

export function IncomeStatement() {
  const lines = useCollection(incomeStatementStore);
  const [period, setPeriod] = useState('2026-09');
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const totalFor = (category: IncomeCategory) =>
    lines.filter((l) => l.category === category).reduce((s, l) => s + l.amount, 0);

  const revenue = totalFor('Revenue');
  const costOfSales = totalFor('Cost of sales');
  const operatingExpenses = totalFor('Operating expenses');
  const other = totalFor('Other');
  const grossProfit = revenue - costOfSales;
  const netProfit = grossProfit - operatingExpenses + other;

  const rows = useMemo<ReportRow[]>(() => {
    const out: ReportRow[] = [];
    const push = (category: IncomeCategory, subtotalLabel: string) => {
      lines
        .filter((l) => l.category === category)
        .forEach((l) => out.push({ id: l.id, label: l.account, amount: l.amount, kind: 'line', category }));
      out.push({ id: `sub-${category}`, label: subtotalLabel, amount: totalFor(category), kind: 'subtotal', category });
    };
    push('Revenue', 'Total revenue');
    push('Cost of sales', 'Total cost of sales');
    out.push({ id: 'sub-gross', label: 'Gross profit', amount: grossProfit, kind: 'subtotal' });
    push('Operating expenses', 'Total operating expenses');
    push('Other', 'Net other income / (costs)');
    out.push({ id: 'sub-net', label: 'Net profit', amount: netProfit, kind: 'subtotal' });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  const columns: Column<ReportRow>[] = [
    {
      id: 'category', header: 'Category', width: 170, sortValue: (r) => r.category ?? '',
      cell: (r) => (r.kind === 'line' ? <span className="text-ink-muted">{r.category}</span> : '')
    },
    {
      id: 'label', header: 'Line', width: 280, sortValue: (r) => r.label,
      cell: (r) => <span className={r.kind === 'subtotal' ? 'font-semibold text-ink' : undefined}>{r.label}</span>
    },
    {
      id: 'amount', header: 'Amount', numeric: true, width: 180, sortValue: (r) => r.amount,
      cell: (r) => <span className={r.kind === 'subtotal' ? 'font-semibold' : undefined}>{formatMoney(r.amount)}</span>
    }
  ];

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedAt('14 Sep 2026, 17:08');
    }, 400);
  };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/reports/income']?.trail ?? ['Finance', 'Reporting', 'Income statement']}
        title="Income statement"
        meta={
          generatedAt ? (
            <>
              <span>{formatPeriod(period)}</span>
              <span aria-hidden>·</span>
              <span>Generated {generatedAt}</span>
            </>
          ) : (
            <span>Choose a period, then generate the report.</span>
          )
        }
        primaryAction={
          generatedAt ? (
            <Button
              variant="primary"
              icon={DownloadIcon}
              onClick={() => toast.success('Export queued', { description: `Income statement, ${formatPeriod(period)} — XLSX.` })}
            >
              Export
            </Button>
          ) : (
            <Button variant="primary" icon={PlayIcon} loading={generating} onClick={generate}>
              Generate report
            </Button>
          )
        }
        secondaryActions={
          generatedAt && (
            <Button icon={RotateCcwIcon} onClick={() => setGeneratedAt(null)}>
              Change parameters
            </Button>
          )
        }
      />

      <div className="p-5">
        {!generatedAt ? (
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 xl:col-span-8">
              <CardHeader title="Report parameters" description="Nothing is generated until you run the report." />
              <FormSection title="Scope" description="Which period the statement covers.">
                <Field label="Period" span={6} required>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    options={PERIODS}
                  />
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
                description="Choose the period, generate, then export. The statement groups revenue, cost of sales, operating expenses and other items into subtotals."
              />
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Total revenue" value={formatMoney(revenue)} />
              <StatTile label="Gross profit" value={formatMoney(grossProfit)} footnote={`After ${formatMoney(costOfSales)} cost of sales`} />
              <StatTile
                emphasis
                label="Net profit"
                value={formatMoney(netProfit)}
                footnote={netProfit >= 0 ? 'Profit for the period' : 'Loss for the period'}
              />
            </div>
            <DataTable
              caption={`Income statement for ${formatPeriod(period)}`}
              columns={columns}
              rows={rows}
              getRowId={(r) => r.id}
              pinFirstColumn
              pageSize={30}
              toolbar={
                <p className="text-small text-ink-muted">
                  {formatPeriod(period)} · {INCOME_CATEGORIES.length} categories · Operating expenses {formatMoney(operatingExpenses)}
                </p>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
