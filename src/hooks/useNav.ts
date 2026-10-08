'use client';

import { usePathname, useRouter } from 'next/navigation';

/**
 * Thin adapter over Next's App Router that preserves the imperative
 * `navigate(path)` API the console was built around. Every screen navigates
 * imperatively (there are no <Link>s), so this keeps call sites unchanged
 * while the underlying router is Next.js.
 */
export function useNav() {
  const router = useRouter();
  return (path: string) => router.push(path);
}

/** Current pathname, matching the old `useLocation().pathname`. */
export function usePath(): string {
  return usePathname() ?? '/';
}
