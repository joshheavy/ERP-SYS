import type { ModuleId } from '../../types/common';
import { MODULE_REGISTRY } from './registry';

/**
 * SUB-MODULES — sellable feature groups WITHIN a module.
 * ------------------------------------------------------
 * A sub-module is a nav group tagged with a `submoduleId`. This file DERIVES the
 * full set of declared sub-modules (and their routes) from the same module
 * manifests the rest of the shell is built from — nothing is hand-listed. Add a
 * `submoduleId` to a nav group and it becomes a licensable unit automatically.
 *
 * Import direction stays acyclic: submodules → registry → navigationData.
 */

export interface SubmoduleInfo {
  /** Stable, module-namespaced id, e.g. 'finance.subledgers'. */
  id: string;
  /** Display name for the licensing screen. */
  label: string;
  /** The module this sub-module belongs to. */
  moduleId: ModuleId;
  /** Routes (page paths) this sub-module owns. */
  routes: string[];
}

/** Every declared sub-module across all installed modules, in registry order. */
export const SUBMODULES: SubmoduleInfo[] = (() => {
  const out: SubmoduleInfo[] = [];
  for (const m of MODULE_REGISTRY) {
    for (const group of m.nav) {
      if (!group.submoduleId) continue;
      out.push({
        id: group.submoduleId,
        label: group.submoduleLabel ?? group.label ?? group.submoduleId,
        moduleId: m.id,
        routes: group.pages.map((p) => p.path)
      });
    }
  }
  return out;
})();

/** All declared sub-module ids. */
export const ALL_SUBMODULE_IDS: string[] = SUBMODULES.map((s) => s.id);

/** Sub-modules grouped by their parent module id. */
export const SUBMODULES_BY_MODULE: Record<string, SubmoduleInfo[]> = (() => {
  const map: Record<string, SubmoduleInfo[]> = {};
  for (const s of SUBMODULES) {
    (map[s.moduleId] ??= []).push(s);
  }
  return map;
})();

/** Fast route → submoduleId lookup, longest-match aware. */
const ROUTE_TO_SUBMODULE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const s of SUBMODULES) {
    for (const route of s.routes) map[route] = s.id;
  }
  return map;
})();

/**
 * The sub-module that owns a path, or null if the path is core (belongs to no
 * tagged group). Uses longest-prefix match so detail routes like
 * /finance/payables/INV-1 resolve to the payables sub-module.
 */
export function submoduleForPath(pathname: string): string | null {
  let best: string | null = null;
  let bestLen = -1;
  for (const [route, id] of Object.entries(ROUTE_TO_SUBMODULE)) {
    if ((pathname === route || pathname.startsWith(route + '/')) && route.length > bestLen) {
      best = id;
      bestLen = route.length;
    }
  }
  return best;
}
