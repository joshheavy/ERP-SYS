'use client';

import React, { useEffect, useState } from 'react';
import { usePath } from '../../hooks/useNav';
import { MODULES, ROUTE_META } from '../../data/navigation';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useModuleAccess } from '../../contexts/EntitlementsContext';
import type { ModuleId } from '../../types/common';
import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * The module a path belongs to, or null for shared/workspace routes that are
 * NOT owned by a module (dashboard, approvals, gallery). Returning null means
 * "no module is active" so the sidebar highlights only Dashboard on /dashboard.
 * A path only claims a module when it is prefixed by that module's id.
 */
function moduleForPath(pathname: string): ModuleId | null {
  const match = MODULES.find((m) => pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`));
  return match?.id ?? null;
}

/** The frame every console screen lives inside. */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePath();
  const { role } = usePreferences();
  const { usableModules } = useModuleAccess();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const accessible = usableModules(role);
  const resolved = moduleForPath(pathname);
  // Active module only when the route belongs to a module this role can access.
  // Shared routes (/dashboard, /approvals, /gallery) leave it null → nothing
  // in the module list is highlighted, only the Dashboard item.
  const activeModule = resolved && accessible.some((m) => m.id === resolved) ? resolved : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas">
      {/* One unified sidebar (module sections + pages), hidden on small screens. */}
      <div className="hidden md:flex">
        <Sidebar
          activeModule={activeModule}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)} />

      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main className="thin-scroll min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>);

}