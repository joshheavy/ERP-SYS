'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ModuleId, Role } from '../types/common';
import { MODULES } from '../data/navigation';
import type { ModuleNav } from '../data/navigation';
import {
  ENTITLED_MODULE_IDS,
  LICENSE,
  isModuleEntitled,
  isSubmoduleEntitled as isSubmoduleLicensed,
  type LicenseManifest
} from '../core/entitlements/entitlements.config';
import { ALL_SUBMODULE_IDS, submoduleForPath } from '../core/module/submodules';
import { usePermissions } from './PermissionsContext';

/**
 * Live sub-module override (demo / operator convenience).
 * ------------------------------------------------------
 * The license (config/env) is the on-prem source of truth for what this install
 * is sold. For demonstrating and letting an operator experiment in the running
 * app, we layer a localStorage override on top: each declared sub-module has an
 * enabled flag, SEEDED from the license default. Toggling it in Admin → Modules
 * & licensing flips the sub-module live; "Reset to license" clears the override.
 */
const OVERRIDE_KEY = 'emtech.entitlements.submodules.v1';

function loadOverride(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/**
 * ENTITLEMENTS CONTEXT
 * --------------------
 * Exposes this install's license (which modules are OWNED) and the combined
 * gate (entitlement ∩ role permission) the whole shell uses to decide what a
 * given role may actually see and open.
 *
 * The license is static config for on-prem (see entitlements.config.ts), so
 * this provider holds no mutable state — it simply surfaces the resolved
 * license plus derived selectors. Role permissions remain editable and live in
 * PermissionsContext; this context reads from it to compute the intersection.
 */
interface EntitlementsValue {
  /** The resolved license for this install. */
  license: LicenseManifest;
  /** Module ids this install is licensed for. */
  entitledIds: ModuleId[];
  /** Is a module licensed on this install (ignores role)? */
  isEntitled: (id: ModuleId) => boolean;
  /**
   * The effective gate: a role may use a module only if it is BOTH entitled
   * on this install AND permitted for the role.
   */
  canUse: (role: Role, id: ModuleId) => boolean;
  /** Modules a role can actually use (entitled ∩ permitted), as nav objects. */
  usableModules: (role: Role) => ModuleNav[];
  /** First usable module route for a role, or the portal if none. */
  homeRoute: (role: Role) => string;
  /** Is a sub-module enabled on this install (live override over the license)? */
  isSubmoduleEntitled: (submoduleId: string) => boolean;
  /**
   * May a role use a given nav path, considering its sub-module gate? A path in
   * a CORE group (no submoduleId) is allowed; a path in a tagged group requires
   * that sub-module to be entitled. Role/module gating is handled separately by
   * canUse — this is purely the sub-module layer.
   */
  isPathSubmoduleEntitled: (pathname: string) => boolean;
  /** Enable/disable a sub-module live (persisted override). */
  setSubmoduleEnabled: (submoduleId: string, enabled: boolean) => void;
  /** Clear all live overrides, reverting every sub-module to the license default. */
  resetSubmodules: () => void;
  /** True when a live override is active (differs from the license default). */
  hasSubmoduleOverride: boolean;
}

const EntitlementsContext = createContext<EntitlementsValue | null>(null);

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const { canAccess } = usePermissions();

  // Live per-sub-module override, keyed by submoduleId. Absent key = follow the
  // license default. Hydrated from localStorage on the client.
  const [override, setOverride] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setOverride(loadOverride());
  }, []);

  const persist = useCallback((next: Record<string, boolean>) => {
    setOverride(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — in-memory still works */
      }
    }
  }, []);

  const setSubmoduleEnabled = useCallback(
    (submoduleId: string, enabled: boolean) => {
      persist({ ...override, [submoduleId]: enabled });
    },
    [override, persist]
  );

  const resetSubmodules = useCallback(() => {
    persist({});
  }, [persist]);

  const value = useMemo<EntitlementsValue>(() => {
    const canUse = (role: Role, id: ModuleId) =>
      isModuleEntitled(id) && canAccess(role, id);

    const usableModules = (role: Role): ModuleNav[] =>
      MODULES.filter((m) => canUse(role, m.id));

    // Live override wins over the license default when a flag is present.
    const isSubmoduleEntitled = (submoduleId: string) =>
      submoduleId in override ? override[submoduleId] : isSubmoduleLicensed(submoduleId);

    // A path is sub-module-allowed if it belongs to no tagged group (core) or
    // its owning sub-module is entitled on this install.
    const isPathSubmoduleEntitled = (pathname: string) => {
      const sub = submoduleForPath(pathname);
      return sub === null || isSubmoduleEntitled(sub);
    };

    const hasSubmoduleOverride = ALL_SUBMODULE_IDS.some(
      (id) => id in override && override[id] !== isSubmoduleLicensed(id)
    );

    return {
      license: LICENSE,
      entitledIds: ENTITLED_MODULE_IDS,
      isEntitled: isModuleEntitled,
      canUse,
      usableModules,
      homeRoute: (role) => usableModules(role)[0]?.home ?? '/portal',
      isSubmoduleEntitled,
      isPathSubmoduleEntitled,
      setSubmoduleEnabled,
      resetSubmodules,
      hasSubmoduleOverride
    };
  }, [canAccess, override, setSubmoduleEnabled, resetSubmodules]);

  return (
    <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>
  );
}

export function useEntitlements(): EntitlementsValue {
  const ctx = useContext(EntitlementsContext);
  if (!ctx) throw new Error('useEntitlements must be used inside EntitlementsProvider');
  return ctx;
}

/**
 * useModuleAccess — the single hook the shell should call to gate modules.
 * Combines entitlements (per install) with role permissions (per role) so
 * callers never have to remember to check both.
 */
export function useModuleAccess() {
  const {
    canUse,
    usableModules,
    homeRoute,
    isEntitled,
    entitledIds,
    isSubmoduleEntitled: isSubEntitled,
    isPathSubmoduleEntitled
  } = useEntitlements();
  return { canUse, usableModules, homeRoute, isEntitled, entitledIds, isSubmoduleEntitled: isSubEntitled, isPathSubmoduleEntitled };
}
