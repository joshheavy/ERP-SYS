import type {
  InputBatchRow,
  PayrollException,
  PayrollRun,
  PayrollStep,
  RegisterRow
} from
  '../types/payroll';

export const PAYROLL_PHASES = [
  { id: 'setup', label: 'Setup' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'calculate', label: 'Calculate' },
  { id: 'review', label: 'Review' },
  { id: 'commit', label: 'Commit' }];


export const PAYROLL_STEPS: PayrollStep[] = [
  {
    id: 'period',
    index: 1,
    phase: 'setup',
    title: 'Pay period & pay groups',
    kind: 'form',
    willChange: 'Sets the period this run posts into and the pay groups it covers. Nothing is calculated yet.',
    didChange: 'Period set to September 2026 across 3 pay groups.'
  },
  {
    id: 'scope',
    index: 2,
    phase: 'setup',
    title: 'Employee scope',
    kind: 'form',
    willChange: 'Resolves which employees are in scope, including joiners, leavers and suspended staff.',
    didChange: '1,248 employees in scope — 14 joiners added, 6 leavers pro-rated, 3 suspended excluded.'
  },
  {
    id: 'structures',
    index: 3,
    phase: 'setup',
    title: 'Validate pay structures',
    kind: 'compute',
    willChange: 'Checks every in-scope employee has an active grade, step and pay structure effective for this period.',
    didChange: 'All 1,248 employees matched to an effective pay structure.'
  },
  {
    id: 'attendance',
    index: 4,
    phase: 'inputs',
    title: 'Attendance & days worked',
    kind: 'input-table',
    willChange: 'Loads attendance for the period and sets days worked per employee. Full-month staff are untouched.',
    didChange: 'Days worked set for 1,248 employees from the attendance import.'
  },
  {
    id: 'lwop',
    index: 5,
    phase: 'inputs',
    title: 'Leave without pay',
    kind: 'input-table',
    willChange: 'Applies unpaid leave days from approved HR leave records as a deduction against basic pay.',
    didChange: 'Unpaid leave applied for 7 employees, KSh 412,560.00 deducted in total.'
  },
  {
    id: 'overtime',
    index: 6,
    phase: 'inputs',
    title: 'Overtime claims',
    kind: 'input-table',
    willChange: 'Brings in approved overtime hours and prices them at each grade’s overtime rate.',
    didChange: 'Overtime priced for 46 employees across 5 departments.'
  },
  {
    id: 'allowances',
    index: 7,
    phase: 'inputs',
    title: 'Allowances & one-off adjustments',
    kind: 'input-table',
    willChange: 'Applies recurring allowance changes and one-off adjustments such as acting allowances and bonuses.',
    didChange: '19 allowance changes and 8 one-off adjustments applied.'
  },
  {
    id: 'loans',
    index: 8,
    phase: 'inputs',
    title: 'Loans & salary advances',
    kind: 'input-table',
    willChange: 'Schedules this period’s loan repayments and advance recoveries, capped at the net pay floor.',
    didChange: 'Repayments scheduled for 132 employees; 2 capped at the net pay floor.'
  },
  {
    id: 'gross',
    index: 9,
    phase: 'calculate',
    title: 'Compute gross pay',
    kind: 'compute',
    willChange: 'Calculates gross pay from basic, housing, transport, utility, meal, overtime and adjustments.',
    didChange: 'Gross pay computed for 1,248 employees — KSh 486,412,900.00 in total.'
  },
  {
    id: 'paye',
    index: 10,
    phase: 'calculate',
    title: 'Compute statutory tax (PAYE)',
    kind: 'compute',
    willChange: 'Applies personal relief and the graduated PAYE bands to taxable pay for each employee.',
    didChange: 'PAYE computed for 1,248 employees — KSh 58,269,600.00 payable.'
  },
  {
    id: 'contributions',
    index: 11,
    phase: 'calculate',
    title: 'Compute NSSF, SHIF & Housing Levy',
    kind: 'compute',
    willChange: 'Calculates employee NSSF, SHIF and Affordable Housing Levy contributions and the matching employer portions.',
    didChange: 'Contributions computed — NSSF KSh 38,913,000.00, SHIF KSh 9,728,200.00, Housing Levy KSh 7,296,100.00.'
  },
  {
    id: 'net',
    index: 12,
    phase: 'calculate',
    title: 'Compute net pay',
    kind: 'compute',
    willChange: 'Nets deductions off gross and checks every employee against the net pay floor.',
    didChange: 'Net pay computed — KSh 357,247,800.00 payable to 1,248 employees.'
  },
  {
    id: 'exceptions',
    index: 13,
    phase: 'review',
    title: 'Exception report',
    kind: 'review',
    willChange: 'Lists every employee the run could not process cleanly. Blocking exceptions must be cleared here.',
    didChange: 'All blocking exceptions cleared. 3 warnings acknowledged.'
  },
  {
    id: 'variance',
    index: 14,
    phase: 'review',
    title: 'Variance vs. last period',
    kind: 'review',
    willChange: 'Compares every employee’s net pay against August 2026 so unexpected movement is caught before payment.',
    didChange: 'Variance reviewed — 11 employees outside the ±10% threshold, all explained.'
  },
  {
    id: 'register',
    index: 15,
    phase: 'review',
    title: 'Register preview & sign-off',
    kind: 'register',
    willChange: 'The full payroll register exactly as it will post. Sign-off records your name against these figures.',
    didChange: 'Register signed off by Nancy Wambui, Senior Payroll Officer.'
  },
  {
    id: 'approve',
    index: 16,
    phase: 'commit',
    title: 'Approve & post to general ledger',
    kind: 'commit',
    requiresConfirmation: true,
    willChange:
      'Posts the payroll journal to the September 2026 ledger period. This is the first irreversible step in the run.',
    didChange: 'Posted to GL as JE-2026-09-0114.'
  },
  {
    id: 'disburse',
    index: 17,
    phase: 'commit',
    title: 'Generate payslips & bank transfer file',
    kind: 'commit',
    requiresConfirmation: true,
    willChange:
      'Publishes 1,248 payslips to the self-service portal and produces the PesaLink/RTGS bank transfer file for treasury.',
    didChange: 'Payslips published and bank transfer file generated.'
  }];


export const PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr-2026-09',
    reference: 'PR-2026-09',
    period: '2026-09',
    payGroup: 'All pay groups',
    employees: 1248,
    gross: 486412900,
    net: 357247800,
    status: 'draft',
    stepsComplete: 12,
    owner: 'Nancy Wambui',
    updatedAt: '2026-09-14T16:12:00'
  },
  {
    id: 'pr-2026-08',
    reference: 'PR-2026-08',
    period: '2026-08',
    payGroup: 'All pay groups',
    employees: 1240,
    gross: 479118400,
    net: 352104600,
    status: 'posted',
    stepsComplete: 17,
    owner: 'Nancy Wambui',
    updatedAt: '2026-08-26T14:02:00'
  },
  {
    id: 'pr-2026-08-sup',
    reference: 'PR-2026-08-S1',
    period: '2026-08',
    payGroup: 'Supplementary — arrears',
    employees: 38,
    gross: 12480000,
    net: 9235400,
    status: 'posted',
    stepsComplete: 17,
    owner: 'Caroline Chebet',
    updatedAt: '2026-08-29T11:20:00'
  },
  {
    id: 'pr-2026-07',
    reference: 'PR-2026-07',
    period: '2026-07',
    payGroup: 'All pay groups',
    employees: 1236,
    gross: 476302100,
    net: 349884200,
    status: 'posted',
    stepsComplete: 17,
    owner: 'Nancy Wambui',
    updatedAt: '2026-07-27T09:44:00'
  },
  {
    id: 'pr-2026-06-rej',
    reference: 'PR-2026-06-S1',
    period: '2026-06',
    payGroup: 'Supplementary — field allowance',
    employees: 24,
    gross: 6420000,
    net: 5118000,
    status: 'rejected',
    stepsComplete: 15,
    owner: 'Caroline Chebet',
    updatedAt: '2026-06-30T15:31:00'
  }];


interface RowSeed {
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  payGroup: string;
  daysWorked: number;
  basic: number;
  overtime: number;
  bonus: number;
  actingAllowance: number;
  loanRepayment: number;
  salaryAdvance: number;
  absenceDeduction: number;
  previousNet: number;
  bank: string;
  accountNumber: string;
  flag?: 'blocking' | 'warning';
}

/** Derived so earnings, deductions and net always reconcile when a seed figure is edited. */
function buildRow(seed: RowSeed): RegisterRow {
  const housing = Math.round(seed.basic * 0.25);
  const transport = Math.round(seed.basic * 0.15);
  const utility = Math.round(seed.basic * 0.08);
  const meal = 45000;
  const gross =
    seed.basic + housing + transport + utility + meal + seed.overtime + seed.bonus + seed.actingAllowance;
  // Kenyan statutory deductions: NSSF (tier I+II, capped), SHIF and the Affordable Housing Levy.
  const nssf = Math.min(4320, Math.round(gross * 0.06));
  const housingLevy = Math.round(gross * 0.015);
  const shif = Math.round(gross * 0.0275);
  // PAYE on taxable pay after NSSF relief; personal relief of KSh 2,400 applied.
  const taxable = gross - nssf;
  const payeTax = Math.max(0, Math.round(taxable * 0.25) - 2400);
  const unionDues = 500;
  const totalDeductions =
    nssf +
    housingLevy +
    shif +
    payeTax +
    seed.loanRepayment +
    seed.salaryAdvance +
    unionDues +
    seed.absenceDeduction;
  const net = gross - totalDeductions;
  return {
    id: seed.employeeId,
    employeeId: seed.employeeId,
    name: seed.name,
    department: seed.department,
    grade: seed.grade,
    payGroup: seed.payGroup,
    daysWorked: seed.daysWorked,
    basic: seed.basic,
    housing,
    transport,
    utility,
    meal,
    overtime: seed.overtime,
    bonus: seed.bonus,
    actingAllowance: seed.actingAllowance,
    gross,
    nssf,
    housingLevy,
    shif,
    payeTax,
    loanRepayment: seed.loanRepayment,
    salaryAdvance: seed.salaryAdvance,
    unionDues,
    absenceDeduction: seed.absenceDeduction,
    totalDeductions,
    net,
    previousNet: seed.previousNet,
    variance: net - seed.previousNet,
    bank: seed.bank,
    accountNumber: seed.accountNumber,
    flag: seed.flag
  };
}

/** Seeded to produce realistic variances and a handful of deliberate exceptions. */
const REGISTER_SEEDS: RowSeed[] = [
  { employeeId: 'EMP-0022', name: 'David Kimani', department: 'Finance', grade: 'M4/3', payGroup: 'Management', daysWorked: 22, basic: 1850000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 1684200, bank: 'KCB', accountNumber: '1023487761' },
  { employeeId: 'EMP-0031', name: 'Grace Wanjiru', department: 'Human Resources', grade: 'M4/1', payGroup: 'Management', daysWorked: 22, basic: 1620000, overtime: 0, bonus: 250000, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 1476800, bank: 'Equity Bank', accountNumber: '0114552390', flag: 'warning' },
  { employeeId: 'EMP-0048', name: 'Brian Otieno', department: 'Information Technology', grade: 'S3/4', payGroup: 'Senior staff', daysWorked: 22, basic: 980000, overtime: 86000, bonus: 0, actingAllowance: 120000, loanRepayment: 145000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 842300, bank: 'Co-operative Bank', accountNumber: '0782114560' },
  { employeeId: 'EMP-0057', name: 'Faith Njoroge', department: 'Finance', grade: 'S2/2', payGroup: 'Senior staff', daysWorked: 22, basic: 742000, overtime: 32000, bonus: 0, actingAllowance: 0, loanRepayment: 96000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 651400, bank: 'Absa Bank', accountNumber: '3092114788' },
  { employeeId: 'EMP-0063', name: 'Hassan Abdi', department: 'Procurement', grade: 'S2/1', payGroup: 'Senior staff', daysWorked: 18, basic: 698000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 120000, absenceDeduction: 126900, previousNet: 612900, bank: 'NCBA Bank', accountNumber: '2019884561', flag: 'warning' },
  { employeeId: 'EMP-0071', name: 'Mercy Achieng', department: 'Operations', grade: 'S1/3', payGroup: 'Senior staff', daysWorked: 22, basic: 610000, overtime: 48000, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 548100, bank: 'KCB', accountNumber: '1044871290' },
  { employeeId: 'EMP-0077', name: 'Samuel Kiprono', department: 'Audit & Assurance', grade: 'S3/1', payGroup: 'Senior staff', daysWorked: 22, basic: 902000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 791600, bank: 'Stanbic Bank', accountNumber: '9011234455' },
  { employeeId: 'EMP-0094', name: 'Aisha Hassan', department: 'Human Resources', grade: 'J3/4', payGroup: 'Junior staff', daysWorked: 22, basic: 412000, overtime: 64000, bonus: 0, actingAllowance: 0, loanRepayment: 38000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 382900, bank: 'Equity Bank', accountNumber: '0117789233' },
  { employeeId: 'EMP-0102', name: 'Peter Kamau', department: 'Operations', grade: 'J3/2', payGroup: 'Junior staff', daysWorked: 22, basic: 386000, overtime: 92000, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 331200, bank: 'Co-operative Bank', accountNumber: '0788412309', flag: 'warning' },
  { employeeId: 'EMP-0119', name: 'Zainab Ali', department: 'Information Technology', grade: 'S1/1', payGroup: 'Senior staff', daysWorked: 22, basic: 564000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 72000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 486700, bank: 'Absa Bank', accountNumber: '3094412887' },
  { employeeId: 'EMP-0126', name: 'Daniel Mwangi', department: 'Facilities', grade: 'J2/3', payGroup: 'Junior staff', daysWorked: 22, basic: 298000, overtime: 74000, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 289400, bank: 'NCBA Bank', accountNumber: '2014478821' },
  { employeeId: 'EMP-0134', name: 'Caroline Chebet', department: 'Human Resources', grade: 'S2/3', payGroup: 'Senior staff', daysWorked: 22, basic: 768000, overtime: 0, bonus: 0, actingAllowance: 90000, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 672100, bank: 'KCB', accountNumber: '1049921034' },
  { employeeId: 'EMP-0148', name: 'Nancy Wambui', department: 'Human Resources', grade: 'S3/2', payGroup: 'Senior staff', daysWorked: 22, basic: 924000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 112000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 792400, bank: 'Equity Bank', accountNumber: '0112238790' },
  { employeeId: 'EMP-0161', name: 'Ruth Atieno', department: 'Finance', grade: 'J3/1', payGroup: 'Junior staff', daysWorked: 22, basic: 356000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 318800, bank: 'Diamond Trust Bank', accountNumber: '5011229384' },
  { employeeId: 'EMP-0173', name: 'Joseph Kariuki', department: 'Facilities', grade: 'J1/2', payGroup: 'Junior staff', daysWorked: 22, basic: 212000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 18000, salaryAdvance: 90000, absenceDeduction: 0, previousNet: 196400, bank: 'Family Bank', accountNumber: '', flag: 'blocking' },
  { employeeId: 'EMP-0186', name: 'Esther Muthoni', department: 'Procurement', grade: 'J2/1', payGroup: 'Junior staff', daysWorked: 22, basic: 268000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 96000, salaryAdvance: 110000, absenceDeduction: 0, previousNet: 214600, bank: 'Co-operative Bank', accountNumber: '0781123409', flag: 'blocking' },
  { employeeId: 'EMP-0198', name: 'Kevin Omondi', department: 'Operations', grade: 'S1/2', payGroup: 'Senior staff', daysWorked: 22, basic: 588000, overtime: 36000, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 512900, bank: 'Stanbic Bank', accountNumber: '9013389201' },
  { employeeId: 'EMP-0207', name: 'Lydia Njeri', department: 'Information Technology', grade: 'J3/3', payGroup: 'Junior staff', daysWorked: 20, basic: 402000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 73100, previousNet: 366200, bank: 'KCB', accountNumber: '1041123908' },
  { employeeId: 'EMP-0214', name: 'Ali Yusuf', department: 'Audit & Assurance', grade: 'S2/4', payGroup: 'Senior staff', daysWorked: 22, basic: 812000, overtime: 0, bonus: 0, actingAllowance: 0, loanRepayment: 0, salaryAdvance: 0, absenceDeduction: 0, previousNet: 712300, bank: 'Absa Bank', accountNumber: '3091188422' },
  { employeeId: 'EMP-0226', name: 'Joy Wangari', department: 'Finance', grade: 'S1/4', payGroup: 'Senior staff', daysWorked: 22, basic: 642000, overtime: 24000, bonus: 0, actingAllowance: 0, loanRepayment: 54000, salaryAdvance: 0, absenceDeduction: 0, previousNet: 552800, bank: 'Equity Bank', accountNumber: '0119923018' }];


export const REGISTER_ROWS: RegisterRow[] = REGISTER_SEEDS.map(buildRow);

export const PAYROLL_EXCEPTIONS: PayrollException[] = [
  {
    id: 'ex1',
    severity: 'blocking',
    code: 'BANK-001',
    title: 'Bank account number missing',
    detail:
      'This employee has no verified bank account on file, so no transfer instruction can be produced for them.',
    employees: ['EMP-0173 · Joseph Kariuki'],
    resolution: 'Add and verify the account in the employee record, then re-run validation.'
  },
  {
    id: 'ex2',
    severity: 'blocking',
    code: 'NET-014',
    title: 'Net pay below the statutory minimum',
    detail:
      'Loan repayment and salary advance recovery together take net pay below the KSh 70,000.00 floor for this employee.',
    employees: ['EMP-0186 · Esther Muthoni'],
    resolution: 'Reduce or defer the advance recovery in step 8, or approve a one-period repayment holiday.'
  },
  {
    id: 'ex3',
    severity: 'warning',
    code: 'VAR-020',
    title: 'Net pay moved more than 10% versus August',
    detail:
      'A performance bonus and an acting allowance account for most of the movement. Confirm the amounts are correct for this period only.',
    employees: ['EMP-0031 · Grace Wanjiru', 'EMP-0102 · Peter Kamau'],
    resolution: 'Acknowledge with a reason, or correct the adjustment in step 7.'
  },
  {
    id: 'ex4',
    severity: 'warning',
    code: 'ATT-007',
    title: 'Days worked below the period standard',
    detail:
      'Attendance shows fewer than 22 days with no matching approved leave record for the shortfall.',
    employees: ['EMP-0063 · Hassan Abdi'],
    resolution: 'Confirm with the line manager or raise a retrospective leave record in HR.'
  },
  {
    id: 'ex5',
    severity: 'warning',
    code: 'OT-031',
    title: 'Overtime above 40 hours in the period',
    detail: 'Overtime hours exceed the departmental cap and require Head of Operations sign-off.',
    employees: ['EMP-0102 · Peter Kamau'],
    resolution: 'Attach the approval memo, or trim the claim in step 6.'
  }];


export const ATTENDANCE_BATCH: InputBatchRow[] = [
  { id: 'a1', employeeId: 'EMP-0063', name: 'Hassan Abdi', department: 'Procurement', value: 18, unit: 'days', source: 'Biometric import', note: '4 days unaccounted' },
  { id: 'a2', employeeId: 'EMP-0207', name: 'Lydia Njeri', department: 'Information Technology', value: 20, unit: 'days', source: 'Biometric import', note: '2 days unpaid leave' },
  { id: 'a3', employeeId: 'EMP-0102', name: 'Peter Kamau', department: 'Operations', value: 22, unit: 'days', source: 'Biometric import' },
  { id: 'a4', employeeId: 'EMP-0126', name: 'Daniel Mwangi', department: 'Facilities', value: 22, unit: 'days', source: 'Manual entry' },
  { id: 'a5', employeeId: 'EMP-0094', name: 'Aisha Hassan', department: 'Human Resources', value: 22, unit: 'days', source: 'Biometric import' }];


export const LWOP_BATCH: InputBatchRow[] = [
  { id: 'l1', employeeId: 'EMP-0207', name: 'Lydia Njeri', department: 'Information Technology', value: 2, unit: 'days', source: 'HR leave record LV-2026-0731' },
  { id: 'l2', employeeId: 'EMP-0063', name: 'Hassan Abdi', department: 'Procurement', value: 4, unit: 'days', source: 'Pending confirmation', note: 'No approved leave record' }];


export const OVERTIME_BATCH: InputBatchRow[] = [
  { id: 'o1', employeeId: 'EMP-0102', name: 'Peter Kamau', department: 'Operations', value: 46, unit: 'hours', source: 'Approved claim OT-0912', note: 'Above 40h departmental cap' },
  { id: 'o2', employeeId: 'EMP-0126', name: 'Daniel Mwangi', department: 'Facilities', value: 32, unit: 'hours', source: 'Approved claim OT-0918' },
  { id: 'o3', employeeId: 'EMP-0048', name: 'Brian Otieno', department: 'Information Technology', value: 24, unit: 'hours', source: 'Approved claim OT-0921' },
  { id: 'o4', employeeId: 'EMP-0094', name: 'Aisha Hassan', department: 'Human Resources', value: 18, unit: 'hours', source: 'Approved claim OT-0925' }];


export const ADJUSTMENT_BATCH: InputBatchRow[] = [
  { id: 'j1', employeeId: 'EMP-0031', name: 'Grace Wanjiru', department: 'Human Resources', value: 250000, unit: 'KSh', source: 'Performance bonus, Q3', note: 'One period only' },
  { id: 'j2', employeeId: 'EMP-0048', name: 'Brian Otieno', department: 'Information Technology', value: 120000, unit: 'KSh', source: 'Acting allowance — Head of Infrastructure' },
  { id: 'j3', employeeId: 'EMP-0134', name: 'Caroline Chebet', department: 'Human Resources', value: 90000, unit: 'KSh', source: 'Acting allowance — HR Manager' }];


export const LOAN_BATCH: InputBatchRow[] = [
  { id: 'r1', employeeId: 'EMP-0186', name: 'Esther Muthoni', department: 'Procurement', value: 206000, unit: 'KSh', source: 'Staff loan + advance recovery', note: 'Takes net below the floor' },
  { id: 'r2', employeeId: 'EMP-0148', name: 'Nancy Wambui', department: 'Human Resources', value: 112000, unit: 'KSh', source: 'Staff loan SL-0412' },
  { id: 'r3', employeeId: 'EMP-0048', name: 'Brian Otieno', department: 'Information Technology', value: 145000, unit: 'KSh', source: 'Staff loan SL-0388' },
  { id: 'r4', employeeId: 'EMP-0173', name: 'Joseph Kariuki', department: 'Facilities', value: 108000, unit: 'KSh', source: 'Advance recovery AD-0221' }];


export const PAY_GROUP_OPTIONS = [
  { value: 'management', label: 'Management', meta: '84' },
  { value: 'senior', label: 'Senior staff', meta: '512' },
  { value: 'junior', label: 'Junior staff', meta: '652' },
  { value: 'contract', label: 'Contract & locum', meta: '96' }];


export const CLOSED_PERIODS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];