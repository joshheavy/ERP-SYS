import type { ModuleId, Role } from '../../types/common';
import type { ModuleNav, NavGroup, RailSection, CommandItem } from '../../data/navigationData';
import { MODULE_REGISTRY } from './registry';
import type { ModuleManifest } from './types';

/**
 * Everything the shell needs is DERIVED from MODULE_REGISTRY here. The sidebar,
 * command palette, route guard, permissions and dashboard import from this file
 * (via the navigation re-exports), so adding/removing a module in the registry
 * updates the whole app with no other edits.
 *
 * "Workspace" items that belong to no single module (My approvals, the
 * self-service portal, the component gallery) are declared here as shared extras.
 */

/** Cross-module workspace routes + commands, not owned by any module. */
const WORKSPACE_ROUTE_TRAILS: Record<string, { module: ModuleId; trail: string[] }> = {
  '/approvals': { module: 'finance', trail: ['Workspace', 'My approvals'] },
  '/notifications': { module: 'finance', trail: ['Workspace', 'Notifications'] },
  '/account': { module: 'finance', trail: ['Account', 'Preferences'] },
  '/gallery': { module: 'finance', trail: ['System', 'Component gallery'] }
};

const WORKSPACE_COMMANDS: CommandItem[] = [
  { id: 'wc-approvals', label: 'My approvals', group: 'Workspace', path: '/approvals', keywords: 'inbox approve pending', shortcut: 'A' },
  { id: 'wc-notifications', label: 'Notifications', group: 'Workspace', path: '/notifications', keywords: 'notifications alerts bell unread mentions' },
  { id: 'wc-account', label: 'Account & preferences', group: 'Workspace', path: '/account', keywords: 'account profile preferences theme density settings me my' },
  { id: 'wc-portal', label: 'Self-service portal', group: 'Workspace', path: '/portal', keywords: 'employee portal payslip leave' },
  { id: 'wc-gallery', label: 'Component gallery', group: 'System', path: '/gallery', keywords: 'components states design system' }
];

/** The shape the sidebar/rail consumes (unchanged from the old MODULES type). */
function toModuleNav(m: ModuleManifest): ModuleNav {
  return {
    id: m.id,
    label: m.label,
    shortLabel: m.shortLabel,
    blurb: m.blurb,
    icon: m.icon,
    home: m.home,
    groups: m.nav
  };
}

/** All installed modules, as ModuleNav (the sidebar/rail data). */
export const MODULES: ModuleNav[] = MODULE_REGISTRY.map(toModuleNav);

/** Every installed module id, canonical order. */
export const ALL_MODULE_IDS: ModuleId[] = MODULE_REGISTRY.map((m) => m.id);

/** Rail sections, built from each module's declared section (empty sections dropped). */
const SECTION_ORDER: RailSection['label'][] = ['Operations', 'People', 'Business', 'System'];
export const RAIL_SECTIONS: RailSection[] = SECTION_ORDER.map((label) => ({
  label,
  moduleIds: MODULE_REGISTRY.filter((m) => m.section === label).map((m) => m.id)
})).filter((s) => s.moduleIds.length > 0);

/** Default role → modules map, seeded from each manifest's defaultRoles. */
export const ROLE_MODULES: Record<Role, ModuleId[]> = (() => {
  const roles: Role[] = ['admin', 'manager', 'officer', 'auditor', 'employee'];
  const map = Object.fromEntries(roles.map((r) => [r, [] as ModuleId[]])) as Record<Role, ModuleId[]>;
  for (const m of MODULE_REGISTRY) {
    for (const role of m.defaultRoles) map[role].push(m.id);
  }
  return map;
})();

/** Route → owning module + breadcrumb trail, from module manifests + workspace extras. */
export const ROUTE_META: Record<string, { module: ModuleId; trail: string[] }> = (() => {
  const meta: Record<string, { module: ModuleId; trail: string[] }> = {};
  for (const m of MODULE_REGISTRY) {
    for (const [path, trail] of Object.entries(m.routeTrails ?? {})) {
      meta[path] = { module: m.id, trail };
    }
  }
  return { ...meta, ...WORKSPACE_ROUTE_TRAILS };
})();

/** Command palette entries, from module manifests + workspace extras. */
export const COMMANDS: CommandItem[] = [
  ...MODULE_REGISTRY.flatMap((m) => m.commands ?? []),
  ...WORKSPACE_COMMANDS
];

export type { NavGroup, ModuleNav, RailSection, CommandItem };
