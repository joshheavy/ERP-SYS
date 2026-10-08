'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_MODULE_IDS, MODULES, ROLE_MODULES } from '../data/navigation';
import type { ModuleNav } from '../data/navigation';
import type { ModuleId, Role } from '../types/common';

const STORAGE_KEY = 'emtech.permissions.v1';

export type ModuleAccessMap = Record<Role, ModuleId[]>;

interface PermissionsValue {
  /** The live, editable per-role module access map. */
  access: ModuleAccessMap;
  /** Can a role open a module right now? */
  canAccess: (role: Role, moduleId: ModuleId) => boolean;
  /** Modules a role can access, resolved to nav objects, in the role's order. */
  modulesFor: (role: Role) => ModuleNav[];
  /** First accessible module route for a role (its landing module). */
  homeModuleRoute: (role: Role) => string;
  /** Toggle one module for one role (used by the Admin editor). */
  toggle: (role: Role, moduleId: ModuleId) => void;
  /** Replace a role's whole module list. */
  setRoleModules: (role: Role, moduleIds: ModuleId[]) => void;
  /** Restore the built-in defaults. */
  reset: () => void;
}

const PermissionsContext = createContext<PermissionsValue | null>(null);

function cloneDefaults(): ModuleAccessMap {
  return Object.fromEntries(
    (Object.keys(ROLE_MODULES) as Role[]).map((r) => [r, [...ROLE_MODULES[r]]])
  ) as ModuleAccessMap;
}

/** Merge stored access with defaults so newly-added roles/modules never break it. */
function normalise(stored: Partial<ModuleAccessMap> | null): ModuleAccessMap {
  const base = cloneDefaults();
  if (!stored) return base;
  for (const role of Object.keys(base) as Role[]) {
    const list = stored[role];
    if (Array.isArray(list)) {
      base[role] = list.filter((id): id is ModuleId => ALL_MODULE_IDS.includes(id as ModuleId));
    }
  }
  return base;
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<ModuleAccessMap>(() => cloneDefaults());

  // Hydrate from localStorage on the client, after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAccess(normalise(JSON.parse(raw)));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = useCallback((next: ModuleAccessMap) => {
    setAccess(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; in-memory state still works */
    }
  }, []);

  const value = useMemo<PermissionsValue>(() => {
    const modulesFor = (role: Role): ModuleNav[] =>
      (access[role] ?? [])
        .map((id) => MODULES.find((m) => m.id === id))
        .filter((m): m is ModuleNav => Boolean(m));

    return {
      access,
      canAccess: (role, moduleId) => (access[role] ?? []).includes(moduleId),
      modulesFor,
      homeModuleRoute: (role) => modulesFor(role)[0]?.home ?? '/portal',
      toggle: (role, moduleId) => {
        const current = access[role] ?? [];
        const next = current.includes(moduleId)
          ? current.filter((id) => id !== moduleId)
          : // keep canonical order when adding
            ALL_MODULE_IDS.filter((id) => current.includes(id) || id === moduleId);
        persist({ ...access, [role]: next });
      },
      setRoleModules: (role, moduleIds) => persist({ ...access, [role]: moduleIds }),
      reset: () => persist(cloneDefaults())
    };
  }, [access, persist]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used inside PermissionsProvider');
  return ctx;
}
