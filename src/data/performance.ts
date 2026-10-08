import { createCollection } from '../core/store/createCollection';

export type KpiPerspective = 'Financial' | 'Customer' | 'Internal' | 'Learning';
export type GoalStatus = 'draft' | 'active' | 'reviewed';

export interface Kpi {
  id: string;
  code: string;
  name: string;
  perspective: KpiPerspective;
  weight: number;
  active: boolean;
}

export interface Goal {
  id: string;
  employee: string;
  kpi: string;
  target: number;
  score: number;
  period: string;
  status: GoalStatus;
}

const SEED_KPIS: Kpi[] = [
  { id: 'kpi-0001', code: 'FIN-01', name: 'Budget variance kept under 5%', perspective: 'Financial', weight: 20, active: true },
  { id: 'kpi-0002', code: 'FIN-02', name: 'Cost savings achieved', perspective: 'Financial', weight: 15, active: true },
  { id: 'kpi-0003', code: 'CUS-01', name: 'Customer satisfaction score', perspective: 'Customer', weight: 20, active: true },
  { id: 'kpi-0004', code: 'CUS-02', name: 'Complaint resolution time', perspective: 'Customer', weight: 10, active: true },
  { id: 'kpi-0005', code: 'INT-01', name: 'Process turnaround time', perspective: 'Internal', weight: 15, active: true },
  { id: 'kpi-0006', code: 'INT-02', name: 'Audit findings closed', perspective: 'Internal', weight: 10, active: false },
  { id: 'kpi-0007', code: 'LRN-01', name: 'Training hours completed', perspective: 'Learning', weight: 5, active: true },
  { id: 'kpi-0008', code: 'LRN-02', name: 'Certifications obtained', perspective: 'Learning', weight: 5, active: true }
];

const SEED_GOALS: Goal[] = [
  { id: 'goal-0001', employee: 'Nancy Wambui', kpi: 'Budget variance kept under 5%', target: 100, score: 92, period: '2026-Q1', status: 'active' },
  { id: 'goal-0002', employee: 'David Kimani', kpi: 'Cost savings achieved', target: 100, score: 88, period: '2026-Q1', status: 'reviewed' },
  { id: 'goal-0003', employee: 'Wanjiku Kamau', kpi: 'Process turnaround time', target: 100, score: 75, period: '2026-Q1', status: 'active' },
  { id: 'goal-0004', employee: 'Hassan Abdi', kpi: 'Cost savings achieved', target: 100, score: 95, period: '2026-Q1', status: 'reviewed' },
  { id: 'goal-0005', employee: 'Brian Otieno', kpi: 'Process turnaround time', target: 100, score: 80, period: '2026-Q1', status: 'active' },
  { id: 'goal-0006', employee: 'Aisha Mohamed', kpi: 'Customer satisfaction score', target: 100, score: 0, period: '2026-Q2', status: 'draft' },
  { id: 'goal-0007', employee: 'Grace Achieng', kpi: 'Audit findings closed', target: 100, score: 70, period: '2026-Q1', status: 'active' },
  { id: 'goal-0008', employee: 'Faith Chebet', kpi: 'Training hours completed', target: 100, score: 100, period: '2026-Q1', status: 'reviewed' },
  { id: 'goal-0009', employee: 'Joseph Kariuki', kpi: 'Budget variance kept under 5%', target: 100, score: 0, period: '2026-Q2', status: 'draft' },
  { id: 'goal-0010', employee: 'Peter Njoroge', kpi: 'Complaint resolution time', target: 100, score: 65, period: '2026-Q1', status: 'active' }
];

export const kpisStore = createCollection<Kpi>('emtech.store.kpis.v1', SEED_KPIS, 'kpi');
export const goalsStore = createCollection<Goal>('emtech.store.goals.v1', SEED_GOALS, 'goal');
