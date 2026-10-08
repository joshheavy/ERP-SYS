# EMTECH ERP v2

An enterprise ERP console and mobile self-service portal — Finance, HR, Procurement, Inventory, Fixed Assets and Budgeting. Built to feel as fast and calm as Linear and as data-clear as Stripe's dashboard, with a component system consistent enough that 700+ screens feel like one product. See `ERP_V2_DESIGNER_BRIEF.md` for the full design brief.

## Stack

- **Next.js 15** (App Router) + **React 18**
- **TypeScript** (strict)
- **Tailwind CSS 3** with a custom design-token layer (light + dark) in `src/index.css`
- **lucide-react** icons, **recharts** charts, **framer-motion** overlays, **sonner** toasts

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /finance
npm run build    # production build + type-check
npm run start    # serve the production build
npm run lint     # next lint
```

## Entry flow

- `/` — a marketing/overview **landing page** explaining the ERP and its six modules.
- `/login` — a front-end-only **sign-in** page. Pick a role (Officer, Approver, Auditor, Employee); it sets the session role and routes you into the console (or the portal for employees). No real authentication — any email/password works.
- `/finance` and the other module routes — the **console**, reached after signing in.
- `/portal` — the mobile-first **self-service portal**.

The demo data is localized for Kenya throughout: figures in **KSh**, payroll with **PAYE, NSSF, SHIF and the Affordable Housing Levy**, Kenyan staff names, Kenyan banks (KCB, Equity, Co-operative, Absa, NCBA, Stanbic, DTB, Family), Nairobi locations (Industrial Area, Upper Hill), and **PesaLink/RTGS** bank transfers.

## How it is organised

- `app/` — Next.js App Router. Routes are thin `page.tsx` wrappers.
  - `app/layout.tsx` + `app/providers.tsx` — root layout, preferences provider, error boundary, toaster.
  - `app/page.tsx` (landing) and `app/login/` sit **outside** the console group, so they render without the console chrome.
  - `app/(console)/` — the dense desktop console. Its `layout.tsx` wraps every screen in the module rail, context sidebar, top bar and command palette (`AppShell`).
  - `app/portal/` — the mobile-first self-service portal, deliberately outside the console shell with its own compact chrome.
  - Every route declared in the navigation is implemented — there are no `ComingSoon` placeholder screens left. (The old placeholder component has been removed now that the product map is fully built out.)
- `src/components/` — the reusable component library (UI primitives, DataTable, approval kit, forms, shell). Named components map 1:1 to the design system.
- `src/pages/` — screen implementations, composed from the component library. Each is a `'use client'` component rendered by an `app/` route.
- `src/data/` — static fixtures standing in for the API.
- `src/hooks/useNav.ts` — thin adapter over the App Router (`useNav()` to navigate, `usePath()` for the current path).

## Screen coverage

- **Finance** — overview dashboard, journal entries (list + drawer), trial balance report, settings.
- **Approvals** — inbox and review screen (maker-checker, approval chain, audit timeline).
- **HR — Payroll** — payroll runs list and the signature **17-step payroll wizard** (`/hr/payroll/run`).
- **HR — Leave** — requests list, request detail/approval, team calendar, and the **self-service portal** (`/portal`).
- **Procurement** — requisitions (list, create, detail) → purchase orders (list + detail drawer) → goods receipts (list + create GRN).
- **Inventory / Fixed Assets / Budgeting** — data-dense list screens.
- **Component gallery** (`/gallery`) — every core component and its states.
