'use client';

import React, { useMemo, useState } from 'react';
import { UploadIcon, EraserIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import { StatTile } from '../../components/ui/StatTile';
import { DataTable } from '../../components/data-table/DataTable';
import { useCan } from '../../contexts/PreferencesContext';
import { holidaysStore, HOLIDAY_TYPES, type Holiday } from '../../data/holidays';
import { jobRolesStore, jobStepsStore, type JobRole, type JobStep } from '../../data/orgStructure';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';

/* ------------------------------------------------------------------ *
 * A bulk-upload target describes the columns expected in the CSV and
 * how to turn one parsed row into a record for its store. Each returns
 * either a record or an error string per row (validated before import).
 * ------------------------------------------------------------------ */
interface UploadTarget<T> {
  id: string;
  label: string;
  columns: string[];
  sample: string;
  /** Validate + map a parsed row (header->value) to a record, or return an error. */
  build: (row: Record<string, string>) => { record: Omit<T, 'id'> } | { error: string };
  add: (record: Omit<T, 'id'>) => void;
}

const holidayTarget: UploadTarget<Holiday> = {
  id: 'holidays',
  label: 'Holidays',
  columns: ['name', 'date', 'type', 'recurring'],
  sample: 'name,date,type,recurring\nEidul Fitr,2026-03-20,public,false\nStrategy day,2026-09-05,company,false',
  build: (row) => {
    const name = row.name?.trim();
    const date = row.date?.trim();
    const type = row.type?.trim().toLowerCase();
    if (!name) return { error: 'Missing name' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return { error: 'Date must be YYYY-MM-DD' };
    if (type !== 'public' && type !== 'company') return { error: "Type must be 'public' or 'company'" };
    return { record: { name, date, type: type as Holiday['type'], recurring: /^(true|yes|1)$/i.test(row.recurring?.trim() ?? ''), notes: '' } };
  },
  add: (r) => { holidaysStore.create(r); }
};

const jobRoleTarget: UploadTarget<JobRole> = {
  id: 'roles',
  label: 'Job roles',
  columns: ['title', 'grade', 'department', 'headcount'],
  sample: 'title,grade,department,headcount\nRisk Analyst,G3,Internal Audit,1\nHelpdesk Officer,G2,Information Technology,2',
  build: (row) => {
    const title = row.title?.trim();
    const grade = row.grade?.trim();
    const department = row.department?.trim();
    const headcount = Number(row.headcount?.trim());
    if (!title) return { error: 'Missing title' };
    if (!grade) return { error: 'Missing grade' };
    if (!department) return { error: 'Missing department' };
    if (!Number.isFinite(headcount) || headcount < 0) return { error: 'Headcount must be a number' };
    return { record: { title, grade, department, headcount } };
  },
  add: (r) => { jobRolesStore.create(r); }
};

const jobStepTarget: UploadTarget<JobStep> = {
  id: 'steps',
  label: 'Job steps',
  columns: ['grade', 'notch', 'salary'],
  sample: 'grade,notch,salary\nG3,4,238000\nG4,3,300000',
  build: (row) => {
    const grade = row.grade?.trim();
    const notch = Number(row.notch?.trim());
    const salary = Number(row.salary?.trim());
    if (!grade) return { error: 'Missing grade' };
    if (!Number.isFinite(notch) || notch < 1) return { error: 'Notch must be a positive number' };
    if (!Number.isFinite(salary) || salary <= 0) return { error: 'Salary must be a positive number' };
    return { record: { grade, notch, code: `${grade}/${notch}`, salary } };
  },
  add: (r) => { jobStepsStore.create(r); }
};

// Each target is strongly typed at its own definition above; the collection
// erases the record type to `unknown` so differently-typed targets can live in
// one array. `build`/`add` stay internally consistent per target.
const TARGETS: UploadTarget<unknown>[] = [
  holidayTarget as UploadTarget<unknown>,
  jobRoleTarget as UploadTarget<unknown>,
  jobStepTarget as UploadTarget<unknown>
];

interface PreviewRow {
  id: string;
  line: number;
  valid: boolean;
  message: string;
  values: Record<string, string>;
  record?: Record<string, unknown>;
}

/** Minimal CSV parse: comma-separated, first line = header. No quoted-comma support (prototype). */
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

export function BulkUploads() {
  const can = useCan();
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const [csv, setCsv] = useState('');
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);

  const target = TARGETS.find((t) => t.id === targetId)!;

  const validate = () => {
    const { rows } = parseCsv(csv);
    if (rows.length === 0) { toast.error('Paste at least a header row and one data row'); return; }
    const result: PreviewRow[] = rows.map((values, i) => {
      const built = target.build(values);
      if ('error' in built) return { id: `r${i}`, line: i + 2, valid: false, message: built.error, values };
      return { id: `r${i}`, line: i + 2, valid: true, message: 'Ready', values, record: built.record };
    });
    setPreview(result);
  };

  const validCount = preview?.filter((r) => r.valid).length ?? 0;
  const invalidCount = preview?.filter((r) => !r.valid).length ?? 0;

  const runImport = () => {
    if (!preview) return;
    const valid = preview.filter((r) => r.valid && r.record);
    valid.forEach((r) => target.add(r.record!));
    toast.success(`Imported ${valid.length} ${target.label.toLowerCase()}`, {
      description: invalidCount ? `${invalidCount} row(s) skipped due to errors.` : undefined
    });
    setPreview(null);
    setCsv('');
  };

  const reset = () => { setPreview(null); setCsv(''); };

  const columns: Column<PreviewRow>[] = useMemo(() => [
    { id: 'line', header: 'Line', width: 70, numeric: true, sortValue: (r) => r.line, cell: (r) => r.line },
    ...target.columns.map((c) => ({
      id: c,
      header: c,
      width: 160,
      sortValue: (r: PreviewRow) => r.values[c] ?? '',
      cell: (r: PreviewRow) => <span className="block truncate">{r.values[c] ?? '—'}</span>
    })),
    {
      id: 'status', header: 'Status', width: 200, sortValue: (r) => (r.valid ? 'ok' : 'err'),
      cell: (r) => (r.valid ? <span className="text-success">{r.message}</span> : <span className="text-danger">{r.message}</span>),
      tone: (r: PreviewRow) => (r.valid ? 'success' : 'danger') as 'success' | 'danger'
    }
  ], [target]);

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/bulk-uploads']?.trail ?? ['Human Resources', 'Tools', 'Bulk uploads']}
        title="Bulk uploads"
        meta={<span>Import records in bulk from CSV.</span>}
        primaryAction={
          preview && (
            <Button
              variant="primary"
              icon={CheckIcon}
              disabled={!can.create || validCount === 0}
              title={can.create ? undefined : 'Your role cannot import records'}
              onClick={runImport}
            >
              Import {validCount} row{validCount === 1 ? '' : 's'}
            </Button>
          )
        }
      />

      <div className="space-y-4 p-5">
        <Card>
          <CardHeader title="Source" description="Choose what you are importing, then paste CSV rows (first line = column headers)." />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-5">
                <label className="mb-1 block text-small font-medium text-ink">Import into</label>
                <Select
                  value={targetId}
                  onChange={(e) => { setTargetId(e.target.value); setPreview(null); }}
                  options={TARGETS.map((t) => ({ value: t.id, label: t.label }))}
                />
                <p className="mt-2 text-caption text-ink-subtle">Columns: <span className="tabular">{target.columns.join(', ')}</span></p>
              </div>
              <div className="col-span-12 sm:col-span-7">
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-small font-medium text-ink">CSV data</label>
                  <button type="button" className="text-caption text-primary-text hover:underline" onClick={() => setCsv(target.sample)}>
                    Load sample
                  </button>
                </div>
                <Textarea rows={7} value={csv} onChange={(e) => setCsv(e.target.value)} className="font-mono text-small" placeholder={target.sample} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button icon={UploadIcon} onClick={validate} disabled={!csv.trim()}>Validate & preview</Button>
              {(csv || preview) && <Button variant="ghost" icon={EraserIcon} onClick={reset}>Clear</Button>}
            </div>
          </div>
        </Card>

        {preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile emphasis label="Ready to import" value={String(validCount)} />
              <StatTile label="With errors" value={String(invalidCount)} footnote={invalidCount ? 'Skipped on import' : undefined} />
              <StatTile label="Total rows" value={String(preview.length)} />
            </div>
            <DataTable
              caption="Import preview"
              columns={columns}
              rows={preview}
              getRowId={(r) => r.id}
              pinFirstColumn
              exportable={false}
              emptyTitle="Nothing parsed"
              emptyDescription="Paste CSV data and validate to preview rows."
            />
          </div>
        )}
      </div>
    </div>
  );
}
