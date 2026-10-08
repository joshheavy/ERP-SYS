import { createCollection } from '../core/store/createCollection';

export interface Branch {
  id: string;
  code: string;
  name: string;
  town: string;
  manager: string;
  active: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  head: string;
  branch: string;
}

export interface JobGrade {
  id: string;
  code: string;
  name: string;
  minSalary: number;
  maxSalary: number;
}

const SEED_BRANCHES: Branch[] = [
  { id: 'br-hq', code: 'HQ', name: 'Nairobi Head Office', town: 'Nairobi', manager: 'David Kimani', active: true },
  { id: 'br-msa', code: 'MSA', name: 'Mombasa Branch', town: 'Mombasa', manager: 'Aisha Mohamed', active: true },
  { id: 'br-nak', code: 'NAK', name: 'Nakuru Branch', town: 'Nakuru', manager: 'Daniel Mwangi', active: true },
  { id: 'br-ksm', code: 'KSM', name: 'Kisumu Branch', town: 'Kisumu', manager: 'Grace Achieng', active: true },
  { id: 'br-eld', code: 'ELD', name: 'Eldoret Branch', town: 'Eldoret', manager: 'Peter Njoroge', active: false }
];

const SEED_DEPARTMENTS: Department[] = [
  { id: 'dep-fin', code: 'FIN', name: 'Finance', head: 'David Kimani', branch: 'Nairobi Head Office' },
  { id: 'dep-hr', code: 'HR', name: 'Human Resources', head: 'Aisha Mohamed', branch: 'Nairobi Head Office' },
  { id: 'dep-ict', code: 'ICT', name: 'Information Technology', head: 'Brian Otieno', branch: 'Nairobi Head Office' },
  { id: 'dep-proc', code: 'PROC', name: 'Procurement', head: 'Hassan Abdi', branch: 'Nairobi Head Office' },
  { id: 'dep-ops', code: 'OPS', name: 'Operations', head: 'Peter Njoroge', branch: 'Nakuru Branch' },
  { id: 'dep-aud', code: 'AUD', name: 'Internal Audit', head: 'Grace Achieng', branch: 'Nairobi Head Office' },
  { id: 'dep-fac', code: 'FAC', name: 'Facilities', head: 'Daniel Mwangi', branch: 'Nairobi Head Office' }
];

const SEED_GRADES: JobGrade[] = [
  { id: 'gr-g1', code: 'G1', name: 'Assistant', minSalary: 80000, maxSalary: 130000 },
  { id: 'gr-g2', code: 'G2', name: 'Officer I', minSalary: 120000, maxSalary: 170000 },
  { id: 'gr-g3', code: 'G3', name: 'Officer II', minSalary: 160000, maxSalary: 230000 },
  { id: 'gr-g4', code: 'G4', name: 'Senior Officer', minSalary: 210000, maxSalary: 300000 },
  { id: 'gr-g5', code: 'G5', name: 'Principal Officer', minSalary: 280000, maxSalary: 380000 },
  { id: 'gr-m1', code: 'M1', name: 'Manager', minSalary: 340000, maxSalary: 460000 },
  { id: 'gr-m2', code: 'M2', name: 'Senior Manager', minSalary: 420000, maxSalary: 560000 },
  { id: 'gr-e1', code: 'E1', name: 'Head of Department', minSalary: 500000, maxSalary: 720000 }
];

/* ------------------------------------------------------------------ *
 * Job steps — salary progression notches within a grade (e.g. G3/1).
 * ------------------------------------------------------------------ */
export interface JobStep {
  id: string;
  /** The grade code this step belongs to (e.g. 'G3'). */
  grade: string;
  /** Step notch within the grade, 1-based. */
  notch: number;
  /** Display code, e.g. 'G3/2'. */
  code: string;
  salary: number;
}

/* ------------------------------------------------------------------ *
 * Job roles — titled positions mapped to a grade and department.
 * ------------------------------------------------------------------ */
export interface JobRole {
  id: string;
  title: string;
  grade: string;
  department: string;
  headcount: number;
}

const SEED_STEPS: JobStep[] = [
  { id: 'st-g2-1', grade: 'G2', notch: 1, code: 'G2/1', salary: 120000 },
  { id: 'st-g2-2', grade: 'G2', notch: 2, code: 'G2/2', salary: 138000 },
  { id: 'st-g2-3', grade: 'G2', notch: 3, code: 'G2/3', salary: 156000 },
  { id: 'st-g3-1', grade: 'G3', notch: 1, code: 'G3/1', salary: 160000 },
  { id: 'st-g3-2', grade: 'G3', notch: 2, code: 'G3/2', salary: 186000 },
  { id: 'st-g3-3', grade: 'G3', notch: 3, code: 'G3/3', salary: 212000 },
  { id: 'st-g4-1', grade: 'G4', notch: 1, code: 'G4/1', salary: 210000 },
  { id: 'st-g4-2', grade: 'G4', notch: 2, code: 'G4/2', salary: 255000 },
  { id: 'st-m1-1', grade: 'M1', notch: 1, code: 'M1/1', salary: 340000 },
  { id: 'st-m1-2', grade: 'M1', notch: 2, code: 'M1/2', salary: 400000 }
];

const SEED_ROLES: JobRole[] = [
  { id: 'rl-payroll', title: 'Payroll Officer', grade: 'G3', department: 'Finance', headcount: 2 },
  { id: 'rl-accountant', title: 'Accountant', grade: 'G3', department: 'Finance', headcount: 3 },
  { id: 'rl-proc-analyst', title: 'Procurement Analyst', grade: 'G3', department: 'Procurement', headcount: 2 },
  { id: 'rl-swe', title: 'Software Engineer', grade: 'G3', department: 'Information Technology', headcount: 4 },
  { id: 'rl-auditor', title: 'Internal Auditor', grade: 'G4', department: 'Internal Audit', headcount: 2 },
  { id: 'rl-hr-bp', title: 'HR Business Partner', grade: 'G4', department: 'Human Resources', headcount: 1 },
  { id: 'rl-ops-officer', title: 'Operations Officer', grade: 'G2', department: 'Operations', headcount: 3 },
  { id: 'rl-hod-fin', title: 'Head of Finance', grade: 'E1', department: 'Finance', headcount: 1 }
];

export const branchesStore = createCollection<Branch>('emtech.store.branches.v1', SEED_BRANCHES, 'br');
export const departmentsStore = createCollection<Department>('emtech.store.departments.v1', SEED_DEPARTMENTS, 'dep');
export const jobGradesStore = createCollection<JobGrade>('emtech.store.grades.v1', SEED_GRADES, 'gr');
export const jobStepsStore = createCollection<JobStep>('emtech.store.jobSteps.v1', SEED_STEPS, 'st');
export const jobRolesStore = createCollection<JobRole>('emtech.store.jobRoles.v1', SEED_ROLES, 'rl');
