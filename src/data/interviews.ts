import { createCollection } from '../core/store/createCollection';
import type { DocumentStatus } from '../types/common';

/* ------------------------------------------------------------------ *
 * Interview Management — schedule and record interviews against
 * recruitment applications. An interview is scheduled, then completed
 * with an outcome (recommend / hold / reject) and a panel score. The
 * outcome drives the linked application forward (offer) or out (rejected).
 * ------------------------------------------------------------------ */

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';
export type InterviewMode = 'in-person' | 'video' | 'phone';
export type InterviewOutcome = 'recommend' | 'hold' | 'reject';

export interface Interview {
  id: string;
  reference: string;
  applicant: string;
  jobTitle: string;
  /** Interview round, e.g. 1 = first round, 2 = panel/final. */
  round: number;
  mode: InterviewMode;
  scheduledOn: string;
  /** Interview panel members. */
  panel: string[];
  status: InterviewStatus;
  /** Set once completed. */
  outcome: InterviewOutcome | null;
  /** Panel score out of 5, set on completion. */
  score: number | null;
  notes: string;
}

export const INTERVIEW_MODES: InterviewMode[] = ['in-person', 'video', 'phone'];
export const INTERVIEW_MODE_LABEL: Record<InterviewMode, string> = {
  'in-person': 'In person',
  video: 'Video call',
  phone: 'Phone'
};

export const INTERVIEW_STATUSES: InterviewStatus[] = ['scheduled', 'completed', 'cancelled'];
export const INTERVIEW_BADGE: Record<InterviewStatus, { status: DocumentStatus; label: string }> = {
  scheduled: { status: 'pending', label: 'Scheduled' },
  completed: { status: 'approved', label: 'Completed' },
  cancelled: { status: 'cancelled', label: 'Cancelled' }
};

export const INTERVIEW_OUTCOMES: InterviewOutcome[] = ['recommend', 'hold', 'reject'];
export const OUTCOME_LABEL: Record<InterviewOutcome, string> = {
  recommend: 'Recommend',
  hold: 'Hold',
  reject: 'Reject'
};
/** Tailwind pill classes per outcome (never colour alone — paired with the label). */
export const OUTCOME_PILL: Record<InterviewOutcome, string> = {
  recommend: 'bg-success-soft text-success',
  hold: 'bg-warning-soft text-warning',
  reject: 'bg-danger-soft text-danger'
};

const SEED_INTERVIEWS: Interview[] = [
  { id: 'itv-0001', reference: 'ITV-2026-0001', applicant: 'Kevin Omondi', jobTitle: 'Software Engineer', round: 1, mode: 'video', scheduledOn: '2026-01-28', panel: ['Faith Chebet', 'Brian Otieno'], status: 'completed', outcome: 'recommend', score: 4, notes: 'Strong technical fundamentals; good system-design answers.' },
  { id: 'itv-0002', reference: 'ITV-2026-0002', applicant: 'Dennis Kiptoo', jobTitle: 'HR Assistant', round: 1, mode: 'in-person', scheduledOn: '2026-01-30', panel: ['Mary Wanjiru'], status: 'scheduled', outcome: null, score: null, notes: '' },
  { id: 'itv-0003', reference: 'ITV-2026-0003', applicant: 'Ibrahim Hassan', jobTitle: 'Internal Auditor', round: 2, mode: 'in-person', scheduledOn: '2026-02-02', panel: ['Samuel Kiprono', 'David Kimani'], status: 'scheduled', outcome: null, score: null, notes: 'Final panel — focus on risk methodology.' }
];

export const interviewsStore = createCollection<Interview>('emtech.store.interviews.v1', SEED_INTERVIEWS, 'itv');
