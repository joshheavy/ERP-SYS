import type { ModuleId } from '../../types/common';

/**
 * ON-PREM ENTITLEMENTS
 * --------------------
 * This is the single source of truth for WHICH MODULES THIS INSTALL IS
 * LICENSED FOR. EMTECH ERP ships as one modular monolith; each customer's
 * on-prem deployment enables only the modules they have purchased.
 *
 * Entitlements are orthogonal to role permissions:
 *   - Entitlement  = "does THIS INSTALL own the module?" (per company/license)
 *   - Permission   = "may THIS ROLE open the module?"    (per role, editable)
 * A module is usable only where the two overlap (entitlement ∩ permission).
 *
 * HOW TO CHANGE FOR AN ON-PREM CUSTOMER
 *   1. Edit `LICENSE.modules` below to list exactly the purchased module ids
 *      (simplest and always works client + server), OR set the env var
 *      NEXT_PUBLIC_EMTECH_LICENSED_MODULES (comma-separated) at build time to
 *      override without touching source, e.g.
 *        NEXT_PUBLIC_EMTECH_LICENSED_MODULES="finance,hr,procurement,admin"
 *      (The NEXT_PUBLIC_ prefix is required for Next.js to inline the value
 *      into the client bundle; the bare EMTECH_LICENSED_MODULES is honoured
 *      too but only on the server.)
 *   2. `admin` should almost always stay licensed — it hosts user, role and
 *      licensing administration. It is force-included below as a safeguard.
 *   3. Rebuild / restart. Unlicensed modules disappear from the sidebar,
 *      command palette, dashboard and are blocked by the route guard.
 *
 * This file is deliberately plain data (no React) so it can be read on the
 * server, in scripts, and in the client bundle alike.
 */

export interface LicenseManifest {
  /** Human-readable name of the licensed organisation (shown in Admin). */
  licensee: string;
  /** License tier label, purely informational. */
  edition: 'Starter' | 'Business' | 'Enterprise';
  /** Modules this install has purchased. `admin` is always added. */
  modules: ModuleId[];
  /**
   * Sellable SUB-MODULES (feature groups within a module) this install owns,
   * by id (e.g. 'finance.subledgers'). Semantics:
   *   - `undefined`  → ALL declared sub-modules are entitled (the default; an
   *     install that bought a module gets its full feature set).
   *   - an array     → ONLY the listed sub-modules are entitled; any tagged
   *     group not listed is disabled on this install. Core (untagged) groups
   *     are always on regardless.
   * Kept as opaque strings so this file needs no dependency on the module
   * registry (avoids an import cycle; entitlements stays plain data).
   */
  submodules?: string[];
  /** Optional ISO date the license expires; undefined = perpetual. */
  expiresAt?: string;
}

/** `admin` is infrastructure, never sold separately — always entitled. */
const ALWAYS_ENTITLED: ModuleId[] = ['admin'];

/** The default license baked into this build (Enterprise = everything). */
const DEFAULT_LICENSE: LicenseManifest = {
  licensee: 'EMTECH Reference Install',
  edition: 'Enterprise',
  modules: ['finance', 'hr', 'procurement', 'inventory', 'assets', 'budgeting', 'suppliers', 'imprest', 'prepayment', 'reports']
};

/**
 * Read an optional build-time override. Works with Next's inlined
 * `process.env` on both server and client when prefixed appropriately; we
 * accept the bare name too for on-prem operators editing their shell env.
 */
function readEnvModules(): ModuleId[] | null {
  const raw =
    (typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_EMTECH_LICENSED_MODULES ??
      process.env.EMTECH_LICENSED_MODULES
      : undefined) ?? null;
  if (!raw) return null;
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as ModuleId[];
  return ids.length ? ids : null;
}

/** The resolved license for this install (env override wins over default). */
export const LICENSE: LicenseManifest = (() => {
  const envModules = readEnvModules();
  const base = envModules
    ? { ...DEFAULT_LICENSE, licensee: 'On-Prem Install', modules: envModules }
    : DEFAULT_LICENSE;
  // Force-include always-entitled modules, de-duplicated, preserving order.
  const merged = Array.from(new Set([...base.modules, ...ALWAYS_ENTITLED]));
  return { ...base, modules: merged };
})();

/** The set of entitled module ids for this install. */
export const ENTITLED_MODULE_IDS: ModuleId[] = LICENSE.modules;

/** Cheap membership test used by selectors and the entitlements context. */
export function isModuleEntitled(id: ModuleId): boolean {
  return ENTITLED_MODULE_IDS.includes(id);
}

/**
 * The set of licensed sub-module ids, or `null` when the license doesn't
 * restrict sub-modules (→ all entitled). An env override lets on-prem operators
 * set the list without editing source, e.g.
 *   NEXT_PUBLIC_EMTECH_LICENSED_SUBMODULES="finance.subledgers,hr.payroll"
 */
export const LICENSED_SUBMODULE_IDS: string[] | null = (() => {
  const raw =
    (typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_EMTECH_LICENSED_SUBMODULES ??
      process.env.EMTECH_LICENSED_SUBMODULES
      : undefined) ?? null;
  if (raw) {
    const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length) return ids;
  }
  return LICENSE.submodules ?? null;
})();

/**
 * Is a sub-module entitled on this install? A `null` licensed set means "no
 * restriction" → every sub-module is entitled (the default). Only when the
 * license explicitly lists sub-modules is an unlisted one disabled.
 */
export function isSubmoduleEntitled(submoduleId: string): boolean {
  return LICENSED_SUBMODULE_IDS === null || LICENSED_SUBMODULE_IDS.includes(submoduleId);
}
