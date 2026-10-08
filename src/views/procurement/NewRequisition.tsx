'use client';

import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../hooks/useNav';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { Field, FormActions, FormSection } from '../../components/forms/FormSection';
import { ProgressBar } from '../../components/ui/Progress';
import { useCan } from '../../contexts/PreferencesContext';
import { BUDGET_LINES, CATEGORIES } from '../../data/procurement';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney } from '../../utils/format';

interface DraftLine {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

let seq = 0;
const newLine = (): DraftLine => ({
  id: `dl-${seq++}`,
  description: '',
  category: CATEGORIES[0],
  quantity: 1,
  unit: 'unit',
  unitPrice: 0
});

export function NewRequisition() {
  const navigate = useNav();
  const can = useCan();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [budgetLine, setBudgetLine] = useState(BUDGET_LINES[0].code);
  const [neededBy, setNeededBy] = useState('2026-10-15');
  const [justification, setJustification] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);

  const budget = BUDGET_LINES.find((b) => b.code === budgetLine) ?? BUDGET_LINES[0];
  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const used = (budget.committed + budget.spent + total) / budget.allocated;

  const update = (id: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const errors: { field: string; message: string }[] = [];
  if (!title.trim()) errors.push({ field: 'Title', message: 'Give the requisition a short title.' });
  if (!justification.trim()) errors.push({ field: 'Justification', message: 'A justification is required for approval.' });
  if (lines.some((l) => !l.description.trim())) errors.push({ field: 'Line items', message: 'Every line needs a description.' });
  if (total <= 0) errors.push({ field: 'Value', message: 'The total value must be greater than zero.' });

  const submit = () => {
    toast.success('Requisition created', {
      description: `${title || 'Untitled'} raised against ${budgetLine}. Submit it for approval when ready.`
    });
    navigate('/procurement/requisitions');
  };

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/procurement/requisitions/new'].trail}
        title="New requisition"
        meta={<span>Draft · not yet submitted</span>}
      />

      <div className="mx-auto max-w-4xl p-5">
        <Card className="overflow-visible">
          <FormSection title="Details" description="What is being requested and against which budget.">
            <Field label="Title" span={12} required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Replacement laptops for Finance" />
            </Field>
            <Field label="Department" span={6} required>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={['Information Technology', 'Finance', 'Facilities', 'Operations', 'Human Resources', 'Procurement'].map((d) => ({ value: d, label: d }))}
              />
            </Field>
            <Field label="Needed by" span={6} required>
              <DatePicker label="Needed by" value={neededBy} onChange={setNeededBy} min="2026-09-15" />
            </Field>
            <Field label="Budget line" span={6} required hint={`${formatMoney(budget.allocated - budget.committed - budget.spent)} available`}>
              <Select
                value={budgetLine}
                onChange={(e) => setBudgetLine(e.target.value)}
                options={BUDGET_LINES.map((b) => ({ value: b.code, label: `${b.code} — ${b.label}` }))}
              />
            </Field>
          </FormSection>

          <FormSection title="Justification" description="Why this is needed. Visible to every approver in the chain.">
            <Field label="Justification" span={12} required>
              <Textarea rows={4} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Explain the business need, urgency and any alternatives considered." />
            </Field>
          </FormSection>

          <FormSection
            title="Line items"
            description="One row per item or service."
            aside={
              <Button size="sm" variant="secondary" icon={PlusIcon} onClick={() => setLines((prev) => [...prev, newLine()])}>
                Add line
              </Button>
            }
          >
            <div className="col-span-12 space-y-3">
              {lines.map((line, i) => (
                <div key={line.id} className="rounded-control border border-line bg-surface-2 p-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="mb-1 block text-caption font-medium text-ink">Description</label>
                      <Input value={line.description} onChange={(e) => update(line.id, { description: e.target.value })} placeholder="Item or service" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="mb-1 block text-caption font-medium text-ink">Category</label>
                      <Select value={line.category} onChange={(e) => update(line.id, { category: e.target.value })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="mb-1 block text-caption font-medium text-ink">Qty</label>
                      <Input numeric type="number" min={1} value={line.quantity} onChange={(e) => update(line.id, { quantity: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <label className="mb-1 block text-caption font-medium text-ink">Unit price</label>
                      <Input numeric type="number" min={0} value={line.unitPrice} onChange={(e) => update(line.id, { unitPrice: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="col-span-12 flex items-end justify-between gap-3 sm:col-span-1">
                      <span className="tabular text-small font-medium text-ink">{formatMoney(line.quantity * line.unitPrice, { symbol: false })}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        iconOnly
                        icon={Trash2Icon}
                        aria-label={`Remove line ${i + 1}`}
                        disabled={lines.length === 1}
                        onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-control border border-line-strong bg-surface px-3 py-2.5">
                <span className="text-small font-medium text-ink">Total requisition value</span>
                <span className="tabular text-h3 text-ink">{formatMoney(total)}</span>
              </div>

              <ProgressBar
                label={`Budget line ${budget.code} after this requisition`}
                caption={`${Math.round(used * 100)}% committed`}
                value={budget.committed + budget.spent + total}
                max={budget.allocated}
                tone={used > 1 ? 'danger' : used > 0.85 ? 'warning' : 'primary'}
              />
              {used > 1 && <p className="text-small text-danger">This requisition exceeds the remaining budget on {budget.code}.</p>}
            </div>
          </FormSection>

          <FormActions
            primaryLabel="Create requisition"
            onPrimary={submit}
            onCancel={() => navigate('/procurement/requisitions')}
            disabledReason={
              !can.create ? 'Your role cannot raise requisitions' : errors.length > 0 ? `${errors.length} field${errors.length === 1 ? '' : 's'} need attention` : undefined
            }
            dirty={title.length > 0 || justification.length > 0}
          />
        </Card>
      </div>
    </div>
  );
}
