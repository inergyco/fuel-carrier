# Mobile Fueling — E2E Business Workflow Audit

**Date:** 2026-09-09  
**Assurance Degree:** **54 / 100** (major reliability concerns)  
**Targets:**
- Company panel: https://mobile-fueling.inergy.ir/
- Admin panel: https://mobile-fueling-admin.inergy.ir/

**Accounts used:** `pars_admin`, `pars_ops`, `kimia_admin`, `zagros_admin`, `khosravi`  
**Method:** Authenticated live API tests against `/api/external` and `/api/internal`, plus code review of custody/auth paths. Interactive browser UI was not automated.

Disposable QA entities were cleaned up. Kimia seed assignment for plate `۲۳ب۴۵۶-۷۸` → driver حسین was restored after cross-company tests. A privilege-escalation test company (“Hacked Co”) was deleted immediately after creation.

---

## 1. Executive summary

Company-tenant happy paths are largely solid: login, logout, Pars/Kimia isolation, viewer write denial, and 1:1 driver↔vehicle custody behave correctly for company users.

The product is **not** equally safe on the admin/API side. Four Critical issues undermine multi-tenant integrity and authorization:

1. A company JWT can manage companies on the internal API (missing role guard).
2. Partial car `PATCH` silently ends custody and wipes fields (Zod create-defaults on update schemas).
3. Admins can assign a driver from Company B to a car of Company A.
4. Moving an assigned driver to another company leaves live cross-tenant custody.

Duplicate unique violations also return HTTP 500 instead of field validation errors.

**Verdict:** Do not treat the polished UI as proof of production readiness for multi-company admin operations. Company-panel day-to-day use is stronger than overall system assurance.

---

## 2. Assurance scoring

| Band | Meaning |
|------|---------|
| 90–100 | Highly reliable |
| 80–89 | Good, minor issues |
| 70–79 | Acceptable but meaningful issues |
| 60–69 | Risky |
| **40–59** | **Major reliability concerns** ← **54 assigned** |
| 0–39 | Unsafe / unreliable for production |

Score is evidence-based and not inflated by UI polish. Company-panel isolation/custody alone would score higher (~80); overall score includes admin authz and custody corruption paths.

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

1. **RolesGuard** on `InternalCompaniesController` (+ role/cookie binding).
2. **Fix update car DTOs** — no create defaults on PATCH; regression tests for partial updates.
3. **Enforce same-company** on assign; block/clear custody on driver or car company moves.
4. **Fix Postgres unique mapping** → 400 (unwrap nested errors).
5. Soft-delete or status + paginated lists before fleet scale.

---

## 10. Code anchors

| Finding | Location |
|---------|----------|
| Missing RolesGuard | `apps/api/src/companies/internal-companies.controller.ts` |
| PATCH defaults | `packages/shared-validation/src/car/create-car.dto.ts` |
| Assign / sync custody | `apps/api/src/cars/cars.service.ts`, `car-driver-assignments.service.ts` |
| Unique error mapping | `apps/api/src/database/postgres-error.utils.ts` |

---

## Status

- **AUTHZ-COMPANIES:** Remediated in code (`RolesGuard` + `@Roles(INTERNAL_ADMIN)` on `InternalCompaniesController`). Redeploy API to take effect in production.
- Remaining Critical items (PATCH-DEFAULTS, ISO-05, ISO-06) and High/Medium findings still open.
