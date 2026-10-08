import { CalendarClockIcon } from 'lucide-react';
import type { ModuleManifest } from '../../core/module/types';

/**
 * Prepayment module — a small, complete vertical slice (list → request →
 * amortization schedule → approval). Owns its manifest + pages, following the
 * admin reference pattern.
 */
export const prepaymentModule: ModuleManifest = {
  id: 'prepayment',
  label: 'Prepayments',
  shortLabel: 'Prepay',
  blurb: 'Prepaid expenses with straight-line amortization and approval.',
  icon: CalendarClockIcon,
  section: 'Business',
  home: '/prepayment/requests',
  defaultRoles: ['admin', 'manager', 'officer', 'auditor'],
  nav: [
    {
      label: 'Prepayments',
      pages: [{ label: 'Prepayment requests', path: '/prepayment/requests', icon: CalendarClockIcon }]
    }
  ],
  commands: [
    { id: 'ppd-list', label: 'Prepayment requests', group: 'Prepayments', path: '/prepayment/requests', keywords: 'prepayment prepaid amortization schedule' }
  ],
  routeTrails: {
    '/prepayment/requests': ['Prepayments', 'Prepayment requests']
  }
};
