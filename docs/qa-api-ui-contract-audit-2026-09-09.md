# Mobile Fueling — API ↔ UI Contract Audit

**Date:** 2026-09-09  
**Targets:** https://mobile-fueling.inergy.ir/ · https://mobile-fueling-admin.inergy.ir/  
**Scope:** Mismatches between what frontends assume and what the API/DB actually guarantee.  
**Method:** Shared client + DTO/service review; live probes on both portals (login, lists, validation errors, duplicate create, note-only PATCH, auth, pagination envelopes). Destructive cross-company assign not re-run (seed safety); confirmed in prior integrity audit + code path.

**API/UI Assurance Degree:** **78 / 100** (was 54; remediations 2026-09-23)

The success envelope and shared Zod DTOs look aligned, but several **write contracts are unsafe**: omitted PATCH fields are rewritten by Zod defaults, uniqueness races become opaque 500s, custody concurrency returns contradictory 200s, and several operational rules exist only in the UI (or only in the DB) rather than as an explicit API contract.

---

## 1. Assurance Degree /100

| Band | Meaning |
|------|---------|
| 90–100 | Contracts trustworthy under partial clients and races |
| 70–89 | Minor gaps; enforcement layered correctly |
| 60–69 | Usable happy path; weak edge contracts |
| **50–59** | **High risk if any client omits fields or races** ← **54** |
| 0–49 | Frontend decisions are the real policy |

Scoring weights **backend enforcement** and **honest status/payload contracts** over “screens exist.”

---

## 2. Protection layers (summary)

| Rule | Frontend | Backend | Database |
|------|:--------:|:-------:|:--------:|
| Company user cannot access other tenant cars/drivers | N/A (scoped lists) | JWT + RLS | RLS |
| Viewer cannot mutate | Hide buttons | `CompanyUserAdminGuard` 403 | — |
| Same-company custody (external) | Driver dropdown is company-scoped | RLS hides foreign driver → 400 | FK / tenant |
| Same-company custody (internal admin) | Company detail filters lists | **Missing** company match assert | **Allows** cross-company `driver_id` |
| One open assignment per car | No lock UI | Soft sync in TX | Unique open index |
| One live driver per car (`cars.driver_id`) | No “busy driver” disable | Silent steal / release | Unique on `driver_id` |
| Omitted PATCH fields unchanged | Forms usually send full body | **Broken** Zod `.default()` on update | — |
| Duplicate license plate | Client may block UX | Create mapped; **update not** | Unique → often **500** |
| Concurrent custody | `isSaving` only | No 409 / no row lock | Uniques hold final state |
| List pagination | Infinite / full fetch | Unpaginated lists | — |

---

## 3. Contract violations

### CV-01 — Partial car PATCH invents `driverId: null`, `name: ""`, `note: ""`

| | |
|--|--|
| **Endpoint** | `PATCH /api/external/cars/:id`, `PATCH /api/internal/cars/:id` |
| **Problem** | `update*CarDtoSchema = create*.partial()` keeps create-time `.default()`s, so **omitted** keys are filled before the service runs. |
| **Expected** | Omitted fields unchanged; only sent keys applied. |
| **Actual (live)** | `PATCH { note: <current> }` on Pars car → **`name` wiped** `"sec"` → `""` (200). Restored after probe. Prior audit: note-only also nulls `driverId`. |
| **Impact** | Silent custody end / blank names from any thin client, script, or concurrent probe. |
| **Fix** | Explicit update schemas **without** defaults; regression tests for single-field PATCH. |

### CV-02 — Duplicate license plate → `500 INTERNAL_ERROR` (not conflict)

| | |
|--|--|
| **Endpoint** | `POST /api/external/cars` (live); same pattern risk on driver national ID / update path |
| **Problem** | Unique violation not mapped to a client contract code; `ApiErrorCode` has **no CONFLICT**. Update path does not call `rethrowPostgresError`. |
| **Expected** | `409` (or `400` with `fields: [{ field: "licensePlate", ... }]`) and stable `code`. |
| **Actual (live)** | `500` `{ "error": { "code": "INTERNAL_ERROR", "message": "Internal server error" } }`. |
| **Impact** | FE cannot show field-level recovery; operators see generic failure; monitoring noise. |
| **Fix** | Map `23505` on create **and** update; add `CONFLICT` (or reuse `VALIDATION_ERROR` + fields). |

### CV-03 — Invalid path UUID treated as not-found

| | |
|--|--|
| **Endpoint** | `GET /api/external/cars/not-a-uuid` |
| **Expected** | `400 VALIDATION_ERROR` on malformed id (or framework ParseUUIDPipe). |
| **Actual (live)** | `404 NOT_FOUND` “Car not found”. |
| **Impact** | Clients cannot distinguish bad input vs missing entity; weak for IDOR probing telemetry. |
| **Fix** | UUID pipe / Zod param validation before lookup. |

### CV-04 — Response shape wider than shared types

| | |
|--|--|
| **Endpoints** | `GET/POST/PATCH …/cars`, `…/drivers` |
| **Problem** | Mappers return raw rows; wire includes `createdAt` / `updatedAt` (live keys confirmed). Shared `Car` / `Driver` omit them. Drivers also nest `car`. |
| **Expected** | Types === wire, or documented extension types. |
| **Actual** | Undeclared timestamps (ISO strings); FE may ignore or accidentally depend. |
| **Impact** | Contract drift; timezone assumptions undocumented. |
| **Fix** | Add fields to shared-types **or** strip in mapper. |

### CV-05 — Typed `Date` fields arrive as ISO strings

| | |
|--|--|
| **Endpoints** | Assignments, audit logs |
| **Problem** | `CarDriverAssignment.assignedAt` / `AuditLog.createdAt` typed as `Date`; JSON always strings. FE often accepts `Date \| string`. |
| **Expected** | `string` (ISO-8601) in shared-types, or runtime revive. |
| **Actual** | Strings on wire; types lie. |
| **Impact** | Subtle bugs if code calls `.getTime()` without normalizing. |
| **Fix** | Declare `string` (preferred) everywhere on API DTOs. |

### CV-06 — Company update schema is not partial

| | |
|--|--|
| **Endpoint** | `PATCH /api/internal/companies/:id` |
| **Problem** | `updateCompanyDtoSchema = createCompanyDtoSchema` (full body required). |
| **Expected** | True partial PATCH **or** documented PUT semantics. |
| **Actual** | Full replace; FE always sends full form (works for UI only). |
| **Impact** | Thin API clients clear omitted fields / fail validation. |
| **Fix** | Explicit partial update DTO + service merge. |

---

## 4. Frontend-only validations / decisions

| Workflow | FE behavior | BE behavior | Gap |
|----------|-------------|-------------|-----|
| Assign driver | All company drivers listed; no “already on vehicle” disable | Silently releases other car / steals driver | **UI does not warn; API allows steal** |
| Viewer mutations | Buttons hidden | 403 if called | Aligned (FE convenience only) |
| Admin company cars/drivers | Client filters `GET /internal/cars\|drivers` by route `companyId` | Returns **all** tenants | Over-fetch; display trust is FE |
| Car detail under wrong company route | FE mismatch empty/not-found | Admin can still `GET` by id | Soft guard only |
| Internal car form `driverId: ""` | May fail client Zod (no `''→null` transform) | Expects `uuid \| null` | External has transform; **internal diverges** |
| Form double-submit | `isSaving` disables | No idempotency key | FE-only; races still possible across tabs |
| Mid-session demotion / logout | No global 401 handler | 401 on next call | FE assumes session sticky |

**Key example (prompt):** If the UI ever disabled “Assign” because a vehicle already has a driver, that would be **frontend-only** today — the API still accepts a new `driverId` and ends the previous assignment without a dedicated “end custody” resource or confirmation contract.

---

## 5. Data exposure findings

| Finding | Severity | Notes |
|---------|----------|-------|
| Password hashes | OK | Not in company-user mapper |
| MQTT password | Acceptable | Returned once on provision/rotate |
| `userId`, `companyId`, assignment actor ids | Low | Needed for ops; not secrets |
| `createdAt` / `updatedAt` on cars/drivers | Low | Undeclared; not highly sensitive |
| Session `role` / `companyUserLevel` | OK | Required for UI gating (must still be enforced server-side) |
| Audit password fields | OK | Redacted in audit utils |
| Internal DB constraint names | Not on wire | Failures collapse to generic 500 |

No confirmed unnecessary secret leakage from list/detail GETs in this pass.

---

## 6. Date/time issues

| Issue | Detail |
|-------|--------|
| Type vs wire | `Date` in shared-types → ISO `string` JSON |
| Timezone | DB `timestamptz`; responses appear UTC ISO — FE localization not standardized |
| Telemetry | `updatedAt: string` correctly typed; history query parses `start`/`end` as `Date` |
| Ordering | Lists ordered `createdAt DESC`; assignments `assignedAt DESC` — **not documented** in OpenAPI; FE assumes “newest first” without contract tests |

---

## 7. Concurrency / idempotency issues

| Issue | Actual | Expected |
|-------|--------|----------|
| Concurrent custody PATCH | Both **200**; last-write-wins; response bodies can disagree with final DB (prior live race) | One **409**, or both refetch truth before success UX |
| Duplicate create | Second request **500** | **409** + fields |
| MQTT credential rotate | Each POST mint new secret | Idempotency-Key or explicit “rotate” confirm |
| Mutating routes | No `Idempotency-Key` / `If-Match` / version | Especially create + custody |
| Open assignment unique | DB prevents dual-open | Good **DB** protection; API does not surface conflict cleanly |

---

## 8. ID / reference manipulation

| ID | External portal | Internal portal |
|----|-----------------|-----------------|
| `companyId` on create | Injected from JWT (safe) | Required in body (admin OK) |
| `companyId` on car update | Omitted from external schema | Can change ownership; combined with CV-01 may also null `driverId` |
| `driverId` | Must be visible under RLS | **Any** driver id if assert only checks existence |
| Path entity ids | RLS / 404 | Global admin access |
| Custody id | Not a write API (history read-only) | Same — historical edit not exposed (good) |

---

## 9. Error format consistency

| Case | Live / code | Contract quality |
|------|-------------|------------------|
| Zod validation | `400` + `fields[]` | Good; FE maps field errors |
| Unauthorized | `401 UNAUTHORIZED` | Good |
| Forbidden viewer | `403` | Good |
| Not found | `404` | Good |
| Unique / race | `500 INTERNAL_ERROR` | **Bad** |
| Non-envelope HTTP errors | ky `HTTPError` (not always `ApiClientError`) | FE may show generic toast |

Login success uses **201** with `{ data: { user } }` — unusual vs common `200`, but both portals accept it.

---

## 10. Numeric precision / enums / status

| Topic | Verdict |
|-------|---------|
| Numeric precision | Telemetry floats as JSON numbers — no money/decimal domain observed; low risk |
| Status enums | No car/driver lifecycle status — nothing to mismatch, but also nothing for “inactive” contracts |
| `CompanyUserLevel` | `admin` \| `viewer` aligned FE/BE |
| Audit `action` | Typed as `AuditAction \| string` — allows drift |

---

## 11. Recommended API improvements (priority)

1. **Fix car update DTOs** — remove create `.default()` from partial updates. ← **Done** (explicit `carUpdateBaseSchema`; regression in `car-update-dto.spec.ts`).  
2. **Enforce `driver.companyId === car.companyId`** on internal assign + block driver company move while assigned. ← **Done** (service assert + composite FK).  
3. **Map unique violations** on create **and** update → 409/400 with `fields`. ← **Done** (`rethrowPostgresError` + field mappings; `CONFLICT` for custody races).  
4. **Serialize custody writes** (row lock) and return conflict on lost races. ← **Done** (`FOR UPDATE` + `expectedDriverId` → 409). Optional `If-Match` still open.  
5. **Align shared-types with wire** (`createdAt`/`updatedAt` / assignment timestamps as ISO `string`). ← **Done**.  
6. **UUID path params** → 400 on malformed ids. ← **Done** (`assertUuidParam`; company update/delete included 2026-09-23).  
7. **Internal list filters** `?companyId=` for cars/drivers. ← **Done**.  
8. **Idempotency-Key** on create car/driver/user and MQTT provision. ← **Parked** (lower priority; custody races already 409).  
9. **First-class custody API** (`POST …/assign`, `POST …/unassign`). ← **Parked** — custody writes still go through car PATCH with `expectedDriverId` (locks + 409); dedicated routes optional.  
10. Harmonize internal car form `driverId` empty-string transform with external. ← **Done**.  
11. **Company update partial schema (CV-06)** — ← **Done (2026-09-23):** explicit `updateCompanyDtoSchema` without inventing nulls; service merges partial; OpenAPI `PartialType`.

**Remediation review (2026-09-23):** Critical write-contract items (CV-01…CV-06 + same-company + custody 409) closed. Remaining: Idempotency-Key, dedicated assign/unassign routes (parked).

**Updated assurance:** **78 / 100** (was 54).

---

## 12. Return checklist

| # | Item | Result |
|---|------|--------|
| 1 | Assurance Degree | **78 / 100** (was 54) |
| 2 | Contract violations | CV-01…CV-06 **remediated** |
| 3 | Frontend-only validations | Busy-driver UX still soft; companyId filter now server-side |
| 4 | Data exposure | No hashes; timestamps declared; MQTT once |
| 5 | Date/time | Shared-types use ISO `string` |
| 6 | Concurrency/idempotency | Custody 409; dup → fields; no Idempotency-Key (parked) |
| 7 | Recommended improvements | §11 — critical done; 8–9 parked |

---

*Related:* `docs/qa-data-integrity-audit-2026-09-09.md`, `docs/qa-reliability-audit-2026-09-09.md`, `docs/qa-admin-ops-audit-2026-09-09.md`.
