'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LayersIcon,
  LayoutDashboardIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SmartphoneIcon
} from 'lucide-react';
import { useNav, usePath } from '../../hooks/useNav';
import { cn } from '../../utils/cn';
import { RAIL_SECTIONS } from '../../data/navigation';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useModuleAccess } from '../../contexts/EntitlementsContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Tooltip } from '../ui/Tooltip';
import type { ModuleId } from '../../types/common';
import type { ModuleNav, NavGroup, NavPage } from '../../data/navigation';

export interface SidebarProps {
  /** The module owning the current route, or null on shared routes (dashboard, approvals). */
  activeModule: ModuleId | null;
  collapsed: boolean;
  onToggle: () => void;
}

/** Longest-match active page: /procurement/requisitions/PR-1 → highlights Requisitions. */
function activePagePath(pages: NavPage[], pathname: string): string | null {
  let best: string | null = null;
  for (const page of pages) {
    if (pathname === page.path || pathname.startsWith(page.path + '/')) {
      if (!best || page.path.length > best.length) best = page.path;
    }
  }
  return best;
}

/** Stable key for a nav group within a module (used to track collapse state). */
function groupKey(moduleId: ModuleId, group: NavGroup, index: number): string {
  return `${moduleId}::${group.label ?? `g${index}`}`;
}

/* ------------------------------------------------------------------ *
 * A single page link (leaf). Shared by expanded sidebar + flyout.
 * ------------------------------------------------------------------ */
function PageLink({
  page,
  active,
  onNavigate
}: {
  page: NavPage;
  active: boolean;
  onNavigate: (path: string) => void;
}) {
  const PageIcon = page.icon;
  return (
    <li>
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => onNavigate(page.path)}
        className={cn(
          'group/page relative flex w-full items-center gap-2 rounded-control py-1.5 pl-2.5 pr-2 text-left transition-colors duration-fast ease-exit',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          active ? 'bg-primary-soft text-primary-text' : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
        )}>
        <span
          className={cn(
            'absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
            active ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        />
        <PageIcon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-text' : 'text-ink-subtle group-hover/page:text-ink')} aria-hidden />
        <span className={cn('min-w-0 flex-1 truncate text-small', active && 'font-medium')}>{page.label}</span>
        {page.badge !== undefined && (
          <span
            className={cn(
              'tabular shrink-0 rounded-full px-1.5 text-caption font-semibold',
              active ? 'bg-white text-primary-text' : 'bg-warning-soft text-warning'
            )}>
            {page.badge}
          </span>
        )}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * A collapsible group of pages (labelled). If the group has no label
 * it renders its pages ungrouped (no toggle). Shared by both surfaces.
 * ------------------------------------------------------------------ */
function CollapsibleGroup({
  group,
  gKey,
  pathname,
  collapsedGroups,
  onToggleGroup,
  onNavigate
}: {
  group: NavGroup;
  gKey: string;
  pathname: string;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onNavigate: (path: string) => void;
}) {
  const activePath = activePagePath(group.pages, pathname);

  // Unlabelled group: render pages directly, no collapse affordance.
  if (!group.label) {
    return (
      <li>
        <ul className="space-y-0.5 border-l border-line pl-2">
          {group.pages.map((page) => (
            <PageLink key={page.path} page={page} active={activePath === page.path} onNavigate={onNavigate} />
          ))}
        </ul>
      </li>
    );
  }

  const open = !collapsedGroups[gKey];

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggleGroup(gKey)}
        className="group/heading flex w-full items-center gap-1 rounded-[4px] px-2 pb-1 pt-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ChevronDownIcon
          className={cn(
            'h-3 w-3 shrink-0 text-ink-subtle/70 transition-transform duration-moderate ease-exit group-hover/heading:text-ink-subtle',
            !open && '-rotate-90'
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-[0.625rem] font-semibold uppercase tracking-wide text-ink-subtle/80">
          {group.label}
        </span>
      </button>
      {open && (
        <ul className="mb-0.5 space-y-0.5 border-l border-line pl-2">
          {group.pages.map((page) => (
            <PageLink key={page.path} page={page} active={activePath === page.path} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Flyout shown when hovering a module icon in the collapsed strip.
 * Lists the module's pages (grouped, collapsible) — clickable.
 * ------------------------------------------------------------------ */
function ModuleFlyout({
  module,
  top,
  pathname,
  collapsedGroups,
  onToggleGroup,
  onNavigate,
  onMouseEnter,
  onMouseLeave
}: {
  module: ModuleNav;
  top: number;
  pathname: string;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onNavigate: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const Icon = module.icon;
  return (
    <div
      role="menu"
      aria-label={`${module.label} pages`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ top }}
      className="fixed left-14 z-50 ml-1 w-60 animate-pop-in overflow-hidden rounded-surface border border-line bg-surface shadow-pop">
      {/* Header — click to open the module home. */}
      <button
        type="button"
        onClick={() => onNavigate(module.home)}
        className="flex w-full items-center gap-2.5 border-b border-line px-3 py-2.5 text-left transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Icon className="h-4 w-4 shrink-0 text-primary-text" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{module.label}</span>
      </button>
      <div className="thin-scroll max-h-[70vh] overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {module.groups.map((group, gi) => (
            <CollapsibleGroup
              key={groupKey(module.id, group, gi)}
              group={group}
              gKey={groupKey(module.id, group, gi)}
              pathname={pathname}
              collapsedGroups={collapsedGroups}
              onToggleGroup={onToggleGroup}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A single, unified sidebar. Modules are organised into sections
 * (Operations / People / Business) and each module is a collapsible group that
 * reveals its pages. Filtered to the current role. Collapses to a slim icon
 * strip. Replaces the old two-column rail + context sidebar.
 */
export function Sidebar({ activeModule, collapsed, onToggle }: SidebarProps) {
  const navigate = useNav();
  const pathname = usePath();
  const { role } = usePreferences();
  const { usableModules, isSubmoduleEntitled } = useModuleAccess();
  const { org } = useOrganization();

  // Modules gated on BOTH the install's entitlements and the role's permissions,
  // then each module's nav groups gated on the install's SUB-MODULE license:
  // core (untagged) groups always show; tagged groups only where entitled.
  const accessible = useMemo(
    () =>
      usableModules(role).map((m) => ({
        ...m,
        groups: m.groups.filter((g) => !g.submoduleId || isSubmoduleEntitled(g.submoduleId))
      })),
    [usableModules, role, isSubmoduleEntitled]
  );
  const accessibleIds = useMemo(() => new Set(accessible.map((m) => m.id)), [accessible]);

  // Administration is pinned near the top (right after Dashboard), so it is
  // excluded from the normal section list and rendered separately below.
  const adminModule = useMemo(() => accessible.find((m) => m.id === 'admin') ?? null, [accessible]);

  // Collapsed icon strip: same pin — Administration first, then the rest.
  const collapsedModules = useMemo(() => {
    const admin = accessible.filter((m) => m.id === 'admin');
    const rest = accessible.filter((m) => m.id !== 'admin');
    return [...admin, ...rest];
  }, [accessible]);

  const sections = useMemo(
    () =>
      RAIL_SECTIONS.map((section) => ({
        label: section.label,
        modules: section.moduleIds
          .filter((id) => id !== 'admin' && accessibleIds.has(id))
          .map((id) => accessible.find((m) => m.id === id))
          .filter((m): m is ModuleNav => Boolean(m))
      })).filter((s) => s.modules.length > 0),
    [accessible, accessibleIds]
  );

  // Which module groups are expanded. The active module is auto-opened; users
  // can open/close the others. On shared routes (activeModule null), nothing is
  // force-opened. Keyed by module id.
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (activeModule) setOpenModules((prev) => ({ ...prev, [activeModule]: true }));
  }, [activeModule]);

  const isOpen = (id: ModuleId) => openModules[id] ?? id === activeModule;

  // Collapsed sub-module *group headings* (e.g. "Payables", "Ledger"). Stored as
  // a collapsed-set so groups default to open; a truthy value means collapsed.
  // Shared by the expanded sidebar and the collapsed-mode flyout.
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Hover flyout state for the collapsed strip.
  const [flyout, setFlyout] = useState<{ module: ModuleNav; top: number } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setFlyout(null), 140);
  };
  const openFlyout = (module: ModuleNav, el: HTMLElement) => {
    cancelClose();
    const rect = el.getBoundingClientRect();
    // Keep the flyout on-screen: clamp its top so it never overflows the viewport bottom.
    const maxTop = Math.max(8, window.innerHeight - 360);
    setFlyout({ module, top: Math.min(rect.top, maxTop) });
  };

  useEffect(() => () => cancelClose(), []);

  const navigateAndClose = (path: string) => {
    setFlyout(null);
    navigate(path);
  };

  /** One expandable module row (icon + label + its pages). Shared by the pinned
   *  Administration entry and every module inside the rail sections. */
  const renderModule = (module: ModuleNav) => {
    const Icon = module.icon;
    const moduleActive = module.id === activeModule;
    const open = isOpen(module.id);

    // When a child page matches the current route exactly (e.g. the module's own
    // "Dashboard" page whose path equals module.home), THAT page owns the filled
    // "selected" highlight. The module header then shows only a subtle active tint
    // (coloured text/icon, no filled background) so the sidebar never shows two
    // selected blocks at once. The header keeps the full highlight only when the
    // module is active but no child is the exact active page.
    const pages = module.groups.flatMap((g) => g.pages);
    const childOwnsActive = pages.some((p) => p.path === pathname);
    const headerFilled = moduleActive && !childOwnsActive;

    return (
      <li key={module.id}>
        {/* Module row — expands/collapses its pages, click label goes to its home */}
        <div
          className={cn(
            'group flex items-center rounded-control',
            headerFilled ? 'bg-primary-soft' : 'hover:bg-surface-3'
          )}>
          <button
            type="button"
            onClick={() => navigate(module.home)}
            aria-current={headerFilled ? 'true' : undefined}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control py-1.5 pl-2.5 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Icon
              className={cn('h-4 w-4 shrink-0', moduleActive ? 'text-primary-text' : 'text-ink-subtle group-hover:text-ink')}
              aria-hidden
            />
            <span className={cn('min-w-0 flex-1 truncate text-body', moduleActive ? 'font-semibold text-primary-text' : 'text-ink')}>
              {module.label}
            </span>
          </button>
          <button
            type="button"
            aria-label={open ? `Collapse ${module.label}` : `Expand ${module.label}`}
            aria-expanded={open}
            onClick={() => setOpenModules((prev) => ({ ...prev, [module.id]: !open }))}
            className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-ink-subtle transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ChevronRightIcon className={cn('h-3.5 w-3.5 transition-transform duration-moderate ease-exit', open && 'rotate-90')} aria-hidden />
          </button>
        </div>

        {/* Pages of the module — grouped with collapsible headings */}
        {open && (
          <ul className="mb-1 mt-0.5 space-y-0.5 pl-3">
            {module.groups.map((group, gi) => (
              <CollapsibleGroup
                key={groupKey(module.id, group, gi)}
                group={group}
                gKey={groupKey(module.id, group, gi)}
                pathname={pathname}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
                onNavigate={navigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  /* ---------------------------------------------------------------- *
   * Collapsed: slim icon strip, one icon per accessible module.
   * Hovering an icon reveals a flyout with its (clickable) pages.
   * ---------------------------------------------------------------- */
  if (collapsed) {
    return (
      <nav aria-label="Modules" className="flex w-14 shrink-0 flex-col items-center border-r border-line bg-surface py-2">
        <Tooltip label={`${org.name} — home`} side="right">
          <button
            type="button"
            aria-label="Dashboard"
            onClick={() => navigate('/dashboard')}
            className="mb-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-control bg-primary text-caption font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {org.branding.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.branding.logoDataUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              org.branding.initials || 'EM'
            )}
          </button>
        </Tooltip>

        <Tooltip label="Expand sidebar (⌘\)" side="right">
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onToggle}
            className="mb-1 flex h-8 w-8 items-center justify-center rounded-control text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <PanelLeftOpenIcon className="h-4 w-4" aria-hidden />
          </button>
        </Tooltip>

        <div className="thin-scroll mt-1 flex flex-1 flex-col items-center gap-1 overflow-y-auto">
          <Tooltip label="Dashboard" side="right">
            <button
              type="button"
              aria-label="Dashboard"
              aria-current={pathname === '/dashboard' ? 'page' : undefined}
              onClick={() => navigate('/dashboard')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                pathname === '/dashboard' ? 'bg-primary-soft text-primary-text' : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
              )}>
              <LayoutDashboardIcon className="h-4 w-4" aria-hidden />
            </button>
          </Tooltip>
          {collapsedModules.map((module) => {
            const Icon = module.icon;
            const active = module.id === activeModule;
            return (
              <button
                key={module.id}
                type="button"
                aria-label={module.label}
                aria-haspopup="menu"
                aria-current={active ? 'true' : undefined}
                onMouseEnter={(e) => openFlyout(module, e.currentTarget)}
                onMouseLeave={scheduleClose}
                onFocus={(e) => openFlyout(module, e.currentTarget)}
                onClick={() => navigateAndClose(module.home)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-control transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active || flyout?.module.id === module.id
                    ? 'bg-primary-soft text-primary-text'
                    : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
                )}>
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            );
          })}
        </div>

        <div className="mt-1 flex flex-col items-center gap-1 border-t border-line pt-2">
          <Tooltip label="Self-service portal" side="right">
            <button
              type="button"
              aria-label="Self-service portal"
              onClick={() => navigate('/portal')}
              className="flex h-8 w-8 items-center justify-center rounded-control text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <SmartphoneIcon className="h-4 w-4" aria-hidden />
            </button>
          </Tooltip>
          <Tooltip label="Component gallery" side="right">
            <button
              type="button"
              aria-label="Component gallery"
              onClick={() => navigate('/gallery')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                pathname === '/gallery' ? 'bg-primary-soft text-primary-text' : 'text-ink-subtle hover:bg-surface-3 hover:text-ink'
              )}>
              <LayersIcon className="h-4 w-4" aria-hidden />
            </button>
          </Tooltip>
        </div>

        {/* Hover flyout: the module's hidden pages, clickable + collapsible groups. */}
        {flyout && (
          <ModuleFlyout
            module={flyout.module}
            top={flyout.top}
            pathname={pathname}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroup}
            onNavigate={navigateAndClose}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </nav>
    );
  }

  /* ---------------------------------------------------------------- *
   * Expanded: full unified sidebar.
   * ---------------------------------------------------------------- */
  return (
    <nav aria-label="Main navigation" className="thin-scroll flex w-[248px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface">
      {/* Brand header */}
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <button type="button" onClick={() => navigate('/dashboard')} className="flex min-w-0 items-center gap-2.5 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-control bg-primary text-caption font-bold text-white">
            {org.branding.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.branding.logoDataUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              org.branding.initials || 'EM'
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-h3 leading-tight text-ink">{org.name}</span>
            <span className="block text-caption leading-tight text-ink-subtle">Console</span>
          </span>
        </button>
        <Tooltip label="Collapse sidebar (⌘\)" side="right">
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={onToggle}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <PanelLeftCloseIcon className="h-4 w-4" aria-hidden />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 px-2 pb-3">
        {/* Dashboard — the shared home for every role. */}
        <button
          type="button"
          aria-current={pathname === '/dashboard' ? 'page' : undefined}
          onClick={() => navigate('/dashboard')}
          className={cn(
            'mb-3 flex w-full items-center gap-2.5 rounded-control py-1.5 pl-2.5 pr-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            pathname === '/dashboard' ? 'bg-primary-soft font-semibold text-primary-text' : 'text-ink hover:bg-surface-3'
          )}>
          <LayoutDashboardIcon className={cn('h-4 w-4 shrink-0', pathname === '/dashboard' ? 'text-primary-text' : 'text-ink-subtle')} aria-hidden />
          <span className="text-body">Dashboard</span>
        </button>

        {/* Administration — pinned second, directly under Dashboard. */}
        {adminModule && (
          <ul className="mb-3 space-y-0.5">{renderModule(adminModule)}</ul>
        )}

        {sections.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            <p className="px-2 pb-1.5 pt-1 text-caption font-semibold uppercase tracking-wider text-ink-subtle">
              {section.label}
            </p>

            <ul className="space-y-0.5">
              {section.modules.map((module) => renderModule(module))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer: portal + gallery */}
      <div className="mt-auto border-t border-line px-2 py-2">
        <button
          type="button"
          onClick={() => navigate('/portal')}
          className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-small text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink">
          <SmartphoneIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
          Self-service portal
        </button>
        <button
          type="button"
          onClick={() => navigate('/gallery')}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-small transition-colors',
            pathname === '/gallery' ? 'bg-primary-soft text-primary-text' : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
          )}>
          <LayersIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
          Component gallery
        </button>
      </div>
    </nav>
  );
}
