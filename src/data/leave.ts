import type { LeaveBalance, LeaveRequest, Payslip, TeamAbsence } from '../types/leave';

export const PUBLIC_HOLIDAYS = ['2026-10-01', '2026-12-25', '2026-12-26'];

export const LEAVE_BALANCES: LeaveBalance[] = [
  { type: 'annual', label: 'Annual leave', entitlement: 24, taken: 11, pending: 0 },
  { type: 'sick', label: 'Sick leave', entitlement: 12, taken: 2, pending: 0 },
  { type: 'compassionate', label: 'Compassionate', entitlement: 5, taken: 0, pending: 0 },
  { type: 'study', label: 'Study leave', entitlement: 10, taken: 0, pending: 0 }];


export const LEAVE_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual leave' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'compassionate', label: 'Compassionate leave' },
  { value: 'study', label: 'Study leave' }];


export const RELIEVER_OPTIONS = [
  { value: 'EMP-0186', label: 'Esther Muthoni — Procurement Officer' },
  { value: 'EMP-0063', label: 'Hassan Abdi — Procurement Manager' },
  { value: 'EMP-0161', label: 'Ruth Atieno — Admin Officer' }];


export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lv-0788',
    reference: 'LV-2026-0788',
    employeeId: 'EMP-0391',
    employee: 'Wanjiku Kamau',
    department: 'Procurement',
    type: 'annual',
    typeLabel: 'Annual leave',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    days: 4,
    reason: 'Family commitment — travelling to Kisumu for my sister’s wedding.',
    reliever: 'Esther Muthoni',
    status: 'pending',
    stage: 'hr',
    queuePosition: 2,
    submittedAt: '2026-09-14T08:52:00',
    timeline: [
      { id: 'lt1', actor: 'Wanjiku Kamau', actorRole: 'Procurement Analyst', action: 'submitted the request', at: '2026-09-14T08:52:00', outcome: 'submitted' },
      { id: 'lt2', actor: 'Hassan Abdi', actorRole: 'Procurement Manager', action: 'approved as supervisor', at: '2026-09-14T11:02:00', outcome: 'approved', comment: 'Cover arranged with Esther. Approved.' },
      { id: 'lt3', actor: 'Grace Wanjiru', actorRole: 'HR Director', action: 'is validating against leave policy', at: '2026-09-14T11:03:00', outcome: 'pending' }],

    raisedByCurrentUser: true
  },
  {
    id: 'lv-0786',
    reference: 'LV-2026-0786',
    employeeId: 'EMP-0102',
    employee: 'Peter Kamau',
    department: 'Operations',
    type: 'sick',
    typeLabel: 'Sick leave',
    startDate: '2026-09-15',
    endDate: '2026-09-17',
    days: 3,
    reason: 'Medical certificate attached — recovery after a minor procedure.',
    reliever: 'Mercy Achieng',
    status: 'pending',
    stage: 'supervisor',
    queuePosition: 1,
    submittedAt: '2026-09-13T16:40:00',
    timeline: [
      { id: 'lt4', actor: 'Peter Kamau', actorRole: 'Operations Assistant', action: 'submitted the request', at: '2026-09-13T16:40:00', outcome: 'submitted' },
      { id: 'lt5', actor: 'Kevin Omondi', actorRole: 'Head of Operations', action: 'is reviewing as supervisor', at: '2026-09-13T16:41:00', outcome: 'pending' }]

  },
  {
    id: 'lv-0781',
    reference: 'LV-2026-0781',
    employeeId: 'EMP-0094',
    employee: 'Aisha Hassan',
    department: 'Human Resources',
    type: 'annual',
    typeLabel: 'Annual leave',
    startDate: '2026-09-21',
    endDate: '2026-09-25',
    days: 5,
    reason: 'Annual family holiday, planned at the start of the year.',
    reliever: 'Caroline Chebet',
    status: 'approved',
    stage: 'complete',
    submittedAt: '2026-09-07T09:15:00',
    timeline: [
      { id: 'lt6', actor: 'Aisha Hassan', actorRole: 'HR Assistant', action: 'submitted the request', at: '2026-09-07T09:15:00', outcome: 'submitted' },
      { id: 'lt7', actor: 'Caroline Chebet', actorRole: 'HR Manager', action: 'approved as supervisor', at: '2026-09-07T14:20:00', outcome: 'approved' },
      { id: 'lt8', actor: 'Grace Wanjiru', actorRole: 'HR Director', action: 'approved and published to the team calendar', at: '2026-09-08T10:05:00', outcome: 'approved', comment: 'Within entitlement and no coverage clash.' }]

  },
  {
    id: 'lv-0774',
    reference: 'LV-2026-0774',
    employeeId: 'EMP-0207',
    employee: 'Lydia Njeri',
    department: 'Information Technology',
    type: 'study',
    typeLabel: 'Study leave',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    days: 2,
    reason: 'Professional certification examination.',
    reliever: 'Zainab Ali',
    status: 'rejected',
    stage: 'rejected',
    submittedAt: '2026-08-25T11:00:00',
    timeline: [
      { id: 'lt9', actor: 'Lydia Njeri', actorRole: 'IT Support Analyst', action: 'submitted the request', at: '2026-08-25T11:00:00', outcome: 'submitted' },
      { id: 'lt10', actor: 'Brian Otieno', actorRole: 'Head of IT', action: 'rejected as supervisor', at: '2026-08-26T09:30:00', outcome: 'rejected', comment: 'Two of three support analysts are already away that week. Resubmit for the following week.' }]

  },
  {
    id: 'lv-0790',
    reference: 'LV-2026-0790',
    employeeId: 'EMP-0126',
    employee: 'Daniel Mwangi',
    department: 'Facilities',
    type: 'compassionate',
    typeLabel: 'Compassionate leave',
    startDate: '2026-09-16',
    endDate: '2026-09-18',
    days: 3,
    reason: 'Bereavement in the immediate family.',
    reliever: 'Joseph Kariuki',
    status: 'pending',
    stage: 'supervisor',
    queuePosition: 1,
    submittedAt: '2026-09-14T07:20:00',
    timeline: [
      { id: 'lt11', actor: 'Daniel Mwangi', actorRole: 'Facilities Officer', action: 'submitted the request', at: '2026-09-14T07:20:00', outcome: 'submitted' },
      { id: 'lt12', actor: 'Beatrice Auma', actorRole: 'Head of Facilities', action: 'is reviewing as supervisor', at: '2026-09-14T07:21:00', outcome: 'pending' }]

  }];


export const TEAM_ABSENCES: TeamAbsence[] = [
  { employee: 'Aisha Hassan', department: 'Human Resources', type: 'annual', typeLabel: 'Annual', startDate: '2026-09-21', endDate: '2026-09-25', status: 'approved' },
  { employee: 'Hassan Abdi', department: 'Procurement', type: 'annual', typeLabel: 'Annual', startDate: '2026-09-23', endDate: '2026-09-29', status: 'approved' },
  { employee: 'Wanjiku Kamau', department: 'Procurement', type: 'annual', typeLabel: 'Annual', startDate: '2026-09-28', endDate: '2026-10-02', status: 'pending' },
  { employee: 'Peter Kamau', department: 'Operations', type: 'sick', typeLabel: 'Sick', startDate: '2026-09-15', endDate: '2026-09-17', status: 'pending' },
  { employee: 'Daniel Mwangi', department: 'Facilities', type: 'compassionate', typeLabel: 'Compassionate', startDate: '2026-09-16', endDate: '2026-09-18', status: 'pending' },
  { employee: 'Zainab Ali', department: 'Information Technology', type: 'annual', typeLabel: 'Annual', startDate: '2026-09-17', endDate: '2026-09-18', status: 'approved' },
  { employee: 'Ruth Atieno', department: 'Finance', type: 'annual', typeLabel: 'Annual', startDate: '2026-09-29', endDate: '2026-09-30', status: 'approved' }];


export const MY_PAYSLIPS: Payslip[] = [
  { id: 'ps-08', period: '2026-08', gross: 742000, deductions: 186400, net: 555600, paidOn: '2026-08-26' },
  { id: 'ps-07', period: '2026-07', gross: 742000, deductions: 186400, net: 555600, paidOn: '2026-07-27' },
  { id: 'ps-06', period: '2026-06', gross: 742000, deductions: 191200, net: 550800, paidOn: '2026-06-26' },
  { id: 'ps-05', period: '2026-05', gross: 698000, deductions: 178900, net: 519100, paidOn: '2026-05-27' },
  { id: 'ps-04', period: '2026-04', gross: 698000, deductions: 178900, net: 519100, paidOn: '2026-04-26' }];