import { createCollection } from '../core/store/createCollection';

export type VirementStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Virement {
  id: string;
  reference: string;
  fromLine: string;
  toLine: string;
  amount: number;
  reason: string;
  status: VirementStatus;
  raisedBy: string;
  raisedOn: string;
}

export const VIREMENT_STATUSES: VirementStatus[] = ['draft', 'pending', 'approved', 'rejected'];

const SEED_VIREMENTS: Virement[] = [
  { id: 'vir-1001', reference: 'VIR-2026-0031', fromLine: 'Travel & subsistence', toLine: 'ICT equipment', amount: 1200000, reason: 'Reallocation for laptop refresh programme', status: 'approved', raisedBy: 'Grace Wambui', raisedOn: '2026-08-28' },
  { id: 'vir-1002', reference: 'VIR-2026-0032', fromLine: 'Training & development', toLine: 'Consultancy fees', amount: 640000, reason: 'Fund external systems review', status: 'pending', raisedBy: 'Peter Njoroge', raisedOn: '2026-09-03' },
  { id: 'vir-1003', reference: 'VIR-2026-0033', fromLine: 'Office supplies', toLine: 'Marketing & sales', amount: 380000, reason: 'Q3 brand campaign top-up', status: 'draft', raisedBy: 'Mercy Wanjiku', raisedOn: '2026-09-05' },
  { id: 'vir-1004', reference: 'VIR-2026-0034', fromLine: 'Facilities maintenance', toLine: 'Utilities', amount: 210000, reason: 'Cover higher power tariffs', status: 'approved', raisedBy: 'Samuel Mwangi', raisedOn: '2026-09-06' },
  { id: 'vir-1005', reference: 'VIR-2026-0035', fromLine: 'Contingency reserve', toLine: 'Legal fees', amount: 950000, reason: 'Provision for pending litigation', status: 'rejected', raisedBy: 'Lydia Achieng', raisedOn: '2026-09-08' },
  { id: 'vir-1006', reference: 'VIR-2026-0036', fromLine: 'Fuel & transport', toLine: 'Vehicle repairs', amount: 175000, reason: 'Fleet servicing overrun', status: 'pending', raisedBy: 'Kevin Omondi', raisedOn: '2026-09-09' },
  { id: 'vir-1007', reference: 'VIR-2026-0037', fromLine: 'Staff welfare', toLine: 'Medical insurance', amount: 520000, reason: 'Cover premium increase', status: 'draft', raisedBy: 'Faith Nduta', raisedOn: '2026-09-11' },
  { id: 'vir-1008', reference: 'VIR-2026-0038', fromLine: 'Advertising', toLine: 'Events & sponsorship', amount: 300000, reason: 'Industry conference booth', status: 'pending', raisedBy: 'Brian Otieno', raisedOn: '2026-09-12' },
  { id: 'vir-1009', reference: 'VIR-2026-0039', fromLine: 'Software licences', toLine: 'Cloud hosting', amount: 460000, reason: 'Migration to managed hosting', status: 'draft', raisedBy: 'David Kiptoo', raisedOn: '2026-09-12' },
  { id: 'vir-1010', reference: 'VIR-2026-0040', fromLine: 'Printing & stationery', toLine: 'Postage & courier', amount: 95000, reason: 'Increased dispatch volumes', status: 'approved', raisedBy: 'Janet Chebet', raisedOn: '2026-09-13' }
];

export const virementsStore = createCollection<Virement>('emtech.store.virements.v1', SEED_VIREMENTS, 'vir');
