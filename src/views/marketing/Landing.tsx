'use client';

import React from 'react';
import {
  ArrowRightIcon,
  BoxesIcon,
  BuildingIcon,
  CheckIcon,
  CommandIcon,
  GaugeCircleIcon,
  LandmarkIcon,
  MoonIcon,
  PiggyBankIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SunIcon,
  UsersIcon
} from 'lucide-react';
import { useNav } from '../../hooks/useNav';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

/** Small brand mark: the org logo if set, else the initials on the primary fill. */
function BrandMark({ className, dataUrl, initials }: { className?: string; dataUrl: string; initials: string }) {
  if (dataUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={dataUrl} alt="" className={cn('object-contain', className)} />;
  }
  return <span className={cn('flex items-center justify-center bg-primary font-bold text-white', className)}>{initials || 'EM'}</span>;
}

const MODULES = [
  { icon: LandmarkIcon, name: 'Finance', stat: 'KSh 357.2M net payable', blurb: 'General ledger, journals, trial balance and period close — every figure reconciled.' },
  { icon: UsersIcon, name: 'Human Resources', stat: '1,248 employees', blurb: 'Leave and a guided 17-step payroll with PAYE, NSSF, SHIF and the Housing Levy built in.' },
  { icon: ShoppingCartIcon, name: 'Procurement', stat: 'Requisition → PO → GRN', blurb: 'A clear maker-checker approval chain from request to goods receipt.' },
  { icon: BoxesIcon, name: 'Inventory', stat: 'Live stock valuation', blurb: 'Item balances across warehouses, with reorder alerts.' },
  { icon: BuildingIcon, name: 'Fixed Assets', stat: 'Net book value tracked', blurb: 'A complete asset register with depreciation and custodians.' },
  { icon: PiggyBankIcon, name: 'Budgeting', stat: 'Commitment & spend', blurb: 'Budget lines by cost centre with utilisation at a glance.' }
];

const PRINCIPLES = [
  { icon: GaugeCircleIcon, title: 'Fast and calm', blurb: 'Keyboard-first navigation, a ⌘K command palette and dense-but-scannable screens. It moves at the speed you think.' },
  { icon: ShieldCheckIcon, title: 'Trusted by design', blurb: 'Maker-checker on every document, full audit trails, and permission-gated actions that are shown, not hidden.' },
  { icon: SmartphoneIcon, title: 'One system, two audiences', blurb: 'A dense desktop console for officers and approvers, and a friendly mobile self-service portal for every employee.' }
];

const STATS = [
  { value: '13', label: 'Modules & sub-areas' },
  { value: '730+', label: 'Screens, one language' },
  { value: '5', label: 'Roles, permission-gated' },
  { value: '17', label: 'Step guided payroll' }
];

const PERSONAS = ['Administrators', 'Approvers & heads of department', 'Officers & clerks', 'Employees on self-service', 'Auditors'];

export function Landing() {
  const navigate = useNav();
  const { theme, setTheme } = usePreferences();
  const { org } = useOrganization();

  return (
    <div className="min-h-full bg-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8 overflow-hidden rounded-control text-caption" dataUrl={org.branding.logoDataUrl} initials={org.branding.initials} />
            <span className="text-h3 text-ink">{org.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            >
              {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/portal')}>
              Employee portal
            </Button>
            <Button variant="primary" size="sm" trailingIcon={ArrowRightIcon} onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(80% 65% at 50% -12%, var(--c-primary-soft) 0%, transparent 70%)' }}
          aria-hidden
        />
        {/* A stronger primary bloom at the very top so the hero reads branded, not blank. */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, var(--c-primary) 0%, transparent 100%)' }}
          aria-hidden
        />
        {/* faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(75% 60% at 50% 0%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(75% 60% at 50% 0%, black, transparent 80%)'
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-8 pt-20 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-caption font-medium text-primary-text">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Kenya-ready · SHIF · NSSF · PAYE · Housing Levy
          </p>
          <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[3.5rem]">
            The <span className="text-primary-text">operating system</span> for
            <br className="hidden sm:block" /> your whole organisation
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body text-ink-muted sm:text-[0.95rem]">
            Finance, HR, Procurement, Inventory, Fixed Assets and Budgeting in one place. Data-dense where you
            need power, calm and clear where you need speed.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" trailingIcon={ArrowRightIcon} onClick={() => navigate('/login')}>
              Sign in to the console
            </Button>
            <Button variant="secondary" size="lg" icon={SmartphoneIcon} onClick={() => navigate('/portal')}>
              Open self-service portal
            </Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-caption text-ink-subtle">
            <CommandIcon className="h-3 w-3" aria-hidden /> Press ⌘K anywhere in the console to jump to any screen
          </p>
        </div>

        {/* Product preview mock */}
        <div className="relative mx-auto max-w-5xl px-5 pb-16">
          <HeroPreview />
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-5 py-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 text-center">
              <p className="tabular text-display text-primary-text">{s.value}</p>
              <p className="mt-1 text-small text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 text-ink sm:text-display">Everything the organisation runs on</h2>
          <p className="mt-2 text-body text-ink-muted">Six modules, one consistent product. Each speaks the same visual language, so the whole system feels like one tool.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="group relative overflow-hidden rounded-surface border border-line bg-surface p-5 transition-all duration-moderate ease-exit hover:-translate-y-1 hover:border-line-strong hover:shadow-pop"
              >
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-soft opacity-0 blur-2xl transition-opacity duration-slow group-hover:opacity-70"
                  aria-hidden
                />
                <div className="relative">
                  <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary-text">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <h3 className="text-h3 text-ink">{m.name}</h3>
                    <span className="tabular rounded-full bg-surface-2 px-2 py-0.5 text-caption text-ink-muted">{m.stat}</span>
                  </div>
                  <p className="mt-1.5 text-small text-ink-muted">{m.blurb}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Principles */}
      <section className="relative overflow-hidden border-y border-line bg-primary-soft/40">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 80% at 85% 0%, var(--c-primary-soft) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-16 md:grid-cols-3">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-surface border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-3 text-h2 text-ink">{p.title}</h3>
                <p className="mt-1.5 text-small text-ink-muted">{p.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personas + CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="overflow-hidden rounded-surface border border-line bg-gradient-to-br from-primary-soft/70 via-surface to-surface p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-h1 text-ink sm:text-display">Built for everyone who touches it</h2>
              <p className="mt-2 text-body text-ink-muted">
                From heavy daily data entry to a once-a-month payslip check — the experience fits the person, not
                the other way round. Sign in as any role to see it adapt.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="primary" trailingIcon={ArrowRightIcon} onClick={() => navigate('/login')}>
                  Get started
                </Button>
                <Button variant="secondary" onClick={() => navigate('/gallery')}>
                  Explore the design system
                </Button>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PERSONAS.map((persona) => (
                <li key={persona} className="flex items-center gap-2 rounded-control border border-line bg-surface px-3 py-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="text-small text-ink">{persona}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-caption text-ink-subtle sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-primary text-[0.6rem] font-bold text-white">EM</span>
            <span>EMTECH ERP v2 · Internal enterprise system</span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className={cn('hover:text-ink')} onClick={() => navigate('/login')}>Sign in</button>
            <button type="button" className={cn('hover:text-ink')} onClick={() => navigate('/portal')}>Self-service</button>
            <button type="button" className={cn('hover:text-ink')} onClick={() => navigate('/gallery')}>Design system</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** A lightweight, on-brand mock of the console — pure decoration for the hero. */
function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-surface border border-line bg-surface shadow-overlay">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-0.5 text-caption text-ink-subtle">
          emtech-erp.co.ke/dashboard
        </span>
      </div>

      <div className="flex h-[300px] text-left">
        {/* mini sidebar */}
        <div className="hidden w-40 shrink-0 flex-col gap-1 border-r border-line bg-surface p-3 sm:flex">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-primary text-[0.55rem] font-bold text-white">EM</span>
            <span className="text-small font-semibold text-ink">EMTECH</span>
          </div>
          {['Dashboard', 'Finance', 'Human Resources', 'Procurement', 'Inventory', 'Budgeting'].map((label, i) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-control px-2 py-1.5 text-caption',
                i === 0 ? 'bg-primary-soft font-medium text-primary-text' : 'text-ink-muted'
              )}
            >
              <span className={cn('h-3 w-3 rounded-[3px]', i === 0 ? 'bg-primary' : 'bg-surface-3')} aria-hidden />
              {label}
            </div>
          ))}
        </div>

        {/* mini content */}
        <div className="min-w-0 flex-1 overflow-hidden p-4">
          <div className="h-4 w-40 rounded bg-surface-3" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { k: 'Net payable', v: 'KSh 357.2M', t: 'text-ink' },
              { k: 'Pending approvals', v: '7', t: 'text-warning' },
              { k: 'Budget available', v: 'KSh 41.8M', t: 'text-success' }
            ].map((c) => (
              <div key={c.k} className="rounded-control border border-line bg-surface-2 p-2.5">
                <p className="text-[0.6rem] uppercase tracking-wide text-ink-subtle">{c.k}</p>
                <p className={cn('tabular mt-1 text-body font-semibold', c.t)}>{c.v}</p>
              </div>
            ))}
          </div>

          {/* mini chart */}
          <div className="mt-3 flex h-24 items-end gap-1.5 rounded-control border border-line bg-surface-2 p-3">
            {[38, 52, 44, 61, 49, 70, 58, 76, 64, 82].map((h, i) => (
              <span key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${h}%` }} aria-hidden />
            ))}
          </div>

          {/* mini table */}
          <div className="mt-3 space-y-1.5">
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-surface-3" aria-hidden />
                <span className="h-2.5 flex-1 rounded bg-surface-3" aria-hidden />
                <span className="h-2.5 w-14 rounded bg-surface-3" aria-hidden />
                <span className="h-4 w-12 rounded-full bg-success-soft" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
