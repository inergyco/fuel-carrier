# Mobile Fueling — Data Integrity & Business-Entity Consistency Audit

**Date:** 2026-09-09  
**Assurance Degree (data consistency):** **48 / 100**  
**Band:** Major reliability concerns (40–59)  
**Targets:** https://mobile-fueling.inergy.ir/ · https://mobile-fueling-admin.inergy.ir/  
**Method:** Schema/constraint review + aggressive live API probes (ID substitution, admin cross-tenant ops, partial PATCH, deletes, race assigns). No browser UI automation; UI forms inferred from code (full-body submit mitigates some PATCH bugs in happy-path UI only).

**Primary question:** *Can stored business data contradict itself?*  
**Answer:** **Yes.** Several reachable paths produce contradictory live custody and corrupted field values. Company-user isolation is strong; admin paths and partial-update validation are not.

Disposable test entities cleaned up. Kimia seed custody `۲۳ب۴۵۶-۷۸` → حسین restored after probes.

---

## 1. Assurance Degree /100

| Score | Meaning |
|------:|---------|
| **48** | Major consistency concerns — contradictory live states are reachable |

A score above 90 would require strong evidence that major domain invariants are enforced at **API + DB**. That bar is not met.

**Why not lower:** Company-scoped RLS works; `cars.driver_id` UNIQUE and open-assignment partial unique prevent the worst “two active custodians on one car” under normal company flows; current production snapshot had **zero** live cross-company custody mismatches at scan time.

**Why not higher:** Admin can create cross-company custody; moving a driver’s company leaves cross-tenant assignment; any partial car PATCH injects `driverId: null` / empty name/note and silently ends custody — including on the **external** API.

---

## 2. Domain invariants discovered

| ID | Invariant |
|----|-----------|
| I1 | Every driver belongs to exactly one company (`drivers.company_id` NOT NULL). |
| I2 | Every vehicle belongs to exactly one company (`cars.company_id` NOT NULL). |
| I3 | Company users only see/mutate their company’s drivers/cars (RLS + JWT). |
| I4 | A vehicle has at most one **current** driver (`cars.driver_id` UNIQUE). |
| I5 | A driver is current custodian of at most one vehicle (same UNIQUE + release helper). |
| I6 | A vehicle has at most one **open** custody interval (`unassigned_at IS NULL`). |
| I7 | Current cache `cars.driver_id` matches the open history row for that car (when assigned). |
| I8 | **If assigned, driver.company_id = car.company_id** (same-tenant custody). |
| I9 | National IDs unique globally; license plates unique globally. |
| I10 | Ending custody when already unassigned is a no-op (safe). |
| I11 | Custody history is not directly editable via API. |
| I12 | Deleting a driver/car closes open custody and clears/nulls FKs without orphaning open intervals. |
| I13 | Partial updates must not change omitted fields. |
| I14 | `unassigned_at >= assigned_at` when both set. |
| I15 | Closed intervals for the same car/driver should not overlap (historical). |

---

## 3. Invariants successfully enforced

| Invariant | Enforcement | Live evidence |
|-----------|-------------|---------------|
| I1, I2 | DB NOT NULL + FK to companies | Schema |
| I3 (company user) | RLS `app_tenant_allows_company` + service checks | Foreign car GET/PATCH/DELETE → 404; foreign driver assign → 400; forged `companyId` on create ignored (JWT company used) |
| I4, I5, I6 | DB unique + service `releaseDriverFromOtherCar` / `closeOpenAssignments` | Transfer leaves prior car null, one open row; race ended with one car holding driver |
| I7 (happy path) | Service writes cache + history together | Cache driverId matched open history row |
| I9 (uniqueness) | DB UNIQUE | Duplicates rejected at DB (but API returns **500**, not 400) |
| I10 | Service treats null→null as no sync work / safe PATCH | Second unassign → 200 |
| I11 | No PATCH/DELETE on assignment resources | History edit → 404 |
| I12 (delete driver) | Service closes opens; FK SET NULL on car | After delete: car.driverId null, open count 0 |

---

## 4. Violated invariants

| Invariant | Severity | Failure layer | Summary |
|-----------|----------|---------------|---------|
| **I8** same-company custody | **Critical** | Domain/API (missing rule); **no DB constraint** | Admin assign Kimia driver to Pars car → 200 |
| **I8** via driver move | **Critical** | Domain/API | PATCH driver `companyId` while assigned → live cross-tenant custody |
| **I13** partial update | **Critical** | API validation (Zod defaults on update) | `PATCH {note}` or `{companyId}` sets `driverId:null`, `name:""`, ends custody |
| **I7** under partial PATCH | **Critical** | Cascades from I13 | Cache cleared and history force-closed without intentional unassign |
| I9 error surfacing | **High** | API error mapping | Unique violations → HTTP 500 instead of 400 |
| I12 history reachability | **Medium** | Product/API | After car delete, history API 404 (rows may remain with null FKs) |
| I14, I15 | **Medium** (latent) | Missing DB CHECKs | No `unassigned_at >= assigned_at`; no overlap exclusion on closed intervals |
| Inactive entities | **Medium** | Missing domain | No status; cannot block custody on “inactive” |

---

## 5. Data corruption scenarios (reproduced)

### C1 — Cross-company live custody (admin assign)

| | |
|--|--|
| **Entities** | Pars car + Kimia driver |
| **Steps** | As admin: `PATCH /internal/cars/<parsCarId> {"driverId":"<kimiaDriverId>"}` |
| **Broken invariant** | I8 |
| **Expected** | Reject |
| **Actual** | 200; car.companyId=Pars, driver.companyId=Kimia |
| **Layer** | Domain/business-rule failure (API); DB allows it |
| **Enforce** | Service: `driver.companyId === car.companyId`; DB CHECK or trigger on `cars` |

### C2 — Cross-company custody via driver company change

| | |
|--|--|
| **Entities** | Assigned driver + car |
| **Steps** | Assign D→C; `PATCH /internal/drivers/:id {"companyId":"<other>"}` |
| **Broken invariant** | I8 |
| **Expected** | Reject or auto-unassign + close history |
| **Actual** | 200; car still references driver now in other company |
| **Layer** | Domain/API |
| **Enforce** | On driver company change: clear `cars.driver_id` + close open assignments, or block |

### C3 — Partial car PATCH destroys custody and wipes fields

| | |
|--|--|
| **Entities** | Any assigned car |
| **Steps** | External: `PATCH /external/cars/:id {"note":"only"}` · Admin: `PATCH /internal/cars/:id {"companyId":"<other>"}` |
| **Broken invariant** | I13, I7; side-effect on I8 path |
| **Expected** | Only sent fields change |
| **Actual** | Zod fills `driverId: null`, `name: ""`, `note` default; service unassigns and closes open history; name wiped. Confirmed on **both** external and internal APIs. |
| **Layer** | API validation failure → domain side effects |
| **Enforce** | Update DTOs without `.default()`; parse only present keys; add regression tests |

**Root cause:**  
`update*CarDtoSchema = create*CarDtoSchema.partial()` while create schema has  
`driverId: …default(null)`, `name/note: …default("")`.

### C4 — Unique conflict → 500 (integrity OK, observability broken)

| | |
|--|--|
| **Steps** | POST duplicate nationalId / licensePlate |
| **Expected** | 400 field error (DB unique still protects data) |
| **Actual** | 500 INTERNAL_ERROR |
| **Layer** | API error-mapping failure (data not duplicated) |
| **Enforce** | Unwrap nested Postgres errors in `getPostgresError` |

### C5 — History orphaned from API after car delete

| | |
|--|--|
| **Steps** | Delete car; GET `.../cars/:id/driver-assignments` |
| **Expected** | Retained, queryable history (or soft-delete) |
| **Actual** | 404; FKs SET NULL by design |
| **Layer** | Domain/product gap |
| **Enforce** | Soft-delete or company-scoped history index API |

---

## 6. Cross-company isolation findings

| Check | Company user | Admin |
|-------|--------------|-------|
| List only own drivers/cars | Pass | Sees all (intended) |
| GET / PATCH / DELETE foreign car by ID | 404 | Can mutate any |
| Assign foreign driver ID | 400 | **Fail — allowed** |
| Forge `companyId` on external create | Ignored; JWT company used | N/A (required in body) |
| Move driver across companies while assigned | N/A (no companyId on external update) | **Fail — leaves bad custody** |
| Move car company via partial PATCH | N/A | **Fail — also clears custody via defaults** |
| Live DB scan (start/end of session) | — | **0** cross-company live mismatches after cleanup |

**Note:** Company isolation for company users is defense-in-depth (RLS + assert). Admin bypasses RLS with `is_internal=true` and lacks same-company business rules.

---

## 7. Custody-history findings

| Scenario | Result |
|----------|--------|
| Two open custodians on one vehicle | Prevented (partial unique + service close) |
| One driver on two vehicles (sequential) | Prevented (release + unique) |
| One driver on two vehicles (parallel race) | Final state consistent (one holder); both HTTP 200 — no user-facing conflict |
| Start second without ending first | Transfer auto-closes prior |
| End non-existent / double end | Safe 200 |
| End &lt; start / overlapping closed intervals | **Not constrained in DB**; no history edit API to create easily |
| Future-dated custody | Not exposed (server `now()`) |
| Duplicate open rows | Blocked by unique index |
| Custody on inactive entity | N/A — no inactive flag |
| Cross-company custody | **Possible via admin** |
| Edit historical rows | No endpoint (good) |
| Delete entity with history | Open closed; history FKs null; car-scoped history unreachable |
| Cache vs open history (happy path) | Consistent |
| Cache vs history after partial PATCH | **Force-closed incorrectly** |

There is **no** DB unique for “one open assignment per driver” on `car_driver_assignments` — only `cars.driver_id` UNIQUE. Service layer is required for driver-side open consistency.

---

## 8. Recommended constraints (defense in depth)

### Database (backstop)

```sql
-- Same-tenant current custody
ALTER TABLE cars ADD CONSTRAINT cars_driver_same_company_chk
  CHECK (
    driver_id IS NULL OR company_id = (
      SELECT company_id FROM drivers WHERE id = driver_id
    )
  );
-- Prefer a TRIGGER if subquery CHECK is unsupported/undesired.

-- Open interval per driver (mirror car open unique)
CREATE UNIQUE INDEX car_driver_assignments_driver_id_open_unique
  ON car_driver_assignments (driver_id)
  WHERE unassigned_at IS NULL AND driver_id IS NOT NULL;

-- Temporal sanity
ALTER TABLE car_driver_assignments
  ADD CONSTRAINT car_driver_assignments_interval_chk
  CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at);

-- Optional: GiST exclusion for non-overlapping ranges per car/driver
```

### API / domain

1. Remove create `.default()` from **update** car schemas (critical).  
2. Assert `driver.companyId === car.companyId` on every assign (internal + external).  
3. On driver or car `companyId` change: block if assigned, or close custody first in one transaction.  
4. Map unique violations to 400 (unwrap `error.cause`).  
5. Consider soft-delete / `status` and block new custody when inactive.

### UI

- Keep full-form submits (current) but **do not rely on them**.  
- Disable cross-company driver options in admin car forms (defense only).

---

## 9. Overall risk assessment

| Area | Risk |
|------|------|
| Company-panel day-to-day custody | Moderate–low if UI always sends full car payloads |
| Any API client / partial PATCH / admin tooling | **High** — silent unassign + field wipe |
| Admin multi-company operations | **High** — contradictory live custody inventable |
| Historical audit after deletes | Medium — data may exist but not queryable by car |
| Duplicate identity at rest | Low (DB unique holds) despite 500 responses |

**Bottom line:** The database enforces “one current driver per car” and “one open interval per car,” and RLS protects company users well. It does **not** enforce “driver and car share a company,” and the update DTO defaults actively **manufacture** false custody endings. Until those are fixed, confidence that stored business data cannot contradict itself remains below a production-safe bar for multi-tenant admin use.

---

## Appendix — Probe log highlights (2026-09-09)

```
ISO-SUB-DRV                 400 (blocked)
ISO-*-FOREIGN-CAR           404 (blocked)
ISO-FORGE-COMPANYID         201 company=Pars (JWT wins)
CUST-TRANSFER               prior null, one open
CUST-CACHE-HIST             match
ADMIN-XCOMP-ASSIGN          200 cross-company (VIOLATION)
ADMIN-MOVE-DRV-CO           200 cross-company (VIOLATION)
ADMIN-PARTIAL / EXT-PARTIAL note/company → driverId null, name wiped (VIOLATION)
DEL-DRV-ACTIVE              clean close
DEL-CAR-HIST                hist 404
DUP-*                       500 (unique still holds)
RACE                        final single holder
final_cross_company         []
```

### Code anchors

| Issue | Location |
|-------|----------|
| PATCH defaults | `packages/shared-validation/src/car/create-car.dto.ts` |
| Assign without same-company | `apps/api/src/cars/cars.service.ts` (`_assertDriverAccessible`) |
| Open-per-car unique | `apps/api/src/database/schema/car-driver-assignments.ts` |
| Driver unique on car | `apps/api/src/database/schema/cars.ts` |
| Unique error unwrap | `apps/api/src/database/postgres-error.utils.ts` |
