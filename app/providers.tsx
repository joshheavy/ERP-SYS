'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { PreferencesProvider, usePreferences } from '../src/contexts/PreferencesContext';
import { PermissionsProvider } from '../src/contexts/PermissionsContext';
import { EntitlementsProvider } from '../src/contexts/EntitlementsContext';
import { OrganizationProvider } from '../src/contexts/OrganizationContext';
import { DelegationProvider } from '../src/contexts/DelegationContext';
import { NotificationsProvider } from '../src/contexts/NotificationsContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function ThemedToaster() {
  const { theme } = usePreferences();
  return <Toaster position="bottom-right" theme={theme} />;
}

/**
 * Global providers mounted once at the root. The router is now Next's App
 * Router (file-based), so the old MemoryRouter is gone — preferences, the
 * error boundary and the toaster are all that live at this level. The console
 * shell and the mobile portal supply their own chrome in their layouts.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <OrganizationProvider>
        <PreferencesProvider initialTheme="light" initialDensity="comfortable" initialRole="manager">
          <PermissionsProvider>
            <EntitlementsProvider>
              <DelegationProvider>
                <NotificationsProvider>
                  {children}
                  <ThemedToaster />
                </NotificationsProvider>
              </DelegationProvider>
            </EntitlementsProvider>
          </PermissionsProvider>
        </PreferencesProvider>
      </OrganizationProvider>
    </ErrorBoundary>
  );
}
