'use client';

import React from 'react';
import { MoonIcon, SunIcon, Rows3Icon, Rows4Icon, BellIcon, UserCogIcon, ArrowRightIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../hooks/useNav';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Tabs';
import { Avatar } from '../components/approval/StatusTimeline';
import { usePreferences } from '../contexts/PreferencesContext';
import { useDelegation } from '../contexts/DelegationContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useOrganization } from '../contexts/OrganizationContext';
import type { Role } from '../types/common';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  officer: 'Officer',
  manager: 'Approver',
  employee: 'Employee',
  auditor: 'Auditor'
};

/**
 * Account & preferences — the user's own home. Profile at a glance, personal
 * appearance preferences (theme + density, persisted), the active role and
 * what it can do, and a notifications summary. Reads/writes the existing
 * contexts; no new store needed.
 */
export function Account() {
  const navigate = useNav();
  const { theme, setTheme, density, setDensity, role } = usePreferences();
  const { effectiveIdentity, isActing, active: activeDelegation } = useDelegation();
  const { unreadCount } = useNotifications();
  const { org } = useOrganization();

  const identity = effectiveIdentity;

  return (
    <div>
      <PageHeader trail={['Account', 'Preferences']} title="Account & preferences" meta={<span>Your profile and how the console looks for you.</span>} />

      <div className="mx-auto max-w-4xl space-y-4 p-5">
        {/* Profile */}
        <Card>
          <div className="flex items-start gap-4 p-5">
            <Avatar name={identity.name} />
            <div className="min-w-0 flex-1">
              <h2 className="text-h2 text-ink">{identity.name}</h2>
              <p className="text-small text-ink-muted">{identity.jobTitle} · {identity.department}</p>
              <p className="tabular mt-0.5 text-caption text-ink-subtle">{identity.employeeId} · {org.name}</p>
              {isActing && activeDelegation && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2 py-0.5 text-caption font-medium text-info">
                  <UserCogIcon className="h-3 w-3" aria-hidden /> Acting for {activeDelegation.from}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader title="Appearance" description="These preferences are personal to you and persist on this device." />
          <div className="space-y-4 p-5 pt-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-body text-ink">Theme</p>
                <p className="text-small text-ink-muted">Light or dark across the whole console.</p>
              </div>
              <Segmented
                aria-label="Theme"
                value={theme}
                onChange={(v) => setTheme(v as 'light' | 'dark')}
                items={[
                  { id: 'light', label: 'Light', icon: SunIcon },
                  { id: 'dark', label: 'Dark', icon: MoonIcon }
                ]}
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-body text-ink">Density</p>
                <p className="text-small text-ink-muted">Comfortable spacing, or compact to fit more rows on screen.</p>
              </div>
              <Segmented
                aria-label="Density"
                value={density}
                onChange={(v) => setDensity(v as 'comfortable' | 'compact')}
                items={[
                  { id: 'comfortable', label: 'Comfortable', icon: Rows3Icon },
                  { id: 'compact', label: 'Compact', icon: Rows4Icon }
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Role & access */}
        <Card>
          <CardHeader title="Role & access" description="Your active role determines what you can do. Switch roles from the profile menu." />
          <div className="flex items-center justify-between gap-4 p-5 pt-0">
            <div className="min-w-0">
              <p className="text-body font-medium text-ink">{ROLE_LABELS[role]}</p>
              <p className="mt-0.5 text-small text-ink-muted">{identity.capability}</p>
            </div>
            <Button variant="secondary" icon={UserCogIcon} onClick={() => navigate('/admin/delegations')}>
              Delegations
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Notifications" description="Approvals, tasks and alerts assigned to you." />
          <div className="flex items-center justify-between gap-4 p-5 pt-0">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-control bg-primary-soft text-primary-text">
                <BellIcon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-body text-ink">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You’re all caught up'}
                </p>
                <p className="text-small text-ink-muted">Review and manage everything that needs your attention.</p>
              </div>
            </div>
            <Button variant="secondary" trailingIcon={ArrowRightIcon} onClick={() => navigate('/notifications')}>
              View all
            </Button>
          </div>
        </Card>

        {/* Sign out */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              toast.success('Signed out');
              navigate('/');
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
