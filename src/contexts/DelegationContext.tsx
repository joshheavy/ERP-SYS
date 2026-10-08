'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePreferences } from './PreferencesContext';
import { delegationsStore, IDENTITIES, type Delegation, type SessionIdentity } from '../data/users';
import { useCollection } from '../core/store/createCollection';
import type { Role } from '../types/common';

/**
 * ROLE DELEGATION
 * ---------------
 * Lets a user act on behalf of another role while a colleague is away
 * (maker-checker continuity). "Acting as" a delegation temporarily switches the
 * effective role — which drives module access, permissions, the sidebar and the
 * dashboard — by setting the Preferences role, remembering the original so it
 * can be restored when the user stops acting.
 *
 * Delegations themselves are managed in Admin → Delegations and persist via
 * delegationsStore; the "currently acting" state lives here (session only).
 */
interface DelegationValue {
  /** All delegations (live from the store). */
  delegations: Delegation[];
  /** The delegation currently being acted under, or null. */
  active: Delegation | null;
  /** Is the user currently acting under a delegation? */
  isActing: boolean;
  /**
   * The identity to DISPLAY. When acting, this is the delegator (the person
   * whose authority you hold) — so the app shows you are acting AS that person,
   * with their delegated role driving permissions. Otherwise it's the signed-in
   * identity for the current role.
   */
  effectiveIdentity: SessionIdentity;
  /** Begin acting under a delegation (switches the effective role). */
  startActing: (delegation: Delegation) => void;
  /** Stop acting and restore the original role. */
  stopActing: () => void;
}

const DelegationContext = createContext<DelegationValue | null>(null);

export function DelegationProvider({ children }: { children: React.ReactNode }) {
  const { role, setRole } = usePreferences();
  const delegations = useCollection(delegationsStore);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalRole, setOriginalRole] = useState<Role | null>(null);

  const active = useMemo(() => delegations.find((d) => d.id === activeId) ?? null, [delegations, activeId]);

  const startActing = useCallback(
    (delegation: Delegation) => {
      if (delegation.status !== 'active') {
        toast.error('This delegation is not active');
        return;
      }
      // Remember where to return to, then assume the delegated role.
      setOriginalRole((prev) => prev ?? role);
      setActiveId(delegation.id);
      setRole(delegation.roleId);
      toast.success(`Now acting for ${delegation.from}`, { description: delegation.scope });
    },
    [role, setRole]
  );

  const stopActing = useCallback(() => {
    if (originalRole) setRole(originalRole);
    setActiveId(null);
    setOriginalRole(null);
    toast.success('Stopped acting — back to your own role');
  }, [originalRole, setRole]);

  // When acting, present the delegator as the current person: their name + job
  // title, with the delegated role's capability. Otherwise the base identity.
  const effectiveIdentity = useMemo<SessionIdentity>(() => {
    if (active) {
      return {
        role: active.roleId,
        name: active.from,
        jobTitle: active.role,
        department: 'Delegated authority',
        employeeId: active.id.toUpperCase(),
        capability: IDENTITIES[active.roleId].capability
      };
    }
    return IDENTITIES[role];
  }, [active, role]);

  const value = useMemo<DelegationValue>(
    () => ({ delegations, active, isActing: active !== null, effectiveIdentity, startActing, stopActing }),
    [delegations, active, effectiveIdentity, startActing, stopActing]
  );

  return <DelegationContext.Provider value={value}>{children}</DelegationContext.Provider>;
}

export function useDelegation(): DelegationValue {
  const ctx = useContext(DelegationContext);
  if (!ctx) throw new Error('useDelegation must be used inside DelegationProvider');
  return ctx;
}
