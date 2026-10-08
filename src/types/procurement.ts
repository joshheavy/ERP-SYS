import type { ApprovalStage, DocumentStatus, TimelineEvent } from './common';

export interface RequisitionLine {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  budgetLine: string;
}

export interface Requisition {
  id: string;
  reference: string;
  title: string;
  department: string;
  requester: string;
  requesterRole: string;
  raisedOn: string;
  neededBy: string;
  status: DocumentStatus;
  justification: string;
  budgetLine: string;
  budgetAllocated: number;
  budgetSpent: number;
  lines: RequisitionLine[];
  chain: ApprovalStage[];
  timeline: TimelineEvent[];
  convertedToPo?: string;
  raisedByCurrentUser?: boolean;
}

export interface PurchaseOrderLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  vendor: string;
  vendorCode: string;
  issuedOn: string;
  expectedOn: string;
  paymentTerms: string;
  deliveryLocation: string;
  status: DocumentStatus;
  fromRequisition: string;
  lines: PurchaseOrderLine[];
  timeline: TimelineEvent[];
  goodsReceipts: string[];
}

export interface GoodsReceiptLine {
  id: string;
  description: string;
  orderedQuantity: number;
  previouslyReceived: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  condition: 'good' | 'damaged' | 'short';
  remark?: string;
}

export interface GoodsReceipt {
  id: string;
  reference: string;
  purchaseOrder: string;
  vendor: string;
  receivedOn: string;
  receivedBy: string;
  warehouse: string;
  waybill: string;
  status: DocumentStatus;
  lines: GoodsReceiptLine[];
}

export interface BudgetLineInfo {
  code: string;
  label: string;
  allocated: number;
  committed: number;
  spent: number;
}