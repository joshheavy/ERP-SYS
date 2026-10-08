'use client';

import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import { statutoryRatesStore, type StatutoryRates as Rates } from '../../../data/statutory';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney } from '../../../utils/format';

/**
 * SHIF, Affordable Housing Levy and relief rates — flat statutory values that
 * apply across payroll. A single-record config; edits auto-save.
 */
export function StatutoryRates() {
  const can = useCan();
  const rates = useCollection(statutoryRatesStore)[0];

  if (!rates) return null;

  const set = (patch: Partial<Rates>) => statutoryRatesStore.update(rates.id, patch);
  const readOnly = !can.create;

  // Illustrative figures on a sample gross for the stat tiles.
  const sampleGross = 120000;
  const shif = Math.max(rates.shifMinimum, Math.round((sampleGross * rates.shifRate) / 100));
  const housing = Math.round((sampleGross * rates.housingLevyRate) / 100);

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/statutory/rates']?.trail ?? ['Human Resources', 'Statutory', 'SHIF & levies']}
        title="SHIF & levies"
        meta={<span>Flat statutory rates and reliefs used across payroll.</span>}
      />
      <div className="mx-auto max-w-3xl space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="SHIF on KSh 120k" value={formatMoney(shif)} footnote={`${rates.shifRate}% (min ${formatMoney(rates.shifMinimum)})`} />
          <StatTile label="Housing levy on KSh 120k" value={formatMoney(housing)} footnote={`${rates.housingLevyRate}%`} />
          <StatTile label="Personal relief" value={formatMoney(rates.personalRelief)} footnote="Monthly PAYE relief" />
        </div>

        <Card className="overflow-visible">
          <FormSection title="SHIF (Social Health Insurance Fund)" description="Replaces NHIF. A percentage of gross with a monthly minimum.">
            <Field label="SHIF rate (%)" span={6}>
              <Input numeric type="number" step="0.05" value={rates.shifRate} disabled={readOnly} onChange={(e) => set({ shifRate: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Monthly minimum (KES)" span={6}>
              <Input numeric type="number" value={rates.shifMinimum} disabled={readOnly} onChange={(e) => set({ shifMinimum: Number(e.target.value) || 0 })} />
            </Field>
          </FormSection>

          <FormSection title="Affordable Housing Levy" description="Employee share of the levy; matched by the employer.">
            <Field label="Levy rate (%)" span={6}>
              <Input numeric type="number" step="0.05" value={rates.housingLevyRate} disabled={readOnly} onChange={(e) => set({ housingLevyRate: Number(e.target.value) || 0 })} />
            </Field>
          </FormSection>

          <FormSection title="Reliefs" description="Reliefs that reduce PAYE payable.">
            <Field label="Personal relief (KES / month)" span={6}>
              <Input numeric type="number" value={rates.personalRelief} disabled={readOnly} onChange={(e) => set({ personalRelief: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Insurance relief (% of premium)" span={6}>
              <Input numeric type="number" step="0.5" value={rates.insuranceReliefRate} disabled={readOnly} onChange={(e) => set({ insuranceReliefRate: Number(e.target.value) || 0 })} />
            </Field>
          </FormSection>

          <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-5 py-3">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
            <p className="text-caption text-ink-muted">
              Changes save as you type. {readOnly && 'Your role has read-only access to statutory configuration.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
