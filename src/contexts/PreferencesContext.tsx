'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Density, Role } from '../types/common';

interface Preferences {
  theme: 'light' | 'dark';
  density: Density;
  role: Role;
  setTheme: (theme: 'light' | 'dark') => void;
  setDensity: (density: Density) => void;
  setRole: (role: Role) => void;
  /** Row/field rhythm derived from density so every surface breathes together. */
  rowHeight: string;
  cellPadding: string;
  sectionGap: string;
}

const PreferencesContext = createContext<Preferences | null>(null);

interface PreferencesProviderProps {
  children: React.ReactNode;
  initialTheme: 'light' | 'dark';
  initialDensity: Density;
  initialRole: Role;
}

export function PreferencesProvider({
  children,
  initialTheme,
  initialDensity,
  initialRole
}: PreferencesProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [density, setDensity] = useState<Density>(initialDensity);
  const [role, setRole] = useState<Role>(initialRole);

  useEffect(() => setTheme(initialTheme), [initialTheme]);
  useEffect(() => setDensity(initialDensity), [initialDensity]);
  useEffect(() => setRole(initialRole), [initialRole]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else
      root.classList.remove('dark');
  }, [theme]);

  const value = useMemo<Preferences>(
    () => ({
      theme,
      density,
      role,
      setTheme,
      setDensity,
      setRole,
      rowHeight: density === 'compact' ? 'h-8' : 'h-10',
      cellPadding: density === 'compact' ? 'px-2.5 py-1' : 'px-3 py-2',
      sectionGap: density === 'compact' ? 'gap-4' : 'gap-6'
    }),
    [theme, density, role]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}

/** Permission model. The console shows what a user cannot do, disabled and explained. */
export function useCan() {
  const { role } = usePreferences();
  return useMemo(
    () => ({
      role,
      create: role === 'officer' || role === 'manager',
      edit: role === 'officer',
      approve: role === 'manager',
      post: role === 'officer',
      export: true,
      viewPayroll: role !== 'employee',
      readOnly: role === 'auditor' || role === 'employee'
    }),
    [role]
  );
}