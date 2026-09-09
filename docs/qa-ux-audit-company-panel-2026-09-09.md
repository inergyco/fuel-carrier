# Mobile Fueling Company Panel — UX / Usability Audit

**Date:** 2026-09-09  
**Target:** https://mobile-fueling.inergy.ir/ (company / external panel only)  
**Primary personas:** company fleet operators, dispatchers, and field personnel on phones outdoors (hurried, glare, gloves/thumbs, intermittent connectivity)  
**Method:** Deep review of `apps/external-panel` + `packages/web-ui` / i18n; live HTML shell check (`lang`/`dir` bootstrap). **No interactive device lab or browser click-through** — findings are code- and structure-evidenced; treat visual/performance numbers as inferred.

**UX Assurance Degree:** **64 / 100**  
Confidence that an ordinary operational user can complete core tasks without confusion or avoidable mistakes under field conditions.

---

## 1. UX Assurance Degree /100

| Score | Interpretation |
|------:|----------------|
| **64** | Usable for office-style company admins familiar with the product; **meaningful friction** for hurried outdoor / one-handed use |

**Why not higher:** Custody (the core domain action) is buried in “Edit vehicle”; vehicle detail omits current driver; no search; no real offline UX; touch targets often ~36–40px; map trajectory is multi-step; audit log is table-only on phones.

**Why not lower:** Persian/RTL by default; destructive deletes use confirm + loading locks; forms block double-submit while saving; lists switch to cards below `md`; login and shell are coherent; empty-state copy exists in FA.

---

## 2. Top usability problems

| Sev | Screen / workflow | Problem | Why it matters | Suggested improvement |
|-----|-------------------|---------|----------------|------------------------|
| **High** | Custody / vehicles | Assign/unassign only inside **Edit vehicle** modal (`FormSelect` driver). No dedicated Assign / Transfer / End custody action. Changing custody looks like editing master data. | Operators in a hurry need a one-tap “give vehicle to driver” / “end custody”. Easy to miss or to edit unrelated fields while assigning. | Vehicle detail + list: primary **Assign / Change driver / End custody** actions with short confirm (“X will no longer have Y”). Keep full edit for plate/name/note. |
| **High** | Vehicle detail | Overview shows plate, name, note — **not current driver**. Current assignment only on list cards or in history (“Still assigned”). | User opens detail to answer “who has this truck?” and must scroll history or go back. | Show current driver (or “Unassigned”) prominently in overview/header with status chip. |
| **High** | Lists (cars/drivers/users) | **No search, filter, or pagination** — full lists only. | Outdoor glare + long fleets = scroll hunting; high error risk picking wrong vehicle. | Sticky search on plate / name / national ID; filter “Unassigned / Assigned”; paginate or virtualize. |
| **High** | Connectivity | UI “آفلاین / Offline” means **no telemetry**, not network failure. No offline banner, retry, or queue. | Field users with poor connectivity misread GPS status as “app offline,” or lose trust when saves fail silently after toast assumptions. | Separate labels: “No live location” vs “You’re offline”. Detect `navigator.onLine` / failed mutations; banner + retry. |
| **Medium** | Navigation | Six equal nav items (Dashboard, Users, Drivers, Vehicles, Map, Audit) for all company users including viewers. MQTT credentials sit on primary vehicle surfaces. | Cognitive load for field roles; admin tooling mixed with daily ops. | Role- or task-based nav (hide Users/Audit/MQTT for non-admins); “Today’s fleet” home with Assign shortcut. |
| **Medium** | Map / trajectory | Full-bleed map + multi-step trajectory (pick vehicle → datetime → show route); controls compete with hamburger (`pl-14`). | Hard one-handed outdoors; easy to abandon. | Simplify default to live fleet; tuck trajectory behind “History route”; larger controls; close drawer on navigate. |
| **Medium** | Forms / API errors | Duplicate plate/national ID can surface as generic failure (API 500 → generic create failed), while FA has good duplicate strings. | User doesn’t know how to fix the mistake. | Ensure field-level duplicate messages always show; keep submit enabled with clear recovery. |
| **Medium** | Touch / density | Icon actions and many buttons use `h-9` / `size-9` (~36px), below ~44px outdoor guideline. | Accidental taps; missed taps with gloves. | Min 44×44px hit areas on mobile; increase spacing between Edit/Delete/MQTT. |
| **Medium** | Audit log | Always a wide table; horizontal scroll on small phones. | Field managers can’t review audit comfortably. | Card/list layout under `md`, same as other resources. |
| **Low** | Loading / empty | Text-only loading (“در حال بارگذاری…”) and empty states; no skeletons. | Easy to miss under bright sun; feels “stuck”. | Skeletons + empty CTA button matching primary action. |
| **Low** | Accessibility | `Field` labels lack `htmlFor`/control `id`; modal focus trap/Escape weak; toast “Dismiss” hardcoded English; password eye `tabIndex={-1}`. | Screen reader and keyboard users struggle; mixed EN in FA UI. | Wire labels; trap focus; i18n dismiss; keyboard-accessible password toggle. |
| **Low** | Custody confirm | Assigning a driver who is on another car silently moves them (backend). UI does not warn. | Surprise: another vehicle becomes unassigned without explicit message. | Confirm: “This driver is on {plate}. Move them here?” |

---

## 3. Critical workflow friction

### Login
- Clear username/password, show/hide password, localized errors, loading on submit — **good**.
- No forgot-password (may be intentional).
- Forced change-password path exists; success goes home with **no toast**.

### “Who has this vehicle?” (most common operational question)
1. Dashboard cards *do* show driver — good entry.
2. Vehicle detail **drops** current driver — friction.
3. Custody change requires Edit modal — friction + accidental field edits.

### Driver workflows
- Create/edit driver is simple (name + national ID) — good for speed.
- Cannot assign a vehicle from the driver side — operators must remember to edit the car.
- Delete confirms and mentions assignment removal — good.

### Vehicle workflows
- List cards on small screens — good.
- MQTT provision/rotate on list + detail is ops-heavy for outdoor “driver” personas.
- History timeline is clear (Current / Still assigned) — good once found.

### Mistake recovery
- Confirm modals disable close while deleting — good against double destructive tap.
- Form save locks while pending — good against double submit.
- Back navigation: SPA routes; refresh restores session via cookie if still valid — OK.
- Invalid data: client Zod helps; server duplicate errors may not map to friendly fields.

### Dangerous operations
- Deletes: titled confirm + irreversible copy — **adequate**.
- Custody change / silent transfer: **under-communicated**.
- MQTT rotate: strong once-only password warning — good for admins, scary if exposed to wrong role.

---

## 4. Accessibility findings

| Finding | Severity |
|---------|----------|
| Labels not programmatically tied to inputs (`Field` without `htmlFor`) | Medium |
| Dialogs: limited focus management / Escape (DaisyUI `modal-open`) | Medium |
| Toast dismiss control not localized | Low |
| Password visibility control not in tab order (`tabIndex={-1}`) | Low |
| Icon-only row actions rely on `aria-label` (present) — OK for SR, weak visually | Low |
| Live region: toasts use `role="alert"` — good | — |
| Document `lang`/`dir` set early for FA RTL — good | — |

---

## 5. Mobile-specific findings

| Finding | Severity |
|---------|----------|
| Default locale FA + `dir=rtl` before paint — good for Persian users | — |
| Viewport meta present; `min-h-svh` auth/shell — good | — |
| Cards below `md` for main resources — good | — |
| Touch targets often 36–40px | Medium–High outdoors |
| Audit log table-only | Medium |
| Map chrome vs menu button collision risk | Medium |
| No offline / flaky-network UX | High for field |
| Theme/locale toggles available; contrast depends on theme — not lab-measured | Untested outdoors |

---

## 6. Recommended UX improvements (impact-ranked)

1. **Surface custody as a first-class action** on vehicle detail/list (Assign / Change / End) with explicit confirm when moving a driver from another vehicle.  
2. **Show current driver on vehicle detail header/overview.**  
3. **Add search (+ assigned filter)** on vehicles and drivers.  
4. **Clarify connectivity vs telemetry**; add offline/error retry banner.  
5. **Enlarge touch targets** to ≥44px on small breakpoints; separate destructive icons.  
6. **Simplify nav for operational roles**; demote Users / Audit / MQTT.  
7. **Audit log responsive cards**; map trajectory progressive disclosure.  
8. **A11y pass:** label association, focus trap, i18n toast dismiss.  
9. **Skeletons** for lists; success toast on password change.  
10. Ensure **duplicate validation** always shows field messages (API + UI).

---

## 7. Workflow checklist (summary answers)

| Question | Verdict |
|----------|---------|
| Know what to do next? | Partial — IA clear for CRUD; custody not obvious |
| Understand current state? | Partial — list/dashboard yes; detail missing driver; “offline” ambiguous |
| Recover from mistakes? | Mostly — confirms + form locks; weak duplicate/API mapping |
| Important info without extra nav? | Weak for custody-on-detail |
| Accidental dangerous ops? | Deletes guarded; custody/MQTT easier to mishandle |
| Destructive clearly communicated? | Deletes yes; custody move no |
| Feedback after action? | Toasts on CRUD; some auth flows silent |

---

## Status

UX audit for company panel documented. Interactive phone/field validation recommended before closing High items. Admin panel (`mobile-fueling-admin`) not in scope.
