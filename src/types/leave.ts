import type { DocumentStatus, TimelineEvent } from './common';

export type LeaveType = 'annual' | 'sick' | 'compassionate' | 'study' | 'maternity';

export interface LeaveBalance {
  type: LeaveType;
  label: string;
  entitlement: number;
  taken: number;
  pending: number;
}

export interface LeaveRequest {
  id: string;
  reference: string;
  employeeId: string;
  employee: string;
  department: string;
  type: LeaveType;
  typeLabel: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  reliever: string;
  status: DocumentStatus;
  stage: 'supervisor' | 'hr' | 'complete' | 'rejected';
  queuePosition?: number;
  submittedAt: string;
  timeline: TimelineEvent[];
  raisedByCurrentUser?: boolean;
}

export interface TeamAbsence {
  employee: string;
  department: string;
  type: LeaveType;
  typeLabel: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending';
}

export interface Payslip {
  id: string;
  period: string;
  gross: number;
  deductions: number;
  net: number;
  paidOn: string;
}