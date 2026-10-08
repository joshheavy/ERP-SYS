export interface InventoryItem {
  id: string;
  code: string;
  description: string;
  category: string;
  warehouse: string;
  unit: string;
  onHand: number;
  reserved: number;
  reorderLevel: number;
  unitCost: number;
  lastMovement: string;
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'i1', code: 'ITM-1042', description: 'A4 paper — 80gsm, ream', category: 'Stationery', warehouse: 'Central store — Industrial Area', unit: 'ream', onHand: 412, reserved: 60, reorderLevel: 150, unitCost: 4800, lastMovement: '2026-09-12' },
  { id: 'i2', code: 'ITM-1118', description: 'Toner cartridge — mono, high yield', category: 'Stationery', warehouse: 'Central store — Industrial Area', unit: 'unit', onHand: 22, reserved: 8, reorderLevel: 30, unitCost: 62000, lastMovement: '2026-09-10' },
  { id: 'i3', code: 'ITM-2204', description: 'Laptop — 14" business class', category: 'ICT hardware', warehouse: 'ICT store — Upper Hill', unit: 'unit', onHand: 6, reserved: 6, reorderLevel: 10, unitCost: 298000, lastMovement: '2026-09-08' },
  { id: 'i4', code: 'ITM-2210', description: 'Docking station — USB-C', category: 'ICT hardware', warehouse: 'ICT store — Upper Hill', unit: 'unit', onHand: 14, reserved: 2, reorderLevel: 8, unitCost: 48000, lastMovement: '2026-09-08' },
  { id: 'i5', code: 'ITM-3301', description: 'Diesel — AGO, litre', category: 'Fuel', warehouse: 'Head office — Plant room', unit: 'litre', onHand: 4820, reserved: 0, reorderLevel: 2000, unitCost: 1240, lastMovement: '2026-09-13' },
  { id: 'i6', code: 'ITM-3318', description: 'Engine oil — 20L drum', category: 'Fuel', warehouse: 'Head office — Plant room', unit: 'drum', onHand: 3, reserved: 2, reorderLevel: 6, unitCost: 86000, lastMovement: '2026-09-14' },
  { id: 'i7', code: 'ITM-4402', description: 'Safety boots — pair', category: 'PPE', warehouse: 'Central store — Industrial Area', unit: 'pair', onHand: 48, reserved: 0, reorderLevel: 20, unitCost: 32000, lastMovement: '2026-08-29' },
  { id: 'i8', code: 'ITM-4418', description: 'Hi-vis vest', category: 'PPE', warehouse: 'Central store — Industrial Area', unit: 'unit', onHand: 96, reserved: 12, reorderLevel: 40, unitCost: 8400, lastMovement: '2026-08-29' }];


export interface FixedAsset {
  id: string;
  tag: string;
  description: string;
  category: string;
  custodian: string;
  location: string;
  acquiredOn: string;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  usefulLife: number;
  condition: 'in service' | 'under repair' | 'retired';
}

export const FIXED_ASSETS: FixedAsset[] = [
  { id: 'a1', tag: 'FA-ICT-0412', description: 'Dell PowerEdge R750 server', category: 'ICT equipment', custodian: 'Brian Otieno', location: 'Data centre — Upper Hill', acquiredOn: '2023-04-18', cost: 18400000, accumulatedDepreciation: 9200000, netBookValue: 9200000, usefulLife: 5, condition: 'in service' },
  { id: 'a2', tag: 'FA-VEH-0188', description: 'Toyota Hilux double cab', category: 'Motor vehicles', custodian: 'Kevin Omondi', location: 'Operations pool', acquiredOn: '2022-11-02', cost: 32800000, accumulatedDepreciation: 19680000, netBookValue: 13120000, usefulLife: 5, condition: 'in service' },
  { id: 'a3', tag: 'FA-PLT-0074', description: 'Perkins 500 KVA generator — Unit A', category: 'Plant & machinery', custodian: 'Beatrice Auma', location: 'Head office — Plant room', acquiredOn: '2021-06-14', cost: 48600000, accumulatedDepreciation: 29160000, netBookValue: 19440000, usefulLife: 10, condition: 'in service' },
  { id: 'a4', tag: 'FA-PLT-0075', description: 'Perkins 500 KVA generator — Unit B', category: 'Plant & machinery', custodian: 'Beatrice Auma', location: 'Head office — Plant room', acquiredOn: '2021-06-14', cost: 48600000, accumulatedDepreciation: 29160000, netBookValue: 19440000, usefulLife: 10, condition: 'under repair' },
  { id: 'a5', tag: 'FA-ICT-0288', description: 'Desktop workstation — batch of 6', category: 'ICT equipment', custodian: 'Zainab Ali', location: 'ICT store — Upper Hill', acquiredOn: '2019-02-20', cost: 4920000, accumulatedDepreciation: 4920000, netBookValue: 0, usefulLife: 5, condition: 'retired' },
  { id: 'a6', tag: 'FA-FUR-0501', description: 'Executive boardroom table & 14 chairs', category: 'Furniture & fittings', custodian: 'Ruth Atieno', location: 'Head office — 4th floor', acquiredOn: '2024-08-09', cost: 8200000, accumulatedDepreciation: 1640000, netBookValue: 6560000, usefulLife: 10, condition: 'in service' }];


export interface BudgetLineRow {
  id: string;
  code: string;
  description: string;
  costCentre: string;
  category: 'Capital' | 'Operating';
  allocated: number;
  committed: number;
  spent: number;
  available: number;
  utilisation: number;
}

function buildBudgetLine(
  row: Omit<BudgetLineRow, 'available' | 'utilisation'>)
  : BudgetLineRow {
  const available = row.allocated - row.committed - row.spent;
  return {
    ...row,
    available,
    utilisation: Math.round((row.committed + row.spent) / row.allocated * 1000) / 10
  };
}

const BUDGET_SEEDS: Omit<BudgetLineRow, 'available' | 'utilisation'>[] = [
  { id: 'b1', code: 'CAP-ICT-2026', description: 'ICT capital expenditure', costCentre: 'CC-210 IT', category: 'Capital', allocated: 68000000, committed: 41200000, spent: 18740000 },
  { id: 'b2', code: 'CAP-VEH-2026', description: 'Vehicles & plant', costCentre: 'CC-410 Operations', category: 'Capital', allocated: 45000000, committed: 12000000, spent: 0 },
  { id: 'b3', code: 'OPX-FAC-2026', description: 'Facilities operating expenditure', costCentre: 'CC-320 Facilities', category: 'Operating', allocated: 24000000, committed: 15600000, spent: 12180000 },
  { id: 'b4', code: 'OPX-TRV-2026', description: 'Travel & subsistence', costCentre: 'CC-410 Operations', category: 'Operating', allocated: 12000000, committed: 9840000, spent: 8620000 },
  { id: 'b5', code: 'OPX-TRN-2026', description: 'Training & development', costCentre: 'CC-110 HR', category: 'Operating', allocated: 18000000, committed: 4200000, spent: 6840000 },
  { id: 'b6', code: 'OPX-PRO-2026', description: 'Professional services', costCentre: 'CC-100 Corporate', category: 'Operating', allocated: 32000000, committed: 11400000, spent: 14260000 }];


export const BUDGET_LINE_ROWS: BudgetLineRow[] = BUDGET_SEEDS.map(buildBudgetLine);