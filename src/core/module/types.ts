import type React from 'react';
import type { ModuleId, Role } from '../../types/common';
import type { NavGroup } from '../../data/navigationData';

/** Which rail section a module belongs to. */
export type ModuleSection = 'Operations' | 'People' | 'Business' | 'System';

/** A command-palette entry a module contributes. */
export interface ModuleCommand {
  id: string;
  label: string;
  group: string;
  path: string;
  keywords: string;
  shortcut?: string;
}

/**
 * The contract every feature module implements. The shell (sidebar, command
 * palette, route guard, dashboard, permissions) is built ENTIRELY from the set
 * of registered manifests — it never hard-codes a module. To add a module you
 * write a manifest and register it; to remove one you unregister it. To sell a
 * module you gate it with entitlements (see EntitlementsProvider).
 */
export interface ModuleManifest {
  id: ModuleId;
  label: string;
  /** Compact label for tight spaces (the collapsed rail). */
  shortLabel?: string;
  /** One-line description shown in menus and the dashboard. */
  blurb?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Rail section the module is grouped under. */
  section: ModuleSection;
  /** Landing route when the module is opened. */
  home: string;
  /** Sidebar groups + pages this module contributes. */
  nav: NavGroup[];
  /** Roles that receive this module by default (seeds the permissions map). */
  defaultRoles: Role[];
  /** Command-palette entries this module contributes. */
  commands?: ModuleCommand[];
  /**
   * Breadcrumb trails per route this module owns, e.g.
   * { '/finance/journals': ['Finance', 'General ledger', 'Journal entries'] }.
   * Optional — routes not listed fall back to the page's own trail.
   */
  routeTrails?: Record<string, string[]>;
}
