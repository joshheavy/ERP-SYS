import React from 'react';
import { UsersIcon } from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Field, FormSection } from '../../../../components/forms/FormSection';
import { Input, Select } from '../../../../components/ui/Input';
import { SearchableMultiSelect } from '../../../../components/ui/SearchableMultiSelect';
import { PeriodPicker, type PeriodGranularity } from '../../../../components/ui/DatePicker';
import { StatTile } from '../../../../components/ui/StatTile';
import { CLOSED_PERIODS, PAY_GROUP_OPTIONS } from '../../../../data/payroll';

export interface PeriodStepProps {
  period: string;
  onPeriodChange: (period: string, granularity: PeriodGranularity) => void;
  payGroups: string[];
  onPayGroupsChange: (groups: string[]) => void;
  payDate: string;
  onPayDateChange: (value: string) => void;
  runType: string;
  onRunTypeChange: (value: string) => void;
}

export function PeriodStep({
  period,
  onPeriodChange,
  payGroups,
  onPayGroupsChange,
  payDate,
  onPayDateChange,
  runType,
  onRunTypeChange
}: PeriodStepProps) {
  return (
    <Card>
      <FormSection
        title="Period"
        description="The ledger period this run posts into. Closed periods cannot be selected.">
        
        <Field label="Pay period" span={6} required>
          <PeriodPicker
            label="Pay period"
            value={period}
            granularity="month"
            closedPeriods={CLOSED_PERIODS}
            onChange={onPeriodChange} />
          
        </Field>
        <Field label="Payment date" span={6} required hint="Drives the value date on the bank transfer file.">
          <Input type="date" value={payDate} onChange={(e) => onPayDateChange(e.target.value)} />
        </Field>
        <Field label="Run type" span={6} required>
          <Select
            value={runType}
            onChange={(e) => onRunTypeChange(e.target.value)}
            options={[
            { value: 'regular', label: 'Regular monthly run' },
            { value: 'supplementary', label: 'Supplementary — arrears' },
            { value: 'offcycle', label: 'Off-cycle — terminal payments' }]
            } />
          
        </Field>
      </FormSection>
      <FormSection
        title="Pay groups"
        description="Which populations this run covers. Each group carries its own pay structure.">
        
        <Field
          label="Included pay groups"
          span={12}
          required
          hint={`${payGroups.length} of ${PAY_GROUP_OPTIONS.length} groups selected.`}>
          
          <SearchableMultiSelect
            label="Included pay groups"
            options={PAY_GROUP_OPTIONS}
            value={payGroups}
            onChange={onPayGroupsChange}
            placeholder="Select at least one pay group"
            maxVisibleChips={3} />
          
        </Field>
      </FormSection>
    </Card>);

}

const SCOPE_BREAKDOWN = [
{ label: 'Active employees at period start', value: '1,243', note: 'Carried from the August run' },
{ label: 'Joiners in period', value: '14', note: 'Pro-rated from their start date' },
{ label: 'Leavers in period', value: '6', note: 'Pro-rated to their last working day' },
{ label: 'Suspended — excluded', value: '3', note: 'On disciplinary suspension without pay' },
{ label: 'Employees in scope', value: '1,248', note: 'Final population for this run' }];


export function ScopeStep() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile emphasis label="Employees in scope" value="1,248" change={{ value: '+8', direction: 'up', caption: 'vs. August', good: undefined }} />
        <StatTile label="Pay groups" value="3" footnote="Management, Senior, Junior" />
        <StatTile label="Excluded" value="3" footnote="Suspended without pay" />
      </div>
      <Card>
        <CardHeader
          title="How the population was resolved"
          description="Every movement since the last run, and what it means for this one." />
        
        <dl className="divide-y divide-line">
          {SCOPE_BREAKDOWN.map((row) =>
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <div className="min-w-0">
                <dt className="text-body text-ink">{row.label}</dt>
                <dd className="text-caption text-ink-subtle">{row.note}</dd>
              </div>
              <span className="tabular shrink-0 text-h3 text-ink">{row.value}</span>
            </div>
          )}
        </dl>
        <p className="flex items-center gap-2 border-t border-line bg-surface-2 px-4 py-2.5 text-small text-ink-muted">
          <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Contract & locum staff are paid from a separate run and are not included here.
        </p>
      </Card>
    </div>);

}