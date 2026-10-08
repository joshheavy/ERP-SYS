/**
 * ORGANIZATION PROFILE
 * --------------------
 * The buying organisation's own record: who they are, their statutory
 * identifiers, and how the product is branded for them. On an on-prem install
 * there is exactly one of these (single-tenant), configured on first run via
 * Admin → Organization. It is orthogonal to the license/entitlements (which
 * decides WHICH MODULES they get) — this is WHO they are and HOW it looks.
 */

/** Brand palette a buyer can customise. Empty strings fall back to defaults. */
export interface OrganizationBranding {
  /** Primary/action colour (hex). Drives buttons, active nav, links. */
  primaryColor: string;
  /** Accent colour (hex) for highlights and secondary emphasis. */
  accentColor: string;
  /** Data-URL of the uploaded logo, or '' to use the initials mark. */
  logoDataUrl: string;
  /** Short mark shown when there is no logo (e.g. "EM"). */
  initials: string;
}

/** The full organisation profile. */
export interface Organization {
  /** Trading / display name shown across the app. */
  name: string;
  /** Optional registered legal name if different from the trading name. */
  legalName: string;
  /** Kenya Revenue Authority PIN. */
  kraPin: string;
  /** NSSF employer registration number. */
  nssfEmployerNo: string;
  /** SHIF (ex-NHIF) employer registration number. */
  shifEmployerNo: string;
  /** Physical / postal address. */
  address: string;
  city: string;
  country: string;
  /** Primary contacts. */
  phone: string;
  email: string;
  website: string;
  /** Finance defaults. */
  baseCurrency: string;
  /** Fiscal year start month, 1–12 (Kenya government FY starts in July = 7). */
  fiscalYearStartMonth: number;
  /** Branding. */
  branding: OrganizationBranding;
}

/** The default profile a fresh install ships with (the EMTECH reference). */
export const DEFAULT_ORGANIZATION: Organization = {
  name: 'EMTECH ERP',
  legalName: '',
  kraPin: '',
  nssfEmployerNo: '',
  shifEmployerNo: '',
  address: '',
  city: 'Nairobi',
  country: 'Kenya',
  phone: '',
  email: '',
  website: '',
  baseCurrency: 'KES',
  fiscalYearStartMonth: 7,
  branding: {
    primaryColor: '#2563eb',
    accentColor: '#0e9488',
    logoDataUrl: '',
    initials: 'EM'
  }
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

/** Currencies a Kenyan install is likely to use. */
export const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS'] as const;
