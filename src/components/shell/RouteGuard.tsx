'use client';

import React from 'react';
import { LockIcon } from 'lucide-react';
import { useNav, usePath } from '../../hooks/useNav';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useModuleAccess } from '../../contexts/EntitlementsContext';
import { MODULES } from '../../data/navigation';
import { Button } from '../ui/Button';

/**
 * Guards module routes against the current role. If a user opens a URL for a
 * module they cannot access (by typing it, a stale bookmark, or a shared link),
 * we show a clear no-access screen with a way back — never a blank page or a
 * silent bounce. Cross-module workspace routes (/approvals, /gallery) are not
 * owned by a module and are always allowed.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePath();
  const navigate = useNav();
  const { role } = usePreferences();
  const { canUse, isEntitled, usableModules, homeRoute, isPathSubmoduleEntitled } = useModuleAccess();

  const owning = MODULES.find((m) => pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`));
  // Blocked if the role can't use the module, OR the route's sub-module isn't
  // licensed on this install (a core/untagged route is always sub-module-allowed).
  const moduleBlocked = owning ? !canUse(role, owning.id) : false;
  const submoduleBlocked = owning ? !isPathSubmoduleEntitled(pathname) : false;
  const blocked = moduleBlocked || submoduleBlocked;

  if (!blocked || !owning) return <>{children}</>;

  const home = homeRoute(role);
  const firstModule = usableModules(role)[0];
  // Distinguish "this install doesn't own the feature" from "your role lacks it".
  // A blocked sub-module is always an entitlement (licensing) matter.
  const notEntitled = submoduleBlocked || !isEntitled(owning.id);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-surface border border-line bg-surface p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning">
          <LockIcon className="h-6 w-6" aria-hidden />
        </span>
        {notEntitled ? (
          <>
            <h1 className="mt-4 text-h1 text-ink">{owning.label} isn’t enabled on this install</h1>
            <p className="mx-auto mt-2 max-w-sm text-body text-ink-muted">
              The {owning.label} module isn’t part of this deployment’s license. Contact your EMTECH
              administrator to add it to your subscription.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-h1 text-ink">You don’t have access to {owning.label}</h1>
            <p className="mx-auto mt-2 max-w-sm text-body text-ink-muted">
              Your role doesn’t include the {owning.label} module. If you believe this is a mistake, ask an
              administrator to review your access.
            </p>
          </>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          {firstModule ? (
            <Button variant="primary" onClick={() => navigate(home)}>
              Go to {firstModule.label}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => navigate('/portal')}>
              Open self-service portal
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
