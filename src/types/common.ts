export type DocumentStatus =
  'draft' |
  'submitted' |
  'pending' |
  'approved' |
  'rejected' |
  'posted' |
  'cancelled';

export type Density = 'comfortable' | 'compact';

export type Role = 'admin' | 'officer' | 'manager' | 'employee' | 'auditor';

export type ModuleId =
  | 'finance'
  | 'hr'
  | 'procurement'
  | 'inventory'
  | 'assets'
  | 'budgeting'
  | 'suppliers'
  | 'imprest'
  | 'prepayment'
  | 'reports'
  | 'admin';

export interface TimelineEvent {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  at: string;
  comment?: string;
  outcome: 'created' | 'submitted' | 'approved' | 'rejected' | 'posted' | 'note' | 'pending';
}

export interface ApprovalStage {
  id: string;
  label: string;
  approver: string;
  approverRole: string;
  state: 'complete' | 'current' | 'pending' | 'rejected' | 'skipped';
  at?: string;
  comment?: string;
}

export interface ApprovalItem {
  id: string;
  reference: string;
  title: string;
  module: ModuleId;
  moduleLabel: string;
  documentType: string;
  requester: string;
  requesterRole: string;
  amount?: number;
  submittedAt: string;
  slaHours: number;
  priority: 'normal' | 'urgent';
  summary: string;
  raisedByCurrentUser?: boolean;
}