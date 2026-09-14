# Mobile Fueling — E2E Business Workflow Audit

**Date:** 2026-09-09 (live audit) · **Remediation review:** 2026-09-14  
**Assurance Degree:** **79 / 100** (estimated after code remediations; pending live re-probe)  
**Original live score (2026-09-09):** **54 / 100**  
**Targets:**
- Company panel: https://mobile-fueling.inergy.ir/
- Admin panel: https://mobile-fueling-admin.inergy.ir/

**Accounts used:** `pars_admin`, `pars_ops`, `kimia_admin`, `zagros_admin`, `khosravi`  
**Method:** Authenticated live API tests against `/api/external` and `/api/internal`, plus code review of custody/auth paths. Interactive browser UI was not automated.

Disposable QA entities were cleaned up. Kimia seed assignment for plate `۲۳ب۴۵۶-۷۸` → driver حسین was restored after cross-company tests. A privilege-escalation test company (“Hacked Co”) was deleted immediately after creation.

> **Remediation (2026-09-14):** Critical items (AUTHZ-COMPANIES, PATCH-DEFAULTS, ISO-05, ISO-06), VAL-500, PAGE-03, and AUTH-03 are implemented in code. Soft-delete/INACTIVE/CUST-09 remain open. Score revised to **79** on that basis — confirm with deploy + live re-probe. See [§ Status](#status). Findings in §§3–6 are the original audit evidence unless marked remediated in Status.

---

## 1. Executive summary

**At audit time (2026-09-09):** Company-tenant happy paths were largely solid (login, logout, Pars/Kimia isolation, viewer write denial, 1:1 custody). Four Critical admin/API issues undermined multi-tenant integrity, and unique violations returned HTTP 500.

**After code remediations (2026-09-14):** Those Critical paths, unique→400 mapping, list pagination, and login body validation (empty `{}` → 400) are fixed in the repo. The remaining material gap from this audit is the lack of an inactive/soft-delete model (hard delete still drops reachable car-scoped history).

**Verdict:** Core custody and tenancy rules look production-credible in code once deployed. Do not treat the **79** as a re-tested live score until remediations are re-probed on the deployed API. Soft-delete/status is the main product gap left from this audit.

---

## 2. Assurance scoring

| Band | Meaning |
|------|---------|
| 90–100 | Highly reliable |
| 80–89 | Good, minor issues |
| **70–79** | **Acceptable but meaningful issues** ← **79 estimated (2026-09-14)** |
| 60–69 | Risky |
| 40–59 | Major reliability concerns ← **54 live (2026-09-09)** |
| 0–39 | Unsafe / unreliable for production |

| Score | When | Basis |
|-------|------|--------|
| **54** | 2026-09-09 | Live API evidence (4 Critical + VAL-500 + unpaginated lists). |
| **78** | 2026-09-14 | Critical/High/PAGE-03 fixed in code; AUTH-03 + soft-delete still open. |
| **79** | 2026-09-14 | +AUTH-03 (`LoginBodyGuard`). Held under ~80–85 by open INACTIVE/CUST-09 and no post-deploy re-probe. |

Original note still holds for the live day: company-panel isolation/custody alone would have scored ~80; the **54** was dragged down by admin authz and custody corruption paths.
---

## 3. Business rule answers

| Question | Result | Evidence |
|----------|--------|----------|
| Can one vehicle be assigned to multiple drivers at once? | **No (enforced)** | `cars.driver_id` unique; one open assignment per car |
| Can one driver have multiple vehicles at once? | **No (happy path)** | Reassign releases prior car and closes its open interval |
| Can custody periods overlap (open) on the same car? | **No** | Transfer closes prior open; DB partial unique |
| Can custody be ended twice? | **Safe** | Repeated `driverId: null` → 200 |
| Custody for inactive driver/vehicle? | **N/A** | No inactive/status model; hard delete only |
| Assign other-company driver (company user)? | **Blocked** | 400 validation on `driverId` |
| Assign other-company driver (admin)? | **Allowed — Critical** | Live HTTP 200 |
| Company A user access Company B vehicles? | **Blocked** | Isolated lists; 404 on get-by-id |
| Historical custody directly editable? | **No dedicated API** | But partial car PATCH can force-close history unintentionally |

---

## 4. Critical findings

### AUTHZ-COMPANIES — Company JWT can administer all companies via internal API

| | |
|--|--|
| **Severity** | Critical |
| **Layer** | API / authz |
| **Reproduction** | 1) Login as `pars_admin` on company API; copy JWT from `external_auth_token`. 2) `GET`/`POST` `https://mobile-fueling-admin.inergy.ir/api/internal/companies` with `Cookie: internal_auth_token=<company_jwt>`. |
| **Expected** | Only `internal_admin` can access internal company management; company tokens → 403. |
| **Actual** | HTTP 200 list-all; HTTP 201 created “Hacked Co” (cleaned up). `InternalCompaniesController` uses `JwtAuthGuard` only — no `RolesGuard`. Sibling `/internal/cars` correctly returns 403 for the same token. |
| **Business impact** | Any company user who can call the admin host can create/update/delete companies. |
| **Fix** | Add `RolesGuard` + `@Roles(INTERNAL_ADMIN)` to `InternalCompaniesController`. Prefer rejecting tokens whose role claim does not match the cookie namespace. |

### PATCH-DEFAULTS — Partial car PATCH silently ends custody and wipes fields

| | |
|--|--|
| **Severity** | Critical |
| **Layer** | API / validation + business logic |
| **Reproduction** | With an assigned car, `PATCH /internal/cars/:id` with body `{"companyId":"<other-company>"}` only (or any partial body omitting `driverId` / `name` / `note`). |
| **Expected** | Omitted fields unchanged; custody continues unless `driverId` is explicitly changed. |
| **Actual** | Zod update schema applies create defaults: `driverId → null`, `name → ""`, `note → ""`. Service treats `driverId: null` as unassign and closes open assignment history. Confirmed live. |
| **Business impact** | Routine partial updates destroy active custody and corrupt editable fields. |
| **Fix** | Remove `.default()` from update DTOs (or build update schemas without create defaults). Only apply keys present in the raw body. Add regression tests for partial PATCH. |

**Code anchor:** `packages/shared-validation/src/car/create-car.dto.ts` (`updateInternalCarDtoSchema = createInternalCarDtoSchema.partial()` with create defaults).

### ISO-05 — Admin can assign a driver from Company B to a car of Company A

| | |
|--|--|
| **Severity** | Critical |
| **Layer** | API / business logic |
| **Reproduction** | As admin, `PATCH /internal/cars/<pars-car-id>` with a Kimia `driverId`. |
| **Expected** | Reject: driver and car must share `companyId`. |
| **Actual** | HTTP 200. External panel correctly rejects the same attempt (400). `_assertDriverAccessible` only checks RLS visibility; internal tenant sees all drivers. |
| **Business impact** | Cross-company custody corrupts tenancy and fleet accountability. |
| **Fix** | Enforce `driver.companyId === car.companyId` on create/update. Prefer a DB check constraint/trigger as backstop. |

### ISO-06 — Moving an assigned driver to another company leaves live cross-tenant custody

| | |
|--|--|
| **Severity** | Critical |
| **Layer** | API / business logic |
| **Reproduction** | Assign driver D to car C. `PATCH /internal/drivers/:id` with `{"companyId":"<other-company>"}`. |
| **Expected** | Reject, or auto-unassign and close custody before company change. |
| **Actual** | HTTP 200; car stays on Company A with driver now on Company B. |
| **Business impact** | Same cross-tenant custody break via driver edit. |
| **Fix** | On driver company change: if assigned, close assignment and clear `cars.driver_id`, or block the update. |

---

## 5. High findings

### VAL-500 — Duplicate driver/car unique violations return HTTP 500

| | |
|--|--|
| **Severity** | High |
| **Layer** | API |
| **Reproduction** | `POST` driver with existing national ID; `POST` car with existing license plate; repeat identical create. |
| **Expected** | HTTP 400 `VALIDATION_ERROR` with field messages (mappings exist in code). |
| **Actual** | HTTP 500 `INTERNAL_ERROR`. `getPostgresError` does not unwrap nested Drizzle/node-pg errors, so constraint mappings never match. |
| **Business impact** | Operators see generic failure; UI duplicate-plate messaging never triggers. |
| **Fix** | Unwrap `error.cause` in `getPostgresError`; add tests for `23505 → 400`. |

---

## 6. Medium / Low findings

| ID | Severity | Title | Actual | Fix |
|----|----------|-------|--------|-----|
| AUTH-03 | Medium | Empty login body | `{}` → 401 instead of 400 | Validate body before passport |
| PAGE-03 | Medium | Lists unpaginated | Cars/drivers/companies return full arrays | Add `page`/`limit` (+ optional `q`) |
| CUST-09 | Medium | Hard-delete loses reachable history | Assignment history 404 after car delete | Soft-delete or company-scoped history search |
| INACTIVE | Medium | No deactivate model | Hard delete only | Status enum; block assign when inactive |
| HIST-EDIT | Low | No direct history edit API | Read-only (good by default) | Keep immutable; fix PATCH-DEFAULTS first |

---

## 7. Tested workflows

| Area | Coverage |
|------|----------|
| Authentication | Login success/fail, `/me`, logout, cross-panel cookie isolation |
| Authorization | viewer vs admin writes; RolesGuard gap on companies |
| Tenant isolation | Pars vs Kimia list/get/assign |
| Drivers CRUD | create, validation, duplicate, delete-with-custody |
| Cars CRUD | create with/without driver, assign/unassign, delete |
| Custody rules | 1↔1, transfer releases prior, repeat unassign, history open/close |
| Admin tenancy | cross-company assign, move driver company, move car company |
| Pagination | assignment history OK; list endpoints unpaginated |
| Audit logs | external + internal readable |
| Telemetry | external + internal markers return data |
| Company users | list levels; viewer PATCH denied |

---

## 8. Untested / limited

| Area | Why |
|------|-----|
| Interactive UI (browser) | No browser automation; UI inferred from API + frontend code |
| `mustChangePassword` gate | Seed users have `mustChangePassword: false` |
| Concurrent race assign | Not load-tested; DB unique should serialize |
| Map/history time-range UX | Telemetry smoke-tested only |
| MQTT credential provisioning | Out of custody scope |
| Company delete cascade | Not executed against production seed companies |
| Session TTL expiry | Logout revocation verified; wall-clock expiry not waited |
| i18n / RTL visual QA | Not visually tested |

---

## 9. Recommended remediation priority

| # | Item | Status (code) |
|---|------|----------------|
| 1 | **RolesGuard** on `InternalCompaniesController` (+ role/cookie binding) | **Done** |
| 2 | **Fix update car DTOs** — no create defaults on PATCH; regression tests | **Done** |
| 3 | **Enforce same-company** on assign; block custody-breaking company moves | **Done** |
| 4 | **Fix Postgres unique mapping** → 400 (unwrap nested errors) | **Done** |
| 5a | **Paginated lists** (`page`/`limit`) on core list endpoints + both panels | **Done** |
| 5b | Soft-delete / status model (INACTIVE + CUST-09) | **Open** |
| — | **AUTH-03** empty login → 400 before passport | **Done** |

---

## 10. Code anchors

| Finding | Location |
|---------|----------|
| RolesGuard (remediated) | `apps/api/src/companies/internal-companies.controller.ts` |
| PATCH update schemas (remediated) | `packages/shared-validation/src/car/create-car.dto.ts` |
| Same-company assign (remediated) | `apps/api/src/cars/cars.service.ts`, composite FK on `cars` |
| Driver company move while assigned (remediated) | `apps/api/src/drivers/drivers.service.ts` |
| Unique error mapping (remediated) | `apps/api/src/database/postgres-error.utils.ts` |
| Custody row locks (related) | `apps/api/src/cars/car-driver-assignments.service.ts` |
| List pagination | `apps/api/src/common/pagination.utils.ts`, panel `usePagination` |
| Login body validation (AUTH-03) | `apps/api/src/auth/login-body.guard.ts` |
| Soft-delete / inactive | *(not implemented)* |

---

## Status

**Audit date:** 2026-09-09 — live score **54/100**.  
**Remediation review:** 2026-09-14 — estimated score **79/100** (Critical/High/PAGE-03/AUTH-03 fixed in code; open soft-delete; **not** re-probed live).  
Production still needs redeploy + re-probe before treating remediations as closed in the wild.

### Implemented in code

| ID | Severity | What changed |
|----|----------|--------------|
| **AUTHZ-COMPANIES** | Critical | `RolesGuard` + `@Roles(INTERNAL_ADMIN)` on `InternalCompaniesController`. |
| **PATCH-DEFAULTS** | Critical | Car update DTOs no longer inherit create `.default()` (so omitted `driverId` does not unassign). Regression coverage in `car-update-dto.spec.ts`. |
| **ISO-05** | Critical | Assign/create/update enforces driver and car share `companyId`; composite FK backstop on `cars`. |
| **ISO-06** | Critical | Driver company change blocked while assigned (`_assertDriverNotAssigned`). Car company change with an assigned driver fails same-company / FK checks. |
| **VAL-500** | High | Postgres error cause-chain unwrap; unique violations (`23505`) map to 400 field errors for cars/drivers (and related custody uniques). |
| **PAGE-03** | Medium | Server pagination (`page`/`limit`) on companies, cars, drivers, company-users lists (internal + external). Both panels use paginated queries; list UI syncs `?page=`/`?limit=` via `usePagination`. Dashboard/map walk pages via `fetchAllPaginated`. |
| **AUTH-03** | Medium | `LoginBodyGuard` validates `loginDtoSchema` before passport-local on internal and external login; empty/`{}` bodies → **400** `VALIDATION_ERROR`. |
| *(related)* | — | Custody assign path takes row locks (`FOR UPDATE`) to reduce race windows. |
| *(related)* | — | Malformed UUID path params → 400 (`assertUuidParam`). |
| *(related)* | — | Internal car/driver lists accept optional `?companyId=` (admin company detail no longer client-filters a full dump). |
| *(related)* | — | Shared types / API mappers expose timestamps as ISO strings (`iso-timestamp.utils.ts`). |

### Still open

| ID | Severity | Notes |
|----|----------|-------|
| **INACTIVE** | Medium | No status / deactivate model; hard delete only. |
| **CUST-09** | Medium | Hard-delete car still makes car-scoped assignment history unreachable (404). Soft-delete or company-scoped history search not done. |
| **HIST-EDIT** | Low | Still no direct history edit API (intentional immutability; PATCH-DEFAULTS fixed). |

### Suggested next step

Implement **soft-delete or inactive status** for cars/drivers (closes INACTIVE + largely CUST-09). After API/panel deploy, re-run the Critical/High live probes and lock the assurance score.
