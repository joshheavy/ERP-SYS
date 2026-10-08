# EMTECH ERP v2 — Module Gap Analysis & Backlog

This maps the legacy reference system (~730 screens across 13 modules, from
`erp-emtech/ERP_V2_MODULE_INVENTORY.md`) against **what this project actually
implements today**, and turns the gap into a prioritized build backlog.

Use it to decide scope. We will **not** build 730 screens in one pass — this
document exists so you can pick the order.

> **STATUS (current): every route the navigation promises is now built.**
> There are no `ComingSoon`/stub screens left in the app, and the four
> previously-missing modules (Suppliers, Imprest, Prepayment, Reports) are all
> registered and implemented. The "Stub"/"Missing" statuses in the tables below
> are **historical** — they describe an earlier snapshot and are kept only as a
> record of the build order that was followed. The remaining genuine gaps are
> the deep HR/Finance sub-areas called out in §4 under "Still deferred".

---

## Legend

- **Have** — a real, working screen exists (UI + mock data + interactions).
- **Stub** — *(historical)* a route/nav entry existed but rendered a placeholder. No stubs remain in the current build.
- **Missing** — *(historical)* nothing existed yet (no route, no module).
- CRUD depth: **R** read-only list/detail · **C** create form · **U** edit · **D** delete · **A** approval. Today most "Have" screens are **R** with write actions that only fire a toast (no persistence). Persistence is Workstream 5.

---

## 1. Coverage at a glance

| Reference module | Legacy size | Our status | Notes |
|---|---:|---|---|
| Admin | ~21 | **Partial** | Have: Users (R), Roles & permissions (real persistence), Modules & licensing (R), **Organization (new, real persistence)**. Missing: privileges catalog, role delegation, audit trail, login sessions, app logs. |
| HR | ~253 | **Partial** | Have: Payroll runs + 12-step run wizard, Leave requests/detail/calendar. Stub: Employees, Pay structures. Missing: recruitment, performance/KPI/BSC, grievances, disciplinary, exit, org structure, statutory config screens. |
| HR Self-Service | ~39 | **Partial** | Have: `/portal` self-service (payslips, leave, profile — mock). Missing: most sub-screens. |
| Finance | ~148 | **Partial** | Have: Finance dashboard, Journal entries (R+drawer+A toast), Trial balance report, Finance settings. Stub: Chart of accounts, Bank reconciliation, Income statement. Missing: finance parameters, fiscal periods, tax config, AP/AR. |
| Fixed Assets | ~111 | **Partial** | Have: Asset register (R). Stub: Depreciation runs. Missing: categories/classes, acquisition, revaluation, transfers, disposal, verification/tagging, reports. |
| Procurement | ~75 | **Partial** | Have: Requisitions (R+C+detail), New requisition (real form), Purchase orders (R), Goods receipts (R + receipt drawer form). Stub: Vendors. Missing: RFQs/tenders, bid evaluation. |
| Inventory | ~32 | **Partial** | Have: Item balances (R). Stub: Stock movements. Missing: warehouses/stores, stock in/out, transfers, stock takes, reorder levels. |
| Budget | ~14 | **Partial** | Have: Budget lines (R). Stub: Virements. Missing: budget setup, allocation, monitoring vs actuals. |
| Suppliers | ~11 | **Missing** | No module. (Distinct from procurement Vendors — registry, prequalification, evaluation.) |
| Imprest | ~10 | **Missing** | No module. Imprest requests, surrender/retirement, approvals. |
| Prepayment | ~7 | **Missing** | No module. Prepayment requests, amortization schedules, approvals. |
| Reports | ~7 | **Missing** | No cross-module reporting hub. |
| Dashboard | 1 | **Have** | Role-aware `/dashboard` with KPIs + charts. |

**Summary:** 6 business modules + admin partially built; **9 stub routes**;
**4 modules entirely missing** (Suppliers, Imprest, Prepayment, Reports); plus
large missing sub-areas inside HR and Finance.

---

## 2. The 9 existing stubs (fastest wins — routes + nav already exist)

| Route | Screen | Suggested build | Archetype |
|---|---|---|---|
| `/finance/accounts` | Chart of accounts | list + create/edit account (code, name, type, parent) | list + form |
| `/finance/reconciliation` | Bank reconciliation | statement vs ledger match, mark-reconciled | list + workspace |
| `/finance/reports/income` | Income statement | period filter → generate → table + export | report |
| `/hr/employees` | Employees | list + detail drawer + create/edit + documents tab | list + detail + form |
| `/hr/payroll/structures` | Pay structures | list of structures + earning/deduction components | list + form |
| `/procurement/vendors` | Vendors | list + detail + create/edit + status | list + detail + form |
| `/inventory/movements` | Stock movements | in/out/transfer ledger + record-movement form | list + form |
| `/assets/depreciation` | Depreciation runs | run list + run wizard/preview + post | list + wizard |
| `/budgeting/virements` | Virements | transfer between budget lines + approval | list + form + approval |

These are Workstream 3. Each reuses existing `DataTable`, `Drawer`,
`FormSection`, `StatusBadge`, chart components — mostly composition + mock data.

---

## 3. The 4 missing modules (net-new, follow the admin module pattern)

Per the reference's "smallest complete module first" advice:

1. **Prepayment** (~7 screens) — smallest complete vertical slice: list →
   request form → amortization schedule → approval → export.
2. **Imprest** (~10) — imprest request → issue → surrender/retirement → approval.
3. **Suppliers** (~11) — supplier registry → prequalification → categories →
   evaluation.
4. **Reports** (~7) — cross-module reporting hub (pick report → filters →
   generate → table/chart → export).

Each becomes `src/modules/<id>/<id>.module.ts` + `pages/`, added to
`MODULE_REGISTRY`, `ModuleId` union, entitlements, and default roles. This is
Workstream 4.

---

## 4. Large missing sub-areas (phase later, sub-module by sub-module)

**Built since first draft:**
- **HR org structure** — Branches, Departments, Job grades (`/hr/org/*`), full CRUD.
- **HR recruitment** — Jobs + Applications with stage workflow (`/hr/recruitment/*`).
- **HR performance** — KPIs + Staff goals with scores (`/hr/performance/*`).
- **HR employee relations** — Grievances + Disciplinary cases with status
  workflow (`/hr/relations/*`).
- **Admin operational** — Privileges catalogue, Audit trail, Login sessions,
  Application logs (`/admin/{privileges,audit,sessions,logs}`).

**Finance sub-areas built:**
- **Fiscal periods** (`/finance/periods`) — accounting calendar with open/close.
- **Currencies & FX** (`/finance/currencies`) — CRUD rates against base KES.
- **Tax configuration** (`/finance/tax`) — VAT/WHT/PAYE/Excise rates.
- **Accounts Payable** (`/finance/payables`) + **Accounts Receivable**
  (`/finance/receivables`) — invoices, aging, record-payment (shared Subledger view).

**Fixed Assets sub-areas built:**
- **Categories/classes** (`/assets/categories`) — CRUD with depreciation method + rate.
- **Acquisitions** (`/assets/acquisitions`) — create → submit → capitalise/reject workflow.
- **Transfers** (`/assets/transfers`) — custodian/location moves with approve/reject.
- **Disposals** (`/assets/disposals`) — sale/scrap/donation/write-off with gain/loss vs NBV + approve.

**Still deferred (need their own phase):**
- **HR statutory config — DONE.** PAYE bands (`/hr/statutory/paye`, with a live
  sample computation), NSSF tiers (`/hr/statutory/nssf`), and SHIF/Housing Levy/
  reliefs (`/hr/statutory/rates`) — Kenyan 2026 values, persisted, in the
  Statutory nav group.
- **HR (still)** — interviews detail, balanced scorecard/perf reports, exit
  management, job steps/roles, holidays, the remaining payroll steps (we have
  ~12 of 17), bulk uploads.
- **Finance** — full general ledger postings engine (beyond the journal list),
  finance parameters beyond the above.
- **Fixed Assets** — revaluation, verification/tagging (QR), asset reports.
- **Admin role delegation — DONE.** `/admin/delegations` (CRUD + revoke).
  "Act as" makes you act **as the delegating person** — the TopBar profile and
  dashboard show their name/job title (`effectiveIdentity`), while their
  delegated **role** drives permissions, so the sidebar/dashboard/approvals all
  follow it until you stop. The TopBar shows an "Acting for X" banner (click to
  stop) and the profile menu toggles delegations.

---

## 5. Cross-cutting capabilities the reference expects (system-wide)

These aren't screens but system features almost every module assumes:

- **Maker-checker** on every entity (View / Maintain / Approve). We have a
  unified approvals inbox; extend it as modules grow.
- **Export (Excel + PDF)** on virtually every list — DONE. The DataTable now
  has built-in CSV + Print/PDF export (dependency-free, `src/utils/export.ts`)
  driven by its own columns/rows; every list exports for real. A backend can
  later swap in server-generated xlsx without touching call sites.
- **Audit trail / activity history** on records.
- **Fine-grained privileges** (beyond our current per-module role gate).
- **Notifications center — DONE.** Persisted read/unread via
  `NotificationsContext` over `notificationsStore`. The TopBar bell shows a live
  unread count, marks an item read on open, and "mark all as read" works; a full
  `/notifications` page filters by kind + unread-only and marks read/all. (A
  live WebSocket feed would be the backend follow-up.)
- **i18n** (multi-language) — deferred unless required.

---

## 6. Recommended build order (proposed)

1. ✅ **Organization setup + branding** (done — Workstream 1).
2. **Fill the 9 stubs** (Workstream 3) — highest value/effort ratio.
3. **Prepayment + Imprest** modules (Workstream 4) — prove the module pattern
   end-to-end on small modules.
4. **Persistence layer** (Workstream 5) — makes all CRUD real without a backend.
5. **Suppliers + Reports** modules (Workstream 4 continued).
6. **CI/tooling** (Workstream 6) — can run in parallel any time.
7. **HR / Finance deep sub-modules** — only after stakeholders prioritize;
   these are the multi-week efforts.

---

## 7. Decision needed from you

Confirm the scope for the current push. Options:

- **A — Foundations + quick wins:** stubs (WS3) + persistence (WS5) + CI (WS6).
  Leaves net-new modules for later. *Lowest risk, most polish on what exists.*
- **B — Breadth:** stubs (WS3) + the 4 missing modules (WS4) + CI (WS6).
  *Widest module coverage; each new module is a thin slice.*
- **C — Everything buildable now:** WS3 + WS4 + WS5 + WS6 in one pass. Large but
  doable with the existing archetypes; HR/Finance deep sub-modules still deferred.

Pick A, B, or C (or adjust). The deep HR/Finance sub-areas in §4 are out of
scope for a single pass regardless and need their own prioritization.
