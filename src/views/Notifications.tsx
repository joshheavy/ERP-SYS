'use client';

import React, { useMemo, useState } from 'react';
import {
  BellIcon,
  CheckCheckIcon,
  ClipboardCheckIcon,
  AlertTriangleIcon,
  LandmarkIcon,
  AtSignIcon,
  ArrowRightIcon
} from 'lucide-react';
import { useNav } from '../hooks/useNav';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, EmptyState } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { Segmented } from '../components/ui/Tabs';
import { Toggle } from '../components/ui/Choice';
import { useNotifications } from '../contexts/NotificationsContext';
import { relativeTime } from '../utils/format';
import { cn } from '../utils/cn';
import type { Notification } from '../data/users';

const KIND_META: Record<Notification['kind'], { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  approval: { label: 'Approval', icon: ClipboardCheckIcon, className: 'bg-warning-soft text-warning' },
  exception: { label: 'Exception', icon: AlertTriangleIcon, className: 'bg-danger-soft text-danger' },
  posted: { label: 'Posted', icon: LandmarkIcon, className: 'bg-primary-soft text-primary-text' },
  mention: { label: 'Mention', icon: AtSignIcon, className: 'bg-info-soft text-info' }
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'approval', label: 'Approvals' },
  { id: 'exception', label: 'Exceptions' },
  { id: 'posted', label: 'Posted' },
  { id: 'mention', label: 'Mentions' }
];

export function Notifications() {
  const navigate = useNav();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const rows = useMemo(() => {
    return [...notifications]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((n) => {
        if (filter !== 'all' && n.kind !== filter) return false;
        if (unreadOnly && !n.unread) return false;
        return true;
      });
  }, [notifications, filter, unreadOnly]);

  return (
    <div>
      <PageHeader
        trail={['Workspace', 'Notifications']}
        title="Notifications"
        meta={<span className="tabular">{unreadCount} unread of {notifications.length}</span>}
        primaryAction={
          <Button variant="primary" icon={CheckCheckIcon} disabled={unreadCount === 0} onClick={() => markAllRead()}>
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Unread" value={String(unreadCount)} />
          <StatTile label="Total" value={String(notifications.length)} />
          <StatTile label="Needing action" value={String(notifications.filter((n) => n.kind === 'approval' || n.kind === 'exception').length)} />
        </div>

        <Card>
          <CardHeader
            title="Your notifications"
            description="Approvals, exceptions, postings and mentions across your modules."
            actions={
              <label className="flex items-center gap-2 text-small text-ink-muted">
                Unread only
                <Toggle checked={unreadOnly} onChange={() => setUnreadOnly((v) => !v)} aria-label="Show unread only" />
              </label>
            }
          />
          <div className="border-b border-line px-3 py-2">
            <Segmented items={FILTERS} value={filter} onChange={setFilter} aria-label="Filter notifications by kind" />
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={BellIcon} title="Nothing here" description={unreadOnly ? 'No unread notifications match this filter.' : 'No notifications match this filter.'} />
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((note) => {
                const meta = KIND_META[note.kind];
                const Icon = meta.icon;
                return (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => { markRead(note.id); navigate(note.path); }}
                      className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control', meta.className)}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn('min-w-0 truncate text-body text-ink', note.unread ? 'font-semibold' : 'font-medium')}>{note.title}</span>
                          {note.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 block text-small text-ink-muted">{note.detail}</span>
                        <span className="tabular mt-0.5 block text-caption text-ink-subtle">{meta.label} · {relativeTime(note.at)}</span>
                      </span>
                      <ArrowRightIcon className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
