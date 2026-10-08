import React from 'react';
import { AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { formatMoney, formatVariance } from '../../utils/format';
import type { Column } from '../data-table/types';
import type { RegisterRow } from '../../types/payroll';

const money = (value: number) => value ? formatMoney(value, { symbol: false }) : '—';
const sum = (rows: RegisterRow[], key: keyof RegisterRow) =>
  formatMoney(
    rows.reduce((total, row) => total + (row[key] as number), 0),
    { symbol: false }
  );

/** The register is the DataTable's hardest test: 20+ columns, banded, pinned and totalled. */
export const REGISTER_COLUMNS: Column<RegisterRow>[] = [
  {
    id: 'employee',
    header: 'Employee',
    width: 210,
    sortValue: (r) => r.name,
    cell: (r) =>
      <span className="flex items-center gap-1.5">
        {r.flag === 'blocking' &&
          <XCircleIcon className="h-3.5 w-3.5 shrink-0 text-danger" aria-label="Blocking exception" />
        }
        {r.flag === 'warning' &&
          <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Warning" />
        }
        <span className="min-w-0">
          <span className="block truncate">{r.name}</span>
          <span className="tabular block text-caption text-ink-subtle">{r.employeeId}</span>
        </span>
      </span>

  },
  { id: 'department', header: 'Department', width: 170, sortValue: (r) => r.department, cell: (r) => r.department },
  { id: 'grade', header: 'Grade', width: 84, sortValue: (r) => r.grade, cell: (r) => <span className="tabular">{r.grade}</span> },
  { id: 'payGroup', header: 'Pay group', width: 130, defaultHidden: true, sortValue: (r) => r.payGroup, cell: (r) => r.payGroup },
  { id: 'daysWorked', header: 'Days', numeric: true, width: 74, sortValue: (r) => r.daysWorked, cell: (r) => r.daysWorked, tone: (r) => r.daysWorked < 22 ? 'warning' : undefined },

  { id: 'basic', header: 'Basic', group: 'Earnings', numeric: true, width: 120, sortValue: (r) => r.basic, cell: (r) => money(r.basic), total: (rows) => sum(rows, 'basic') },
  { id: 'housing', header: 'Housing', group: 'Earnings', numeric: true, width: 112, sortValue: (r) => r.housing, cell: (r) => money(r.housing), total: (rows) => sum(rows, 'housing') },
  { id: 'transport', header: 'Transport', group: 'Earnings', numeric: true, width: 112, sortValue: (r) => r.transport, cell: (r) => money(r.transport), total: (rows) => sum(rows, 'transport') },
  { id: 'utility', header: 'Utility', group: 'Earnings', numeric: true, width: 104, defaultHidden: true, sortValue: (r) => r.utility, cell: (r) => money(r.utility), total: (rows) => sum(rows, 'utility') },
  { id: 'meal', header: 'Meal', group: 'Earnings', numeric: true, width: 100, defaultHidden: true, sortValue: (r) => r.meal, cell: (r) => money(r.meal), total: (rows) => sum(rows, 'meal') },
  { id: 'overtime', header: 'Overtime', group: 'Earnings', numeric: true, width: 108, sortValue: (r) => r.overtime, cell: (r) => money(r.overtime), total: (rows) => sum(rows, 'overtime') },
  { id: 'bonus', header: 'Bonus', group: 'Earnings', numeric: true, width: 104, sortValue: (r) => r.bonus, cell: (r) => money(r.bonus), total: (rows) => sum(rows, 'bonus') },
  { id: 'acting', header: 'Acting', group: 'Earnings', numeric: true, width: 104, sortValue: (r) => r.actingAllowance, cell: (r) => money(r.actingAllowance), total: (rows) => sum(rows, 'actingAllowance') },
  { id: 'gross', header: 'Gross', group: 'Earnings', numeric: true, width: 132, sortValue: (r) => r.gross, cell: (r) => <span className="font-semibold">{money(r.gross)}</span>, total: (rows) => sum(rows, 'gross') },

  { id: 'paye', header: 'PAYE', group: 'Deductions', numeric: true, width: 116, sortValue: (r) => r.payeTax, cell: (r) => money(r.payeTax), total: (rows) => sum(rows, 'payeTax') },
  { id: 'nssf', header: 'NSSF', group: 'Deductions', numeric: true, width: 112, sortValue: (r) => r.nssf, cell: (r) => money(r.nssf), total: (rows) => sum(rows, 'nssf') },
  { id: 'housingLevy', header: 'Housing Levy', group: 'Deductions', numeric: true, width: 118, defaultHidden: true, sortValue: (r) => r.housingLevy, cell: (r) => money(r.housingLevy), total: (rows) => sum(rows, 'housingLevy') },
  { id: 'shif', header: 'SHIF', group: 'Deductions', numeric: true, width: 100, defaultHidden: true, sortValue: (r) => r.shif, cell: (r) => money(r.shif), total: (rows) => sum(rows, 'shif') },
  { id: 'loan', header: 'Loan', group: 'Deductions', numeric: true, width: 104, sortValue: (r) => r.loanRepayment, cell: (r) => money(r.loanRepayment), total: (rows) => sum(rows, 'loanRepayment') },
  { id: 'advance', header: 'Advance', group: 'Deductions', numeric: true, width: 108, sortValue: (r) => r.salaryAdvance, cell: (r) => money(r.salaryAdvance), total: (rows) => sum(rows, 'salaryAdvance') },
  { id: 'union', header: 'Union', group: 'Deductions', numeric: true, width: 96, defaultHidden: true, sortValue: (r) => r.unionDues, cell: (r) => money(r.unionDues), total: (rows) => sum(rows, 'unionDues') },
  { id: 'absence', header: 'Absence', group: 'Deductions', numeric: true, width: 108, sortValue: (r) => r.absenceDeduction, cell: (r) => money(r.absenceDeduction), total: (rows) => sum(rows, 'absenceDeduction') },
  { id: 'totalDeductions', header: 'Total', group: 'Deductions', numeric: true, width: 124, sortValue: (r) => r.totalDeductions, cell: (r) => <span className="font-semibold">{money(r.totalDeductions)}</span>, total: (rows) => sum(rows, 'totalDeductions') },

  { id: 'net', header: 'Net pay', group: 'Net', numeric: true, width: 136, sortValue: (r) => r.net, cell: (r) => <span className="font-semibold">{money(r.net)}</span>, total: (rows) => sum(rows, 'net') },
  { id: 'previousNet', header: 'Aug net', group: 'Net', numeric: true, width: 128, sortValue: (r) => r.previousNet, cell: (r) => money(r.previousNet), total: (rows) => sum(rows, 'previousNet') },
  {
    id: 'variance',
    header: 'Variance',
    group: 'Net',
    numeric: true,
    width: 128,
    sortValue: (r) => r.variance,
    cell: (r) => formatVariance(r.variance),
    tone: (r) => r.variance < 0 ? 'neg' : r.variance > 0 ? 'pos' : undefined,
    total: (rows) => formatVariance(rows.reduce((total, row) => total + row.variance, 0))
  },
  { id: 'bank', header: 'Bank', group: 'Payment', width: 140, defaultHidden: true, sortValue: (r) => r.bank, cell: (r) => r.bank },
  {
    id: 'account',
    header: 'Account',
    group: 'Payment',
    width: 140,
    defaultHidden: true,
    sortValue: (r) => r.accountNumber,
    cell: (r) =>
      r.accountNumber ?
        <span className="tabular">{r.accountNumber}</span> :

        <span className="text-danger">Missing</span>

  }];


/** The narrow variance view used in the review phase. */
export const VARIANCE_COLUMNS: Column<RegisterRow>[] = [
  REGISTER_COLUMNS[0],
  REGISTER_COLUMNS[1],
  REGISTER_COLUMNS[2],
  { id: 'gross', header: 'Gross', numeric: true, width: 140, sortValue: (r) => r.gross, cell: (r) => money(r.gross), total: (rows) => sum(rows, 'gross') },
  { id: 'previousNet', header: 'August net', numeric: true, width: 140, sortValue: (r) => r.previousNet, cell: (r) => money(r.previousNet), total: (rows) => sum(rows, 'previousNet') },
  { id: 'net', header: 'September net', numeric: true, width: 148, sortValue: (r) => r.net, cell: (r) => <span className="font-semibold">{money(r.net)}</span>, total: (rows) => sum(rows, 'net') },
  {
    id: 'variance',
    header: 'Variance',
    numeric: true,
    width: 136,
    sortValue: (r) => r.variance,
    cell: (r) => formatVariance(r.variance),
    tone: (r) => r.variance < 0 ? 'neg' : r.variance > 0 ? 'pos' : undefined,
    total: (rows) => formatVariance(rows.reduce((total, row) => total + row.variance, 0))
  },
  {
    id: 'pct',
    header: 'Change',
    numeric: true,
    width: 108,
    sortValue: (r) => r.variance / r.previousNet,
    cell: (r) => `${(r.variance / r.previousNet * 100).toFixed(1)}%`,
    tone: (r) => Math.abs(r.variance / r.previousNet) > 0.1 ? 'warning' : undefined
  }];