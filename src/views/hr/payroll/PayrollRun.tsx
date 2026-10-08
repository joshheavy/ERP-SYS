'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNav } from '../../../hooks/useNav';
import { Button } from '../../../components/ui/Button';
import { StepFrame, WizardRail, type StepState, type WizardStep } from '../../../components/forms/Wizard';
import { useCan } from '../../../contexts/PreferencesContext';
import {
  ADJUSTMENT_BATCH,
  ATTENDANCE_BATCH,
  LOAN_BATCH,
  LWOP_BATCH,
  OVERTIME_BATCH,
  PAYROLL_PHASES,
  PAYROLL_STEPS
} from '../../../data/payroll';
import { formatMoney } from '../../../utils/format';
import type { InputBatchRow, PayrollStep } from '../../../types/payroll';
import { PeriodStep, ScopeStep } from './steps/SetupStep';
import { ComputeStep } from './steps/ComputeStep';
import { InputTableStep } from './steps/InputTableStep';
import { ExceptionStep, VarianceStep } from './steps/ReviewSteps';
import { RegisterStep } from './steps/RegisterStep';
import { CommitStep } from './steps/CommitStep';
import type { PeriodGranularity } from '../../../components/ui/DatePicker';

const INPUT_BATCHES: Record<string, InputBatchRow[]> = {
  attendance: ATTENDANCE_BATCH,
  lwop: LWOP_BATCH,
  overtime: OVERTIME_BATCH,
  allowances: ADJUSTMENT_BATCH,
  loans: LOAN_BATCH
};

/** Steps 1–12 are pre-completed for the demo draft; the officer resumes at the exception report. */
const INITIALLY_COMPLETE = PAYROLL_STEPS.filter((s) => s.index <= 12).map((s) => s.id);

const RAIL_STEPS: WizardStep[] = PAYROLL_STEPS.map((s) => ({
  id: s.id,
  index: s.index,
  phase: s.phase,
  title: s.title
}));

export function PayrollRun() {
  const navigate = useNav();
  const can = useCan();

  const [completed, setCompleted] = useState<string[]>(INITIALLY_COMPLETE);
  const [currentId, setCurrentId] = useState<string>('exceptions');

  // Setup-step form state, so the wizard behaves like a real run.
  const [period, setPeriod] = useState('2026-09');
  const [payGroups, setPayGroups] = useState<string[]>(['management', 'senior', 'junior']);
  const [payDate, setPayDate] = useState('2026-09-26');
  const [runType, setRunType] = useState('regular');

  const current = PAYROLL_STEPS.find((s) => s.id === currentId) ?? PAYROLL_STEPS[0];
  const currentIndex = PAYROLL_STEPS.findIndex((s) => s.id === currentId);
  const isComplete = completed.includes(currentId);

  const stateFor = useCallback(
    (step: WizardStep): StepState => {
      if (step.id === currentId) return 'current';
      if (completed.includes(step.id)) return 'complete';
      return 'pending';
    },
    [completed, currentId]
  );

  const gate = useMemo(() => {
    // The exception report blocks forward movement until its blocking items clear.
    if (currentId === 'exceptions' && !completed.includes('exceptions')) {
      return 'Clear the blocking exceptions on this step before continuing.';
    }
    return undefined;
  }, [currentId, completed]);

  const goTo = (step: WizardStep) => setCurrentId(step.id);

  const markComplete = useCallback(
    (id: string) => setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id])),
    []
  );

  const advance = () => {
    markComplete(currentId);
    const next = PAYROLL_STEPS[currentIndex + 1];
    if (next) {
      setCurrentId(next.id);
    } else {
      toast.success('Payroll run complete', {
        description: 'September 2026 posted and disbursed. The run is now read-only.'
      });
      navigate('/hr/payroll');
    }
  };

  const back = () => {
    const prev = PAYROLL_STEPS[currentIndex - 1];
    if (prev) setCurrentId(prev.id);
  };

  const doneCount = completed.length;

  return (
    <div className="flex h-full min-h-0">
      <aside className="thin-scroll hidden w-[264px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface md:flex">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">Run payroll</p>
            <h2 className="truncate text-h3 text-ink">September 2026</h2>
          </div>
          <Button size="sm" variant="ghost" iconOnly icon={XIcon} aria-label="Exit run" onClick={() => navigate('/hr/payroll')} />
        </div>
        <WizardRail
          phases={PAYROLL_PHASES}
          steps={RAIL_STEPS}
          currentId={currentId}
          stateFor={stateFor}
          onNavigate={goTo}
          summary={
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-caption text-ink-subtle">Progress</dt>
                <dd className="tabular text-caption font-medium text-ink">
                  {doneCount}/{PAYROLL_STEPS.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-caption text-ink-subtle">Net payable</dt>
                <dd className="tabular text-caption font-medium text-ink">{formatMoney(357247800)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-caption text-ink-subtle">Employees</dt>
                <dd className="tabular text-caption font-medium text-ink">1,248</dd>
              </div>
            </dl>
          }
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <StepFrame
          step={{ id: current.id, index: current.index, phase: current.phase, title: current.title }}
          totalSteps={PAYROLL_STEPS.length}
          title={current.title}
          willChange={isComplete ? undefined : current.willChange}
          didChange={isComplete ? current.didChange : undefined}
          gate={gate}
          footer={
            <>
              <Button variant="ghost" icon={ArrowLeftIcon} disabled={currentIndex === 0} onClick={back}>
                Back
              </Button>
              <Button
                variant="primary"
                trailingIcon={ArrowRightIcon}
                disabled={Boolean(gate)}
                onClick={advance}
              >
                {currentIndex === PAYROLL_STEPS.length - 1 ? 'Finish run' : 'Continue'}
              </Button>
            </>
          }
        >
          <StepBody
            step={current}
            complete={isComplete}
            canApprove={can.approve}
            onComplete={() => markComplete(current.id)}
            period={period}
            onPeriodChange={(p: string) => setPeriod(p)}
            payGroups={payGroups}
            onPayGroupsChange={setPayGroups}
            payDate={payDate}
            onPayDateChange={setPayDate}
            runType={runType}
            onRunTypeChange={setRunType}
          />
        </StepFrame>
      </div>
    </div>
  );
}

interface StepBodyProps {
  step: PayrollStep;
  complete: boolean;
  canApprove: boolean;
  onComplete: () => void;
  period: string;
  onPeriodChange: (period: string, granularity: PeriodGranularity) => void;
  payGroups: string[];
  onPayGroupsChange: (groups: string[]) => void;
  payDate: string;
  onPayDateChange: (value: string) => void;
  runType: string;
  onRunTypeChange: (value: string) => void;
}

/** Routes each step id to the right body. Every step kind has a home here. */
function StepBody(props: StepBodyProps) {
  const { step, complete, canApprove, onComplete } = props;

  // Setup phase
  if (step.id === 'period') {
    return (
      <PeriodStep
        period={props.period}
        onPeriodChange={props.onPeriodChange}
        payGroups={props.payGroups}
        onPayGroupsChange={props.onPayGroupsChange}
        payDate={props.payDate}
        onPayDateChange={props.onPayDateChange}
        runType={props.runType}
        onRunTypeChange={props.onRunTypeChange}
      />
    );
  }
  if (step.id === 'scope') return <ScopeStep />;

  // Compute phase (also the setup 'structures' validation)
  if (step.kind === 'compute') {
    return <ComputeStep step={step} complete={complete} onComplete={onComplete} />;
  }

  // Inputs phase
  if (step.kind === 'input-table') {
    return <InputTableStep step={step} rows={INPUT_BATCHES[step.id] ?? []} complete={complete} onComplete={onComplete} />;
  }

  // Review phase
  if (step.id === 'exceptions') return <ExceptionStep complete={complete} onComplete={onComplete} />;
  if (step.id === 'variance') return <VarianceStep complete={complete} onComplete={onComplete} />;
  if (step.id === 'register') return <RegisterStep complete={complete} onComplete={onComplete} />;

  // Commit phase
  if (step.kind === 'commit') {
    return <CommitStep step={step} complete={complete} canApprove={canApprove} onComplete={onComplete} />;
  }

  return null;
}
