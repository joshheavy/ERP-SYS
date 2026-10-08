import type {
  BudgetLineInfo,
  GoodsReceipt,
  PurchaseOrder,
  Requisition
} from
  '../types/procurement';

export const BUDGET_LINES: BudgetLineInfo[] = [
  { code: 'CAP-ICT-2026', label: 'ICT capital expenditure', allocated: 68000000, committed: 41200000, spent: 18740000 },
  { code: 'OPX-FAC-2026', label: 'Facilities operating expenditure', allocated: 24000000, committed: 15600000, spent: 12180000 },
  { code: 'OPX-TRV-2026', label: 'Travel & subsistence', allocated: 12000000, committed: 9840000, spent: 8620000 },
  { code: 'CAP-VEH-2026', label: 'Vehicles & plant', allocated: 45000000, committed: 12000000, spent: 0 }];


export const VENDORS = [
  { value: 'v1', label: 'Nairobi Systems Ltd', meta: 'VEN-0142' },
  { value: 'v2', label: 'Savannah Office Supplies', meta: 'VEN-0088' },
  { value: 'v3', label: 'Rift Valley Facilities Services', meta: 'VEN-0210' },
  { value: 'v4', label: 'Simba Motors Ltd', meta: 'VEN-0301' }];


export const REQUISITIONS: Requisition[] = [
  {
    id: 'req-0412',
    reference: 'REQ-2026-0412',
    title: 'Replacement laptops for Finance and Audit',
    department: 'Information Technology',
    requester: 'Wanjiku Kamau',
    requesterRole: 'Procurement Analyst',
    raisedOn: '2026-09-11',
    neededBy: '2026-10-02',
    status: 'pending',
    justification:
      'Existing ThinkPad T480 units are five years old and out of warranty. Three have failed in the last quarter, and the audit team cannot run the new analytics toolset on them.',
    budgetLine: 'CAP-ICT-2026',
    budgetAllocated: 68000000,
    budgetSpent: 18740000,
    lines: [
      { id: 'rl1', description: 'Laptop — 14" business class, 32GB RAM, 1TB SSD', category: 'ICT hardware', quantity: 12, unit: 'unit', unitPrice: 298000, budgetLine: 'CAP-ICT-2026' },
      { id: 'rl2', description: 'Docking station — USB-C, dual display', category: 'ICT hardware', quantity: 12, unit: 'unit', unitPrice: 48000, budgetLine: 'CAP-ICT-2026' },
      { id: 'rl3', description: 'Extended warranty — 3 years onsite', category: 'ICT services', quantity: 12, unit: 'unit', unitPrice: 36000, budgetLine: 'CAP-ICT-2026' },
      { id: 'rl4', description: 'Laptop carry case', category: 'ICT accessories', quantity: 12, unit: 'unit', unitPrice: 12000, budgetLine: 'CAP-ICT-2026' }],

    chain: [
      { id: 'c1', label: 'Head of Department', approver: 'Brian Otieno', approverRole: 'Head of IT', state: 'complete', at: '2026-09-11T15:20:00', comment: 'Specification matches the standard build.' },
      { id: 'c2', label: 'Procurement review', approver: 'Hassan Abdi', approverRole: 'Procurement Manager', state: 'complete', at: '2026-09-12T10:05:00', comment: 'Three quotations obtained; Nairobi Systems is lowest compliant.' },
      { id: 'c3', label: 'Finance approval', approver: 'David Kimani', approverRole: 'Head of Finance', state: 'current' },
      { id: 'c4', label: 'Executive approval', approver: 'Not required', approverRole: 'Threshold KSh 10,000,000.00', state: 'skipped' }],

    timeline: [
      { id: 't1', actor: 'Wanjiku Kamau', actorRole: 'Procurement Analyst', action: 'created the requisition', at: '2026-09-11T09:42:00', outcome: 'created' },
      { id: 't2', actor: 'Wanjiku Kamau', actorRole: 'Procurement Analyst', action: 'submitted for approval', at: '2026-09-11T11:15:00', outcome: 'submitted' },
      { id: 't3', actor: 'Brian Otieno', actorRole: 'Head of IT', action: 'approved at stage 1', at: '2026-09-11T15:20:00', outcome: 'approved', comment: 'Specification matches the standard build.' },
      { id: 't4', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'approved at stage 2', at: '2026-09-12T10:05:00', outcome: 'approved', comment: 'Three quotations obtained; Nairobi Systems is lowest compliant.' },
      { id: 't5', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'is reviewing stage 3', at: '2026-09-12T10:06:00', outcome: 'pending' }]

  },
  {
    id: 'req-0409',
    reference: 'REQ-2026-0409',
    title: 'Generator servicing — head office',
    department: 'Facilities',
    requester: 'Daniel Mwangi',
    requesterRole: 'Facilities Officer',
    raisedOn: '2026-09-09',
    neededBy: '2026-09-24',
    status: 'approved',
    justification: 'Quarterly preventive maintenance on both 500 KVA units, contractually due this month.',
    budgetLine: 'OPX-FAC-2026',
    budgetAllocated: 24000000,
    budgetSpent: 12180000,
    lines: [
      { id: 'rl5', description: 'Preventive maintenance — 500 KVA generator', category: 'Facilities services', quantity: 2, unit: 'service', unitPrice: 420000, budgetLine: 'OPX-FAC-2026' },
      { id: 'rl6', description: 'Consumables — filters, oil, coolant', category: 'Facilities supplies', quantity: 2, unit: 'set', unitPrice: 118000, budgetLine: 'OPX-FAC-2026' }],

    chain: [
      { id: 'c5', label: 'Head of Department', approver: 'Beatrice Auma', approverRole: 'Head of Facilities', state: 'complete', at: '2026-09-09T14:02:00' },
      { id: 'c6', label: 'Procurement review', approver: 'Hassan Abdi', approverRole: 'Procurement Manager', state: 'complete', at: '2026-09-10T09:30:00' },
      { id: 'c7', label: 'Finance approval', approver: 'David Kimani', approverRole: 'Head of Finance', state: 'complete', at: '2026-09-10T16:44:00', comment: 'Within the facilities operating budget.' }],

    timeline: [
      { id: 't6', actor: 'Daniel Mwangi', actorRole: 'Facilities Officer', action: 'created the requisition', at: '2026-09-09T10:11:00', outcome: 'created' },
      { id: 't7', actor: 'Daniel Mwangi', actorRole: 'Facilities Officer', action: 'submitted for approval', at: '2026-09-09T10:40:00', outcome: 'submitted' },
      { id: 't8', actor: 'Beatrice Auma', actorRole: 'Head of Facilities', action: 'approved at stage 1', at: '2026-09-09T14:02:00', outcome: 'approved' },
      { id: 't9', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'approved at stage 2', at: '2026-09-10T09:30:00', outcome: 'approved' },
      { id: 't10', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'approved at stage 3', at: '2026-09-10T16:44:00', outcome: 'approved', comment: 'Within the facilities operating budget.' },
      { id: 't11', actor: 'System', actorRole: 'Procurement engine', action: 'converted the requisition to PO-2026-0188', at: '2026-09-10T16:45:00', outcome: 'posted' }],

    convertedToPo: 'PO-2026-0188'
  },
  {
    id: 'req-0405',
    reference: 'REQ-2026-0405',
    title: 'Field allowance advance — Northern survey',
    department: 'Operations',
    requester: 'Mercy Achieng',
    requesterRole: 'Operations Supervisor',
    raisedOn: '2026-09-05',
    neededBy: '2026-09-18',
    status: 'rejected',
    justification: 'Advance for a four-week field survey covering Kaduna, Kano and Katsina.',
    budgetLine: 'OPX-TRV-2026',
    budgetAllocated: 12000000,
    budgetSpent: 8620000,
    lines: [
      { id: 'rl7', description: 'Field allowance — 6 staff, 28 days', category: 'Travel', quantity: 168, unit: 'day', unitPrice: 18000, budgetLine: 'OPX-TRV-2026' }],

    chain: [
      { id: 'c8', label: 'Head of Department', approver: 'Kevin Omondi', approverRole: 'Head of Operations', state: 'complete', at: '2026-09-05T12:22:00' },
      { id: 'c9', label: 'Finance approval', approver: 'David Kimani', approverRole: 'Head of Finance', state: 'rejected', at: '2026-09-08T09:10:00', comment: 'Travel budget is 72% committed with a quarter to run. Resubmit with a reduced team size.' }],

    timeline: [
      { id: 't12', actor: 'Mercy Achieng', actorRole: 'Operations Supervisor', action: 'submitted for approval', at: '2026-09-05T09:02:00', outcome: 'submitted' },
      { id: 't13', actor: 'Kevin Omondi', actorRole: 'Head of Operations', action: 'approved at stage 1', at: '2026-09-05T12:22:00', outcome: 'approved' },
      { id: 't14', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'rejected at stage 2', at: '2026-09-08T09:10:00', outcome: 'rejected', comment: 'Travel budget is 72% committed with a quarter to run. Resubmit with a reduced team size.' }]

  },
  {
    id: 'req-0414',
    reference: 'REQ-2026-0414',
    title: 'Office consumables — Q4 restock',
    department: 'Administration',
    requester: 'Ruth Atieno',
    requesterRole: 'Admin Officer',
    raisedOn: '2026-09-13',
    neededBy: '2026-10-01',
    status: 'draft',
    justification: 'Quarterly stationery and consumables restock for all four floors.',
    budgetLine: 'OPX-FAC-2026',
    budgetAllocated: 24000000,
    budgetSpent: 12180000,
    lines: [
      { id: 'rl8', description: 'A4 paper — 80gsm, ream', category: 'Stationery', quantity: 240, unit: 'ream', unitPrice: 4800, budgetLine: 'OPX-FAC-2026' },
      { id: 'rl9', description: 'Toner cartridge — mono, high yield', category: 'Stationery', quantity: 18, unit: 'unit', unitPrice: 62000, budgetLine: 'OPX-FAC-2026' }],

    chain: [
      { id: 'c10', label: 'Head of Department', approver: 'Awaiting submission', approverRole: 'Head of Administration', state: 'pending' },
      { id: 'c11', label: 'Procurement review', approver: 'Hassan Abdi', approverRole: 'Procurement Manager', state: 'pending' }],

    timeline: [
      { id: 't15', actor: 'Ruth Atieno', actorRole: 'Admin Officer', action: 'created the requisition', at: '2026-09-13T15:30:00', outcome: 'created' }],

    raisedByCurrentUser: true
  }];


export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-0188',
    reference: 'PO-2026-0188',
    vendor: 'Rift Valley Facilities Services',
    vendorCode: 'VEN-0210',
    issuedOn: '2026-09-10',
    expectedOn: '2026-09-22',
    paymentTerms: '30 days from invoice',
    deliveryLocation: 'Head office — Plant room, Upper Hill',
    status: 'approved',
    fromRequisition: 'REQ-2026-0409',
    lines: [
      { id: 'pl1', description: 'Preventive maintenance — 500 KVA generator', quantity: 2, unit: 'service', unitPrice: 420000, receivedQuantity: 1 },
      { id: 'pl2', description: 'Consumables — filters, oil, coolant', quantity: 2, unit: 'set', unitPrice: 118000, receivedQuantity: 2 }],

    timeline: [
      { id: 'pt1', actor: 'System', actorRole: 'Procurement engine', action: 'created the order from REQ-2026-0409', at: '2026-09-10T16:45:00', outcome: 'created' },
      { id: 'pt2', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'issued the order to the vendor', at: '2026-09-10T17:20:00', outcome: 'submitted' },
      { id: 'pt3', actor: 'Daniel Mwangi', actorRole: 'Facilities Officer', action: 'recorded a partial receipt, GRN-2026-0301', at: '2026-09-14T10:15:00', outcome: 'posted' }],

    goodsReceipts: ['GRN-2026-0301']
  },
  {
    id: 'po-0181',
    reference: 'PO-2026-0181',
    vendor: 'Savannah Office Supplies',
    vendorCode: 'VEN-0088',
    issuedOn: '2026-08-28',
    expectedOn: '2026-09-08',
    paymentTerms: '14 days from invoice',
    deliveryLocation: 'Central store — Industrial Area',
    status: 'posted',
    fromRequisition: 'REQ-2026-0388',
    lines: [
      { id: 'pl3', description: 'A4 paper — 80gsm, ream', quantity: 200, unit: 'ream', unitPrice: 4800, receivedQuantity: 200 },
      { id: 'pl4', description: 'Box files', quantity: 120, unit: 'unit', unitPrice: 2400, receivedQuantity: 120 }],

    timeline: [
      { id: 'pt4', actor: 'System', actorRole: 'Procurement engine', action: 'created the order from REQ-2026-0388', at: '2026-08-28T09:00:00', outcome: 'created' },
      { id: 'pt5', actor: 'Esther Muthoni', actorRole: 'Procurement Officer', action: 'recorded full receipt, GRN-2026-0288', at: '2026-09-08T14:30:00', outcome: 'posted' }],

    goodsReceipts: ['GRN-2026-0288']
  }];


export const GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: 'grn-0301',
    reference: 'GRN-2026-0301',
    purchaseOrder: 'PO-2026-0188',
    vendor: 'Rift Valley Facilities Services',
    receivedOn: '2026-09-14',
    receivedBy: 'Daniel Mwangi',
    warehouse: 'Head office — Plant room',
    waybill: 'PFS-WB-11284',
    status: 'posted',
    lines: [
      { id: 'gl1', description: 'Preventive maintenance — 500 KVA generator', orderedQuantity: 2, previouslyReceived: 0, receivedQuantity: 1, unit: 'service', unitPrice: 420000, condition: 'good', remark: 'Unit B deferred to 26 Sep at the vendor’s request.' },
      { id: 'gl2', description: 'Consumables — filters, oil, coolant', orderedQuantity: 2, previouslyReceived: 0, receivedQuantity: 2, unit: 'set', unitPrice: 118000, condition: 'good' }]

  },
  {
    id: 'grn-0288',
    reference: 'GRN-2026-0288',
    purchaseOrder: 'PO-2026-0181',
    vendor: 'Savannah Office Supplies',
    receivedOn: '2026-09-08',
    receivedBy: 'Esther Muthoni',
    warehouse: 'Central store — Industrial Area',
    waybill: 'SOS-WB-77120',
    status: 'posted',
    lines: [
      { id: 'gl3', description: 'A4 paper — 80gsm, ream', orderedQuantity: 200, previouslyReceived: 0, receivedQuantity: 200, unit: 'ream', unitPrice: 4800, condition: 'good' },
      { id: 'gl4', description: 'Box files', orderedQuantity: 120, previouslyReceived: 0, receivedQuantity: 120, unit: 'unit', unitPrice: 2400, condition: 'good' }]

  }];


export const CATEGORIES = [
  'ICT hardware',
  'ICT services',
  'ICT accessories',
  'Facilities services',
  'Facilities supplies',
  'Stationery',
  'Travel',
  'Professional services'];