'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, RefreshCwIcon } from 'lucide-react';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ProgressBar } from '../../../../components/ui/Progress';
import { StatTile } from '../../../../components/ui/StatTile';
import type { PayrollStep } from '../../../../types/payroll';

const OUTPUTS: Record<string, { label: string; value: string; }[]> = {
  structures: [
    { label: 'Employees matched', value: '1,248' },
    { label: 'Structures used', value: '9' },
    { label: 'Unmatched', value: '0' }],

  gross: [
    { label: 'Total gross', value: 'KSh 486,412,900.00' },
    { label: 'Average gross', value: 'KSh 389,754.00' },
    { label: 'Highest grade band', value: 'M4/3' }],

  paye: [
    { label: 'Total PAYE', value: 'KSh 58,269,600.00' },
    { label: 'Effective rate', value: '11.98%' },
    { label: 'Employees below threshold', value: '42' }],

  contributions: [
    { label: 'NSSF (employee)', value: 'KSh 38,913,000.00' },
    { label: 'Housing Levy', value: 'KSh 9,728,200.00' },
    { label: 'SHIF', value: 'KSh 7,296,100.00' }],

  net: [
    { label: 'Total net payable', value: 'KSh 357,247,800.00' },
    { label: 'Below net pay floor', value: '1' },
    { label: 'Zero net pay', value: '0' }]

};

export interface ComputeStepProps {
  step: PayrollStep;
  complete: boolean;
  onComplete: () => void;
}

/** Determinate progress with a real count. Navigation stays available while it runs. */
export function ComputeStep({ step, complete, onComplete }: ComputeStepProps) {
  const [processed, setProcessed] = useState(complete ? 1248 : 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setProcessed(complete ? 1248 : 0);
    setRunning(false);
  }, [step.id, complete]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setProcessed((p) => {
        const next = Math.min(1248, p + 156);
        if (next === 1248) {
          clearInterval(timer);
          setRunning(false);
          onComplete();
        }
        return next;
      });
    }, 110);
    return () => clearInterval(timer);
  }, [running, onComplete]);

  const outputs = OUTPUTS[step.id] ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={complete && !running ? 'Calculation complete' : 'Calculation'}
          description={
            running ?
              'You can leave this step while it runs — the run resumes where it left off.' :
              complete ?
                'Re-running recalculates every employee in scope and supersedes the previous figures.' :
                'Nothing is written to the ledger by this step.'
          }
          actions={
            <Button
              size="sm"
              icon={RefreshCwIcon}
              loading={running}
              onClick={() => {
                setProcessed(0);
                setRunning(true);
              }}>

              {complete ? 'Recalculate' : 'Run calculation'}
            </Button>
          } />

        <div className="px-4 py-4">
          <ProgressBar
            label={running ? 'Processing employees' : complete ? 'Processed' : 'Not started'}
            caption={`${processed.toLocaleString()} of 1,248 employees`}
            value={processed}
            max={1248}
            tone={complete && !running ? 'success' : 'primary'} />

          {complete && !running &&
            <p className="mt-3 flex items-center gap-1.5 text-small text-success">
              <CheckCircle2Icon className="h-4 w-4" aria-hidden />
              {step.didChange}
            </p>
          }
        </div>
      </Card>

      {complete && outputs.length > 0 &&
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {outputs.map((output, i) =>
            <StatTile key={output.label} emphasis={i === 0} label={output.label} value={output.value} />
          )}
        </div>
      }
    </div>);

}