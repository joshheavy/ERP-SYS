import { createCollection } from '../core/store/createCollection';

export type CaseStatus = 'open' | 'reviewing' | 'resolved' | 'closed';
export type GrievanceCategory = 'Workplace' | 'Pay' | 'Harassment' | 'Other';
export type GrievanceSeverity = 'low' | 'medium' | 'high';

export interface Grievance {
  id: string;
  reference: string;
  employee: string;
  category: GrievanceCategory;
  severity: GrievanceSeverity;
  status: CaseStatus;
  raisedOn: string;
  summary: string;
}

export interface DisciplinaryCase {
  id: string;
  reference: string;
  employee: string;
  violation: string;
  action: string;
  status: CaseStatus;
  raisedOn: string;
  notes: string;
}

const SEED_GRIEVANCES: Grievance[] = [
  { id: 'grv-0001', reference: 'GRV-2026-0001', employee: 'Mary Wanjiru', category: 'Pay', severity: 'medium', status: 'open', raisedOn: '2026-01-08', summary: 'Overtime hours not reflected in the January payslip.' },
  { id: 'grv-0002', reference: 'GRV-2026-0002', employee: 'Peter Njoroge', category: 'Workplace', severity: 'low', status: 'reviewing', raisedOn: '2026-01-10', summary: 'Requesting a workstation move away from a noisy area.' },
  { id: 'grv-0003', reference: 'GRV-2026-0003', employee: 'Samuel Mutua', category: 'Harassment', severity: 'high', status: 'reviewing', raisedOn: '2026-01-12', summary: 'Report of intimidating conduct from a peer during a meeting.' },
  { id: 'grv-0004', reference: 'GRV-2026-0004', employee: 'Faith Chebet', category: 'Workplace', severity: 'low', status: 'resolved', raisedOn: '2025-12-20', summary: 'Faulty air conditioning in the second floor office.' },
  { id: 'grv-0005', reference: 'GRV-2026-0005', employee: 'Joseph Kariuki', category: 'Pay', severity: 'medium', status: 'closed', raisedOn: '2025-12-05', summary: 'Delayed reimbursement of approved travel claim.' },
  { id: 'grv-0006', reference: 'GRV-2026-0006', employee: 'Grace Achieng', category: 'Other', severity: 'low', status: 'open', raisedOn: '2026-01-15', summary: 'Clarification needed on the new leave carry-over policy.' },
  { id: 'grv-0007', reference: 'GRV-2026-0007', employee: 'Wanjiku Kamau', category: 'Workplace', severity: 'medium', status: 'reviewing', raisedOn: '2026-01-16', summary: 'Concern over unequal distribution of workload in the team.' },
  { id: 'grv-0008', reference: 'GRV-2026-0008', employee: 'Aisha Mohamed', category: 'Harassment', severity: 'high', status: 'resolved', raisedOn: '2025-12-28', summary: 'Inappropriate remarks reported and addressed with counselling.' }
];

const SEED_DISCIPLINARY: DisciplinaryCase[] = [
  { id: 'dsc-0001', reference: 'DSC-2026-0001', employee: 'Peter Njoroge', violation: 'Repeated late arrival', action: 'Verbal warning', status: 'resolved', raisedOn: '2026-01-06', notes: 'Employee counselled on timekeeping expectations.' },
  { id: 'dsc-0002', reference: 'DSC-2026-0002', employee: 'Samuel Mutua', violation: 'Unauthorised absence', action: 'Written warning', status: 'reviewing', raisedOn: '2026-01-09', notes: 'Two days absent without notice; awaiting explanation.' },
  { id: 'dsc-0003', reference: 'DSC-2026-0003', employee: 'Joseph Kariuki', violation: 'Breach of expense policy', action: 'Written warning', status: 'open', raisedOn: '2026-01-11', notes: 'Personal expense charged to company card.' },
  { id: 'dsc-0004', reference: 'DSC-2026-0004', employee: 'Mary Wanjiru', violation: 'Misuse of company equipment', action: 'Verbal warning', status: 'open', raisedOn: '2026-01-13', notes: 'Non-work software installed on the workstation.' },
  { id: 'dsc-0005', reference: 'DSC-2026-0005', employee: 'Daniel Mwangi', violation: 'Gross misconduct', action: 'Suspension pending review', status: 'closed', raisedOn: '2025-11-22', notes: 'Case concluded following disciplinary hearing.' },
  { id: 'dsc-0006', reference: 'DSC-2026-0006', employee: 'Wanjiku Kamau', violation: 'Confidentiality breach', action: 'Final written warning', status: 'reviewing', raisedOn: '2026-01-14', notes: 'Shared a draft tender document externally.' },
  { id: 'dsc-0007', reference: 'DSC-2026-0007', employee: 'Faith Chebet', violation: 'Insubordination', action: 'Verbal warning', status: 'resolved', raisedOn: '2025-12-18', notes: 'Refused a reasonable task; resolved after discussion.' },
  { id: 'dsc-0008', reference: 'DSC-2026-0008', employee: 'Grace Achieng', violation: 'Policy non-compliance', action: 'Written warning', status: 'open', raisedOn: '2026-01-17', notes: 'Did not follow the updated approval workflow.' }
];

export const grievancesStore = createCollection<Grievance>('emtech.store.grievances.v1', SEED_GRIEVANCES, 'grv');
export const disciplinaryStore = createCollection<DisciplinaryCase>('emtech.store.disciplinary.v1', SEED_DISCIPLINARY, 'dsc');
