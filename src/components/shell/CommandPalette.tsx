'use client';

import React, { useMemo } from 'react';
import { useNav } from '../../hooks/useNav';
import { CornerDownLeftIcon } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '../ui/command';
import { COMMANDS, MODULES } from '../../data/navigation';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useModuleAccess } from '../../contexts/EntitlementsContext';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/** The module that owns a path, or null for cross-module workspace routes. */
function owningModule(path: string) {
  return MODULES.find((m) => path === `/${m.id}` || path.startsWith(`/${m.id}/`)) ?? null;
}

/**
 * ⌘K palette, powered by cmdk (shadcn Command). cmdk owns the fuzzy matching,
 * keyboard navigation and selection; we just render items and route on select.
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNav();
  const { role } = usePreferences();
  const { canUse, isPathSubmoduleEntitled } = useModuleAccess();

  const commands = useMemo(
    () =>
      COMMANDS.filter((c) => {
        // Hidden if its target sub-module isn't licensed on this install.
        if (!isPathSubmoduleEntitled(c.path)) return false;
        // Visible unless it targets a module this role can't use (entitlement ∩ permission).
        const owning = owningModule(c.path);
        return owning ? canUse(role, owning.id) : true;
      }),
    [role, canUse, isPathSubmoduleEntitled]
  );
  const groupOrder = useMemo(() => Array.from(new Set(commands.map((c) => c.group))), [commands]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <CommandInput placeholder="Search screens, records and actions" />
      <CommandList>
        <CommandEmpty>Nothing matches. Try a module name, a document type or a reference.</CommandEmpty>
        {groupOrder.map((group) => (
          <CommandGroup key={group} heading={group}>
            {commands.filter((c) => c.group === group).map((cmd) => (
              <CommandItem
                key={cmd.id}
                // Match on label + keywords + group, not just the visible label.
                value={`${cmd.label} ${cmd.keywords} ${cmd.group}`}
                onSelect={() => go(cmd.path)}
                className="group"
              >
                <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="rounded-[4px] border border-border bg-secondary px-1 text-caption text-muted-foreground">
                    {cmd.shortcut}
                  </kbd>
                )}
                <CornerDownLeftIcon
                  className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100"
                  aria-hidden
                />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
