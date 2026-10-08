import {
  ShieldCheckIcon,
  UsersIcon,
  UserCogIcon,
  BuildingIcon,
  KeyRoundIcon,
  ScrollTextIcon,
  MonitorIcon,
  ListChecksIcon,
  UserCheckIcon
} from 'lucide-react';
import type { ModuleManifest } from '../../core/module/types';

/**
 * Administration module manifest — the REFERENCE implementation of the pluggable
 * module pattern. Everything the shell needs about this module (label, icon,
 * nav, commands, default roles, breadcrumb trails) lives here, not in the shared
 * navigation file. Copy this shape when migrating the other modules.
 *
 * The screens live in src/modules/admin/pages/*; the app/(console)/admin routes
 * import them from there.
 */
export const adminModule: ModuleManifest = {
  id: 'admin',
  label: 'Administration',
  shortLabel: 'Admin',
  blurb: 'Organization, users, roles, permissions and module licensing.',
  icon: ShieldCheckIcon,
  section: 'System',
  home: '/admin/organization',
  defaultRoles: ['admin'],
  nav: [
    {
      label: 'Organization',
      pages: [
        { label: 'Organization', path: '/admin/organization', icon: BuildingIcon }
      ]
    },
    {
      label: 'Access control',
      pages: [
        { label: 'Users', path: '/admin/users', icon: UsersIcon },
        { label: 'Roles & permissions', path: '/admin/roles', icon: UserCogIcon },
        { label: 'Privileges', path: '/admin/privileges', icon: KeyRoundIcon },
        { label: 'Delegations', path: '/admin/delegations', icon: UserCheckIcon },
        { label: 'Modules & licensing', path: '/admin/modules', icon: ShieldCheckIcon }
      ]
    },
    {
      label: 'Audit & security',
      pages: [
        { label: 'Audit trail', path: '/admin/audit', icon: ListChecksIcon },
        { label: 'Login sessions', path: '/admin/sessions', icon: MonitorIcon },
        { label: 'Application logs', path: '/admin/logs', icon: ScrollTextIcon }
      ]
    }
  ],
  commands: [
    { id: 'adm-org', label: 'Organization settings', group: 'Administration', path: '/admin/organization', keywords: 'organization company branding logo colours profile' },
    { id: 'adm-users', label: 'Manage users', group: 'Administration', path: '/admin/users', keywords: 'users accounts people manage' },
    { id: 'adm-roles', label: 'Roles & permissions', group: 'Administration', path: '/admin/roles', keywords: 'roles permissions access privileges' },
    { id: 'adm-privileges', label: 'Privileges catalogue', group: 'Administration', path: '/admin/privileges', keywords: 'privileges view maintain approve maker checker' },
    { id: 'adm-delegations', label: 'Role delegations', group: 'Administration', path: '/admin/delegations', keywords: 'delegation act on behalf acting authority absence' },
    { id: 'adm-modules', label: 'Modules & licensing', group: 'Administration', path: '/admin/modules', keywords: 'modules licensing entitlements install' },
    { id: 'adm-audit', label: 'Audit trail', group: 'Administration', path: '/admin/audit', keywords: 'audit trail activity history log' },
    { id: 'adm-sessions', label: 'Login sessions', group: 'Administration', path: '/admin/sessions', keywords: 'sessions login active security' },
    { id: 'adm-logs', label: 'Application logs', group: 'Administration', path: '/admin/logs', keywords: 'logs errors warnings technical' }
  ],
  routeTrails: {
    '/admin/organization': ['Administration', 'Organization'],
    '/admin/users': ['Administration', 'Access control', 'Users'],
    '/admin/roles': ['Administration', 'Access control', 'Roles & permissions'],
    '/admin/privileges': ['Administration', 'Access control', 'Privileges'],
    '/admin/delegations': ['Administration', 'Access control', 'Delegations'],
    '/admin/modules': ['Administration', 'Access control', 'Modules & licensing'],
    '/admin/audit': ['Administration', 'Audit & security', 'Audit trail'],
    '/admin/sessions': ['Administration', 'Audit & security', 'Login sessions'],
    '/admin/logs': ['Administration', 'Audit & security', 'Application logs']
  }
};
