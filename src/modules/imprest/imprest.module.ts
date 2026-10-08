import { WalletIcon } from 'lucide-react';
import type { ModuleManifest } from '../../core/module/types';

/**
 * Imprest module — issue, surrender and retire cash imprests. Owns its manifest
 * + pages, following the admin/prepayment reference pattern.
 */
export const imprestModule: ModuleManifest = {
  id: 'imprest',
  label: 'Imprest',
  shortLabel: 'Imprest',
  blurb: 'Cash imprests with issue, surrender and retirement workflow.',
  icon: WalletIcon,
  section: 'Business',
  home: '/imprest/requests',
  defaultRoles: ['admin', 'manager', 'officer', 'auditor'],
  nav: [
    {
      label: 'Imprest',
      pages: [{ label: 'Imprest requests', path: '/imprest/requests', icon: WalletIcon }]
    }
  ],
  commands: [
    { id: 'imp-list', label: 'Imprest requests', group: 'Imprest', path: '/imprest/requests', keywords: 'imprest cash float surrender retire per diem advance' }
  ],
  routeTrails: {
    '/imprest/requests': ['Imprest', 'Imprest requests']
  }
};
