import type { Role } from '../types/common';
import { createCollection } from '../core/store/createCollection';

export interface SessionIdentity {
  role: Role;
  name: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  /** What the role is allowed to do, stated plainly in the profile menu. */
  capability: string;
}

export const IDENTITIES: Record<Role, SessionIdentity> = {
  admin: {
    role: 'admin',
    name: 'Njeri Kamande',
    jobTitle: 'System Administrator',
    department: 'ICT',
    employeeId: 'EMP-0001',
    capability: 'Full access. Manages users, roles, permissions and every module.'
  },
  officer: {
    role: 'officer',
    name: 'Nancy Wambui',
    jobTitle: 'Senior Payroll Officer',
    department: 'Human Resources',
    employeeId: 'EMP-0148',
    capability: 'Can create, edit and post records. Cannot approve.'
  },
  manager: {
    role: 'manager',
    name: 'David Kimani',
    jobTitle: 'Head of Finance',
    department: 'Finance',
    employeeId: 'EMP-0022',
    capability: 'Can approve or reject documents raised by others.'
  },
  employee: {
    role: 'employee',
    name: 'Wanjiku Kamau',
    jobTitle: 'Procurement Analyst',
    department: 'Procurement',
    employeeId: 'EMP-0391',
    capability: 'Self-service only — own leave, payslips and profile.'
  },
  auditor: {
    role: 'auditor',
    name: 'Samuel Kiprono',
    jobTitle: 'Internal Auditor',
    department: 'Audit & Assurance',
    employeeId: 'EMP-0077',
    capability: 'Read-only across all modules, with full audit history and export.'
  }
};

export interface Delegation {
  id: string;
  /** Person delegating their authority. */
  from: string;
  /** Their job-title label (display only). */
  role: string;
  /** The Role whose permissions the delegate assumes while acting. */
  roleId: Role;
  /** Person receiving the delegation (who acts on `from`'s behalf). */
  to: string;
  /** Plain-language scope of the delegated authority. */
  scope: string;
  /** Expiry date (ISO). */
  until: string;
  status: 'active' | 'revoked' | 'expired';
}

const SEED_DELEGATIONS: Delegation[] = [
  { id: 'del-1', from: 'David Kimani', role: 'Head of Finance', roleId: 'manager', to: 'Faith Njoroge', scope: 'Requisitions up to KSh 5,000,000.00', until: '2026-09-21', status: 'active' },
  { id: 'del-2', from: 'Grace Wanjiru', role: 'HR Director', roleId: 'manager', to: 'Aisha Hassan', scope: 'Leave approvals, all departments', until: '2026-09-18', status: 'active' },
  { id: 'del-3', from: 'Njeri Kamande', role: 'System Administrator', roleId: 'admin', to: 'Brian Otieno', scope: 'User administration while on leave', until: '2026-09-15', status: 'expired' }
];

export const delegationsStore = createCollection<Delegation>('emtech.store.delegations.v1', SEED_DELEGATIONS, 'del');


export interface Notification {
  id: string;
  title: string;
  detail: string;
  at: string;
  kind: 'approval' | 'exception' | 'posted' | 'mention';
  unread: boolean;
  path: string;
}

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Payroll PR-2026-09 has 2 blocking exceptions',
    detail: 'Bank account missing for 1 employee, net pay below statutory minimum for 1 employee.',
    at: '2026-09-14T16:12:00',
    kind: 'exception',
    unread: true,
    path: '/hr/payroll/run'
  },
  {
    id: 'n2',
    title: 'REQ-2026-0412 needs your approval',
    detail: 'Wanjiku Kamau raised a KSh 4,285,000.00 requisition for ICT equipment.',
    at: '2026-09-14T14:38:00',
    kind: 'approval',
    unread: true,
    path: '/approvals'
  },
  {
    id: 'n3',
    title: 'Leave request LV-2026-0788 escalated to HR',
    detail: 'Supervisor approved. Policy validation is now with HR.',
    at: '2026-09-14T11:02:00',
    kind: 'approval',
    unread: true,
    path: '/hr/leave/requests'
  },
  {
    id: 'n4',
    title: 'JE-2026-08-0091 posted to the general ledger',
    detail: 'August depreciation journal posted by Nancy Wambui.',
    at: '2026-09-13T17:45:00',
    kind: 'posted',
    unread: false,
    path: '/finance/journals'
  },
  {
    id: 'n5',
    title: 'David Kimani mentioned you on GRN-2026-0087',
    detail: '“Please confirm the short-delivery was resolved with the vendor.”',
    at: '2026-09-13T14:20:00',
    kind: 'mention',
    unread: true,
    path: '/procurement/receipts'
  },
  {
    id: 'n6',
    title: 'Depreciation run DEP-2026-08 posted',
    detail: 'August depreciation of KSh 3.19M posted to the ledger.',
    at: '2026-09-12T09:05:00',
    kind: 'posted',
    unread: false,
    path: '/assets/depreciation'
  }];

export const notificationsStore = createCollection<Notification>('emtech.store.notifications.v1', SEED_NOTIFICATIONS, 'ntf');


/* ==========================================================================
   System users — the directory managed in the Admin area. Each user has a
   role (which drives their module access via the permissions map) and a status.
   ========================================================================== */

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  role: Role;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'EMP-0001', name: 'Njeri Kamande', email: 'njeri.kamande@emtech.co.ke', jobTitle: 'System Administrator', department: 'ICT', role: 'admin', status: 'active', lastActive: '2026-09-14T16:40:00' },
  { id: 'EMP-0022', name: 'David Kimani', email: 'david.kimani@emtech.co.ke', jobTitle: 'Head of Finance', department: 'Finance', role: 'manager', status: 'active', lastActive: '2026-09-14T15:12:00' },
  { id: 'EMP-0148', name: 'Nancy Wambui', email: 'nancy.wambui@emtech.co.ke', jobTitle: 'Senior Payroll Officer', department: 'Human Resources', role: 'officer', status: 'active', lastActive: '2026-09-14T16:22:00' },
  { id: 'EMP-0077', name: 'Samuel Kiprono', email: 'samuel.kiprono@emtech.co.ke', jobTitle: 'Internal Auditor', department: 'Audit & Assurance', role: 'auditor', status: 'active', lastActive: '2026-09-14T09:05:00' },
  { id: 'EMP-0391', name: 'Wanjiku Kamau', email: 'wanjiku.kamau@emtech.co.ke', jobTitle: 'Procurement Analyst', department: 'Procurement', role: 'employee', status: 'active', lastActive: '2026-09-14T08:52:00' },
  { id: 'EMP-0031', name: 'Grace Wanjiru', email: 'grace.wanjiru@emtech.co.ke', jobTitle: 'HR Director', department: 'Human Resources', role: 'manager', status: 'active', lastActive: '2026-09-14T11:03:00' },
  { id: 'EMP-0063', name: 'Hassan Abdi', email: 'hassan.abdi@emtech.co.ke', jobTitle: 'Procurement Manager', department: 'Procurement', role: 'officer', status: 'active', lastActive: '2026-09-13T17:20:00' },
  { id: 'EMP-0057', name: 'Faith Njoroge', email: 'faith.njoroge@emtech.co.ke', jobTitle: 'Finance Officer', department: 'Finance', role: 'officer', status: 'active', lastActive: '2026-09-13T15:52:00' },
  { id: 'EMP-0126', name: 'Daniel Mwangi', email: 'daniel.mwangi@emtech.co.ke', jobTitle: 'Facilities Officer', department: 'Facilities', role: 'employee', status: 'active', lastActive: '2026-09-14T07:20:00' },
  { id: 'EMP-0198', name: 'Kevin Omondi', email: 'kevin.omondi@emtech.co.ke', jobTitle: 'Head of Operations', department: 'Operations', role: 'manager', status: 'active', lastActive: '2026-09-12T14:02:00' },
  { id: 'EMP-0207', name: 'Lydia Njeri', email: 'lydia.njeri@emtech.co.ke', jobTitle: 'IT Support Analyst', department: 'Information Technology', role: 'employee', status: 'suspended', lastActive: '2026-08-26T09:30:00' },
  { id: 'EMP-0412', name: 'Brian Otieno', email: 'brian.otieno@emtech.co.ke', jobTitle: 'Head of IT', department: 'Information Technology', role: 'manager', status: 'active', lastActive: '2026-09-11T15:20:00' },
  { id: 'EMP-0455', name: 'Aisha Hassan', email: 'aisha.hassan@emtech.co.ke', jobTitle: 'HR Assistant', department: 'Human Resources', role: 'officer', status: 'invited', lastActive: '2026-09-10T10:00:00' }
];
