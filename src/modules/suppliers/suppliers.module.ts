import { Building2Icon } from 'lucide-react';
import type { ModuleManifest } from '../../core/module/types';

/**
 * Suppliers module — the supplier registry, prequalification and evaluation.
 * Distinct from procurement Vendors (transacting parties); this is the master
 * registry with prequalification status and evaluation scores.
 */
export const suppliersModule: ModuleManifest = {
  id: 'suppliers',
  label: 'Suppliers',
  shortLabel: 'Suppliers',
  blurb: 'Supplier registry, prequalification and evaluation scoring.',
  icon: Building2Icon,
  section: 'Business',
  home: '/suppliers/registry',
  defaultRoles: ['admin', 'manager', 'officer', 'auditor'],
  nav: [
    {
      label: 'Suppliers',
      pages: [{ label: 'Supplier registry', path: '/suppliers/registry', icon: Building2Icon }]
    }
  ],
  commands: [
    { id: 'sup-list', label: 'Supplier registry', group: 'Suppliers', path: '/suppliers/registry', keywords: 'supplier registry prequalification evaluation vendor master' }
  ],
  routeTrails: {
    '/suppliers/registry': ['Suppliers', 'Supplier registry']
  }
};
