import type { ModuleId, Role } from '../types/common';
import {
  MODULES,
  ALL_MODULE_IDS,
  RAIL_SECTIONS,
  ROLE_MODULES,
  ROUTE_META,
  COMMANDS
} from '../core/module/selectors';
import type { ModuleNav } from './navigationData';

/**
 * Public navigation API. The values below are DERIVED from the module registry
 * (src/core/module) — they are no longer hand-authored here. Application code
 * keeps importing MODULES / ROUTE_META / COMMANDS / RAIL_SECTIONS / ROLE_MODULES
 * / ALL_MODULE_IDS from this file exactly as before; the data now flows through
 * the registry + selectors so modules are pluggable.
 *
 * The raw, per-module source data lives in ./navigationData (transitional) and,
 * for migrated modules, in src/modules/<id>/<id>.module.ts.
 */

export type { NavPage, NavGroup, ModuleNav, RailSection, CommandItem } from './navigationData';

export { MODULES, ALL_MODULE_IDS, RAIL_SECTIONS, ROLE_MODULES, ROUTE_META, COMMANDS };

/** Modules a role may access by default, resolved to nav objects, in registry order. */
export function modulesForRole(role: Role): ModuleNav[] {
  const allowed = ROLE_MODULES[role] ?? [];
  return MODULES.filter((m) => allowed.includes(m.id));
}

export function canAccessModule(role: Role, moduleId: ModuleId): boolean {
  return (ROLE_MODULES[role] ?? []).includes(moduleId);
}

/** The first module a role should land on when they enter the console. */
export function homeRouteForRole(role: Role): string {
  const first = modulesForRole(role)[0];
  return first ? first.home : '/portal';
}
