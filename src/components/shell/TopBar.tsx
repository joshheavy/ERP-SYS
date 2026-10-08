'use client';

import React, { useState } from 'react';
import { useNav } from '../../hooks/useNav';
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UserCogIcon
} from
  'lucide-react';
import { cn } from '../../utils/cn';
import { relativeTime } from '../../utils/format';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useDelegation } from '../../contexts/DelegationContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Avatar } from '../approval/StatusTimeline';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '../ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import type { Role } from '../../types/common';

export interface TopBarProps {
  onOpenCommandPalette: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  officer: 'Payroll Officer',
  manager: 'Approver (HOD)',
  employee: 'Employee',
  auditor: 'Auditor'
};

export function TopBar({ onOpenCommandPalette }: TopBarProps) {
  const navigate = useNav();
  const { theme, setTheme, role, setRole } = usePreferences();
  const { delegations, active: activeDelegation, isActing, effectiveIdentity, startActing, stopActing } = useDelegation();
  // Display the effective identity — the delegator when acting, else the signed-in user.
  const identity = effectiveIdentity;
  const { notifications, unreadCount: unread, markRead, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="flex h-8 w-full max-w-[320px] items-center gap-2 rounded-control border border-line-strong bg-surface-2 px-2.5 text-left transition-colors duration-fast ease-exit hover:border-line-strong hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

        <SearchIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
        <span className="flex-1 truncate text-body text-ink-subtle">Search or jump to…</span>
        <kbd className="rounded-[4px] border border-line bg-surface px-1.5 text-caption text-ink-subtle">⌘K</kbd>
      </button>

      {isActing && activeDelegation &&
        <button
          type="button"
          onClick={stopActing}
          title="Click to stop acting"
          className="ml-2 hidden items-center gap-1.5 rounded-full bg-info-soft px-2 py-1 text-caption font-medium text-info transition-colors hover:bg-info-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex">
          <UserCogIcon className="h-3 w-3" aria-hidden />
          Acting for {activeDelegation.from} · stop
        </button>
      }

      <div className="ml-auto flex items-center gap-1">
        <Tooltip label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            icon={theme === 'dark' ? SunIcon : MoonIcon}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

        </Tooltip>

        {/* Notifications — shadcn Popover (accessible open/close, click-outside, Escape). */}
        <Popover open={bellOpen} onOpenChange={setBellOpen}>
          <PopoverTrigger asChild>
            <span className="relative inline-flex">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={BellIcon}
                aria-label={`Notifications, ${unread} unread`} />

              {unread > 0 &&
                <span className="tabular pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-caption font-semibold text-white">
                  {unread}
                </span>
              }
            </span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-h4 text-ink">Notifications</p>
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={unread === 0}
                className="text-caption font-medium text-primary-text hover:underline disabled:cursor-not-allowed disabled:text-ink-subtle disabled:no-underline">
                Mark all as read
              </button>
            </div>
            <ul className="thin-scroll max-h-80 divide-y divide-line overflow-y-auto">
              {notifications.length === 0 &&
                <li className="px-3 py-6 text-center text-small text-ink-subtle">You’re all caught up.</li>
              }
              {notifications.slice(0, 6).map((note) =>
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markRead(note.id);
                      navigate(note.path);
                      setBellOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-fast hover:bg-surface-2">

                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        note.unread ? 'bg-primary' : 'bg-transparent'
                      )}
                      aria-hidden />

                    <span className="min-w-0">
                      <span className={cn('block text-body text-ink', note.unread ? 'font-semibold' : 'font-medium')}>{note.title}</span>
                      <span className="mt-0.5 block text-small text-ink-muted">{note.detail}</span>
                      <span className="tabular mt-0.5 block text-caption text-ink-subtle">
                        {relativeTime(note.at)}
                      </span>
                    </span>
                  </button>
                </li>
              )}
            </ul>
            <div className="border-t border-line px-3 py-2">
              <button
                type="button"
                onClick={() => { navigate('/notifications'); setBellOpen(false); }}
                className="w-full rounded-control py-1 text-center text-small font-medium text-primary-text transition-colors hover:bg-surface-2">
                View all notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile menu — shadcn DropdownMenu (accessible: keyboard nav, focus trap, Escape). */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-control px-1.5 transition-colors duration-fast hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:bg-surface-3">

              <Avatar name={identity.name} />
              <span className="hidden min-w-0 text-left lg:block">
                <span className="block truncate text-small font-medium leading-tight text-ink">
                  {identity.name}
                </span>
                <span className="block truncate text-caption leading-tight text-ink-subtle">
                  {ROLE_LABELS[role]}
                </span>
              </span>
              <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel className="font-normal">
              <p className="text-body font-medium text-ink">{identity.name}</p>
              <p className="text-small font-normal text-ink-muted">
                {identity.jobTitle} · {identity.department}
              </p>
              <p className="tabular mt-0.5 text-caption font-normal text-ink-subtle">{identity.employeeId}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => navigate('/account')}>
              <UserCogIcon className="h-4 w-4" aria-hidden />
              Account & preferences
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
              Active role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <DropdownMenuRadioItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <p className="px-2 pb-1.5 pt-1 text-caption text-ink-subtle">{identity.capability}</p>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
              Delegated authority
            </DropdownMenuLabel>
            {delegations.filter((d) => d.status === 'active').length === 0 && (
              <p className="px-2 py-1 text-caption text-ink-subtle">No active delegations.</p>
            )}
            {delegations.filter((d) => d.status === 'active').map((d) => {
              const acting = activeDelegation?.id === d.id;
              return (
                <div key={d.id} className="flex items-start justify-between gap-2 px-2 py-1">
                  <span className="min-w-0">
                    <span className="block text-small text-ink">{d.from}</span>
                    <span className="block text-caption text-ink-subtle">{d.scope}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => (acting ? stopActing() : startActing(d))}
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      acting ? 'bg-success-soft text-success hover:bg-success-soft/70' : 'bg-neutralsoft text-ink-muted hover:bg-surface-3'
                    )}>
                    {acting ? 'Stop' : 'Act as'}
                  </button>
                </div>
              );
            })}
            <DropdownMenuItem onSelect={() => navigate('/admin/delegations')} className="text-ink-muted">
              <UserCogIcon className="h-4 w-4" aria-hidden />
              Manage delegations
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => navigate('/')} className="text-ink-muted">
              <LogOutIcon className="h-4 w-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>);

}