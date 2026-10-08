import type { ModuleManifest, ModuleSection } from './types';
import type { ModuleId } from '../../types/common';
import {
  RAW_MODULES,
  RAW_ROLE_MODULES,
  RAW_RAIL_SECTIONS,
  RAW_COMMANDS,
  RAW_ROUTE_META
} from '../../data/navigationData';
import { adminModule } from '../../modules/admin/admin.module';
import { prepaymentModule } from '../../modules/prepayment/prepayment.module';
import { imprestModule } from '../../modules/imprest/imprest.module';
import { suppliersModule } from '../../modules/suppliers/suppliers.module';
import { reportsModule } from '../../modules/reports/reports.module';

/**
 * MODULE_REGISTRY — the single list of installed modules.
 *
 * Two kinds of entries live here today:
 *   1. Modules still assembled from the shared RAW navigation data (transitional
 *      — finance, hr, procurement, inventory, assets, budgeting). As each is
 *      migrated into src/modules/<id>/<id>.module.ts, replace its assembled
 *      entry with a direct manifest import.
 *   2. Modules that already own their manifest (admin — the reference).
 *
 * To ADD a module: register its manifest here.
 * To REMOVE a module from a build (on-prem): omit it here. To sell/toggle a
 * module without changing code, gate it with entitlements (EntitlementsProvider).
 */

function sectionFor(id: ModuleId): ModuleSection {
  const match = RAW_RAIL_SECTIONS.find((s) => s.moduleIds.includes(id));
  return (match?.label as ModuleSection) ?? 'Business';
}

function defaultRolesFor(id: ModuleId) {
  return (Object.keys(RAW_ROLE_MODULES) as (keyof typeof RAW_ROLE_MODULES)[]).filter((role) =>
    RAW_ROLE_MODULES[role].includes(id)
  );
}

function commandsFor(id: ModuleId) {
  return RAW_COMMANDS.filter((c) => c.path === `/${id}` || c.path.startsWith(`/${id}/`)).map((c) => ({ ...c }));
}

function routeTrailsFor(id: ModuleId): Record<string, string[]> {
  const trails: Record<string, string[]> = {};
  for (const [path, meta] of Object.entries(RAW_ROUTE_META)) {
    if (path === `/${id}` || path.startsWith(`/${id}/`)) trails[path] = meta.trail;
  }
  return trails;
}

/** Modules still assembled from the shared RAW data (pre-migration). */
const ASSEMBLED_MODULES: ModuleManifest[] = RAW_MODULES.map((m) => ({
  id: m.id,
  label: m.label,
  shortLabel: m.shortLabel,
  blurb: m.blurb,
  icon: m.icon,
  section: sectionFor(m.id),
  home: m.home,
  nav: m.groups,
  defaultRoles: defaultRolesFor(m.id),
  commands: commandsFor(m.id),
  routeTrails: routeTrailsFor(m.id)
}));

/** Modules that own their manifest directly (the target shape). */
const OWNED_MODULES: ModuleManifest[] = [
  suppliersModule,
  imprestModule,
  prepaymentModule,
  reportsModule,
  adminModule
];

export const MODULE_REGISTRY: ModuleManifest[] = [...ASSEMBLED_MODULES, ...OWNED_MODULES];

/** Fast lookup by id. */
export const MODULE_BY_ID: Record<string, ModuleManifest> = Object.fromEntries(
  MODULE_REGISTRY.map((m) => [m.id, m])
);
