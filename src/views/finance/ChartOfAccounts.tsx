'use client';

import React, { useMemo, useState } from 'react';
import { PlusIcon, PencilIcon, Trash2Icon, MoreHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/shell/PageHeader';
import { DataTable } from '../../components/data-table/DataTable';
import { FilterBar } from '../../components/data-table/FilterBar';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Choice';
import { StatTile } from '../../components/ui/StatTile';
import { FormSection, Field } from '../../components/forms/FormSection';
import { useCan } from '../../contexts/PreferencesContext';
import {
  accountsStore,
  ACCOUNT_TYPES,
  type AccountType,
  type LedgerAccount
} from '../../data/accounts';
import { journalsStore, postedMovementForAccount } from '../../data/ledger';
import { useCollection } from '../../core/store/createCollection';
import { ROUTE_META } from '../../data/navigation';
import { formatMoney } from '../../utils/format';
import type { Column } from '../../components/data-table/types';

interface AccountForm {
  code: string;
  name: string;
  type: AccountType;
  parent: string;
  postable: boolean;
  active: boolean;
  balance: number;
}

const emptyForm: AccountForm = { code: '', name: '', type: 'Asset', parent: '', postable: true, active: true, balance: 0 };

export function ChartOfAccounts() {
  const can = useCan();
  const accounts = useCollection(accountsStore);
  const journals = useCollection(journalsStore);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  // Drawer state: null = closed; 'new' = create; else the id being edited.
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };
  const openEdit = (a: LedgerAccount) => {
    setForm({ code: a.code, name: a.name, type: a.type, parent: a.parent, postable: a.postable, active: a.active, balance: a.balance });
    setEditing(a.id);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (type && a.type !== type) return false;
      if (!q) return true;
      return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    });
  }, [accounts, query, type]);

  const postableCount = accounts.filter((a) => a.postable).length;
  const activeCount = accounts.filter((a) => a.active).length;

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required');
      return;
    }
    if (editing === 'new') {
      accountsStore.create(form);
      toast.success(`Account ${form.code} created`);
    } else if (editing) {
      accountsStore.update(editing, form);
      toast.success(`Account ${form.code} updated`);
    }
    setEditing(null);
  };

  const remove = (a: LedgerAccount) => {
    accountsStore.remove(a.id);
    toast.success(`Account ${a.code} deleted`);
  };

  const columns: Column<LedgerAccount>[] = [
    { id: 'code', header: 'Code', width: 100, sortValue: (r) => r.code, cell: (r) => <span className="tabular">{r.code}</span> },
    {
      id: 'name', header: 'Account', width: 260, sortValue: (r) => r.name, cell: (r) => (
        <span className={r.parent === '' ? 'font-semibold text-ink' : undefined}>{r.name}</span>
      )
    },
    { id: 'type', header: 'Type', width: 120, sortValue: (r) => r.type, cell: (r) => r.type },
    { id: 'parent', header: 'Parent', width: 100, defaultHidden: true, sortValue: (r) => r.parent, cell: (r) => <span className="tabular">{r.parent || '—'}</span> },
    { id: 'postable', header: 'Postable', width: 100, sortValue: (r) => (r.postable ? 1 : 0), cell: (r) => (r.postable ? 'Yes' : 'Header') },
    { id: 'active', header: 'Status', width: 100, sortValue: (r) => (r.active ? 1 : 0), cell: (r) => (r.active ? 'Active' : 'Inactive') },
    { id: 'balance', header: 'Balance', numeric: true, width: 150, sortValue: (r) => r.balance, cell: (r) => (r.postable ? formatMoney(r.balance) : '—') },
    {
      id: 'posted',
      header: 'Posted movement',
      numeric: true,
      width: 168,
      sortValue: (r) => postedMovementForAccount(journals, r.code) ?? 0,
      cell: (r) => {
        const movement = postedMovementForAccount(journals, r.code);
        return movement === null ? <span className="text-ink-subtle">—</span> : <span className="tabular">{formatMoney(movement)}</span>;
      }
    }
  ];

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/finance/accounts']?.trail ?? ['Finance', 'Chart of accounts']}
        title="Chart of accounts"
        meta={
          <>
            <span className="tabular">{accounts.length} accounts</span>
            <span aria-hidden>·</span>
            <span>{postableCount} postable</span>
            <span aria-hidden>·</span>
            <span>Posted movement is live from the general ledger</span>
          </>
        }
        primaryAction={
          <Button variant="primary" icon={PlusIcon} disabled={!can.create} title={can.create ? undefined : 'Your role cannot add accounts'} onClick={openNew}>
            New account
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="Accounts" value={String(accounts.length)} />
          <StatTile label="Postable" value={String(postableCount)} footnote="Accept direct entries" />
          <StatTile label="Active" value={String(activeCount)} />
        </div>

        <DataTable
          caption="General ledger chart of accounts"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          pinFirstColumn
          filtered={Boolean(type) || query.length > 0}
          onClearFilters={() => {
            setType('');
            setQuery('');
          }}
          onRowClick={(r) => openEdit(r)}
          toolbar={
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search code or name"
              chips={type ? [{ id: 'type', label: 'Type', value: type }] : []}
              onRemoveChip={() => setType('')}
              onClearAll={() => {
                setType('');
                setQuery('');
              }}
              controls={
                <Select
                  className="w-44"
                  aria-label="Filter by type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[{ value: '', label: 'All types' }, ...ACCOUNT_TYPES.map((t) => ({ value: t, label: t }))]}
                />
              }
            />
          }
          rowActions={(r) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" iconOnly icon={PencilIcon} aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)} />
              <Button
                size="sm"
                variant="ghost"
                iconOnly
                icon={Trash2Icon}
                aria-label={`Delete ${r.name}`}
                disabled={!can.create}
                onClick={() => remove(r)}
              />
            </div>
          )}
        />
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="md"
        title={editing === 'new' ? 'New account' : 'Edit account'}
        subtitle={editing === 'new' ? 'Add a general ledger account' : form.code}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!can.create}>
              {editing === 'new' ? 'Create account' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="p-1">
          <FormSection title="Account details" description="Code, name and where it sits in the hierarchy.">
            <Field label="Code" span={6} required>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="font-mono" placeholder="e.g. 5401" />
            </Field>
            <Field label="Type" span={6} required>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
                options={ACCOUNT_TYPES.map((t) => ({ value: t, label: t }))}
              />
            </Field>
            <Field label="Name" span={12} required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Staff training" />
            </Field>
            <Field label="Parent code" span={6} hint="Blank for a top-level account">
              <Input value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className="font-mono" />
            </Field>
            <Field label="Opening balance" span={6}>
              <Input numeric type="number" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: Number(e.target.value) || 0 }))} />
            </Field>
          </FormSection>

          <FormSection title="Behaviour" description="How the account is used in posting.">
            <div className="col-span-12 space-y-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Postable (accepts direct entries)</span>
                <Toggle checked={form.postable} onChange={() => setForm((f) => ({ ...f, postable: !f.postable }))} aria-label="Postable" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-body text-ink">Active</span>
                <Toggle checked={form.active} onChange={() => setForm((f) => ({ ...f, active: !f.active }))} aria-label="Active" />
              </label>
            </div>
          </FormSection>
        </div>
      </Drawer>
    </div>
  );
}
