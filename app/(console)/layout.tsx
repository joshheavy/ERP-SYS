import { AppShell } from '../../src/components/shell/AppShell';
import { RouteGuard } from '../../src/components/shell/RouteGuard';

/**
 * The console chrome — module rail, context sidebar, top bar and command
 * palette — wraps every officer/manager/auditor screen. RouteGuard sits inside
 * the shell so a user who opens a module they can't access still sees the
 * navigation and a clear explanation, rather than a blank page. The
 * self-service portal deliberately lives outside this group with its own layout.
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <RouteGuard>{children}</RouteGuard>
    </AppShell>
  );
}
