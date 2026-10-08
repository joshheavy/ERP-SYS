'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { notificationsStore, type Notification } from '../data/users';
import { useCollection } from '../core/store/createCollection';

/**
 * NOTIFICATIONS CENTER
 * --------------------
 * Real, persisted read/unread state over the notifications store. The TopBar
 * bell and the /notifications page both read from here, so marking one read (by
 * opening it) or "mark all as read" is reflected everywhere and survives
 * navigation and reload.
 */
interface NotificationsValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notifications = useCollection(notificationsStore);

  const markRead = useCallback((id: string) => {
    const n = notificationsStore.get(id);
    if (n && n.unread) notificationsStore.update(id, { unread: false });
  }, []);

  const markAllRead = useCallback(() => {
    for (const n of notificationsStore.list()) {
      if (n.unread) notificationsStore.update(n.id, { unread: false });
    }
  }, []);

  const value = useMemo<NotificationsValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
      markRead,
      markAllRead
    }),
    [notifications, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
