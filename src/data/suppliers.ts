import { createCollection } from '../core/store/createCollection';

export type PrequalStatus = 'prequalified' | 'pending' | 'disqualified';

export interface Supplier {
  id: string;
  registryNo: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  taxCompliant: boolean;
  prequalStatus: PrequalStatus;
  /** Evaluation score, 0-100. */
  evaluationScore: number;
  registeredOn: string;
}

export const SUPPLIER_CATEGORIES = [
  'ICT & software', 'Office supplies', 'Construction', 'Logistics',
  'Facilities', 'Professional services', 'Utilities', 'Medical'
];

export const PREQUAL_STATUSES: PrequalStatus[] = ['prequalified', 'pending', 'disqualified'];

const SEED_SUPPLIERS: Supplier[] = [
  { id: 'sup-0001', registryNo: 'SR-2026-001', name: 'Twiga Foods Ltd', category: 'Logistics', contact: 'Peter Njoroge', phone: '+254 712 445 900', email: 'procurement@twigafoods.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 88, registeredOn: '2025-02-11' },
  { id: 'sup-0002', registryNo: 'SR-2026-002', name: 'Nyumba Contractors Ltd', category: 'Construction', contact: 'Grace Wambui', phone: '+254 733 210 118', email: 'tenders@nyumba.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 79, registeredOn: '2025-03-04' },
  { id: 'sup-0003', registryNo: 'SR-2026-003', name: 'Safaricom Business', category: 'ICT & software', contact: 'Brian Otieno', phone: '+254 722 000 100', email: 'enterprise@safaricom.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 94, registeredOn: '2025-01-20' },
  { id: 'sup-0004', registryNo: 'SR-2026-004', name: 'Coastal Suppliers Ltd', category: 'Office supplies', contact: 'Amina Hassan', phone: '+254 741 882 004', email: 'sales@coastalsuppliers.co.ke', taxCompliant: false, prequalStatus: 'pending', evaluationScore: 61, registeredOn: '2026-06-18' },
  { id: 'sup-0005', registryNo: 'SR-2026-005', name: 'Bidco Africa', category: 'Office supplies', contact: 'David Kiptoo', phone: '+254 720 334 551', email: 'orders@bidco.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 82, registeredOn: '2025-05-09' },
  { id: 'sup-0006', registryNo: 'SR-2026-006', name: 'Rift Valley Logistics', category: 'Logistics', contact: 'Janet Chebet', phone: '+254 715 660 233', email: 'ops@rvlogistics.co.ke', taxCompliant: true, prequalStatus: 'pending', evaluationScore: 68, registeredOn: '2026-07-02' },
  { id: 'sup-0007', registryNo: 'SR-2026-007', name: 'Sote Cleaning Services', category: 'Facilities', contact: 'Samuel Mwangi', phone: '+254 726 118 774', email: 'info@sotecleaning.co.ke', taxCompliant: false, prequalStatus: 'disqualified', evaluationScore: 34, registeredOn: '2026-04-15' },
  { id: 'sup-0008', registryNo: 'SR-2026-008', name: 'Deloitte Kenya', category: 'Professional services', contact: 'Lydia Achieng', phone: '+254 719 039 000', email: 'advisory@deloitte.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 91, registeredOn: '2025-02-28' },
  { id: 'sup-0009', registryNo: 'SR-2026-009', name: 'Kenya Power (KPLC)', category: 'Utilities', contact: 'Account Services', phone: '+254 711 070 000', email: 'accounts@kplc.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 74, registeredOn: '2025-01-15' },
  { id: 'sup-0010', registryNo: 'SR-2026-010', name: 'Techno Brain EA', category: 'ICT & software', contact: 'Faith Nduta', phone: '+254 738 221 400', email: 'sales@technobrain.co.ke', taxCompliant: true, prequalStatus: 'pending', evaluationScore: 66, registeredOn: '2026-08-01' },
  { id: 'sup-0011', registryNo: 'SR-2026-011', name: 'Jambo Movers Ltd', category: 'Logistics', contact: 'Kevin Omondi', phone: '+254 703 556 812', email: 'bookings@jambomovers.co.ke', taxCompliant: false, prequalStatus: 'disqualified', evaluationScore: 41, registeredOn: '2026-05-22' },
  { id: 'sup-0012', registryNo: 'SR-2026-012', name: 'Gertrudes Medical Supplies', category: 'Medical', contact: 'Dr. Mercy Wanjiru', phone: '+254 717 904 336', email: 'orders@gertrudesmed.co.ke', taxCompliant: true, prequalStatus: 'prequalified', evaluationScore: 85, registeredOn: '2025-09-30' }
];

export const suppliersStore = createCollection<Supplier>('emtech.store.suppliers.v1', SEED_SUPPLIERS, 'sup');
