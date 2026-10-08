'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  DEFAULT_ORGANIZATION,
  type Organization,
  type OrganizationBranding
} from '../types/organization';

const STORAGE_KEY = 'emtech.organization.v1';

interface OrganizationValue {
  org: Organization;
  /** Merge a partial update and persist. */
  update: (patch: Partial<Omit<Organization, 'branding'>>) => void;
  /** Merge a partial branding update and persist (re-themes live). */
  updateBranding: (patch: Partial<OrganizationBranding>) => void;
  /** Restore the shipped defaults. */
  reset: () => void;
  /** Convenience: the mark to show (logo data-url or initials). */
  hasLogo: boolean;
}

const OrganizationContext = createContext<OrganizationValue | null>(null);

/* ------------------------------------------------------------------ *
 * Colour helpers — derive the primary token family from one hex so a
 * buyer only picks ONE brand colour and the whole primary scale follows.
 * ------------------------------------------------------------------ */

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

/** Mix a colour toward white (amount 0..1). */
function tint(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/** Mix a colour toward black (amount 0..1). */
function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Relative luminance for a readable contrast decision. */
function isDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const [r, g, b] = rgb.map((v) => v / 255) as [number, number, number];
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L < 0.5;
}

/**
 * Inject (or clear) the brand override variables on <html>. We only override
 * the primary + accent families, leaving the rest of the design system intact,
 * so a custom brand colour flows into every button/active-nav/link without
 * touching component code. Cleared when the buyer uses the default colour.
 */
function applyBranding(branding: OrganizationBranding) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const setOrClear = (name: string, value: string | null) => {
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  };

  const primary = hexToRgb(branding.primaryColor) ? branding.primaryColor : null;
  if (primary) {
    setOrClear('--c-primary', primary);
    setOrClear('--c-primary-hover', shade(primary, 0.14));
    setOrClear('--c-primary-soft', tint(primary, 0.88));
    setOrClear('--c-primary-text', shade(primary, 0.18));
    setOrClear('--c-focus', primary);
    // Keep the categorical chart-1 in step with the brand.
    setOrClear('--c-chart-1', primary);
  } else {
    // Revert to the stylesheet defaults.
    ['--c-primary', '--c-primary-hover', '--c-primary-soft', '--c-primary-text', '--c-focus', '--c-chart-1'].forEach(
      (v) => setOrClear(v, null)
    );
  }

  const accent = hexToRgb(branding.accentColor) ? branding.accentColor : null;
  setOrClear('--c-chart-2', accent ?? null);
}

function readStored(): Organization | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Organization>;
    // Merge over defaults so new fields never break an old stored record.
    return {
      ...DEFAULT_ORGANIZATION,
      ...parsed,
      branding: { ...DEFAULT_ORGANIZATION.branding, ...(parsed.branding ?? {}) }
    };
  } catch {
    return null;
  }
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Organization>(DEFAULT_ORGANIZATION);

  // Hydrate after mount to avoid SSR mismatch, then apply branding.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setOrg(stored);
      applyBranding(stored.branding);
    } else {
      applyBranding(DEFAULT_ORGANIZATION.branding);
    }
  }, []);

  const persist = useCallback((next: Organization) => {
    setOrg(next);
    applyBranding(next.branding);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — in-memory still works */
    }
  }, []);

  const value = useMemo<OrganizationValue>(
    () => ({
      org,
      update: (patch) => persist({ ...org, ...patch }),
      updateBranding: (patch) => persist({ ...org, branding: { ...org.branding, ...patch } }),
      reset: () => persist(DEFAULT_ORGANIZATION),
      hasLogo: Boolean(org.branding.logoDataUrl)
    }),
    [org, persist]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationValue {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used inside OrganizationProvider');
  return ctx;
}

/** Exported for any surface that needs the readable on-brand text colour. */
export function onBrandTextColor(hex: string): string {
  return isDark(hex) ? '#ffffff' : '#0f172a';
}
