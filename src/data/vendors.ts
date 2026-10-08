import { createCollection } from '../core/store/createCollection';

export type VendorStatus = 'active' | 'prospect' | 'suspended';

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  status: VendorStatus;
  /** Performance rating, 1-5. */
  rating: number;
}

export const VENDOR_STATUSES: VendorStatus[] = ['active', 'prospect', 'suspended'];

export const VENDOR_CATEGORIES = ['ICT & software', 'Office supplies', 'Construction', 'Logistics', 'Facilities', 'Professional services', 'Utilities'];

const SEED_VENDORS: Vendor[] = [
  { id: 'ven-1001', code: 'V-0001', name: 'Twiga Foods Ltd', category: 'Logistics', contact: 'Peter Njoroge', phone: '+254 712 445 900', email: 'procurement@twigafoods.co.ke', status: 'active', rating: 5 },
  { id: 'ven-1002', code: 'V-0002', name: 'Nyumba Contractors Ltd', category: 'Construction', contact: 'Grace Wambui', phone: '+254 733 210 118', email: 'tenders@nyumba.co.ke', status: 'active', rating: 4 },
  { id: 'ven-1003', code: 'V-0003', name: 'Safaricom Business', category: 'ICT & software', contact: 'Brian Otieno', phone: '+254 722 000 100', email: 'enterprise@safaricom.co.ke', status: 'active', rating: 5 },
  { id: 'ven-1004', code: 'V-0004', name: 'Coastal Suppliers Ltd', category: 'Office supplies', contact: 'Amina Hassan', phone: '+254 741 882 004', email: 'sales@coastalsuppliers.co.ke', status: 'active', rating: 3 },
  { id: 'ven-1005', code: 'V-0005', name: 'Bidco Africa', category: 'Office supplies', contact: 'David Kiptoo', phone: '+254 720 334 551', email: 'orders@bidco.co.ke', status: 'active', rating: 4 },
  { id: 'ven-1006', code: 'V-0006', name: 'Rift Valley Logistics', category: 'Logistics', contact: 'Janet Chebet', phone: '+254 715 660 233', email: 'ops@rvlogistics.co.ke', status: 'active', rating: 4 },
  { id: 'ven-1007', code: 'V-0007', name: 'Sote Cleaning Services', category: 'Facilities', contact: 'Samuel Mwangi', phone: '+254 726 118 774', email: 'info@sotecleaning.co.ke', status: 'prospect', rating: 3 },
  { id: 'ven-1008', code: 'V-0008', name: 'Deloitte Kenya', category: 'Professional services', contact: 'Lydia Achieng', phone: '+254 719 039 000', email: 'advisory@deloitte.co.ke', status: 'active', rating: 5 },
  { id: 'ven-1009', code: 'V-0009', name: 'Kenya Power (KPLC)', category: 'Utilities', contact: 'Account Services', phone: '+254 711 070 000', email: 'accounts@kplc.co.ke', status: 'active', rating: 3 },
  { id: 'ven-1010', code: 'V-0010', name: 'Techno Brain EA', category: 'ICT & software', contact: 'Faith Nduta', phone: '+254 738 221 400', email: 'sales@technobrain.co.ke', status: 'prospect', rating: 4 },
  { id: 'ven-1011', code: 'V-0011', name: 'Jambo Movers Ltd', category: 'Logistics', contact: 'Kevin Omondi', phone: '+254 703 556 812', email: 'bookings@jambomovers.co.ke', status: 'suspended', rating: 2 },
  { id: 'ven-1012', code: 'V-0012', name: 'Elgon Stationers', category: 'Office supplies', contact: 'Mercy Wanjiku', phone: '+254 717 904 336', email: 'orders@elgonstationers.co.ke', status: 'active', rating: 4 }
];

export const vendorsStore = createCollection<Vendor>('emtech.store.vendors.v1', SEED_VENDORS, 'ven');
