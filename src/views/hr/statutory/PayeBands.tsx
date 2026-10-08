'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { DataTable } from '../../../components/data-table/DataTable';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatTile } from '../../../components/ui/StatTile';
import { Card, CardHeader } from '../../../components/ui/Card';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useCan } from '../../../contexts/PreferencesContext';
import {
  payeBandsStore,
  statutoryRatesStore,
  computePaye,
  type PayeBand
} from '../../../data/statutory';
import { useCollection } from '../../../core/store/createCollection';
import { ROUTE_META } from '../../../data/navigation';
import { formatMoney } from '../../../utils/format';
import type { Column } from '../../../components/data-table/types';

interface BandForm {
  lower: number;
  upper: string; // string so it can be blank for the open-ended top band
  rate: number;
}
const emptyForm: BandForm = { lower: 0, upper: '', rate: 10 };

export function PayeBands() {
  const can = useCan();
  const bands = useCollection(payeBandsStore);
  const rates = useCollection(statutoryRatesStore)[0];
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<BandForm>(emptyForm);
  const [sample, setSample] = useState(120000);

  const ordered = useMemo(() => [...bands].sort((a, b) => a.lower - b.lower), [bands]);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (b: PayeBand) => { setForm({ lower: b.lower, upper: b.upper === null ? '' : String(b.upper), rate: b.rate }); setEditing(b.id); };

  const save = () => {
    const payload = { lower: form.lower, upper: form.upper.trim() === '' ? null : Number(form.upper), rate: form.rate };
    if (payload.upper !== null && payload.upper <= payload.lower) { toast.error('Upper bound must exceed the lower bound'); return; }
    if (editing === 'new') { payeBandsStore.create(payload); toast.success('PAYE band added'); }
    else if (editing) { payeBandsStore.update(editing, payload); toast.success('PAYE band updated'); }
    setEditing(null);
  };
  const remove = (b: PayeBand) => { payeBandsStore.remove(b.id); toast.success('PAYE band removed'); };

  // Live sample: gross → PAYE before/after personal relief.
  const grossTax = computePaye(sample, bands);
  const relief = rates?.personalRelief ?? 2400;
  const netPaye = Math.max(0, grossTax - relief);

  const columns: Column<PayeBand>[] = [
    { id: 'band', header: 'Band', width: 240, sortValue: (r) => r.lower, cell: (r) => (
      <span className="tabular">{formatMoney(r.lower)} – {r.upper === null ? 'and above' : formatMoney(r.upper)}</span>
    ) },
    { id: 'rate', header: 'Rate', numeric: true, width: 120, sortValue: (r) => r.rate, cell: (r) => `${r.rate}%` }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/statutory/paye']?.trail ?? ['Human Resources', 'Statutory', 'PAYE bands']}
        title="PAYE tax bands"
        meta={<span className="tabular">{bands.length} bands · monthly</span>}
        primaryAction={<Button variant="primary" icon={PlusIcon} disabled={!can.create} onClick={openNew}>New band</Button>}
      />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Bands" value={String(bands.length)} />
          <StatTile label="Top marginal rate" value={`${Math.max(...bands.map((b) => b.rate))}%`} />
          <StatTile label="Personal relief" value={formatMoney(relief)} footnote="Monthly" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DataTable
              caption="PAYE tax bands"
              columns={columns}
              rows={ordered}
              getRowId={(r) => r.id}
              pinFirstColumn
              rowActions={(r) => (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label="Edit band" onClick={() => openEdit(r)} />
                  <Button size="sm" variant="ghost" iconOnly icon={Trash2Icon} aria-label="Delete band" disabled={!can.create} onClick={() => remove(r)} />
                </div>
              )}
            />
          </div>

          {/* Live sample computation */}
          <Card>
            <CardHeader title="Sample computation" description="See PAYE for a monthly taxable amount." level={3} />
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-small font-medium text-ink">Monthly taxable pay (KES)</label>
                <Input numeric type="number" value={sample} onChange={(e) => setSample(Number(e.target.value) || 0)} />
              </div>
              <dl className="space-y-2 border-t border-line pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-small text-ink-muted">Gross PAYE</dt>
                  <dd className="tabular text-body text-ink">{formatMoney(grossTax)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-small text-ink-muted">Personal relief</dt>
                  <dd className="tabular text-body text-numeric-negative">-{formatMoney(relief)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <dt className="text-small font-semibold text-ink">Net PAYE payable</dt>
                  <dd className="tabular text-h3 text-ink">{formatMoney(netPaye)}</dd>
                </div>
              </dl>
              <p className="text-caption text-ink-subtle">Effective rate {sample > 0 ? ((netPaye / sample) * 100).toFixed(1) : '0.0'}% of taxable pay.</p>
            </div>
          </Card>
        </div>
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New PAYE band' : 'Edit PAYE band'}
        subtitle="Monthly taxable income band"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save} disabled={!can.create}>{editing === 'new' ? 'Add band' : 'Save changes'}</Button></>}
      >
        <div className="p-1">
          <FormSection title="Band" description="Leave the upper bound blank for the top open-ended band.">
            <Field label="Lower bound (KES)" span={6} required><Input numeric type="number" value={form.lower} onChange={(e) => setForm((f) => ({ ...f, lower: Number(e.target.value) || 0 }))} /></Field>
            <Field label="Upper bound (KES)" span={6} hint="Blank = and above"><Input numeric type="number" value={form.upper} onChange={(e) => setForm((f) => ({ ...f, upper: e.target.value }))} /></Field>
            <Field label="Marginal rate (%)" span={6} required><Input numeric type="number" step="0.5" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) || 0 }))} /></Field>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
