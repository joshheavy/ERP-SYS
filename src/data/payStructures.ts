import { createCollection } from '../core/store/createCollection';

export interface PayStructure {
  id: string;
  name: string;
  grade: string;
  basic: number;
  house: number;
  transport: number;
  medical: number;
  active: boolean;
}

const SEED_STRUCTURES: PayStructure[] = [
  { id: 'pst-1001', name: 'Executive', grade: 'E1', basic: 620000, house: 180000, transport: 60000, medical: 45000, active: true },
  { id: 'pst-1002', name: 'Senior management', grade: 'M1', basic: 420000, house: 120000, transport: 45000, medical: 35000, active: true },
  { id: 'pst-1003', name: 'Middle management', grade: 'M2', basic: 285000, house: 90000, transport: 35000, medical: 28000, active: true },
  { id: 'pst-1004', name: 'Senior officer', grade: 'O1', basic: 195000, house: 60000, transport: 25000, medical: 22000, active: true },
  { id: 'pst-1005', name: 'Officer', grade: 'O2', basic: 142000, house: 45000, transport: 20000, medical: 18000, active: true },
  { id: 'pst-1006', name: 'Junior officer', grade: 'O3', basic: 96000, house: 32000, transport: 15000, medical: 14000, active: true },
  { id: 'pst-1007', name: 'Technician', grade: 'T1', basic: 78000, house: 24000, transport: 12000, medical: 12000, active: true },
  { id: 'pst-1008', name: 'Support staff', grade: 'S1', basic: 52000, house: 18000, transport: 10000, medical: 9000, active: true },
  { id: 'pst-1009', name: 'Graduate trainee', grade: 'GT', basic: 65000, house: 20000, transport: 12000, medical: 10000, active: true },
  { id: 'pst-1010', name: 'Intern', grade: 'IN', basic: 35000, house: 0, transport: 8000, medical: 6000, active: false }
];

export const payStructuresStore = createCollection<PayStructure>('emtech.store.payStructures.v1', SEED_STRUCTURES, 'pst');
