# Mobile Fueling Admin Panel — Operations / Control-Plane Audit

**Date:** 2026-09-09  
**Target:** https://mobile-fueling-admin.inergy.ir/  
**Role:** Internal administrator (`internal_admin`) — system control plane  
**Method:** Code review of `apps/internal-panel` + shared web-ui/API patterns; prior live API findings on custody, cascade deletes, and audit APIs. Not a full interactive click-lab of every modal.

**Admin Assurance Degree:** **58 / 100**

Administrators **can** perform nested CRUD and see custody history and some audit diffs, but they **cannot** safely operate at scale or safely execute high-impact lifecycle actions: no search/filter/pagination on core lists, company delete under-warns cascade, custody changes lack confirmations, current driver is weak on vehicle detail, no deactivate/status model, and operational “attention” questions are only partially answerable.

---

## 1. Assurance Degree /100

| Score | Meaning |
|------:|---------|
| **58** | High operational risk for enterprise control-plane use — CRUD exists; safe accurate operations do not |

Scoring emphasizes: Can an admin avoid destroying the wrong tenant? Understand current vs historical custody? Answer fleet questions without spreadsheet exports? Trace who changed what?

---

## 2. What the control plane covers today

| Area | Capability |
|------|------------|
| IA | Dashboard · Companies · Map · Audit log; company nested Overview / Users / Drivers / Cars / Audit |
| Companies | Create, edit, delete, read overview |
| Users / Drivers / Cars | Per-company CRUD; cars include MQTT provision |
| Relationships | Car list shows assigned driver; driver list shows assigned car; custody **history** on vehicle detail |
| Map | Global fleet, company coloring/filter |
| Audit | Global (internal-admin actors) + per-company (all actors); before→after diffs for many updates |

---

## 3. CRUD correctness matrix

| Entity | Create | Read | Update | Delete | Search | Filter | Pagination | Sorting | Detail |
|--------|:------:|:----:|:------:|:------:|:------:|:------:|:----------:|:-------:|:------:|
| Companies | Y | Y | Y (list) | Y | **N** | **N** | **N** | **N** (API createdAt) | Overview read-only |
| Company users | Y | Y | Y | Y | **N** | **N** | **N** | **N** | Modal only |
| Drivers | Y | Y | Y | Y | **N** | **N** | **N** | **N** | No driver detail route |
| Vehicles | Y | Y | Y | Y | **N** | **N** | **N** | **N** | Detail + tanks + history |
| Custody | via car edit | History Y | via car edit | N/A | **N** | Active-only **N** | History Y | History by time | Current badge in history |
| Audit logs | N/A | Y | N/A | N/A | **N** | **N** | **Y** | **N** | Inline details |

**Gap:** At enterprise scale, acting on the wrong company/vehicle is likely without search.

---

## 4. Relationship management

| Relationship | How admin sees it | Gap |
|--------------|-------------------|-----|
| Company → vehicles/drivers/users | Nested nav + counts on dashboard cards | No global inventory lists |
| Vehicle → current driver | **List column** + history “Current” badge | **Not on detail overview/header** |
| Driver → current vehicle | Driver list column | No driver detail / custody from driver side |
| Current vs historical custody | History section distinguishes open (“Current” / open-ended) vs closed | Assigning is not framed as a custody state transition |
| Cross-company relationships | Not exposed in UI (companyId locked to route) | API can still break tenancy (see integrity audit) — UI doesn’t warn because it doesn’t offer move |

**Verdict:** Historical custody is reasonably visible; **current state is under-emphasized** on the vehicle detail control surface.

---

## 5. Dangerous administrative operations

| Operation | Confirmation | Validation / warning quality | Risk |
|-----------|--------------|------------------------------|------|
| Delete company | Confirm with name | **Does not list cascade** (cars, drivers, users deleted in DB) | **Critical operational** |
| Delete car / driver / user | Confirm | Permanent language; driver delete mentions assignment | Medium — acceptable if search exists |
| Change custody (driver select on car form) | **None** | Silent; may auto-release driver from another car with no UI warning | **High** |
| End custody (`no driver`) | **None** | Same as edit save | Medium–High |
| Edit historical custody | No UI | Good (immutable via UI) | Low |
| Change company ownership of car/driver | No UI | API allows; panel injects route companyId | Hidden API risk |
| Modify plate / national ID | Via edit forms | Uniques exist; may 500 | Medium UX |
| MQTT rotate | Confirm + once-only password | Strong | Low if role-correct |
| Deactivate entity | **Impossible** | Hard delete only | Forces destructive ops |

---

## 6. Missing validations (admin-visible)

- No dependency counts before company/driver/car delete (“3 cars, 4 drivers will be removed”).
- No custody-transfer confirm (“Driver is on plate X — move here?”).
- No soft-delete / deactivate path.
- No UI guard against concurrent edit (see reliability audit).
- Duplicate identity errors may present as generic failure (API 500).
- No typed confirm for company delete.

---

## 7. Missing visibility (operational questions)

| Question | Answerable from admin UI? |
|----------|---------------------------|
| How many companies? | **Yes** — dashboard summary |
| How many vehicles / drivers? | **Yes** — summary + per-company chips (all vehicles, not “active” status) |
| How many **active** vehicles/drivers? | **No** — no status model; all records are “active” until deleted |
| Which vehicles currently assigned? | **Partial** — per-company car list / dashboard rows; no fleet-wide filter |
| Which vehicles have no driver? | **Partial** — visible per row (“Unassigned”); no aggregate / filter |
| Which drivers have no vehicle? | **Partial** — driver list column; no aggregate |
| Which custody assignments are currently active? | **Weak** — only by opening each vehicle history or scanning lists |
| Which records require attention? | **No** — no queue (stale GPS, MQTT missing, offline long-term, orphans) |

Dashboard gives: `# companies · # vehicles · # live` and per-company vehicle/driver/live chips + per-vehicle live/offline and driver name. That is a **monitor**, not an **operations workbench**.

---

## 8. Auditability concerns

| Need | UI support |
|------|------------|
| Who performed the operation? | **Partial** — `actorDisplayName`; username/role/IP/UA **not shown** (even if API stores some) |
| What changed? | **Yes** for many updates — field `from → to` in details |
| When? | **Yes** |
| Previous value? | **Yes** when `metadata.changes` / snapshot present |
| Current vs historical business state? | Custody history yes; entity versions no |
| Company-user actions in global audit? | **No** — global `/audit-logs` is **internal-admin actors only**; use **company audit tab** for tenant activity |
| Search/filter audit by action/entity/date? | **No** — pagination only |

**Explicit:** Full forensic auditability (IP, user agent, role column, filters) is **not verifiable / not exposed from UI**. Domain change logging for cars/drivers/users/companies **is partially visible** via company audit + change diffs.

---

## 9. Operational gaps (summary)

1. No search/filter/sort/pagination on companies and nested resources.  
2. Company delete cascade under-communicated.  
3. Custody treated as a form field, not a controlled state transition.  
4. Current driver missing from vehicle detail chrome.  
5. No deactivate/status — only hard delete.  
6. No attention/ops queue; weak unassigned aggregates.  
7. No global cars/drivers inventory.  
8. Audit UI incomplete for investigations; split global vs company scope easy to miss.  
9. Cars/drivers loaded globally then client-filtered (scale + failure modes).  
10. Prior API integrity issues (cross-company assign, PATCH defaults) remain hazards if admins use API or future UI exposes company move.

---

## 10. Recommended admin improvements (impact order)

1. **Company delete:** show cascade counts + typed confirm (`DELETE {name}`).  
2. **Custody control:** Assign / End actions with explicit confirm when moving drivers; show **current driver** on vehicle detail.  
3. **Search + filters** on companies, cars (assigned/unassigned), drivers; paginate lists.  
4. **Ops dashboard widgets:** unassigned vehicles, unassigned drivers, offline/stale telemetry, MQTT not provisioned.  
5. **Soft deactivate** (or archive) instead of hard delete for cars/drivers/companies where history must remain.  
6. **Audit workbench:** filters, show role/username; clarify global vs company scopes in UI copy.  
7. **Server-scoped** company cars/drivers queries (stop fetch-all-then-filter).  
8. Block or heavily guard API-level company reassignment until UI + rules exist.

---

## Related audits

- Integrity: cross-company custody, PATCH defaults — `qa-data-integrity-audit-2026-09-09.md`  
- Reliability: concurrent assign dual-200 — `qa-reliability-audit-2026-09-09.md`  
- Security: stale JWT, Redis fail-open — `qa-security-audit-2026-09-09.md` (gitignored)  
- Company UX: parallel custody/search gaps — `qa-ux-audit-company-panel-2026-09-09.md`
