# EMTECH ERP v2 — Designer Brief & Narration

> Hand this document to your designer. It sets the story, the users, the mood, and exactly what to deliver.
> (Written for the EMTECH ERP v2 rebuild. Move this file into the `erp-emtech` folder alongside the Playbook and Inventory when convenient.)

---

## System context (so you understand what you're designing for)

EMTECH ERP is a large internal business system. Scale and nature you should design for:

- **~730 screens across 13 modules:** Admin (users/roles/privileges/audit), HR (the biggest — ~250 screens: employees, recruitment, leave, performance/KPI, grievances, disciplinary, a 17-step payroll, statutory deductions), HR Self-Service (employee portal), Finance (general ledger, finance management), Fixed Assets, Procurement, Inventory, Budget, Suppliers, Imprest, Prepayment, Reports, and an executive Dashboard.
- **It is data-dense and workflow-driven.** Almost everything follows a **maker-checker** pattern: someone creates a record, someone else approves or rejects it. Approvals, status timelines, and "what needs my attention" are central — not an afterthought.
- **It is permission-gated.** What a user can see and do depends on fine-grained privileges (e.g. "View", "Maintain", "Approve"). The UI must gracefully hide/disable what a user can't access.
- **It is Kenya-based** (statutory items like SHIF, NSSF, PAYE, Affordable Housing Levy, HELB, P9). Keep terminology familiar to Kenyan finance/HR staff.
- **Two audiences, one system:** a dense **desktop console** for officers/managers, and a simple **mobile-first self-service portal** for ordinary employees.

You do **not** need to design 730 unique screens. You design a **component library** plus **~10 reusable screen patterns**; the screens are combinations of those. That is the whole strategy.

---

## The one-paragraph narration (read this first)

We are designing **version 2 of an enterprise ERP** — the internal operating system for an organization's Finance, HR, Procurement, Inventory, Fixed Assets, and Budgeting. Real staff live inside this tool for their entire workday: HR officers running a 17-step payroll, finance clerks posting to the general ledger, managers approving requisitions and leave, employees checking payslips on their phones. The current version works but feels dated, cluttered, and slow to navigate across its ~730 screens. **Our job in v2 is to make an enterprise ERP that feels as fast, calm, and clear as a modern product like Linear or Stripe's dashboard — without losing the density and power these professionals need.** We are not decorating; we are designing a system: a set of reusable components and repeatable screen patterns that make 700+ screens feel like one coherent, trustworthy product.

---

## Who we are designing for (personas)

1. **The Power User (Admin / Officer)** — spends 6–8 hrs/day in the system on a large monitor (1440px+). Does heavy data entry, filtering, and review. Values speed, keyboard shortcuts, dense tables, and no wasted clicks. *This is the primary persona for the main console.*
2. **The Approver (Manager / HOD / Executive)** — reviews and approves/rejects items others created (maker-checker). Needs a clear "what needs my attention" inbox, full context to decide, and a fast approve/reject with a reason. Often on desktop, sometimes tablet.
3. **The Employee (Self-Service)** — an ordinary staff member who occasionally logs in to request leave, view a payslip, or update their profile. **Mobile-first.** Needs a simple, friendly, guided experience — the opposite of the dense admin console.
4. **The Auditor** — reads history, audit trails, and reports. Needs clarity, timelines, and export.

One product, but the **console** (personas 1, 2, 4) and the **self-service portal** (persona 3) are two different design targets.

---

## The mood / visual direction

- **Professional, precise, calm.** This system moves money and manages people. It must feel reliable and quiet, never flashy or playful.
- **Modern enterprise, not "old ERP."** Think Linear, Stripe Dashboard, Vercel, Notion, Retool — clean neutrals, crisp typography, generous-but-efficient spacing. Avoid the heavy, boxed, gray look of legacy ERPs (SAP, Oracle Forms).
- **Density with air.** Show a lot of data, but keep it scannable with hierarchy, alignment, and restraint.
- **Trust through consistency.** The same action looks the same everywhere.

---

## Design principles (the rules)

1. **Clarity over cleverness.** Obvious labels, visible actions, no mystery icons.
2. **Design the system, not the pages.** Deliver components + screen archetypes; the 730 screens are compositions of these.
3. **Consistency is the product.** Edit, approve, export, filter must be identical everywhere.
4. **Every state matters.** Default, hover, focus, active, disabled, loading (skeleton), empty, error, and no-permission — design all of them.
5. **Numbers deserve respect.** This is finance/payroll. Right-align numerics, use tabular figures, show currency, define totals/negatives.
6. **Accessible by default.** WCAG AA contrast, visible focus rings, keyboard operable, never color-alone for meaning.

---

## What to deliver (in Figma, in this order)

### 1. Foundations (design tokens)
- **Color:** neutral gray scale for structure; one primary brand color; semantic success/warning/danger/info. **Include dark mode from the start** (power users want it).
- **Typography:** one clean sans (e.g. Inter); type scale (display, h1–h4, body, small, caption) + a **tabular/mono** style for numbers and IDs.
- **Spacing** (4px base), **radius**, **elevation/shadows**, **borders**.
- **Icons:** one set (e.g. Lucide), consistent stroke.

### 2. Core components (with every state listed above)
- Buttons (primary / secondary / ghost / danger), inputs, textarea, select, **searchable multi-select**, date & period pickers, checkbox, radio, toggle, file upload.
- **DataTable — the single most important component.** Sortable sticky headers, row selection, inline row actions, pagination, column pinning, density toggle, a filter bar, export button, empty state, loading skeleton. Must hold 20+ columns gracefully.
- **Forms:** multi-column layouts, sectioned forms, and **wizard/stepper** (for long processes like the 17-step payroll).
- **Modals & side drawers** (a right-side drawer for detail views is ideal in ERPs), confirmation dialogs.
- **Approval kit:** approval card, **status badge**, **status timeline/history**, maker-checker banner, reject-with-reason input.
- Cards, **KPI/stat tiles**, tabs, breadcrumbs, toasts, tooltips.
- **Navigation:** collapsible module-aware sidebar, top bar with **global search (⌘K)**, notifications bell, profile menu, and a **role/delegation switcher**.

### 3. Screen archetypes (design once, reuse ~700 times)
- **Dashboard** (KPI tiles + charts + recent activity + pending approvals)
- **List page** (table + filters + bulk actions + create)
- **Detail page** (drawer or full page, with tabs + audit timeline)
- **Create/Edit form** + **multi-step wizard** variant
- **Approval / review** screen
- **Report** page (filters → generate → table/chart → export)
- **Config/settings** page
- **States:** empty, error, no-permission, loading skeletons

### 4. Flagship flows (fully designed, end-to-end)
Design these 3 completely so developers see the patterns in context:
- **Leave request → supervisor approve → HR approve → calendar updates** (self-service + console + approval).
- **Requisition → approval chain → purchase order → goods receipt** (procurement, multi-step approval).
- **Run payroll** (the guided 17-step wizard — a signature flow of this system).

---

## Layout guidance
- **Console: desktop-first**, optimized for ≥1440px, then define tablet/mobile behavior (how tables collapse to cards).
- **Self-service portal: mobile-first**, simple and friendly.
- Persistent left sidebar (collapsible), sticky top bar, content area with breadcrumb + page header (title + primary action). Detail views open in a **right drawer** where possible to keep context.

---

## Inspiration board (study these, and what to borrow)
- **Linear** — speed, ⌘K command palette, calm density, keyboard-first. *Borrow: interaction feel, navigation.*
- **Stripe Dashboard** — dense financial tables, filters, money presentation. *Borrow: table + money patterns.*
- **Notion / Height** — flexible layouts, side-drawer detail, inline edit. *Borrow: drawer detail views.*
- **Vercel / Retool** — clean enterprise neutrals, settings/form layouts. *Borrow: config/form density.*
- **Real ERPs (Odoo, SAP Fiori, Zoho, Workday)** — study their module navigation & approval UX, but **modernize** — most feel dated; our edge is making an ERP feel like Linear.

---

## Handoff expectations (so one engineer can build 700+ screens)
- A **Figma component library** with variants + auto-layout.
- **Name components to match code** (Figma `DataTable` ↔ `<DataTable>`). This 1:1 naming is what makes the volume buildable.
- Document tokens as styles/variables so they map to Tailwind theme tokens.
- Provide redlines/specs only where behavior isn't obvious; otherwise rely on the shared components.

---

## The one-line brief
> *"Make an enterprise ERP that feels as fast and clean as Linear, as data-clear as Stripe's dashboard, with a component system consistent enough that 700+ screens feel like one product."*
