import { createCollection } from '../core/store/createCollection';

export type MovementType = 'in' | 'out' | 'transfer';

export interface StockMovement {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  type: MovementType;
  quantity: number;
  reference: string;
  notes?: string;
}

export const MOVEMENT_TYPES: MovementType[] = ['in', 'out', 'transfer'];

export const WAREHOUSES = ['Nairobi Central Store', 'Mombasa Depot', 'Nakuru Branch Store', 'Kisumu Regional Store'];

const SEED_MOVEMENTS: StockMovement[] = [
  { id: 'mov-1001', date: '2026-09-02', itemCode: 'ITM-0101', itemName: 'A4 Copier paper (ream)', warehouse: 'Nairobi Central Store', type: 'in', quantity: 400, reference: 'GRN-2026-0881', notes: 'Bidco delivery' },
  { id: 'mov-1002', date: '2026-09-03', itemCode: 'ITM-0207', itemName: 'HP LaserJet toner 26A', warehouse: 'Nairobi Central Store', type: 'out', quantity: 18, reference: 'ISS-2026-0442' },
  { id: 'mov-1003', date: '2026-09-04', itemCode: 'ITM-0330', itemName: 'Ethernet cable Cat6 (box)', warehouse: 'Mombasa Depot', type: 'in', quantity: 25, reference: 'GRN-2026-0890' },
  { id: 'mov-1004', date: '2026-09-05', itemCode: 'ITM-0101', itemName: 'A4 Copier paper (ream)', warehouse: 'Nairobi Central Store', type: 'transfer', quantity: 120, reference: 'TRF-2026-0119', notes: 'To Nakuru Branch Store' },
  { id: 'mov-1005', date: '2026-09-08', itemCode: 'ITM-0512', itemName: 'Dell Latitude 5540 laptop', warehouse: 'Nairobi Central Store', type: 'in', quantity: 30, reference: 'GRN-2026-0901', notes: 'Techno Brain supply' },
  { id: 'mov-1006', date: '2026-09-09', itemCode: 'ITM-0512', itemName: 'Dell Latitude 5540 laptop', warehouse: 'Nairobi Central Store', type: 'out', quantity: 12, reference: 'ISS-2026-0451', notes: 'IT department rollout' },
  { id: 'mov-1007', date: '2026-09-10', itemCode: 'ITM-0088', itemName: 'Cleaning detergent 5L', warehouse: 'Kisumu Regional Store', type: 'in', quantity: 60, reference: 'GRN-2026-0912' },
  { id: 'mov-1008', date: '2026-09-10', itemCode: 'ITM-0207', itemName: 'HP LaserJet toner 26A', warehouse: 'Mombasa Depot', type: 'transfer', quantity: 8, reference: 'TRF-2026-0124', notes: 'To Nairobi Central Store' },
  { id: 'mov-1009', date: '2026-09-11', itemCode: 'ITM-0330', itemName: 'Ethernet cable Cat6 (box)', warehouse: 'Mombasa Depot', type: 'out', quantity: 10, reference: 'ISS-2026-0460' },
  { id: 'mov-1010', date: '2026-09-12', itemCode: 'ITM-0641', itemName: 'Office chair — ergonomic', warehouse: 'Nakuru Branch Store', type: 'in', quantity: 15, reference: 'GRN-2026-0920' },
  { id: 'mov-1011', date: '2026-09-12', itemCode: 'ITM-0088', itemName: 'Cleaning detergent 5L', warehouse: 'Kisumu Regional Store', type: 'out', quantity: 22, reference: 'ISS-2026-0466' },
  { id: 'mov-1012', date: '2026-09-13', itemCode: 'ITM-0512', itemName: 'Dell Latitude 5540 laptop', warehouse: 'Nakuru Branch Store', type: 'in', quantity: 6, reference: 'TRF-2026-0130', notes: 'From Nairobi Central Store' }
];

export const movementsStore = createCollection<StockMovement>('emtech.store.movements.v1', SEED_MOVEMENTS, 'mov');
