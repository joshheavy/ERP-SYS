'use client';

import React, { useState } from 'react';
import {
  BoxIcon,
  DownloadIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, CardHeader, EmptyState, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Checkbox, RadioGroup, Toggle } from '../../components/ui/Choice';
import { Tabs, Segmented } from '../../components/ui/Tabs';
import { Tooltip } from '../../components/ui/Tooltip';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressBar } from '../../components/ui/Progress';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { SearchableMultiSelect } from '../../components/ui/SearchableMultiSelect';
import { FileUpload, type UploadedFile } from '../../components/ui/FileUpload';
import { DataTable } from '../../components/data-table/DataTable';
import { StatusBadge } from '../../components/approval/StatusBadge';
import { StatusTimeline, ApprovalChain } from '../../components/approval/StatusTimeline';
import { MakerCheckerBanner } from '../../components/approval/Decision';
import { ROUTE_META } from '../../data/navigation';
import type { Column } from '../../components/data-table/types';
import type { DocumentStatus } from '../../types/common';

const SECTIONS = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'data', label: 'Data display' },
  { id: 'approval', label: 'Approval kit' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'states', label: 'States' }
];

function Block({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} level={3} />
      <div className="p-4">{children}</div>
    </Card>
  );
}

const DEMO_STATUSES: DocumentStatus[] = ['draft', 'submitted', 'pending', 'approved', 'rejected', 'posted', 'cancelled'];

interface DemoRow {
  id: string;
  item: string;
  qty: number;
  value: number;
}
const DEMO_ROWS: DemoRow[] = [
  { id: 'r1', item: 'Laptop — 14"', qty: 12, value: 3576000 },
  { id: 'r2', item: 'Docking station', qty: 12, value: 576000 },
  { id: 'r3', item: 'Carry case', qty: 12, value: 144000 }
];

export function ComponentGallery() {
  const [section, setSection] = useState('foundations');
  const [tab, setTab] = useState('all');
  const [checked, setChecked] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [radio, setRadio] = useState('officer');
  const [multi, setMulti] = useState<string[]>(['management']);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const demoColumns: Column<DemoRow>[] = [
    { id: 'item', header: 'Item', width: 220, sortValue: (r) => r.item, cell: (r) => r.item },
    { id: 'qty', header: 'Qty', numeric: true, width: 90, sortValue: (r) => r.qty, cell: (r) => r.qty, total: (all) => all.reduce((s, r) => s + r.qty, 0) },
    { id: 'value', header: 'Value', numeric: true, width: 150, sortValue: (r) => r.value, cell: (r) => `KSh ${r.value.toLocaleString()}`, total: (all) => `KSh ${all.reduce((s, r) => s + r.value, 0).toLocaleString()}` }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/gallery'].trail}
        title="Component gallery"
        meta={<span>Every core component and its states — the system 700+ screens are built from.</span>}
        tabs={<Segmented aria-label="Gallery sections" items={SECTIONS} value={section} onChange={setSection} />}
      />

      <div className="mx-auto max-w-5xl space-y-5 p-5">
        {section === 'foundations' && (
          <>
            <Block title="Colour tokens" description="Neutrals for structure, one primary, and semantic tones. Dark mode is a first-class token set.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { name: 'Primary', className: 'bg-primary' },
                  { name: 'Success', className: 'bg-success' },
                  { name: 'Warning', className: 'bg-warning' },
                  { name: 'Danger', className: 'bg-danger' },
                  { name: 'Info', className: 'bg-info' },
                  { name: 'Surface', className: 'bg-surface border border-line' },
                  { name: 'Surface 2', className: 'bg-surface-2 border border-line' },
                  { name: 'Canvas', className: 'bg-canvas border border-line' }
                ].map((swatch) => (
                  <div key={swatch.name}>
                    <div className={`h-12 rounded-control ${swatch.className}`} />
                    <p className="mt-1 text-caption text-ink-muted">{swatch.name}</p>
                  </div>
                ))}
              </div>
            </Block>
            <Block title="Typography" description="One clean sans, with a tabular style for every number and ID.">
              <div className="space-y-1">
                <p className="text-display text-ink">Display · KSh 486,412,900.00</p>
                <p className="text-h1 text-ink">Heading 1 · Payroll runs</p>
                <p className="text-h2 text-ink">Heading 2 · Section title</p>
                <p className="text-h3 text-ink">Heading 3 · Card header</p>
                <p className="text-body text-ink">Body · The quick brown fox jumps over the lazy dog.</p>
                <p className="text-small text-ink-muted">Small · Supporting copy and captions.</p>
                <p className="tabular text-caption text-ink-subtle">Caption / tabular · EMP-0148 · 1,234,567.50</p>
              </div>
            </Block>
          </>
        )}

        {section === 'buttons' && (
          <>
            <Block title="Variants" description="Primary, secondary, ghost and danger — one meaning each, everywhere.">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </Block>
            <Block title="Sizes & icons">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" icon={PlusIcon}>Small</Button>
                <Button size="md" icon={DownloadIcon}>Medium</Button>
                <Button size="lg" variant="primary" icon={PlusIcon}>Large</Button>
                <Button iconOnly icon={Trash2Icon} variant="ghost" aria-label="Delete" />
                <Tooltip label="With a tooltip" shortcut="⌘K">
                  <Button variant="secondary" icon={SearchIcon}>Hover me</Button>
                </Tooltip>
              </div>
            </Block>
          </>
        )}

        {section === 'inputs' && (
          <>
            <Block title="Text inputs" description="Default, focus, invalid, numeric, with icon, and permission-locked.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input placeholder="Default input" />
                <Input placeholder="With icon" icon={SearchIcon} />
                <Input placeholder="Invalid" invalid defaultValue="Not valid" />
                <Input numeric placeholder="0.00" suffix="KSh" defaultValue="298000" />
                <Input placeholder="Read-only for your role" noPermission defaultValue="Locked" />
                <Select options={[{ value: '1', label: 'Select option one' }, { value: '2', label: 'Option two' }]} />
              </div>
              <Textarea className="mt-4" placeholder="A multi-line textarea for reasons and notes." />
            </Block>
            <Block title="Choices">
              <div className="flex flex-col gap-4">
                <Checkbox checked={checked} onChange={setChecked} label="Send me a copy" description="A confirmation email after posting." />
                <Checkbox checked={false} indeterminate onChange={() => undefined} label="Indeterminate state" />
                <Toggle checked={toggle} onChange={setToggle} label="Enable dark mode by default" />
                <RadioGroup
                  name="role"
                  value={radio}
                  onChange={setRadio}
                  options={[
                    { value: 'officer', label: 'Officer', description: 'Creates and posts documents.' },
                    { value: 'manager', label: 'Manager', description: 'Approves what officers create.' },
                    { value: 'auditor', label: 'Auditor', description: 'Read-only access to history.' }
                  ]}
                />
              </div>
            </Block>
            <Block title="Searchable multi-select">
              <SearchableMultiSelect
                label="Pay groups"
                options={[
                  { value: 'management', label: 'Management', meta: '84' },
                  { value: 'senior', label: 'Senior staff', meta: '512' },
                  { value: 'junior', label: 'Junior staff', meta: '652' },
                  { value: 'contract', label: 'Contract & locum', meta: '96' }
                ]}
                value={multi}
                onChange={setMulti}
              />
            </Block>
            <Block title="File upload">
              <FileUpload
                label="Supporting documents"
                files={files}
                onAdd={(names) => setFiles((prev) => [...prev, ...names.map((name, i) => ({ id: `f${prev.length + i}`, name, size: '242 KB', progress: 100 }))])}
                onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
              />
            </Block>
          </>
        )}

        {section === 'data' && (
          <>
            <Block title="Stat tiles">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile emphasis label="Net payable" value="KSh 357.2M" change={{ value: '+1.5%', direction: 'up', caption: 'vs. Aug', good: false }} />
                <StatTile label="Pending approvals" value="7" footnote="2 past SLA" />
                <StatTile label="Loading" value="" loading />
              </div>
            </Block>
            <Block title="Progress bars">
              <div className="space-y-3">
                <ProgressBar label="Primary" value={62} max={100} caption="62%" />
                <ProgressBar label="Warning" value={88} max={100} caption="88%" tone="warning" />
                <ProgressBar label="Danger" value={104} max={100} caption="104%" tone="danger" />
                <ProgressBar label="Success" value={100} max={100} caption="Complete" tone="success" />
              </div>
            </Block>
            <Block title="DataTable" description="Sortable, paginated, with totals and a density toggle. The single most important component.">
              <DataTable caption="Demo table" columns={demoColumns} rows={DEMO_ROWS} getRowId={(r) => r.id} showTotals pageSize={5} />
            </Block>
            <Block title="Tabs">
              <Tabs aria-label="Demo tabs" value={tab} onChange={setTab} items={[{ id: 'all', label: 'All', count: 12 }, { id: 'open', label: 'Open', count: 4 }, { id: 'closed', label: 'Closed' }]} />
            </Block>
          </>
        )}

        {section === 'approval' && (
          <>
            <Block title="Status badges" description="Every document status maps to a single, consistent badge.">
              <div className="flex flex-wrap gap-2">
                {DEMO_STATUSES.map((s) => (
                  <StatusBadge key={s} status={s} />
                ))}
              </div>
            </Block>
            <Block title="Maker-checker banner">
              <MakerCheckerBanner documentReference="REQ-2026-0414" />
            </Block>
            <Block title="Approval chain">
              <ApprovalChain
                stages={[
                  { id: 's1', label: 'Head of Department', approver: 'Brian Otieno', approverRole: 'Head of IT', state: 'complete', at: '2026-09-11T15:20:00' },
                  { id: 's2', label: 'Procurement review', approver: 'Hassan Abdi', approverRole: 'Procurement Manager', state: 'complete', at: '2026-09-12T10:05:00' },
                  { id: 's3', label: 'Finance approval', approver: 'David Kimani', approverRole: 'Head of Finance', state: 'current' },
                  { id: 's4', label: 'Executive approval', approver: 'Not required', approverRole: 'Threshold KSh 10M', state: 'skipped' }
                ]}
              />
            </Block>
            <Block title="Status timeline">
              <StatusTimeline
                events={[
                  { id: 't1', actor: 'Wanjiku Kamau', actorRole: 'Analyst', action: 'created the requisition', at: '2026-09-11T09:42:00', outcome: 'created' },
                  { id: 't2', actor: 'Wanjiku Kamau', actorRole: 'Analyst', action: 'submitted for approval', at: '2026-09-11T11:15:00', outcome: 'submitted' },
                  { id: 't3', actor: 'Brian Otieno', actorRole: 'Head of IT', action: 'approved at stage 1', at: '2026-09-11T15:20:00', outcome: 'approved', comment: 'Matches the standard build.' }
                ]}
              />
            </Block>
          </>
        )}

        {section === 'overlays' && (
          <Block title="Modals and drawers" description="Dialogs for focused decisions; a right drawer for detail without losing context.">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setModalOpen(true)}>Open modal</Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirm dialog</Button>
              <Button variant="secondary" icon={PackageIcon} onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            </div>
          </Block>
        )}

        {section === 'states' && (
          <>
            <Block title="Loading skeleton">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Block>
            <Block title="Empty state">
              <EmptyState icon={BoxIcon} title="Nothing here yet" description="Records will appear here once they are created." action={<Button size="sm" icon={PlusIcon}>Create the first one</Button>} />
            </Block>
            <Block title="Error state">
              <EmptyState tone="error" icon={BoxIcon} title="Could not load this list" description="The request failed. Retry, or contact support if it persists." action={<Button size="sm">Retry</Button>} />
            </Block>
            <Block title="No-permission state">
              <EmptyState tone="locked" icon={BoxIcon} title="You cannot view this" description="Your current role does not include permission to see these records." />
            </Block>
            <Block title="DataTable — permission & loading states">
              <div className="space-y-4">
                <DataTable caption="Loading demo" columns={demoColumns} rows={[]} getRowId={(r) => r.id} state="loading" />
                <DataTable caption="No permission demo" columns={demoColumns} rows={[]} getRowId={(r) => r.id} state="no-permission" />
              </div>
            </Block>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example modal" description="A focused dialog for a single task." footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setModalOpen(false)}>Save</Button></>}>
        <p className="text-body text-ink-muted">Modals trap focus, close on Escape and dim the surface behind them. Use them for short, self-contained tasks.</p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success('Confirmed');
        }}
        title="Delete this record?"
        tone="danger"
        confirmLabel="Delete record"
        requireReference="DELETE"
        message={<span>This cannot be undone. Type <strong className="tabular">DELETE</strong> to confirm.</span>}
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Detail drawer" subtitle="Context stays behind it" width="md" headerAccessory={<StatusBadge status="pending" />}>
        <p className="text-body text-ink-muted">Drawers slide in from the right so the list behind stays visible. Ideal for record detail in a data-dense product.</p>
      </Drawer>
    </div>
  );
}
