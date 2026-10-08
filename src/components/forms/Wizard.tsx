import React from 'react';
import { CheckIcon, CircleIcon, MinusIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type StepState = 'complete' | 'current' | 'pending' | 'blocked' | 'skipped';

export interface WizardStep {
  id: string;
  index: number;
  phase: string;
  title: string;
}

export interface WizardPhase {
  id: string;
  label: string;
}

export interface WizardRailProps {
  phases: WizardPhase[];
  steps: WizardStep[];
  currentId: string;
  stateFor: (step: WizardStep) => StepState;
  onNavigate: (step: WizardStep) => void;
  /** What has been committed so far, kept visible at the bottom of the rail. */
  summary?: React.ReactNode;
  className?: string;
}

const MARKERS: Record<StepState, {className: string;icon: React.ReactNode;}> = {
  complete: {
    className: 'border-success bg-success text-white',
    icon: <CheckIcon className="h-2.5 w-2.5" strokeWidth={3.5} />
  },
  current: {
    className: 'border-primary bg-primary text-white',
    icon: <CircleIcon className="h-1.5 w-1.5 fill-current" />
  },
  blocked: {
    className: 'border-danger bg-danger-soft text-danger',
    icon: <XIcon className="h-2.5 w-2.5" strokeWidth={3.5} />
  },
  skipped: {
    className: 'border-line-strong bg-surface text-ink-subtle',
    icon: <MinusIcon className="h-2.5 w-2.5" strokeWidth={3} />
  },
  pending: { className: 'border-line-strong bg-surface text-ink-subtle', icon: null }
};

export function WizardRail({
  phases,
  steps,
  currentId,
  stateFor,
  onNavigate,
  summary,
  className
}: WizardRailProps) {
  return (
    <nav aria-label="Payroll run steps" className={cn('flex flex-col', className)}>
      <ol className="flex-1 px-3 py-3">
        {phases.map((phase) => {
          const phaseSteps = steps.filter((s) => s.phase === phase.id);
          const done = phaseSteps.filter((s) => stateFor(s) === 'complete').length;
          return (
            <li key={phase.id} className="mb-3 last:mb-0">
              <div className="mb-1 flex items-baseline justify-between px-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                  {phase.label}
                </span>
                <span className="tabular text-caption text-ink-subtle">
                  {done}/{phaseSteps.length}
                </span>
              </div>
              <ol>
                {phaseSteps.map((step) => {
                  const state = stateFor(step);
                  const marker = MARKERS[state];
                  const active = step.id === currentId;
                  const reachable = state === 'complete' || state === 'current' || state === 'blocked';
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        aria-current={active ? 'step' : undefined}
                        disabled={!reachable}
                        onClick={() => onNavigate(step)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-control px-1.5 py-1 text-left',
                          'transition-colors duration-fast ease-exit',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          active ? 'bg-primary-soft' : reachable ? 'hover:bg-surface-3' : 'cursor-not-allowed'
                        )}>
                        
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                            marker.className
                          )}
                          aria-hidden>
                          
                          {marker.icon}
                        </span>
                        <span className="tabular w-4 shrink-0 text-caption text-ink-subtle">{step.index}</span>
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate text-small',
                            active ?
                            'font-semibold text-ink' :
                            state === 'complete' ?
                            'text-ink-muted' :
                            state === 'blocked' ?
                            'font-medium text-danger' :
                            'text-ink-subtle'
                          )}>
                          
                          {step.title}
                        </span>
                      </button>
                    </li>);

                })}
              </ol>
            </li>);

        })}
      </ol>
      {summary && <div className="border-t border-line px-3 py-3">{summary}</div>}
    </nav>);

}

export interface StepFrameProps {
  step: WizardStep;
  totalSteps: number;
  title: string;
  /** Stated before the step runs. */
  willChange?: string;
  /** Stated after the step has run. */
  didChange?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Named reason the gate is closed. */
  gate?: string;
}

export function StepFrame({
  step,
  totalSteps,
  title,
  willChange,
  didChange,
  children,
  footer,
  gate
}: StepFrameProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-line px-5 py-4">
        <p className="tabular text-caption font-medium uppercase tracking-wide text-ink-subtle">
          Step {step.index} of {totalSteps} · {step.phase}
        </p>
        <h1 className="mt-1 text-h1 text-ink">{title}</h1>
        {didChange ?
        <p className="mt-2 flex items-start gap-1.5 text-small text-success">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {didChange}
          </p> :

        willChange && <p className="mt-2 max-w-3xl text-small text-ink-muted">{willChange}</p>
        }
      </header>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-5 py-3">
        {gate &&
        <p className="mr-auto flex items-center gap-1.5 text-small text-danger">
            <XIcon className="h-3.5 w-3.5" aria-hidden />
            {gate}
          </p>
        }
        {!gate && <span className="mr-auto" />}
        {footer}
      </footer>
    </div>);

}