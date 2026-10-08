import { BarChart3Icon } from 'lucide-react';
import type { ModuleManifest } from '../../core/module/types';

/**
 * Reports module — a read-only reporting hub that runs reports across the
 * existing modules' data (finance, HR, procurement, inventory, assets). Owns
 * no store of its own; it reads the other modules' stores and mock registers.
 */
export const reportsModule: ModuleManifest = {
  id: 'reports',
  label: 'Reports',
  shortLabel: 'Reports',
  blurb: 'Cross-module reporting hub — run and export operational reports.',
  icon: BarChart3Icon,
  section: 'System',
  home: '/reports',
  defaultRoles: ['admin', 'manager', 'auditor'],
  nav: [
    {
      label: 'Reports',
      pages: [{ label: 'Reports', path: '/reports', icon: BarChart3Icon }]
    }
  ],
  commands: [
    { id: 'rpt-hub', label: 'Reports', group: 'Reports', path: '/reports', keywords: 'reports reporting hub trial balance headcount vendor spend stock valuation' }
  ],
  routeTrails: {
    '/reports': ['Reports']
  }
};
