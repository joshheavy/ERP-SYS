import { createCollection } from '../core/store/createCollection';
import type { DocumentStatus } from '../types/common';

/* ------------------------------------------------------------------ *
 * Exit Management — employee offboarding.
 * An exit case tracks a departing employee from initiation through a
 * clearance checklist to final approval and completion. Clearance must
 * be complete before the exit can be approved.
 * ------------------------------------------------------------------ */

export type ExitType = 'resignation' | 'termination' | 'retirement' | 'end-of-contract';

export type ExitStatus = 'initiated' | 'clearance' | 'approved' | 'completed' | 'rejected';

/** A single clearance sign-off item (department confirms nothing is outstanding). */
export interface ClearanceItem {
  id: string;
  label: string;
  /** The department/owner responsible for this sign-off. */
  owner: string;
  cleared: boolean;
}

export interface ExitCase {
  id: string;
  reference: string;
  employee: string;
  department: string;
  jobTitle: string;
  type: ExitType;
  reason: string;
  noticeDate: string;
  lastWorkingDay: string;
  status: ExitStatus;
  clearance: ClearanceItem[];
  raisedBy: string;
}

export const EXIT_TYPES: ExitType[] = ['resignation', 'termination', 'retirement', 'end-of-contract'];

export const EXIT_TYPE_LABEL: Record<ExitType, string> = {
  resignation: 'Resignation',
  termination: 'Termination',
  retirement: 'Retirement',
  'end-of-contract': 'End of contract'
};

export const EXIT_STATUSES: ExitStatus[] = ['initiated', 'clearance', 'approved', 'completed', 'rejected'];

export const EXIT_BADGE: Record<ExitStatus, { status: DocumentStatus; label: string }> = {
  initiated: { status: 'submitted', label: 'Initiated' },
  clearance: { status: 'pending', label: 'In clearance' },
  approved: { status: 'approved', label: 'Approved' },
  completed: { status: 'posted', label: 'Completed' },
  rejected: { status: 'rejected', label: 'Rejected' }
};

/** The standard clearance checklist every exit starts with. */
export function defaultClearance(): ClearanceItem[] {
  return [
    { id: 'cl-it', label: 'IT assets & access revoked', owner: 'Information Technology', cleared: false },
    { id: 'cl-fin', label: 'Finance dues & advances settled', owner: 'Finance', cleared: false },
    { id: 'cl-handover', label: 'Work handover completed', owner: 'Line manager', cleared: false },
    { id: 'cl-assets', label: 'Company assets returned', owner: 'Facilities', cleared: false },
    { id: 'cl-hr', label: 'HR documents & final dues', owner: 'Human Resources', cleared: false }
  ];
}

/** Clearance completion as a 0..1 fraction. */
export function clearanceProgress(c: ExitCase): number {
  if (c.clearance.length === 0) return 0;
  return c.clearance.filter((i) => i.cleared).length / c.clearance.length;
}

export function clearanceComplete(c: ExitCase): boolean {
  return c.clearance.length > 0 && c.clearance.every((i) => i.cleared);
}

/** Build a clearance list with the first `clearedCount` items marked done (seed helper). */
function seededClearance(clearedCount: number): ClearanceItem[] {
  return defaultClearance().map((item, i) => ({ ...item, cleared: i < clearedCount }));
}

const SEED_EXITS: ExitCase[] = [
  {
    id: 'ext-0001',
    reference: 'EXT-2026-0007',
    employee: 'Grace Otieno',
    department: 'Facilities',
    jobTitle: 'Facilities Officer',
    type: 'resignation',
    reason: 'Accepted a role at another organisation.',
    noticeDate: '2026-09-01',
    lastWorkingDay: '2026-09-30',
    status: 'clearance',
    clearance: seededClearance(3),
    raisedBy: 'Mary Wanjiru'
  },
  {
    id: 'ext-0002',
    reference: 'EXT-2026-0006',
    employee: 'Samuel Kiprono',
    department: 'Internal Audit',
    jobTitle: 'Internal Auditor',
    type: 'retirement',
    reason: 'Reached mandatory retirement age.',
    noticeDate: '2026-07-15',
    lastWorkingDay: '2026-10-31',
    status: 'initiated',
    clearance: seededClearance(0),
    raisedBy: 'Mary Wanjiru'
  },
  {
    id: 'ext-0003',
    reference: 'EXT-2026-0005',
    employee: 'Daniel Mwangi',
    department: 'Operations',
    jobTitle: 'Operations Officer',
    type: 'end-of-contract',
    reason: 'Fixed-term contract concluded and not renewed.',
    noticeDate: '2026-08-01',
    lastWorkingDay: '2026-08-31',
    status: 'completed',
    clearance: seededClearance(5),
    raisedBy: 'Aisha Mohamed'
  },
  {
    id: 'ext-0004',
    reference: 'EXT-2026-0004',
    employee: 'Brian Kamau',
    department: 'Information Technology',
    jobTitle: 'Software Engineer',
    type: 'resignation',
    reason: 'Relocating abroad.',
    noticeDate: '2026-08-20',
    lastWorkingDay: '2026-09-20',
    status: 'approved',
    clearance: seededClearance(5),
    raisedBy: 'Mary Wanjiru'
  }
];

export const exitsStore = createCollection<ExitCase>('emtech.store.exits.v1', SEED_EXITS, 'ext');
