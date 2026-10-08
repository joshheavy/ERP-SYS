'use client';

import React from 'react';
import { CheckCircle2Icon, CircleSlashIcon, InfoIcon, PackageIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Choice';
import { StatTile } from '../../../components/ui/StatTile';
import { useEntitlements } from '../../../contexts/EntitlementsContext';
import { MODULE_REGISTRY } from '../../../core/module/registry';
import { SUBMODULES, SUBMODULES_BY_MODULE } from '../../../core/module/submodules';
import { ROUTE_META } from '../../../data/navigation';
import { cn } from '../../../utils/cn';
import type { Role } from '../../../types/common';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  manager: 'Approver',
  officer: 'Officer',
  auditor: 'Auditor',
  employee: 'Employee'
};

/**
 * Modules & licensing — the on-prem operator's view of what this install owns.
 *
 * "Installed" = every module compiled into this build (MODULE_REGISTRY).
 * "Licensed"  = the subset the entitlements config enables (see
 *               src/core/entitlements/entitlements.config.ts).
 * A licensed module still only appears for a role that the permissions matrix
 * grants it — the two gates are independent (entitlement ∩ permission).
 */
export function ModulesLicensing() {
  const {
    license,
    isEntitled,
    entitledIds,
    isSubmoduleEntitled,
    setSubmoduleEnabled,
    resetSubmodules,
    hasSubmoduleOverride
  } = useEntitlements();

  const installed = MODULE_REGISTRY.length;
  const licensed = entitledIds.length;
  const licensedSubmodules = SUBMODULES.filter((s) => isSubmoduleEntitled(s.id)).length;

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/modules']?.trail ?? ['Administration', 'Modules & licensing']}
        title="Modules & licensing"
        meta={
          <span>
            {license.licensee} · {license.edition} edition
            {license.expiresAt ? ` · expires ${license.expiresAt}` : ' · perpetual license'}
            {hasSubmoduleOverride ? ' · local override active' : ''}
          </span>
        }
        secondaryActions={
          hasSubmoduleOverride && (
            <Button
              icon={RotateCcwIcon}
              onClick={() => {
                resetSubmodules();
                toast.success('Sub-modules reset to the license default');
              }}
            >
              Reset to license
            </Button>
          )
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Licensed modules" value={String(licensed)} footnote="Enabled on this install" />
          <StatTile label="Installed modules" value={String(installed)} footnote="Compiled into this build" />
          <StatTile
            label="Licensed sub-modules"
            value={`${licensedSubmodules}/${SUBMODULES.length}`}
            footnote="Sellable feature groups enabled"
          />
        </div>

        <Card>
          <CardHeader
            title="Module catalogue"
            description="Every module in this build and whether your license enables it. Licensed modules appear in the sidebar for any role granted them."
          />
          <ul className="divide-y divide-line">
            {MODULE_REGISTRY.map((m) => {
              const Icon = m.icon;
              const entitled = isEntitled(m.id);
              return (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-control',
                      entitled ? 'bg-primary-soft text-primary-text' : 'bg-surface-3 text-ink-subtle'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-body font-medium text-ink">{m.label}</span>
                      <span className="rounded-full border border-line bg-surface-2 px-1.5 text-caption text-ink-subtle">
                        {m.section}
                      </span>
                    </div>
                    {m.blurb && <p className="mt-0.5 truncate text-small text-ink-muted">{m.blurb}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-caption text-ink-subtle">
                      <span className="font-medium uppercase tracking-wide">Default roles:</span>
                      {m.defaultRoles.length ? (
                        m.defaultRoles.map((r) => (
                          <span key={r} className="rounded-full bg-surface-3 px-1.5">
                            {ROLE_LABEL[r]}
                          </span>
                        ))
                      ) : (
                        <span className="italic">none</span>
                      )}
                    </p>

                    {/* Sellable sub-modules within this module — toggle live. */}
                    {(SUBMODULES_BY_MODULE[m.id]?.length ?? 0) > 0 && (
                      <div className="mt-2.5">
                        <span className="text-caption font-medium uppercase tracking-wide text-ink-subtle">Sub-modules</span>
                        <ul className="mt-1 space-y-1">
                          {SUBMODULES_BY_MODULE[m.id].map((s) => {
                            const on = isSubmoduleEntitled(s.id);
                            return (
                              <li
                                key={s.id}
                                className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-2.5 py-1.5"
                              >
                                <span className="flex min-w-0 items-center gap-1.5">
                                  {on ? (
                                    <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                                  ) : (
                                    <CircleSlashIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden />
                                  )}
                                  <span className={cn('truncate text-small', on ? 'text-ink' : 'text-ink-muted')}>{s.label}</span>
                                </span>
                                <Toggle
                                  checked={on}
                                  disabled={!entitled}
                                  onChange={(next) => {
                                    setSubmoduleEnabled(s.id, next);
                                    toast.success(`${s.label} ${next ? 'enabled' : 'disabled'}`);
                                  }}
                                  aria-label={`${on ? 'Disable' : 'Enable'} ${s.label}`}
                                />
                              </li>
                            );
                          })}
                        </ul>
                        {!entitled && (
                          <p className="mt-1 text-caption text-ink-subtle">License the module to manage its sub-modules.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-small font-medium',
                      entitled ? 'bg-success-soft text-success' : 'bg-surface-3 text-ink-muted'
                    )}
                  >
                    {entitled ? (
                      <>
                        <CheckCircle2Icon className="h-4 w-4" aria-hidden />
                        Licensed
                      </>
                    ) : (
                      <>
                        <CircleSlashIcon className="h-4 w-4" aria-hidden />
                        Not licensed
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* On-prem operator guidance — how to change the license. */}
        <Card className="p-4">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-text">
              <PackageIcon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 text-small text-ink-muted">
              <h3 className="text-h3 text-ink">Changing your license (on-prem)</h3>
              <p className="mt-1">
                Entitlements are set per install and take effect on the next build or restart. Choose one:
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Edit <code className="rounded bg-surface-3 px-1">LICENSE.modules</code> in{' '}
                  <code className="rounded bg-surface-3 px-1">src/core/entitlements/entitlements.config.ts</code>, or
                </li>
                <li>
                  Set{' '}
                  <code className="rounded bg-surface-3 px-1">NEXT_PUBLIC_EMTECH_LICENSED_MODULES</code>{' '}
                  (comma-separated module ids) at build time to override without touching source.
                </li>
                <li>
                  To sell individual <strong>sub-modules</strong>, set{' '}
                  <code className="rounded bg-surface-3 px-1">LICENSE.submodules</code> (or{' '}
                  <code className="rounded bg-surface-3 px-1">NEXT_PUBLIC_EMTECH_LICENSED_SUBMODULES</code>) to the
                  sub-module ids you sell, e.g. <code className="rounded bg-surface-3 px-1">finance.subledgers,hr.payroll</code>.
                  Leaving it unset licenses every sub-module of the modules you own.
                </li>
              </ol>
              <p className="mt-2 flex items-start gap-1.5">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                The Administration module is always licensed so you can never lock yourself out of this screen.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
