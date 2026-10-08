'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../hooks/useNav';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/approval/StatusTimeline';
import { IDENTITIES } from '../../data/users';
import { cn } from '../../utils/cn';
import type { Role } from '../../types/common';

const ROLE_ORDER: Role[] = ['admin', 'manager', 'officer', 'auditor', 'employee'];
const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  officer: 'Officer',
  manager: 'Approver',
  auditor: 'Auditor',
  employee: 'Employee'
};

export function Login() {
  const navigate = useNav();
  const { setRole } = usePreferences();
  const { org } = useOrganization();
  const [role, setLocalRole] = useState<Role>('officer');
  const [email, setEmail] = useState('nancy.wambui@emtech.co.ke');
  const [password, setPassword] = useState('demo-password');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const identity = IDENTITIES[role];

  const signIn = () => {
    setSubmitting(true);
    setRole(role);
    // Front-end demo only: no real authentication. Route by role.
    setTimeout(() => {
      toast.success(`Signed in as ${identity.name}`, { description: identity.capability });
      // Everyone lands on their role dashboard first; employees have no console
      // modules, so they go straight to the self-service portal.
      navigate(role === 'employee' ? '/portal' : '/dashboard');
    }, 200);
  };

  return (
    <div className="grid min-h-full grid-cols-1 bg-canvas lg:grid-cols-2">
      {/* Left — brand panel (hidden on small screens) */}
      <div className="relative hidden overflow-hidden border-r border-line bg-rail lg:block">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(50% 50% at 30% 20%, #2563eb55 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-control bg-primary text-caption font-bold text-white">
              {org.branding.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.branding.logoDataUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                org.branding.initials || 'EM'
              )}
            </span>
            <span className="text-h2 text-white">{org.name}</span>
          </button>
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-white">Welcome back.</h1>
            <p className="mt-3 max-w-sm text-body text-rail-text">
              Sign in to the console to run payroll, approve requisitions, post to the ledger and see what needs
              your attention today.
            </p>
            <ul className="mt-6 space-y-2 text-small text-rail-text">
              <li>· Finance, HR, Procurement, Inventory, Assets and Budgeting</li>
              <li>· Maker-checker approvals with full audit trails</li>
              <li>· ⌘K to jump anywhere, instantly</li>
            </ul>
          </div>
          <p className="text-caption text-rail-text">© 2026 EMTECH · Internal enterprise system</p>
        </div>
      </div>

      {/* Right — sign-in form */}
      <div className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-sm">
          <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-1.5 text-small text-ink-muted hover:text-ink lg:hidden">
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to home
          </button>

          <h2 className="text-h1 text-ink">Sign in</h2>
          <p className="mt-1 text-small text-ink-muted">Choose how you want to explore the demo, then continue.</p>

          {/* Role selector */}
          <div className="mt-5">
            <p className="mb-1.5 text-small font-medium text-ink">Sign in as</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_ORDER.map((r) => {
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setLocalRole(r);
                      setEmail(`${IDENTITIES[r].name.toLowerCase().replace(/\s+/g, '.')}@emtech.co.ke`);
                    }}
                    className={cn(
                      'rounded-control border px-3 py-2 text-left transition-colors',
                      active ? 'border-primary bg-primary-soft' : 'border-line-strong bg-surface hover:bg-surface-2'
                    )}
                  >
                    <span className={cn('block text-small font-semibold', active ? 'text-primary-text' : 'text-ink')}>{ROLE_LABEL[r]}</span>
                    <span className="block truncate text-caption text-ink-subtle">{IDENTITIES[r].jobTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identity preview */}
          <div className="mt-4 flex items-center gap-3 rounded-control border border-line bg-surface-2 px-3 py-2.5">
            <Avatar name={identity.name} />
            <div className="min-w-0">
              <p className="truncate text-small font-medium text-ink">{identity.name}</p>
              <p className="truncate text-caption text-ink-subtle">{identity.capability}</p>
            </div>
          </div>

          {/* Credentials (demo) */}
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-small font-medium text-ink">Work email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center justify-between text-small font-medium text-ink">
                Password
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="inline-flex items-center gap-1 text-caption font-normal text-ink-subtle hover:text-ink">
                  {showPassword ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={LockIcon}
                autoComplete="current-password"
              />
            </label>
          </div>

          <Button className="mt-5 w-full" variant="primary" size="lg" trailingIcon={ArrowRightIcon} loading={submitting} onClick={signIn}>
            {role === 'employee' ? 'Continue to self-service' : 'Sign in to console'}
          </Button>

          <p className="mt-3 text-center text-caption text-ink-subtle">
            Demo environment — no real authentication. Any email and password will do.
          </p>
        </div>
      </div>
    </div>
  );
}
