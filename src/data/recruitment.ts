import { createCollection } from '../core/store/createCollection';

export type JobStatus = 'open' | 'closed' | 'onHold';
export type ApplicationStage = 'applied' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Job {
  id: string;
  reference: string;
  title: string;
  department: string;
  grade: string;
  positions: number;
  status: JobStatus;
  postedOn: string;
  closingOn: string;
}

export interface Application {
  id: string;
  applicant: string;
  email: string;
  jobTitle: string;
  stage: ApplicationStage;
  appliedOn: string;
  rating?: number;
}

const SEED_JOBS: Job[] = [
  { id: 'job-0001', reference: 'REQ-2026-0001', title: 'Payroll Officer', department: 'Finance', grade: 'G3', positions: 1, status: 'open', postedOn: '2026-01-06', closingOn: '2026-02-06' },
  { id: 'job-0002', reference: 'REQ-2026-0002', title: 'Procurement Analyst', department: 'Procurement', grade: 'G3', positions: 2, status: 'open', postedOn: '2026-01-10', closingOn: '2026-02-10' },
  { id: 'job-0003', reference: 'REQ-2026-0003', title: 'Software Engineer', department: 'Information Technology', grade: 'G3', positions: 3, status: 'open', postedOn: '2026-01-14', closingOn: '2026-02-14' },
  { id: 'job-0004', reference: 'REQ-2026-0004', title: 'Internal Auditor', department: 'Internal Audit', grade: 'G4', positions: 1, status: 'onHold', postedOn: '2026-01-16', closingOn: '2026-02-20' },
  { id: 'job-0005', reference: 'REQ-2026-0005', title: 'HR Assistant', department: 'Human Resources', grade: 'G1', positions: 1, status: 'open', postedOn: '2026-01-20', closingOn: '2026-02-24' },
  { id: 'job-0006', reference: 'REQ-2026-0006', title: 'Operations Officer', department: 'Operations', grade: 'G2', positions: 2, status: 'closed', postedOn: '2025-11-05', closingOn: '2025-12-05' },
  { id: 'job-0007', reference: 'REQ-2026-0007', title: 'Facilities Officer', department: 'Facilities', grade: 'G2', positions: 1, status: 'closed', postedOn: '2025-11-18', closingOn: '2025-12-18' },
  { id: 'job-0008', reference: 'REQ-2026-0008', title: 'Accountant', department: 'Finance', grade: 'G3', positions: 1, status: 'onHold', postedOn: '2026-01-24', closingOn: '2026-02-28' }
];

const SEED_APPLICATIONS: Application[] = [
  { id: 'app-0001', applicant: 'Kevin Omondi', email: 'kevin.omondi@mail.co.ke', jobTitle: 'Software Engineer', stage: 'interview', appliedOn: '2026-01-16', rating: 4 },
  { id: 'app-0002', applicant: 'Lucy Njeri', email: 'lucy.njeri@mail.co.ke', jobTitle: 'Software Engineer', stage: 'shortlisted', appliedOn: '2026-01-17', rating: 3 },
  { id: 'app-0003', applicant: 'Abdi Rahman', email: 'abdi.rahman@mail.co.ke', jobTitle: 'Procurement Analyst', stage: 'applied', appliedOn: '2026-01-18' },
  { id: 'app-0004', applicant: 'Christine Auma', email: 'christine.auma@mail.co.ke', jobTitle: 'Payroll Officer', stage: 'offer', appliedOn: '2026-01-12', rating: 5 },
  { id: 'app-0005', applicant: 'Dennis Kiptoo', email: 'dennis.kiptoo@mail.co.ke', jobTitle: 'HR Assistant', stage: 'interview', appliedOn: '2026-01-22', rating: 4 },
  { id: 'app-0006', applicant: 'Mercy Wangari', email: 'mercy.wangari@mail.co.ke', jobTitle: 'Software Engineer', stage: 'rejected', appliedOn: '2026-01-15', rating: 2 },
  { id: 'app-0007', applicant: 'Fredrick Ochieng', email: 'fredrick.ochieng@mail.co.ke', jobTitle: 'Procurement Analyst', stage: 'shortlisted', appliedOn: '2026-01-19', rating: 3 },
  { id: 'app-0008', applicant: 'Janet Muthoni', email: 'janet.muthoni@mail.co.ke', jobTitle: 'Payroll Officer', stage: 'hired', appliedOn: '2026-01-08', rating: 5 },
  { id: 'app-0009', applicant: 'Victor Kiplagat', email: 'victor.kiplagat@mail.co.ke', jobTitle: 'Software Engineer', stage: 'applied', appliedOn: '2026-01-23' },
  { id: 'app-0010', applicant: 'Sylvia Nduta', email: 'sylvia.nduta@mail.co.ke', jobTitle: 'HR Assistant', stage: 'shortlisted', appliedOn: '2026-01-24', rating: 4 },
  { id: 'app-0011', applicant: 'Ibrahim Hassan', email: 'ibrahim.hassan@mail.co.ke', jobTitle: 'Internal Auditor', stage: 'interview', appliedOn: '2026-01-20', rating: 3 },
  { id: 'app-0012', applicant: 'Beatrice Akinyi', email: 'beatrice.akinyi@mail.co.ke', jobTitle: 'Software Engineer', stage: 'offer', appliedOn: '2026-01-14', rating: 5 }
];

export const jobsStore = createCollection<Job>('emtech.store.jobs.v1', SEED_JOBS, 'job');
export const applicationsStore = createCollection<Application>('emtech.store.applications.v1', SEED_APPLICATIONS, 'app');
