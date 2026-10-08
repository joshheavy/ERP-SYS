'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2Icon, PenLineIcon } from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { StatTile } from '../../../../components/ui/StatTile';
import { FilterBar } from '../../../../components/data-table/FilterBar';
import { DataTable } from '../../../../components/data-table/DataTable';
import { Checkbox } from '../../../../components/ui/Choice';
import { REGISTER_ROWS } from '../../../../data/payroll';
import { REGISTER_COLUMNS } from '../../../../components/payroll/registerColumns';
import { formatMoney } from '../../../../utils/format';

export interface RegisterStepProps {
  complete: boolean;
  onComplete: () => void;
}

/** The full payroll register exactly as it will post. Sign-off records the officer's name. */
export function RegisterStep({ complete, onComplete }: RegisterStepProps) {
  const [query, setQuery] = useState('');
  const [confirmed, setConfirmed] = useState(complete);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REGISTER_ROWS;
    return REGISTER_ROWS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
    );
  }, [query]);

  const totalGross = REGISTER_ROWS.reduce((s, r) => s + r.gross, 0);
  const totalNet = REGISTER_ROWS.reduce((s, r) => s + r.net, 0);
  const totalDeductions = REGISTER_ROWS.reduce((s, r) => s + r.totalDeductions, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile emphasis label="Net payable" value={formatMoney(totalNet)} />
        <StatTile label="Gross pay" value={formatMoney(totalGross)} />
        <StatTile label="Total deductions" value={formatMoney(totalDeductions)} />
        <StatTile label="Employees" value={REGISTER_ROWS.length.toLocaleString()} footnote="All reconcile to net" />
      </div>

      <Card>
        <CardHeader
          title="Payroll register"
          description="The final register. Every earning and deduction column reconciles to net pay."
        />
        <div className="p-3">
          <DataTable
            caption="Payroll register preview"
            columns={REGISTER_COLUMNS}
            rows={rows}
            getRowId={(r) => r.id}
            pageSize={8}
            pinFirstColumn
            showTotals
            filtered={query.length > 0}
            onClearFilters={() => setQuery('')}
            maxBodyHeight="420px"
            toolbar={<FilterBar query={query} onQueryChange={setQuery} placeholder="Search employee" />}
          />
        </div>
      </Card>

      {complete ? (
        <p className="flex items-center gap-1.5 text-small text-success">
          <CheckCircle2Icon className="h-4 w-4" aria-hidden />
          Register signed off by Nancy Wambui, Senior Payroll Officer.
        </p>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Checkbox
              checked={confirmed}
              onChange={setConfirmed}
              label="I have reviewed the register and confirm these figures are correct"
              description="Sign-off is recorded against your name and the current timestamp."
            />
            <Button variant="primary" icon={PenLineIcon} disabled={!confirmed} onClick={onComplete}>
              Sign off register
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
