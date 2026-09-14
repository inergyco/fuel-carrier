# Mobile Fueling — Data Integrity & Business-Entity Consistency Audit

**Date:** 2026-09-09 (live audit) · **Remediation review:** 2026-09-14  
**Assurance Degree (data consistency):** **94 / 100** (estimated after code remediations; pending migrate + deploy + live re-probe)  
**Original live score (2026-09-09):** **48 / 100**  
**Band:** Highly reliable (90–100) ← **estimated**; not locked as live until re-probe  
**Targets:** https://mobile-fueling.inergy.ir/ · https://mobile-fueling-admin.inergy.ir/  
**Method:** Schema/constraint review + aggressive live API probes (ID substitution, admin cross-tenant ops, partial PATCH, deletes, race assigns). No browser UI automation; UI forms inferred from code (full-body submit mitigates some PATCH bugs in happy-path UI only).

**Primary question:** *Can stored business data contradict itself?*  
**Answer (2026-09-09):** **Yes** — admin assign/move and partial car PATCH could create contradictory live custody.  
**Answer (2026-09-14, code):** **No on the audited paths** — API + DB backstops cover the violated invariants; **not** re-probed live.

Disposable test entities cleaned up. Kimia seed custody `۲۳ب۴۵۶-۷۸` → حسین restored after probes.

> **Remediation (2026-09-14):** Critical/High/Medium integrity findings from this audit are implemented in code (shared with the E2E workflow canvas where they overlapped), plus defense-in-depth DB rules for open-per-driver, interval order, and non-overlapping custody ranges. Score revised to **94** — confirm with migrate through `0021` + deploy + live re-probe. Findings in §§3–7 are the original audit evidence unless marked remediated in [§ Status](#status).

---

## 1. Assurance Degree /100

| Score | When | Basis |
|------:|------|--------|
| **48** | 2026-09-09 | Live API evidence — I8/I13 Critical paths reachable; I14/I15 missing DB checks. |
| **94** | 2026-09-14 | All listed violations remediated in code (API + DB). Held under **100** by no post-deploy re-probe and residual concurrent-response semantics. |

A score above 90 requires strong evidence that major domain invariants are enforced at **API + DB**. That bar is **met in the repo**; production evidence is still pending.

**Why not 100 yet:** Migrations `0017`–`0021` and API deploy not confirmed live; Critical/High paths not re-probed on the deployed API. Concurrent assigns may still return success to more than one client while the DB keeps a single consistent final state (stronger constraints should turn more races into 400s — verify live).

**Why not lower (after remediation):** Same-company custody is service-enforced with a composite FK; update DTOs no longer apply create defaults; open custody is unique per car **and** per driver; interval CHECK + GiST exclusion backstop history; soft-deactivate keeps car-scoped history reachable.

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

*(Original live evidence, 2026-09-09 — before remediations.)*

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

*(Original findings, 2026-09-09. All remediated in code — see [§ Status](#status).)*

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

*(Original live reproductions, 2026-09-09.)*

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
| **Status (code)** | **Done** — assert + composite FK `cars(driver_id, company_id) → drivers(id, company_id)` |

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
| **Status (code)** | **Done** — blocked while assigned |

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
| **Status (code)** | **Done** — update schemas no longer inherit create defaults |

**Root cause (historical):**  
`update*CarDtoSchema = create*CarDtoSchema.partial()` while create schema had  
`driverId: …default(null)`, `name/note: …default("")`.

### C4 — Unique conflict → 500 (integrity OK, observability broken)

| | |
|--|--|
| **Steps** | POST duplicate nationalId / licensePlate |
| **Expected** | 400 field error (DB unique still protects data) |
| **Actual** | 500 INTERNAL_ERROR |
| **Layer** | API error-mapping failure (data not duplicated) |
| **Enforce** | Unwrap nested Postgres errors in `getPostgresError` |
| **Status (code)** | **Done** — cause-chain unwrap; `23505` → 400 |

### C5 — History orphaned from API after car delete

| | |
|--|--|
| **Steps** | Delete car; GET `.../cars/:id/driver-assignments` |
| **Expected** | Retained, queryable history (or soft-delete) |
| **Actual** | 404; FKs SET NULL by design |
| **Layer** | Domain/product gap |
| **Enforce** | Soft-delete or company-scoped history index API |
| **Status (code)** | **Done** — soft-deactivate; car-scoped history remains reachable |

---

## 6. Cross-company isolation findings

*(Original live matrix, 2026-09-09.)*

| Check | Company user | Admin |
|-------|--------------|-------|
| List only own drivers/cars | Pass | Sees all (intended) |
| GET / PATCH / DELETE foreign car by ID | 404 | Can mutate any |
| Assign foreign driver ID | 400 | **Fail — allowed** *(remediated in code)* |
| Forge `companyId` on external create | Ignored; JWT company used | N/A (required in body) |
| Move driver across companies while assigned | N/A (no companyId on external update) | **Fail — leaves bad custody** *(remediated in code)* |
| Move car company via partial PATCH | N/A | **Fail — also clears custody via defaults** *(remediated in code)* |
| Live DB scan (start/end of session) | — | **0** cross-company live mismatches after cleanup |

**Note (2026-09-09):** Company isolation for company users is defense-in-depth (RLS + assert). Admin bypassed RLS with `is_internal=true` and lacked same-company business rules.  
**Note (2026-09-14):** Admin same-company assign/move rules + composite FK are in code; re-probe to confirm live.

---

## 7. Custody-history findings

*(Original live notes, 2026-09-09, with remediation callouts.)*

| Scenario | Result (live 2026-09-09) | Code (2026-09-14) |
|----------|--------------------------|-------------------|
| Two open custodians on one vehicle | Prevented (partial unique + service close) | Unchanged + still enforced |
| One driver on two vehicles (sequential) | Prevented (release + unique) | + open-per-driver unique index |
| One driver on two vehicles (parallel race) | Final state consistent; both HTTP 200 | DB uniques/exclusion should surface conflicts more often — re-probe |
| Start second without ending first | Transfer auto-closes prior | Shared timestamp on close+open (no false overlap) |
| End non-existent / double end | Safe 200 | Unchanged |
| End &lt; start / overlapping closed intervals | **Not constrained in DB** | **I14 CHECK + I15 GiST EXCLUDE** |
| Future-dated custody | Not exposed (server `now()`) | Unchanged |
| Duplicate open rows | Blocked by unique index (car) | + driver open unique |
| Custody on inactive entity | N/A — no inactive flag | Soft-deactivate; assign blocked when inactive |
| Cross-company custody | **Possible via admin** | Blocked (API + composite FK) |
| Edit historical rows | No endpoint (good) | Still immutable (intentional) |
| Delete entity with history | Open closed; history unreachable by car | Soft-deactivate; history stays car-scoped |
| Cache vs open history (happy path) | Consistent | Unchanged |
| Cache vs history after partial PATCH | **Force-closed incorrectly** | PATCH defaults fixed |

---

## 8. Recommended constraints (defense in depth)

### Database (backstop)

| Recommendation | Status (code) | Migration / artifact |
|----------------|---------------|----------------------|
| Same-tenant current custody | **Done** | Composite FK (prefer over subquery CHECK) — `0017_car_driver_same_company` |
| Open interval per driver | **Done** | `0019_driver_open_assignment_unique` |
| Temporal sanity (`unassigned_at >= assigned_at`) | **Done** | `0020_assignment_interval_check` |
| Non-overlapping ranges (GiST EXCLUDE) | **Done** | `0021_assignment_no_overlap` (`btree_gist`) |

### API / domain

| # | Item | Status (code) |
|---|------|----------------|
| 1 | Remove create `.default()` from **update** car schemas | **Done** |
| 2 | Assert `driver.companyId === car.companyId` on every assign | **Done** |
| 3 | On driver/car `companyId` change: block if assigned (or close first) | **Done** |
| 4 | Map unique violations to 400 (unwrap `error.cause`) | **Done** |
| 5 | Soft-delete / `status`; block custody when inactive | **Done** |

### UI

- Keep full-form submits (current) but **do not rely on them** — API/DB now enforce.  
- Disable cross-company driver options in admin car forms remains useful defense-in-depth (optional polish).

---

## 9. Overall risk assessment

| Area | Risk (2026-09-09) | Risk (2026-09-14, code) |
|------|-------------------|-------------------------|
| Company-panel day-to-day custody | Moderate–low if UI always sends full payloads | Low — PATCH no longer invents unassigns |
| Any API client / partial PATCH / admin tooling | **High** — silent unassign + field wipe | Low — update DTOs fixed |
| Admin multi-company operations | **High** — contradictory live custody inventable | Low — same-company + FK |
| Historical audit after deletes | Medium — unreachable by car | Low — soft-deactivate |
| Duplicate identity at rest | Low (DB unique) despite 500s | Low — unique → 400 |
| Overlapping / inverted history intervals | Medium (latent) | Low — CHECK + EXCLUDE |

**Bottom line (2026-09-09):** The database enforced “one current driver per car” and “one open interval per car,” and RLS protected company users well. It did **not** enforce “driver and car share a company,” and update DTO defaults manufactured false custody endings.

**Bottom line (2026-09-14):** Those gaps are closed in code at API and DB layers. Estimated integrity assurance **94/100**. Do not treat as **100** or as a live production score until migrate through `0021`, redeploy, and re-probe.

---

## Status

**Audit date:** 2026-09-09 — live score **48/100**.  
**Remediation review:** 2026-09-14 — estimated score **94/100** (integrity remediation backlog done in code; **not** re-probed live).  
Production still needs migrate (`0017`–`0021`) + redeploy + re-probe before locking the score (and before calling it **100**).

### Implemented in code

| ID | Severity | What changed |
|----|----------|--------------|
| **I8 / C1** | Critical | Same-company assert on assign; composite FK on `cars`. |
| **I8 / C2** | Critical | Driver company change blocked while assigned. |
| **I13 / I7 / C3** | Critical | Car update DTOs without create `.default()`; regression tests. |
| **I9 / C4** | High | Postgres cause-chain unwrap; unique → 400. |
| **I12 / C5** | Medium | Soft-deactivate cars/drivers; history remains car-scoped. |
| **Inactive** | Medium | `entity_status` active/inactive; assign blocked when inactive. |
| **Open-per-driver** | Medium | Partial unique `car_driver_assignments_driver_id_open_unique` (`0019`). |
| **I14** | Medium | CHECK `car_driver_assignments_interval_chk` (`0020`). |
| **I15** | Medium | GiST EXCLUDE no-overlap per car and per driver (`0021`); assign close+open shares one timestamp. |
| *(related)* | — | Exclusion/unique violations map to clear 400 field errors; custody row locks. |

### Still open

| Item | Notes |
|------|--------|
| Live re-probe | Required to lock score; do not claim **100** until then. |
| Deploy / migrate | Apply through `0021_assignment_no_overlap` (needs `btree_gist`). |
| Concurrent assign UX | DB should stay consistent; confirm clients get conflict errors rather than dual 200s where possible. |
| Admin UI driver filter | Optional: hide cross-company drivers in car forms (defense only). |

### Suggested next step

Run migrations through `0021`, deploy API, re-probe C1–C5 + soft-delete + overlap/open-unique paths, then lock the integrity assurance score. This canvas’s remediation backlog is otherwise complete — proceed to the next audit canvas when ready.

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
| PATCH defaults (remediated) | `packages/shared-validation/src/car/create-car.dto.ts` |
| Same-company assign (remediated) | `apps/api/src/cars/cars.service.ts`, `drizzle/0017_car_driver_same_company.sql` |
| Driver company move while assigned (remediated) | `apps/api/src/drivers/drivers.service.ts` |
| Open-per-car / open-per-driver unique | `apps/api/src/database/schema/car-driver-assignments.ts`, `drizzle/0019_*.sql` |
| Interval CHECK | `drizzle/0020_assignment_interval_check.sql` |
| No-overlap EXCLUDE | `drizzle/0021_assignment_no_overlap.sql` |
| Shared close+open timestamp | `apps/api/src/cars/car-driver-assignments.service.ts` |
| Unique / exclusion error mapping | `apps/api/src/database/postgres-error.utils.ts`, `cars-postgres-mappings.ts` |
| Soft-delete / inactive | `entity_status`; cars/drivers services; `drizzle/0018_entity_status.sql` |
