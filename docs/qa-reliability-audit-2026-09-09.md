# Mobile Fueling — Reliability & Failure-Mode Audit

**Date:** 2026-09-09  
**Targets:** https://mobile-fueling.inergy.ir/ · https://mobile-fueling-admin.inergy.ir/  
**Scope:** Behavior when things go wrong — network, user actions, API errors, concurrency (especially custody).  
**Method:** Shared client/query code review + live API probes (status codes, concurrent custody assigns). Interactive browser throttling / multi-tab UI not instrumented in a device lab; UI failure mapping inferred from React Query + form/mutation code (same stack on both panels).

**Reliability Assurance Degree:** **61 / 100**

Happy path forms and DB uniqueness prevent the worst dual-open custody corruption, but concurrent custody writes can return **success to both clients** with a **last-write-wins** final state, error surfaces often look like empty/not-found, mid-session 401 is unhandled, and partial PATCH defaults wipe fields during “simple” assigns.

---

## 1. Assurance Degree /100

| Band | Meaning |
|------|---------|
| 90–100 | Strong under failure and concurrency |
| 70–89 | Acceptable with gaps |
| **60–69** | **Meaningful reliability weaknesses** ← **61** |
| 40–59 | High operational risk |
| 0–39 | Unsafe |

**Not inflated by happy path.** Score reflects: concurrent assign messaging, silent field wipe on PATCH, opaque 500s, weak list/detail error UX, no offline/401 recovery.

---

## 2. Failure scenarios tested

| Area | Scenario | How tested |
|------|----------|------------|
| API | 400 validation | Live POST empty driver |
| API | 401 unauthenticated | Live GET cars no cookie |
| API | 403 forbidden | Live viewer create driver |
| API | 404 missing | Live GET unknown car UUID |
| API | 500 (duplicate as internal) | Live duplicate national ID |
| API | Invalid id shape | Live GET `not-uuid` → 404 |
| API | 409 / 422 | **Not observed** in product (duplicates → 500, not 409) |
| API | 429 / 502 / 503 | Code-reviewed (login maps 429; ky retries some GETs); not load-hammered |
| Network | Timeout / slow | Client `timeout: 30s`; `retryOnTimeout: false`; not lab-throttled |
| User | Double-submit forms | Code: `isSaving` disables button / blocks close |
| User | Double create | Live: 201 then 500 (no duplicate row) |
| Concurrency | Same driver → two cars | Live parallel PATCH |
| Concurrency | Two drivers → same car | Live parallel PATCH |
| Concurrency | End vs assign same car | Live parallel PATCH |
| Concurrency | Delete vs PATCH | Live parallel |
| UI | List/detail on error | Code: empty / not-found conflation |
| UI | Mid-session 401 | Code: no global handler |
| UI | Multi-tab logout | Code: no BroadcastChannel/storage sync |
| UI | Offline | Code: none |

---

## 3. Confirmed reliability problems

### REL-01 — Concurrent custody: both clients get 200; only one final state

| | |
|--|--|
| **Failure scenario** | Two operators assign the same driver to two vehicles at once; or two drivers to one vehicle at once. |
| **Reproduction** | Parallel `PATCH /external/cars/{id}` with conflicting `driverId` (live). |
| **Expected** | One success, one conflict (409/400) **or** both refetch and show final truth; no false success. |
| **Actual** | **Same driver → two cars:** both HTTP 200; final: one car holds driver, other null. **Same car → two drivers:** both HTTP 200 with **different** `driverId` in each response body; final DB had one driver and **one** open history row. |
| **Data corruption risk** | Medium — invariants held (≤1 open / ≤1 `cars.driver_id`), but **clients can believe contradictory success**. |
| **User impact** | Operator A thinks assign succeeded; list/detail after refresh shows otherwise → lost trust, rework, possible second mistaken assign. |
| **Solution** | Serialize assigns (row lock / advisory lock); return 409 on unique conflict; map DB unique to 409; UI always invalidate + refetch before toast; optional version/`updatedAt` precondition. |

### REL-02 — Partial car PATCH wipes name/note and can clear custody

| | |
|--|--|
| **Failure scenario** | Assign/edit with body only `{driverId}` or `{note}` (including concurrent assign probes). |
| **Reproduction** | Live concurrent assign responses showed `"name":""`; integrity audit proved note-only PATCH sets `driverId: null`. |
| **Expected** | Omitted fields unchanged. |
| **Actual** | Zod update defaults fill `driverId: null`, `name/note: ""`. |
| **Data corruption risk** | **High** — silent custody end / blank names under normal API use. |
| **User impact** | “I only changed the note / assigned a driver” → vehicle untitled and/or unassigned. |
| **Solution** | Fix update DTOs (no create defaults); regression tests. |

### REL-03 — Duplicate operations return 500 instead of conflict

| | |
|--|--|
| **Failure scenario** | Double-submit create same plate / national ID. |
| **Reproduction** | Live: create car twice → `201` then `500 INTERNAL_ERROR`. |
| **Expected** | 409 or 400 with field message; safe to retry understanding. |
| **Actual** | DB blocks duplicate; API says internal error. |
| **Data corruption risk** | Low (no duplicate row). |
| **User impact** | Panic retry; generic “failed” toast/form message; outdoor recovery unclear. |
| **Solution** | Map `23505` → 400/409; UI show duplicate copy (already exists in i18n). |

### REL-04 — Query failures look like empty or not-found

| | |
|--|--|
| **Failure scenario** | 500 / network / 403 on list or detail fetch. |
| **Reproduction** | Code: lists use `data ?? []`; detail uses `isNotFound \|\| !data` (`CarDetailPage`). |
| **Expected** | Explicit error + retry. |
| **Actual** | Empty list or “not found” page. |
| **Data corruption risk** | None directly. |
| **User impact** | User believes fleet is empty or entity deleted; may recreate duplicates. |
| **Solution** | Branch `isError`; retry button; don’t equate error with empty/404. |

### REL-05 — No mid-session 401 / multi-tab session handling

| | |
|--|--|
| **Failure scenario** | Cookie expired or logout in another tab; user continues editing. |
| **Reproduction** | Code: no ky 401→login hook; no tab sync. |
| **Expected** | Redirect to login; preserve return URL; sync logout across tabs. |
| **Actual** | Mutations/queries fail in place; other tab keeps stale `me` cache. |
| **Data corruption risk** | Low–medium (failed writes); confusion high. |
| **User impact** | Stuck UI; repeated submits; lost confidence. |
| **Solution** | Global 401 handler; `BroadcastChannel`/focus refetch of `me`; clear cache on logout. |

### REL-06 — End custody vs assign race: last write wins, both 200

| | |
|--|--|
| **Failure scenario** | User A ends custody while User B assigns another driver. |
| **Reproduction** | Live parallel unassign + assign → both 200; final = assigned. |
| **Expected** | Clear conflict or ordered state machine with notifications. |
| **Actual** | Last writer wins; A may think vehicle is free. |
| **Data corruption risk** | Low if final consistent; operational confusion High. |
| **Solution** | Same as REL-01; optional “custody revision” token. |

---

## 4. Concurrency problems (summary)

| Scenario | DB final state | Client messaging | Verdict |
|----------|----------------|------------------|---------|
| Same driver → two cars | One holder (unique) | Both 200 | Misleading success |
| Two drivers → one car | One holder, 1 open row | Both 200, responses disagree with each other | **False success** |
| End vs assign | Assign can win | Both 200 | Misleading |
| Delete vs PATCH | Patch 404 | Delete completes | Acceptable |
| Double create | One row | Second 500 | Safe data, bad signal |

**Protection present:** `cars.driver_id UNIQUE`, open-assignment partial unique, service release/close helpers.  
**Protection missing:** optimistic locking, conflict status codes, UI reconciliation after mutation.

---

## 5. Error-handling problems

| Status | API | UI (shared panels) |
|--------|-----|---------------------|
| 400 | Field validation envelope | Forms: field + banner; good if mapped |
| 401 | Unauthorized | Login OK; **mid-session weak** |
| 403 | Forbidden | Generic message / no list error UI |
| 404 | Not found | Detail OK if true 404; overloaded with other errors |
| 409 | Unused | N/A |
| 422 | Unused | N/A |
| 429 | Login rate limit | Login copy only |
| 500 | Generic INTERNAL_ERROR (incl. duplicates) | Generic fail toast/form |
| 502/503 | — | ky may retry GET; mutations fail; no special UI |

**Preserves input on form error:** Yes (modal stays open).  
**Safe retry:** Deletes stay open for retry — good. Creates after false 500 may confuse.  
**Duplicate ops:** UI guards double-click; network double-create not idempotent.

---

## 6. Data-loss risks

| Risk | Severity | Notes |
|------|----------|-------|
| Partial PATCH clears custody / blanks name | **High** | REL-02 |
| Operator acts on stale “success” after concurrent assign | **Medium** | REL-01 |
| User recreates entities after error shown as empty | **Medium** | REL-04 |
| Toast-only delete failure missed outdoors (4s) | **Low–Medium** | Confirm stays open (mitigation) |
| True dual open custody | **Low** (not observed) | DB unique holds |

**UI success / server fail:** Possible if toast fires only on mutation success (generally OK); risk is opposite: **server intermediate success in response that is later overwritten** (REL-01).  
**Server success / UI fail:** Possible on timeout after commit (30s timeout, POST not retried by ky) — user may retry → duplicate risk for creates (plate unique → 500).

---

## 7. Recommended resilience improvements

1. **Fix car update DTO defaults** (blocks accidental custody/name loss).  
2. **Custody concurrency:** transaction locks + **409** on conflict; never dual 200 with divergent bodies without refetch.  
3. **Map unique violations → 400/409**; stop 500 on duplicates.  
4. **Global 401 → login**; multi-tab auth cache clear.  
5. **List/detail `isError` UI** with Retry (never empty/not-found for 500/network).  
6. **Offline / timeout banner**; disable submit when offline; clarify telemetry “offline”.  
7. **Mutation success:** invalidate queries and toast from **refetched** entity for custody.  
8. Optional: idempotency keys for creates; AbortController on navigate.

---

## 8. What works

- Form double-submit locks and preserved fields on validation errors  
- Delete confirm stays open on failure; close disabled while pending  
- DB prevents two current drivers on one car / one driver on two cars at rest  
- Open custody history stayed at one row under same-car race  
- Login distinguishes 401 / 429 (when rate-limited)  
- 30s HTTP timeout configured  
- Cookie logout invalidates token (single tab)

---

## Related docs

- [qa-data-integrity-audit-2026-09-09.md](./qa-data-integrity-audit-2026-09-09.md) — PATCH defaults, cross-company  
- [qa-security-audit-2026-09-09.md](./qa-security-audit-2026-09-09.md) — authz (gitignored)  
- [qa-ux-audit-company-panel-2026-09-09.md](./qa-ux-audit-company-panel-2026-09-09.md) — outdoor UX  

Disposable `REL`/`RL*` test entities were cleaned up after probes.
