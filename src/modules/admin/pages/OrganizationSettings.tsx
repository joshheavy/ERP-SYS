'use client';

import React, { useRef, useState } from 'react';
import { BuildingIcon, RotateCcwIcon, UploadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { FormSection, Field } from '../../../components/forms/FormSection';
import { useOrganization, onBrandTextColor } from '../../../contexts/OrganizationContext';
import { CURRENCIES, MONTHS } from '../../../types/organization';
import { ROUTE_META } from '../../../data/navigation';

/** A labelled colour swatch + hex input pair. */
function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-small font-medium text-ink">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-control border border-line bg-surface p-1"
        />
        <Input
          aria-label={`${label} hex value`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 font-mono"
          placeholder="#2563eb"
        />
      </div>
    </div>
  );
}

/**
 * Admin → Organization. The buyer configures their own company profile,
 * Kenyan statutory identifiers, finance defaults and brand (logo + colours).
 * Branding writes live CSS variables through OrganizationContext, so the whole
 * app re-themes as they pick colours. Persisted to localStorage for now.
 */
export function OrganizationSettings() {
  const { org, update, updateBranding, reset } = useOrganization();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const onLogoPick = (file: File | undefined) => {
    setUploadError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Choose an image file (PNG, JPG or SVG).');
      return;
    }
    if (file.size > 512 * 1024) {
      setUploadError('Logo must be under 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBranding({ logoDataUrl: String(reader.result) });
      toast.success('Logo updated');
    };
    reader.onerror = () => setUploadError('Could not read that file. Try another.');
    reader.readAsDataURL(file);
  };

  const brandText = onBrandTextColor(org.branding.primaryColor);

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/admin/organization']?.trail ?? ['Administration', 'Organization']}
        title="Organization"
        meta={<span>Your company profile and branding. Changes save to this install.</span>}
        secondaryActions={
          <Button
            icon={RotateCcwIcon}
            onClick={() => {
              reset();
              toast.success('Organization reset to defaults');
            }}
          >
            Reset to defaults
          </Button>
        }
      />

      <div className="mx-auto max-w-4xl p-5">
        <Card className="overflow-visible">
          {/* -------------------------------------------------- Profile */}
          <FormSection title="Company profile" description="Who you are. The name shows across the app.">
            <Field label="Organization name" span={8} required>
              <Input
                value={org.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="e.g. Savannah Holdings Ltd"
              />
            </Field>
            <Field label="Registered legal name" span={4} hint="If different from the trading name">
              <Input value={org.legalName} onChange={(e) => update({ legalName: e.target.value })} />
            </Field>
            <Field label="Address" span={12}>
              <Textarea rows={2} value={org.address} onChange={(e) => update({ address: e.target.value })} placeholder="Street, building, P.O. Box" />
            </Field>
            <Field label="City / town" span={6}>
              <Input value={org.city} onChange={(e) => update({ city: e.target.value })} />
            </Field>
            <Field label="Country" span={6}>
              <Input value={org.country} onChange={(e) => update({ country: e.target.value })} />
            </Field>
            <Field label="Phone" span={4}>
              <Input value={org.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+254…" />
            </Field>
            <Field label="Email" span={4}>
              <Input type="email" value={org.email} onChange={(e) => update({ email: e.target.value })} placeholder="info@company.co.ke" />
            </Field>
            <Field label="Website" span={4}>
              <Input value={org.website} onChange={(e) => update({ website: e.target.value })} placeholder="https://…" />
            </Field>
          </FormSection>

          {/* -------------------------------------------------- Statutory + finance */}
          <FormSection
            title="Statutory & finance"
            description="Kenyan employer identifiers and finance defaults used across payroll and reports."
          >
            <Field label="KRA PIN" span={4}>
              <Input value={org.kraPin} onChange={(e) => update({ kraPin: e.target.value })} placeholder="P000000000A" className="font-mono" />
            </Field>
            <Field label="NSSF employer no." span={4}>
              <Input value={org.nssfEmployerNo} onChange={(e) => update({ nssfEmployerNo: e.target.value })} className="font-mono" />
            </Field>
            <Field label="SHIF employer no." span={4}>
              <Input value={org.shifEmployerNo} onChange={(e) => update({ shifEmployerNo: e.target.value })} className="font-mono" />
            </Field>
            <Field label="Base currency" span={6}>
              <Select
                value={org.baseCurrency}
                onChange={(e) => update({ baseCurrency: e.target.value })}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Field label="Fiscal year starts" span={6} hint="Kenya government FY starts in July">
              <Select
                value={String(org.fiscalYearStartMonth)}
                onChange={(e) => update({ fiscalYearStartMonth: Number(e.target.value) })}
                options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
              />
            </Field>
          </FormSection>

          {/* -------------------------------------------------- Branding */}
          <FormSection
            title="Branding"
            description="Your logo and brand colour. The colour re-themes buttons, links and active navigation instantly."
          >
            <div className="col-span-12 space-y-4">
              {/* Logo */}
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line"
                  style={{ background: org.branding.logoDataUrl ? undefined : org.branding.primaryColor }}
                >
                  {org.branding.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.branding.logoDataUrl} alt="Organization logo" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-h3 font-bold" style={{ color: brandText }}>
                      {org.branding.initials || 'EM'}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onLogoPick(e.target.files?.[0])}
                    />
                    <Button size="sm" variant="secondary" icon={UploadIcon} onClick={() => fileRef.current?.click()}>
                      Upload logo
                    </Button>
                    {org.branding.logoDataUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={XIcon}
                        onClick={() => {
                          updateBranding({ logoDataUrl: '' });
                          toast.success('Logo removed');
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-caption text-ink-subtle">PNG, JPG or SVG, under 512 KB. Used in the sidebar and top bar.</p>
                  {uploadError && <p className="text-caption text-danger">{uploadError}</p>}
                </div>
              </div>

              {/* Initials fallback */}
              <div className="max-w-[10rem]">
                <label className="mb-1 block text-small font-medium text-ink">Initials mark</label>
                <Input
                  value={org.branding.initials}
                  onChange={(e) => updateBranding({ initials: e.target.value.slice(0, 3).toUpperCase() })}
                  placeholder="EM"
                  className="w-24"
                />
                <p className="mt-1 text-caption text-ink-subtle">Shown when no logo is set.</p>
              </div>

              {/* Colours */}
              <div className="flex flex-wrap gap-6">
                <ColorField label="Primary colour" value={org.branding.primaryColor} onChange={(hex) => updateBranding({ primaryColor: hex })} />
                <ColorField label="Accent colour" value={org.branding.accentColor} onChange={(hex) => updateBranding({ accentColor: hex })} />
              </div>

              {/* Live preview */}
              <div className="rounded-control border border-line bg-surface-2 p-4">
                <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-subtle">Live preview</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-small font-medium text-primary-text">Active nav</span>
                  <a className="text-small font-medium text-primary underline">A themed link</a>
                </div>
              </div>
            </div>
          </FormSection>

          <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-5 py-3">
            <BuildingIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
            <p className="text-caption text-ink-muted">
              Every field saves as you type — there is no separate save button. On an on-prem install this is your single company profile.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
