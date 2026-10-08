import { createCollection } from '../core/store/createCollection';

export type DepreciationStatus = 'draft' | 'pending' | 'posted';

export interface DepreciationRun {
  id: string;
  reference: string;
  period: string;        // e.g. '2026-09'
  runOn: string;         // ISO date the run was generated
  assetsCount: number;
  totalDepreciation: number;
  status: DepreciationStatus;
  postedBy?: string;
}

const SEED_RUNS: DepreciationRun[] = [
  { id: 'dep-2026-08', reference: 'DEP-2026-08', period: '2026-08', runOn: '2026-08-31', assetsCount: 6, totalDepreciation: 3186667, status: 'posted', postedBy: 'David Kimani' },
  { id: 'dep-2026-07', reference: 'DEP-2026-07', period: '2026-07', runOn: '2026-07-31', assetsCount: 6, totalDepreciation: 3186667, status: 'posted', postedBy: 'David Kimani' },
  { id: 'dep-2026-06', reference: 'DEP-2026-06', period: '2026-06', runOn: '2026-06-30', assetsCount: 5, totalDepreciation: 2953334, status: 'posted', postedBy: 'David Kimani' }
];

export const depreciationStore = createCollection<DepreciationRun>('emtech.store.depreciation.v1', SEED_RUNS, 'dep');
