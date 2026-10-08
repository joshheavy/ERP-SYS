import { createCollection } from '../core/store/createCollection';

export type EmployeeStatus = 'active' | 'probation' | 'onLeave' | 'exited';

export interface Employee {
  id: string;
  staffNo: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  grade: string;
  station: string;
  joinedOn: string;
  status: EmployeeStatus;
  basicSalary: number;
  kraPin: string;
  nssfNo: string;
}

export const DEPARTMENTS = [
  'Finance', 'Human Resources', 'Information Technology', 'Procurement',
  'Operations', 'Internal Audit', 'Facilities'
];

export const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'M1', 'M2', 'E1'];

const SEED_EMPLOYEES: Employee[] = [
  { id: 'emp-0001', staffNo: 'EMT-0001', name: 'Nancy Wambui', email: 'nancy.wambui@company.co.ke', phone: '+254 712 445 190', department: 'Finance', jobTitle: 'Payroll Officer', grade: 'G3', station: 'Nairobi HQ', joinedOn: '2021-03-15', status: 'active', basicSalary: 186000, kraPin: 'A004521190B', nssfNo: '1029384756' },
  { id: 'emp-0002', staffNo: 'EMT-0002', name: 'David Kimani', email: 'david.kimani@company.co.ke', phone: '+254 722 118 442', department: 'Finance', jobTitle: 'Head of Finance', grade: 'E1', station: 'Nairobi HQ', joinedOn: '2018-06-01', status: 'active', basicSalary: 520000, kraPin: 'A008812442C', nssfNo: '1029384700' },
  { id: 'emp-0003', staffNo: 'EMT-0003', name: 'Wanjiku Kamau', email: 'wanjiku.kamau@company.co.ke', phone: '+254 733 902 771', department: 'Procurement', jobTitle: 'Procurement Analyst', grade: 'G3', station: 'Nairobi HQ', joinedOn: '2022-01-10', status: 'active', basicSalary: 172000, kraPin: 'A009027713D', nssfNo: '1029384811' },
  { id: 'emp-0004', staffNo: 'EMT-0004', name: 'Hassan Abdi', email: 'hassan.abdi@company.co.ke', phone: '+254 720 553 118', department: 'Procurement', jobTitle: 'Procurement Manager', grade: 'M1', station: 'Nairobi HQ', joinedOn: '2019-09-23', status: 'active', basicSalary: 348000, kraPin: 'A005531182E', nssfNo: '1029384822' },
  { id: 'emp-0005', staffNo: 'EMT-0005', name: 'Brian Otieno', email: 'brian.otieno@company.co.ke', phone: '+254 711 674 093', department: 'Information Technology', jobTitle: 'Head of IT', grade: 'M2', station: 'Nairobi HQ', joinedOn: '2017-11-06', status: 'active', basicSalary: 412000, kraPin: 'A006740931F', nssfNo: '1029384833' },
  { id: 'emp-0006', staffNo: 'EMT-0006', name: 'Aisha Mohamed', email: 'aisha.mohamed@company.co.ke', phone: '+254 725 330 448', department: 'Human Resources', jobTitle: 'HR Business Partner', grade: 'G4', station: 'Mombasa branch', joinedOn: '2020-02-18', status: 'active', basicSalary: 224000, kraPin: 'A003304482G', nssfNo: '1029384844' },
  { id: 'emp-0007', staffNo: 'EMT-0007', name: 'Peter Njoroge', email: 'peter.njoroge@company.co.ke', phone: '+254 738 221 905', department: 'Operations', jobTitle: 'Operations Officer', grade: 'G2', station: 'Nakuru branch', joinedOn: '2023-07-03', status: 'probation', basicSalary: 138000, kraPin: 'A002219053H', nssfNo: '1029384855' },
  { id: 'emp-0008', staffNo: 'EMT-0008', name: 'Grace Achieng', email: 'grace.achieng@company.co.ke', phone: '+254 716 889 210', department: 'Internal Audit', jobTitle: 'Internal Auditor', grade: 'G4', station: 'Nairobi HQ', joinedOn: '2021-10-12', status: 'active', basicSalary: 236000, kraPin: 'A008892103J', nssfNo: '1029384866' },
  { id: 'emp-0009', staffNo: 'EMT-0009', name: 'Samuel Mutua', email: 'samuel.mutua@company.co.ke', phone: '+254 729 445 006', department: 'Facilities', jobTitle: 'Facilities Officer', grade: 'G2', station: 'Nairobi HQ', joinedOn: '2019-04-29', status: 'onLeave', basicSalary: 142000, kraPin: 'A004450061K', nssfNo: '1029384877' },
  { id: 'emp-0010', staffNo: 'EMT-0010', name: 'Faith Chebet', email: 'faith.chebet@company.co.ke', phone: '+254 701 337 884', department: 'Information Technology', jobTitle: 'Software Engineer', grade: 'G3', station: 'Nairobi HQ', joinedOn: '2022-08-15', status: 'active', basicSalary: 198000, kraPin: 'A003378841L', nssfNo: '1029384888' },
  { id: 'emp-0011', staffNo: 'EMT-0011', name: 'Joseph Kariuki', email: 'joseph.kariuki@company.co.ke', phone: '+254 742 990 213', department: 'Finance', jobTitle: 'Accountant', grade: 'G3', station: 'Mombasa branch', joinedOn: '2020-12-01', status: 'active', basicSalary: 204000, kraPin: 'A009902132M', nssfNo: '1029384899' },
  { id: 'emp-0012', staffNo: 'EMT-0012', name: 'Mary Wanjiru', email: 'mary.wanjiru@company.co.ke', phone: '+254 718 552 470', department: 'Human Resources', jobTitle: 'HR Assistant', grade: 'G1', station: 'Nairobi HQ', joinedOn: '2024-01-08', status: 'probation', basicSalary: 96000, kraPin: 'A005524701N', nssfNo: '1029384900' },
  { id: 'emp-0013', staffNo: 'EMT-0013', name: 'Daniel Mwangi', email: 'daniel.mwangi@company.co.ke', phone: '+254 733 118 067', department: 'Facilities', jobTitle: 'Facilities Supervisor', grade: 'G4', station: 'Nakuru branch', joinedOn: '2016-05-20', status: 'exited', basicSalary: 218000, kraPin: 'A001180672P', nssfNo: '1029384911' }
];

export const employeesStore = createCollection<Employee>('emtech.store.employees.v1', SEED_EMPLOYEES, 'emp');
