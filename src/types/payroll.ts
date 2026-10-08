import type { DocumentStatus } from './common';

export type PayrollPhase = 'setup' | 'inputs' | 'calculate' | 'review' | 'commit';

export interface PayrollStep {
  id: string;
  index: number;
  phase: PayrollPhase;
  title: string;
  /** Stated before the step runs: what this step will change. */
  willChange: string;
  /** Stated after the step runs: what it changed. */
  didChange: string;
  kind: 'form' | 'input-table' | 'compute' | 'review' | 'register' | 'commit';
  requiresConfirmation?: boolean;
}

export interface PayrollRun {
  id: string;
  reference: string;
  period: string;
  payGroup: string;
  employees: number;
  gross: number;
  net: number;
  status: DocumentStatus;
  stepsComplete: number;
  owner: string;
  updatedAt: string;
}

export interface RegisterRow {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  payGroup: string;
  daysWorked: number;
  basic: number;
  housing: number;
  transport: number;
  utility: number;
  meal: number;
  overtime: number;
  bonus: number;
  actingAllowance: number;
  gross: number;
  nssf: number;
  housingLevy: number;
  shif: number;
  payeTax: number;
  loanRepayment: number;
  salaryAdvance: number;
  unionDues: number;
  absenceDeduction: number;
  totalDeductions: number;
  net: number;
  previousNet: number;
  variance: number;
  bank: string;
  accountNumber: string;
  flag?: 'blocking' | 'warning';
}

export interface PayrollException {
  id: string;
  severity: 'blocking' | 'warning';
  code: string;
  title: string;
  detail: string;
  employees: string[];
  resolution: string;
  acknowledged?: boolean;
}

export interface InputBatchRow {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  value: number;
  unit: string;
  source: string;
  note?: string;
}