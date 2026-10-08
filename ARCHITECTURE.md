# EMTECH ERP — Architecture

EMTECH ERP is a **modular monolith**: one Next.js 15 (App Router) application,
one deployment, built from independent feature *modules* that are described by
manifests and assembled through a central registry. It ships **on-prem**, and
each install enables only the modules it is licensed for via an **entitlements**
layer that sits on top of the existing per-role permissions.

There are no micro-frontends and no multi-tenancy: a single install serves a
single organisation, and modules are sold/enabled per install rather than per
tenant.

---

## 1. Layers at a glance

```
app/                         Next.js App Router — routes only (thin wrappers)
  (console)/**/page.tsx      import a page component from src/ and render it
  providers.tsx              mounts the global context providers

src/
  core/
    module/                  the pluggable-module machinery
      types.ts               ModuleManifest, ModuleSection, ModuleCommand
      registry.ts            MODULE_REGISTRY — the list of installed modules
      selectors.ts           derives MODULES/ROUTE_META/COMMANDS/… from registry
    entitlements/
      entitlements.config.ts LICENSE — which modules THIS install owns
  contexts/
    PermissionsContext.tsx   editable per-role module access (localStorage)
    EntitlementsContext.tsx  license + combined gate (entitlement ∩ permission)
  data/
    navigationData.ts        RAW hand-authored nav data (transitional source)
    navigation.ts            public navigation API (re-exports derived data)
  modules/
    admin/                   REFERENCE migrated module (manifest + pages)
      admin.module.ts        the module's manifest
      pages/                 the module's screens
  components/shell/          the shell that renders whatever modules exist
```

The guiding rule: **the shell never hard-codes a module.** The sidebar, command
palette, route guard, dashboard and permissions are all built from the set of
registered manifests. Add a manifest → the module appears. Remove it → it is
gone. Gate it with entitlements → it is present in the build but only enabled
where licensed.

---

## 2. Modules

A module is a self-describing feature area. Its contract is `ModuleManifest`
(`src/core/module/types.ts`):

| Field          | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `id`           | Stable `ModuleId` (`finance`, `hr`, `admin`, …)                |
| `label` / `shortLabel` / `blurb` | Display text                                 |
| `icon`         | Lucide icon component                                          |
| `section`      | Rail grouping: `Operations` / `People` / `Business` / `System` |
| `home`         | Landing route when the module is opened                        |
| `nav`          | Sidebar groups + pages the module contributes                  |
| `defaultRoles` | Roles that receive the module by default (seeds permissions)   |
| `commands`     | Command-palette entries                                        |
| `routeTrails`  | Breadcrumb trail per owned route                               |

### The registry

`MODULE_REGISTRY` (`src/core/module/registry.ts`) is the single list of
**installed** modules. It currently holds two kinds of entry:

1. **Assembled modules** — `finance, hr, procurement, inventory, assets,
   budgeting`. These are still built from the shared `RAW_*` data in
   `navigationData.ts` (a transitional shim). Each is converted into a
   `ModuleManifest` at load time.
2. **Owned modules** — `admin`. This module owns its manifest directly
   (`src/modules/admin/admin.module.ts`) and is the **reference** for the
   target shape.

> **Migrating a module to the owned shape:** create
> `src/modules/<id>/<id>.module.ts` exporting a `ModuleManifest`, move its pages
> under `src/modules/<id>/pages/`, add it to `OWNED_MODULES` in `registry.ts`,
> and remove its `RAW_*` entries. Nothing else changes because everything is
> derived from the registry.

### Selectors

`src/core/module/selectors.ts` derives everything the shell consumes from
`MODULE_REGISTRY`:

- `MODULES` — nav objects for the sidebar/rail
- `ALL_MODULE_IDS` — canonical id order
- `RAIL_SECTIONS` — sections built from each module's `section`
- `ROLE_MODULES` — default role→modules map, seeded from `defaultRoles`
- `ROUTE_META` — route → owning module + breadcrumb trail
- `COMMANDS` — all command-palette entries

Cross-module *workspace* routes that no module owns (`/approvals`, `/portal`,
`/gallery`) are declared here as shared extras.

`src/data/navigation.ts` re-exports these so existing
`import … from '../data/navigation'` call sites keep working unchanged.

**Import direction (no cycles):**
`navigation → selectors → registry → navigationData`. `types.ts` and
`selectors.ts` import types from `navigationData`, never from `navigation`.

---

## 3. Two independent access gates

Access to a module is the **intersection** of two orthogonal checks:

```
usable(role, module)  ==  entitled(module)  AND  permitted(role, module)
```

| Gate            | Question                              | Scope         | Where                       | Mutable?                 |
| --------------- | ------------------------------------- | ------------- | --------------------------- | ------------------------ |
| **Entitlement** | Does THIS INSTALL own the module?     | per install   | `entitlements.config.ts`    | build/restart (on-prem)  |
| **Permission**  | May THIS ROLE open the module?        | per role      | `PermissionsContext`        | live, via Admin → Roles  |

### Entitlements (per install)

`src/core/entitlements/entitlements.config.ts` is plain data (no React) so it
can be read on the server, in scripts and in the client bundle. It resolves a
`LICENSE` describing the licensee, edition and the `modules` this install owns.
`admin` is force-included so an operator can never lock themselves out of the
licensing screen.

### Permissions (per role)

`PermissionsContext` holds the editable role→modules map (persisted to
`localStorage`, seeded from `ROLE_MODULES`). The Admin → Roles & permissions
screen edits it live.

### The combined gate

`EntitlementsContext` (`src/contexts/EntitlementsContext.tsx`) reads
`PermissionsContext` and exposes the combined selectors the whole shell uses:

- `canUse(role, id)` = `isEntitled(id) && canAccess(role, id)`
- `usableModules(role)` — modules that pass both gates, as nav objects
- `homeRoute(role)` — first usable module's home, else `/portal`
- `isEntitled(id)` / `entitledIds` / `license`

The convenience hook `useModuleAccess()` returns these. **Shell components call
`useModuleAccess`, not `usePermissions`,** so both gates are always applied:

- `AppShell` — which module is "active" for highlighting
- `Sidebar` — which modules and sections render
- `CommandPalette` — which commands are offered
- `RoleDashboard` — which module cards + approvals show
- `RouteGuard` — blocks unreachable routes, and distinguishes
  *"not enabled on this install"* (entitlement) from *"your role lacks access"*
  (permission)

The two Admin editors deliberately keep using `usePermissions` directly: they
describe/edit the raw role configuration, not the current user's runtime access.

Provider order (`app/providers.tsx`):
`Preferences → Permissions → Entitlements → app`. Entitlements must be inside
Permissions because it reads from it.

---

## 4. Changing entitlements for an on-prem customer

Pick one; both take effect on the next build/restart:

1. **Edit source** — set `LICENSE.modules` in
   `src/core/entitlements/entitlements.config.ts` to the purchased module ids.
2. **Env override (no source edit)** — set
   `NEXT_PUBLIC_EMTECH_LICENSED_MODULES` to a comma-separated list, e.g.
   `NEXT_PUBLIC_EMTECH_LICENSED_MODULES="finance,hr,procurement,admin"`.
   (The `NEXT_PUBLIC_` prefix is required for Next.js to inline the value into
   the client bundle. The bare `EMTECH_LICENSED_MODULES` is honoured too, but
   only on the server.)

`admin` is always licensed regardless. The **Admin → Modules & licensing**
screen (`/admin/modules`) shows installed vs licensed modules and repeats this
guidance for operators.

To physically **omit** a module from a build entirely (not just disable it),
remove it from `MODULE_REGISTRY`. Entitlements are the softer, reversible lever;
registry removal is the hard one.

---

## 5. Roles and module ids

```
Role     = 'admin' | 'manager' | 'officer' | 'auditor' | 'employee'
ModuleId = 'finance' | 'hr' | 'procurement' | 'inventory'
         | 'assets'  | 'budgeting' | 'admin'
```

---

## 6. Verification

- `npx tsc --noEmit` passes clean (whole codebase type-checks, including the
  registry, entitlements layer and the new `/admin/modules` route).
- Full `next build` should be run with the dev server stopped — on Windows a
  running `npm run dev` locks `.next/` and causes an `EPERM: …/.next/trace`
  error that is environmental, not a code fault.

### Behaviours to confirm in the running app

- A role sees exactly the modules where **entitlement ∩ permission** hold.
- Toggling a module for a role in Admin → Roles updates sidebar, dashboard and
  palette immediately for that role.
- Removing a module from the license removes it from every surface and makes its
  routes show *"isn't enabled on this install"*.
- The `admin` module is always present; the licensing screen never disappears.

---

## 8. Organization profile & white-label branding

A single **Organization** record (single-tenant, on-prem) holds the buyer's
company profile and branding. Configured at **Admin → Organization**
(`/admin/organization`).

- Types: `src/types/organization.ts` (`Organization`, `OrganizationBranding`,
  `DEFAULT_ORGANIZATION`). Kenyan fields: KRA PIN, NSSF/SHIF employer numbers,
  base currency (KES), fiscal-year start month (July default).
- Context: `src/contexts/OrganizationContext.tsx` — `useOrganization()` exposes
  the record plus `update`/`updateBranding`/`reset`. Persists to localStorage
  (`emtech.organization.v1`). Mounted **outermost** in `app/providers.tsx` (above
  Preferences) so branding applies app-wide.
- **Runtime white-label theming:** `applyBranding()` injects CSS variables on
  `<html>` — from a single brand hex it derives the whole primary family
  (`--c-primary`, `-hover`, `-soft`, `-text`, `--c-focus`, `--c-chart-1`) via
  tint/shade helpers, and maps the accent to `--c-chart-2`. Picking a colour
  re-themes every button, link and active-nav instantly, with no component
  edits. Clearing to the default reverts to the stylesheet tokens.
- The org name + logo flow into the Sidebar, Landing and Login (replacing the
  hard-coded EMTECH mark).

## 9. Prototype persistence layer

`src/core/store/createCollection.ts` — a tiny, dependency-free persisted store.

- `createCollection<T>(storageKey, seed, idPrefix)` wraps a seed array with
  `list/get/create/update/remove/replaceAll/reset/subscribe` and persists to
  localStorage. `useCollection(store)` subscribes a component via
  `useSyncExternalStore` (SSR-safe: server snapshot returns the seed).
- This makes create/edit/delete survive navigation and reload **without a
  backend**. Used by the filled-in screens and every new module's data file in
  `src/data/*`.
- **Swap path to a real backend:** the public surface (`list/get/create/update/
  remove`) mirrors a REST/service client, so replacing the store body with the
  fetch client in §11 is mechanical — call sites keep the same method names.

## 10. Module roster

Registered in `MODULE_REGISTRY` (`src/core/module/registry.ts`). Two kinds:
assembled-from-`RAW_*` (transitional) and owned-manifest (target).

| Module | Section | Kind | Home |
|---|---|---|---|
| Finance, HR, Procurement, Inventory, Fixed Assets, Budgeting | Operations/People/Business | assembled | module home |
| Suppliers | Business | owned (`src/modules/suppliers`) | `/suppliers/registry` |
| Imprest | Business | owned (`src/modules/imprest`) | `/imprest/requests` |
| Prepayments | Business | owned (`src/modules/prepayment`) | `/prepayment/requests` |
| Reports | System | owned (`src/modules/reports`) | `/reports` |
| Administration | System | owned (`src/modules/admin`) | `/admin/organization` |

Adding a module: create `src/modules/<id>/<id>.module.ts`, add it to
`OWNED_MODULES`, extend the `ModuleId` union in `src/types/common.ts`, add it to
`DEFAULT_LICENSE.modules`, and add entries to the two exhaustive
`Record<ModuleId, …>` maps (`MODULE_SPARKLINES`, `MODULE_SUMMARIES`). TypeScript
enforces the last step.

Reports is a cross-module hub (`ReportsHub.tsx`): report cards → a runner that
reads existing stores (`employeesStore`, `vendorsStore`, `accountsStore`,
`INVENTORY_ITEMS`) and renders read-only tables with export.

## 11. Future backend integration (patterns to adopt)

When a real backend lands, adopt the patterns proven in the CIC-BANCA-FE
project (studied for this build):

- **Endpoint registry → Next rewrites:** one factory file per domain exporting
  `(backendUrl) => [{source, destination}]`, aggregated by `getAllEndpoints()`
  and spread into `next.config.ts` `rewrites()`. The browser calls same-origin
  relative paths; Next proxies to the gateway — no CORS in the browser.
- **Thin fetch client:** an `api`/`apiMethods` wrapper with a custom `ApiError`
  (HTML-vs-JSON error detection, status mapping). Replace the `createCollection`
  bodies with calls to this; keep method names so call sites don't change.
- **httpOnly-cookie auth:** access token in an httpOnly cookie, a JS presence
  sentinel for "authenticated", an `isJwt()` guard before attaching
  `Authorization`, and a global fetch interceptor doing single-flight refresh on
  401 + forced logout. (`AuthContext` would replace the current role switcher.)
- **Security headers** in `next.config.ts` (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, HSTS).

## 12. CI / tooling

- `package.json` scripts: `typecheck` (`tsc --noEmit`), `lint` (`next lint`),
  `build` (`next build`).
- `.github/workflows/ci.yml` — on push/PR to main/master/develop/development:
  checkout → Node 20 (npm cache) → `npm ci` → `typecheck` → `lint` → `build`,
  with concurrency cancellation. Mirrors the CIC-BANCA verify-and-build gate.
- **Windows note:** run `next build` with the dev server stopped — a running
  `npm run dev` locks `.next/` and causes `EPERM: .next/trace` (environmental,
  not a code fault).
