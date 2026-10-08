import { createCollection } from '../core/store/createCollection';
import type { ModuleId } from '../types/common';

/* ------------------------------------------------------------------ *
 * Privileges catalog — the maker-checker privilege strings per module.
 * Read-only reference of what the backend authorization model exposes.
 * ------------------------------------------------------------------ */
export type PrivilegeAction = 'View' | 'Maintain' | 'Approve';

export interface Privilege {
  id: string;
  module: ModuleId;
  entity: string;
  action: PrivilegeAction;
  /** The canonical privilege string, e.g. "View Journal Entries". */
  code: string;
}

const PRIVILEGE_ENTITIES: { module: ModuleId; entity: string }[] = [
  { module: 'finance', entity: 'Journal Entries' },
  { module: 'finance', entity: 'Chart of Accounts' },
  { module: 'hr', entity: 'Employees' },
  { module: 'hr', entity: 'Payroll' },
  { module: 'hr', entity: 'Leave' },
  { module: 'procurement', entity: 'Requisitions' },
  { module: 'procurement', entity: 'Purchase Orders' },
  { module: 'inventory', entity: 'Stock' },
  { module: 'assets', entity: 'Asset Register' },
  { module: 'budgeting', entity: 'Budget Lines' },
  { module: 'suppliers', entity: 'Suppliers' },
  { module: 'imprest', entity: 'Imprest' },
  { module: 'prepayment', entity: 'Prepayments' }
];

const ACTIONS: PrivilegeAction[] = ['View', 'Maintain', 'Approve'];

const SEED_PRIVILEGES: Privilege[] = PRIVILEGE_ENTITIES.flatMap(({ module, entity }) =>
  ACTIONS.map((action) => ({
    id: `priv-${module}-${entity.replace(/\s+/g, '-').toLowerCase()}-${action.toLowerCase()}`,
    module,
    entity,
    action,
    code: `${action} ${entity}`
  }))
);

export const privilegesStore = createCollection<Privilege>('emtech.store.privileges.v1', SEED_PRIVILEGES, 'priv');

/* ------------------------------------------------------------------ *
 * Audit trail — a record of who did what. Read-only.
 * ------------------------------------------------------------------ */
export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  module: ModuleId;
  outcome: 'created' | 'updated' | 'approved' | 'rejected' | 'deleted' | 'login' | 'logout';
}

const SEED_AUDIT: AuditEntry[] = [
  { id: 'aud-1', at: '2026-09-17T08:42:00', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'Approved journal', entity: 'JE-2026-0188', module: 'finance', outcome: 'approved' },
  { id: 'aud-2', at: '2026-09-17T08:31:00', actor: 'Wanjiku Kamau', actorRole: 'Procurement Analyst', action: 'Created requisition', entity: 'REQ-2026-0413', module: 'procurement', outcome: 'created' },
  { id: 'aud-3', at: '2026-09-17T08:15:00', actor: 'Nancy Wambui', actorRole: 'Payroll Officer', action: 'Signed in', entity: 'Session', module: 'admin', outcome: 'login' },
  { id: 'aud-4', at: '2026-09-16T17:58:00', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'Approved purchase order', entity: 'PO-2026-0121', module: 'procurement', outcome: 'approved' },
  { id: 'aud-5', at: '2026-09-16T16:40:00', actor: 'Grace Achieng', actorRole: 'Internal Auditor', action: 'Exported trial balance', entity: 'Trial balance', module: 'finance', outcome: 'updated' },
  { id: 'aud-6', at: '2026-09-16T15:22:00', actor: 'Aisha Mohamed', actorRole: 'HR Business Partner', action: 'Updated employee', entity: 'EMT-0010', module: 'hr', outcome: 'updated' },
  { id: 'aud-7', at: '2026-09-16T14:03:00', actor: 'David Kimani', actorRole: 'Head of Finance', action: 'Rejected requisition', entity: 'REQ-2026-0410', module: 'procurement', outcome: 'rejected' },
  { id: 'aud-8', at: '2026-09-16T11:47:00', actor: 'Brian Otieno', actorRole: 'Head of IT', action: 'Deleted draft', entity: 'PPD-2026-0005', module: 'prepayment', outcome: 'deleted' },
  { id: 'aud-9', at: '2026-09-16T09:12:00', actor: 'Faith Chebet', actorRole: 'Software Engineer', action: 'Signed in', entity: 'Session', module: 'admin', outcome: 'login' },
  { id: 'aud-10', at: '2026-09-15T18:30:00', actor: 'Nancy Wambui', actorRole: 'Payroll Officer', action: 'Signed out', entity: 'Session', module: 'admin', outcome: 'logout' },
  { id: 'aud-11', at: '2026-09-15T16:05:00', actor: 'Joseph Kariuki', actorRole: 'Accountant', action: 'Created prepayment', entity: 'PPD-2026-0003', module: 'prepayment', outcome: 'created' },
  { id: 'aud-12', at: '2026-09-15T10:20:00', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'Registered supplier', entity: 'SR-2026-014', module: 'suppliers', outcome: 'created' }
];

export const auditStore = createCollection<AuditEntry>('emtech.store.audit.v1', SEED_AUDIT, 'aud');

/* ------------------------------------------------------------------ *
 * Login sessions — active/recent sessions. Read-only.
 * ------------------------------------------------------------------ */
export interface LoginSession {
  id: string;
  user: string;
  role: string;
  ipAddress: string;
  device: string;
  startedAt: string;
  lastSeen: string;
  active: boolean;
}

const SEED_SESSIONS: LoginSession[] = [
  { id: 'ses-1', user: 'Nancy Wambui', role: 'Payroll Officer', ipAddress: '196.201.214.10', device: 'Chrome · Windows', startedAt: '2026-09-17T08:15:00', lastSeen: '2026-09-17T08:52:00', active: true },
  { id: 'ses-2', user: 'David Kimani', role: 'Head of Finance', ipAddress: '105.163.2.44', device: 'Edge · Windows', startedAt: '2026-09-17T07:58:00', lastSeen: '2026-09-17T08:50:00', active: true },
  { id: 'ses-3', user: 'Faith Chebet', role: 'Software Engineer', ipAddress: '41.90.64.130', device: 'Firefox · macOS', startedAt: '2026-09-17T09:12:00', lastSeen: '2026-09-17T09:30:00', active: true },
  { id: 'ses-4', user: 'Grace Achieng', role: 'Internal Auditor', ipAddress: '196.201.214.55', device: 'Chrome · Windows', startedAt: '2026-09-16T16:20:00', lastSeen: '2026-09-16T17:05:00', active: false },
  { id: 'ses-5', user: 'Hassan Abdi', role: 'Procurement Manager', ipAddress: '105.163.2.90', device: 'Safari · iPhone', startedAt: '2026-09-16T14:00:00', lastSeen: '2026-09-16T15:40:00', active: false },
  { id: 'ses-6', user: 'Aisha Mohamed', role: 'HR Business Partner', ipAddress: '154.159.237.8', device: 'Chrome · Android', startedAt: '2026-09-16T10:30:00', lastSeen: '2026-09-16T12:10:00', active: false }
];

export const sessionsStore = createCollection<LoginSession>('emtech.store.sessions.v1', SEED_SESSIONS, 'ses');

/* ------------------------------------------------------------------ *
 * Application logs — technical event log. Read-only.
 * ------------------------------------------------------------------ */
export interface AppLog {
  id: string;
  at: string;
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

const SEED_LOGS: AppLog[] = [
  { id: 'log-1', at: '2026-09-17T08:52:14', level: 'info', source: 'auth', message: 'Token refreshed for session ses-1' },
  { id: 'log-2', at: '2026-09-17T08:50:02', level: 'info', source: 'finance.journal', message: 'Journal JE-2026-0188 approved and posted' },
  { id: 'log-3', at: '2026-09-17T08:31:44', level: 'info', source: 'procurement', message: 'Requisition REQ-2026-0413 created' },
  { id: 'log-4', at: '2026-09-17T08:20:31', level: 'warn', source: 'payroll', message: 'Two employees missing KRA PIN in September run' },
  { id: 'log-5', at: '2026-09-17T07:59:10', level: 'info', source: 'auth', message: 'User david.kimani signed in' },
  { id: 'log-6', at: '2026-09-16T22:00:05', level: 'error', source: 'integration.bank', message: 'Bank statement import timed out; retry scheduled' },
  { id: 'log-7', at: '2026-09-16T18:30:22', level: 'info', source: 'auth', message: 'User nancy.wambui signed out' },
  { id: 'log-8', at: '2026-09-16T16:41:09', level: 'warn', source: 'reports', message: 'Trial balance export exceeded 5s to render' },
  { id: 'log-9', at: '2026-09-16T11:47:55', level: 'info', source: 'prepayment', message: 'Draft PPD-2026-0005 deleted by brian.otieno' },
  { id: 'log-10', at: '2026-09-15T02:00:00', level: 'info', source: 'scheduler', message: 'Nightly depreciation preview generated' }
];

export const logsStore = createCollection<AppLog>('emtech.store.logs.v1', SEED_LOGS, 'log');
