import { createCollection } from '../core/store/createCollection';
import type { DocumentStatus } from '../types/common';
import { FIXED_ASSETS } from './registers';

/* ------------------------------------------------------------------ *
 * Asset categories (classes) — drive default depreciation treatment.
 * ------------------------------------------------------------------ */
export type DepreciationMethod = 'straight-line' | 'reducing-balance';

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  method: DepreciationMethod;
  /** Useful life in years (straight-line) / basis for the rate. */
  usefulLife: number;
  /** Annual depreciation rate %, used for reducing-balance. */
  rate: number;
  active: boolean;
}

export const DEPRECIATION_METHODS: DepreciationMethod[] = ['straight-line', 'reducing-balance'];

export const METHOD_LABEL: Record<DepreciationMethod, string> = {
  'straight-line': 'Straight line',
  'reducing-balance': 'Reducing balance'
};

const SEED_CATEGORIES: AssetCategory[] = [
  { id: 'ac-ict', code: 'ICT', name: 'ICT equipment', method: 'straight-line', usefulLife: 5, rate: 20, active: true },
  { id: 'ac-veh', code: 'VEH', name: 'Motor vehicles', method: 'reducing-balance', usefulLife: 5, rate: 25, active: true },
  { id: 'ac-plt', code: 'PLT', name: 'Plant & machinery', method: 'straight-line', usefulLife: 10, rate: 10, active: true },
  { id: 'ac-fur', code: 'FUR', name: 'Furniture & fittings', method: 'straight-line', usefulLife: 10, rate: 10, active: true },
  { id: 'ac-bld', code: 'BLD', name: 'Buildings', method: 'straight-line', usefulLife: 40, rate: 2.5, active: true },
  { id: 'ac-lnd', code: 'LND', name: 'Land', method: 'straight-line', usefulLife: 0, rate: 0, active: true }
];

export const assetCategoriesStore = createCollection<AssetCategory>('emtech.store.assetCategories.v1', SEED_CATEGORIES, 'ac');

/* ------------------------------------------------------------------ *
 * Acquisitions — new assets awaiting capitalisation into the register.
 * ------------------------------------------------------------------ */
export type AcquisitionStatus = 'draft' | 'pending' | 'capitalised' | 'rejected';

export interface Acquisition {
  id: string;
  reference: string;
  description: string;
  category: string;
  cost: number;
  supplier: string;
  acquiredOn: string;
  custodian: string;
  location: string;
  status: AcquisitionStatus;
  raisedBy: string;
}

export const ACQUISITION_BADGE: Record<AcquisitionStatus, { status: DocumentStatus; label: string }> = {
  draft: { status: 'draft', label: 'Draft' },
  pending: { status: 'pending', label: 'Pending' },
  capitalised: { status: 'posted', label: 'Capitalised' },
  rejected: { status: 'rejected', label: 'Rejected' }
};

const SEED_ACQUISITIONS: Acquisition[] = [
  { id: 'acq-0001', reference: 'ACQ-2026-0031', description: 'HP ProLiant DL380 server', category: 'ICT equipment', cost: 2140000, supplier: 'Nairobi Systems Ltd', acquiredOn: '2026-09-04', custodian: 'Brian Otieno', location: 'Data centre — Upper Hill', status: 'pending', raisedBy: 'Faith Chebet' },
  { id: 'acq-0002', reference: 'ACQ-2026-0032', description: 'Isuzu D-Max pickup', category: 'Motor vehicles', cost: 4380000, supplier: 'Simba Motors Ltd', acquiredOn: '2026-09-08', custodian: 'Kevin Omondi', location: 'Operations pool', status: 'pending', raisedBy: 'Peter Njoroge' },
  { id: 'acq-0003', reference: 'ACQ-2026-0033', description: 'Office workstations — batch of 10', category: 'Furniture & fittings', cost: 1650000, supplier: 'Savannah Office Supplies', acquiredOn: '2026-09-11', custodian: 'Ruth Atieno', location: 'Head office — 3rd floor', status: 'draft', raisedBy: 'Aisha Mohamed' },
  { id: 'acq-0004', reference: 'ACQ-2026-0030', description: 'Cisco core switch', category: 'ICT equipment', cost: 1980000, supplier: 'Nairobi Systems Ltd', acquiredOn: '2026-08-22', custodian: 'Brian Otieno', location: 'Data centre — Upper Hill', status: 'capitalised', raisedBy: 'Faith Chebet' }
];

export const acquisitionsStore = createCollection<Acquisition>('emtech.store.acquisitions.v1', SEED_ACQUISITIONS, 'acq');

/* ------------------------------------------------------------------ *
 * Transfers — moving an asset's custodian and/or location.
 * ------------------------------------------------------------------ */
export type TransferStatus = 'pending' | 'approved' | 'rejected';

export interface AssetTransfer {
  id: string;
  reference: string;
  assetTag: string;
  assetDescription: string;
  fromCustodian: string;
  toCustodian: string;
  fromLocation: string;
  toLocation: string;
  requestedOn: string;
  status: TransferStatus;
  raisedBy: string;
}

export const TRANSFER_BADGE: Record<TransferStatus, { status: DocumentStatus; label: string }> = {
  pending: { status: 'pending', label: 'Pending' },
  approved: { status: 'approved', label: 'Approved' },
  rejected: { status: 'rejected', label: 'Rejected' }
};

const SEED_TRANSFERS: AssetTransfer[] = [
  { id: 'atr-0001', reference: 'TRF-2026-0012', assetTag: 'FA-ICT-0412', assetDescription: 'Dell PowerEdge R750 server', fromCustodian: 'Brian Otieno', toCustodian: 'Faith Chebet', fromLocation: 'Data centre — Upper Hill', toLocation: 'DR site — Mombasa', requestedOn: '2026-09-10', status: 'pending', raisedBy: 'Brian Otieno' },
  { id: 'atr-0002', reference: 'TRF-2026-0011', assetTag: 'FA-VEH-0188', assetDescription: 'Toyota Hilux double cab', fromCustodian: 'Kevin Omondi', toCustodian: 'Daniel Mwangi', fromLocation: 'Operations pool', toLocation: 'Nakuru Branch', requestedOn: '2026-09-03', status: 'approved', raisedBy: 'Peter Njoroge' },
  { id: 'atr-0003', reference: 'TRF-2026-0010', assetTag: 'FA-FUR-0501', assetDescription: 'Executive boardroom table & 14 chairs', fromCustodian: 'Ruth Atieno', toCustodian: 'Aisha Mohamed', fromLocation: 'Head office — 4th floor', toLocation: 'Mombasa Branch', requestedOn: '2026-08-28', status: 'rejected', raisedBy: 'Ruth Atieno' }
];

export const transfersStore = createCollection<AssetTransfer>('emtech.store.assetTransfers.v1', SEED_TRANSFERS, 'atr');

/* ------------------------------------------------------------------ *
 * Disposals — retiring, selling or scrapping an asset. Gain/loss = proceeds - NBV.
 * ------------------------------------------------------------------ */
export type DisposalMethod = 'sale' | 'scrap' | 'donation' | 'write-off';
export type DisposalStatus = 'pending' | 'approved' | 'rejected';

export interface AssetDisposal {
  id: string;
  reference: string;
  assetTag: string;
  assetDescription: string;
  method: DisposalMethod;
  netBookValue: number;
  proceeds: number;
  disposedOn: string;
  status: DisposalStatus;
  raisedBy: string;
}

export const DISPOSAL_METHODS: DisposalMethod[] = ['sale', 'scrap', 'donation', 'write-off'];

export const DISPOSAL_METHOD_LABEL: Record<DisposalMethod, string> = {
  sale: 'Sale',
  scrap: 'Scrap',
  donation: 'Donation',
  'write-off': 'Write-off'
};

export const DISPOSAL_BADGE: Record<DisposalStatus, { status: DocumentStatus; label: string }> = {
  pending: { status: 'pending', label: 'Pending' },
  approved: { status: 'approved', label: 'Approved' },
  rejected: { status: 'rejected', label: 'Rejected' }
};

/** Gain (positive) or loss (negative) on disposal = proceeds − net book value. */
export function disposalGainLoss(d: AssetDisposal): number {
  return d.proceeds - d.netBookValue;
}

const SEED_DISPOSALS: AssetDisposal[] = [
  { id: 'dsp-0001', reference: 'DSP-2026-0007', assetTag: 'FA-ICT-0288', assetDescription: 'Desktop workstation — batch of 6', method: 'scrap', netBookValue: 0, proceeds: 60000, disposedOn: '2026-09-06', status: 'approved', raisedBy: 'Zainab Ali' },
  { id: 'dsp-0002', reference: 'DSP-2026-0008', assetTag: 'FA-PLT-0075', assetDescription: 'Perkins 500 KVA generator — Unit B', method: 'sale', netBookValue: 19440000, proceeds: 16500000, disposedOn: '2026-09-12', status: 'pending', raisedBy: 'Beatrice Auma' },
  { id: 'dsp-0003', reference: 'DSP-2026-0006', assetTag: 'FA-FUR-0330', assetDescription: 'Reception seating set', method: 'donation', netBookValue: 120000, proceeds: 0, disposedOn: '2026-08-19', status: 'approved', raisedBy: 'Ruth Atieno' }
];

export const disposalsStore = createCollection<AssetDisposal>('emtech.store.disposals.v1', SEED_DISPOSALS, 'dsp');

/* ------------------------------------------------------------------ *
 * Verification — a physical stock-take of the fixed asset register.
 * Each register asset gets a verification line; a verifier confirms the
 * asset physically exists and records its actual custodian, location and
 * condition, then marks it verified / not found / needs attention.
 * ------------------------------------------------------------------ */
export type VerificationStatus = 'pending' | 'verified' | 'not-found' | 'attention';

export interface VerificationLine {
  id: string;
  /** The verification exercise this line belongs to (a period stock-take). */
  runRef: string;
  assetTag: string;
  assetDescription: string;
  category: string;
  /** Expected values from the register at the time the run was opened. */
  expectedCustodian: string;
  expectedLocation: string;
  expectedCondition: FixedAssetCondition;
  /** What the verifier actually found (blank until checked). */
  foundCustodian: string;
  foundLocation: string;
  foundCondition: FixedAssetCondition;
  status: VerificationStatus;
  verifiedBy: string;
  verifiedOn: string;
  note: string;
}

/** Mirror of the register's condition union so lines are self-contained. */
export type FixedAssetCondition = 'in service' | 'under repair' | 'retired';
export const ASSET_CONDITIONS: FixedAssetCondition[] = ['in service', 'under repair', 'retired'];

export const VERIFICATION_STATUSES: VerificationStatus[] = ['pending', 'verified', 'not-found', 'attention'];

export const VERIFICATION_BADGE: Record<VerificationStatus, { status: DocumentStatus; label: string }> = {
  pending: { status: 'pending', label: 'Pending' },
  verified: { status: 'approved', label: 'Verified' },
  'not-found': { status: 'rejected', label: 'Not found' },
  attention: { status: 'draft', label: 'Needs attention' }
};

/** The current verification exercise reference (one open run for the demo). */
export const CURRENT_VERIFICATION_RUN = 'AV-2026-Q3';

/**
 * Seeded from the live register so every asset has a line. A couple are
 * pre-completed to make the progress view meaningful out of the box.
 */
const SEED_VERIFICATION: VerificationLine[] = FIXED_ASSETS.map((a, i) => {
  const base: VerificationLine = {
    id: `avl-${a.id}`,
    runRef: CURRENT_VERIFICATION_RUN,
    assetTag: a.tag,
    assetDescription: a.description,
    category: a.category,
    expectedCustodian: a.custodian,
    expectedLocation: a.location,
    expectedCondition: a.condition,
    foundCustodian: '',
    foundLocation: '',
    foundCondition: a.condition,
    status: 'pending',
    verifiedBy: '',
    verifiedOn: '',
    note: ''
  };
  // Pre-complete the first two lines for a realistic starting state.
  if (i === 0) {
    return { ...base, foundCustodian: a.custodian, foundLocation: a.location, foundCondition: a.condition, status: 'verified', verifiedBy: 'Beatrice Auma', verifiedOn: '2026-09-15', note: 'Tag intact, serial matches register.' };
  }
  if (i === 3) {
    return { ...base, foundCustodian: a.custodian, foundLocation: 'Head office — Plant room (awaiting spares)', foundCondition: 'under repair', status: 'attention', verifiedBy: 'Beatrice Auma', verifiedOn: '2026-09-15', note: 'Located but partially dismantled during repair — confirm on completion.' };
  }
  return base;
});

export const verificationStore = createCollection<VerificationLine>('emtech.store.assetVerification.v1', SEED_VERIFICATION, 'avl');

/** True when the found custodian/location/condition differ from the register. */
export function verificationHasVariance(line: VerificationLine): boolean {
  if (line.status === 'pending') return false;
  return (
    (line.foundCustodian !== '' && line.foundCustodian !== line.expectedCustodian) ||
    (line.foundLocation !== '' && line.foundLocation !== line.expectedLocation) ||
    line.foundCondition !== line.expectedCondition
  );
}

/* ------------------------------------------------------------------ *
 * Revaluation — restating an asset's carrying value (net book value)
 * to a new fair value. Uplift (revalued > NBV) is a revaluation gain;
 * a fall (revalued < NBV) is an impairment. Goes through an approval.
 * ------------------------------------------------------------------ */
export type RevaluationStatus = 'pending' | 'approved' | 'rejected';

export interface AssetRevaluation {
  id: string;
  reference: string;
  assetTag: string;
  assetDescription: string;
  /** Net book value at the time the revaluation was raised. */
  currentNbv: number;
  /** New carrying value the asset is being restated to. */
  revaluedAmount: number;
  /** Why the value is being restated (market appraisal, impairment test, etc.). */
  basis: string;
  revaluedOn: string;
  status: RevaluationStatus;
  raisedBy: string;
}

export const REVALUATION_BADGE: Record<RevaluationStatus, { status: DocumentStatus; label: string }> = {
  pending: { status: 'pending', label: 'Pending' },
  approved: { status: 'approved', label: 'Approved' },
  rejected: { status: 'rejected', label: 'Rejected' }
};

/** Uplift (positive, a revaluation gain) or impairment (negative) = revalued − NBV. */
export function revaluationDelta(r: AssetRevaluation): number {
  return r.revaluedAmount - r.currentNbv;
}

const SEED_REVALUATIONS: AssetRevaluation[] = [
  { id: 'rev-0001', reference: 'REV-2026-0004', assetTag: 'FA-PLT-0074', assetDescription: 'Perkins 500 KVA generator — Unit A', currentNbv: 19440000, revaluedAmount: 22800000, basis: 'Independent market appraisal — Sept 2026', revaluedOn: '2026-09-10', status: 'pending', raisedBy: 'Beatrice Auma' },
  { id: 'rev-0002', reference: 'REV-2026-0003', assetTag: 'FA-VEH-0188', assetDescription: 'Toyota Hilux double cab', currentNbv: 13120000, revaluedAmount: 10400000, basis: 'Impairment — accident damage', revaluedOn: '2026-09-05', status: 'approved', raisedBy: 'Kevin Omondi' },
  { id: 'rev-0003', reference: 'REV-2026-0002', assetTag: 'FA-FUR-0501', assetDescription: 'Executive boardroom table & 14 chairs', currentNbv: 6560000, revaluedAmount: 7200000, basis: 'Valuer report — bespoke joinery', revaluedOn: '2026-08-27', status: 'rejected', raisedBy: 'Ruth Atieno' }
];

export const revaluationsStore = createCollection<AssetRevaluation>('emtech.store.assetRevaluations.v1', SEED_REVALUATIONS, 'rev');
