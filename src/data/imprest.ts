import { createCollection } from '../core/store/createCollection';
import type { DocumentStatus } from '../types/common';

export type ImprestStatus = 'draft' | 'issued' | 'pendingSurrender' | 'retired';

export interface Imprest {
  id: string;
  reference: string;
  holder: string;
  purpose: string;
  amount: number;
  issuedOn: string;
  status: ImprestStatus;
  /** Amount accounted for on surrender. */
  surrenderedAmount?: number;
  /** Outstanding balance after surrender (amount - surrenderedAmount). */
  balance?: number;
  raisedBy: string;
}

/** Maps an imprest lifecycle status to the shared StatusBadge (DocumentStatus + label override). */
export const IMPREST_STATUS_BADGE: Record<
  ImprestStatus,
  { status: DocumentStatus; label?: string }
> = {
  draft: { status: 'draft' },
  issued: { status: 'posted', label: 'Issued' },
  pendingSurrender: { status: 'pending', label: 'Pending surrender' },
  retired: { status: 'approved', label: 'Retired' }
};

export const IMPREST_STATUSES: ImprestStatus[] = ['draft', 'issued', 'pendingSurrender', 'retired'];

const SEED_IMPREST: Imprest[] = [
  { id: 'imp-0001', reference: 'IMP-2026-0001', holder: 'Nancy Wambui', purpose: 'Field audit per diem — Mombasa branch', amount: 180000, issuedOn: '2026-08-04', status: 'retired', surrenderedAmount: 174500, balance: 5500, raisedBy: 'David Kimani' },
  { id: 'imp-0002', reference: 'IMP-2026-0002', holder: 'Brian Otieno', purpose: 'ICT site survey — Nakuru & Eldoret', amount: 240000, issuedOn: '2026-08-18', status: 'pendingSurrender', surrenderedAmount: 210000, balance: 30000, raisedBy: 'David Kimani' },
  { id: 'imp-0003', reference: 'IMP-2026-0003', holder: 'Wanjiku Kamau', purpose: 'Supplier prequalification visits', amount: 120000, issuedOn: '2026-09-01', status: 'issued', raisedBy: 'Hassan Abdi' },
  { id: 'imp-0004', reference: 'IMP-2026-0004', holder: 'Samuel Mutua', purpose: 'Generator servicing petty expenses', amount: 90000, issuedOn: '2026-09-03', status: 'issued', raisedBy: 'Daniel Mwangi' },
  { id: 'imp-0005', reference: 'IMP-2026-0005', holder: 'Grace Achieng', purpose: 'Internal audit fieldwork — Kisumu', amount: 210000, issuedOn: '2026-09-05', status: 'pendingSurrender', surrenderedAmount: 198000, balance: 12000, raisedBy: 'David Kimani' },
  { id: 'imp-0006', reference: 'IMP-2026-0006', holder: 'Peter Njoroge', purpose: 'Operations fuel float — Nakuru', amount: 75000, issuedOn: '2026-09-08', status: 'draft', raisedBy: 'David Kimani' },
  { id: 'imp-0007', reference: 'IMP-2026-0007', holder: 'Aisha Mohamed', purpose: 'HR recruitment drive — Coast region', amount: 160000, issuedOn: '2026-07-22', status: 'retired', surrenderedAmount: 160000, balance: 0, raisedBy: 'David Kimani' },
  { id: 'imp-0008', reference: 'IMP-2026-0008', holder: 'Joseph Kariuki', purpose: 'Statutory filing courier & fees', amount: 45000, issuedOn: '2026-09-10', status: 'draft', raisedBy: 'David Kimani' }
];

export const imprestStore = createCollection<Imprest>('emtech.store.imprest.v1', SEED_IMPREST, 'imp');
