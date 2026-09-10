# Build prompt — Admin console & Operator workbench

Paste everything below the line into a fresh Claude Code session in this repo.
It is written to be executed in phases; do not skip Phase 0.

---

## ROLE

You are building the two staff-facing surfaces of a live Indian driving-licence
application portal: an **Admin console** (state-level oversight + configuration)
and an **Operator workbench** (RTO clerk daily processing queue). Real applicant
PII — Aadhaar numbers, dates of birth, home addresses, mobile numbers — flows
through both. Treat every authorization decision as security-critical, not UX polish.

## PHASE 0 — READ BEFORE WRITING ANY CODE

Non-negotiable. Report what you found before proposing a plan.

1. `AGENTS.md` — this is **not** the Next.js in your training data. Next 16.3.4 has
   breaking changes. Read the relevant guides in `node_modules/next/dist/docs/`
   before using any App Router, routing, caching, or middleware API. Note that
   middleware is `src/proxy.js` exporting `proxy()` in this version, **not**
   `middleware.js`.
2. `AUDIT.md` — 51 findings from a prior audit. The SEC-01…SEC-06 items define the
   authorization model you must not regress. Read every finding tagged A1.
3. `database/schema.sql` — all 20 tables. You are not allowed to invent a column
   that does not exist; propose a migration explicitly if you need one.
4. `src/lib/auth.js`, `src/proxy.js`, `src/app/api/applications/route.js`,
   `src/app/api/applications/[id]/route.js` — the existing session and scoping model.
5. `src/app/globals.css` (design tokens), `src/app/admin/admin.module.css` — the
   visual system you must extend, not replace.
6. `src/contexts/AppContext.js`, `src/lib/i18n.js`, `src/lib/translations/*.json` —
   every user-visible string goes through `t()`; DB-backed names through `localize()`.

Then state, in one short block: the current auth model, the status values that
actually exist, and which of the screens below already have data behind them.

## STACK CONSTRAINTS (hard)

- Next.js 16.3.4 App Router, React 19.2.8, **JavaScript only — no TypeScript**.
- **CSS Modules + the `globals.css` custom properties.** No Tailwind, no CSS-in-JS,
  no component library. Every colour, radius, spacing and shadow must come from an
  existing `--token`; if you need a new one, add it to `:root` in `globals.css`.
- `better-sqlite3` — synchronous, no ORM. Prepared statements only, never string
  interpolation into SQL.
- Zod for every request body and query-param schema.
- No new runtime dependencies without asking first. Charts, tables, and date
  handling are to be hand-rolled with the tokens above.
- i18n: `en` / `hi` / `gu`. A hardcoded English string in JSX is a defect.

## DOMAIN MODEL — the part you must get exactly right

### The two personas

**Operator** (`users.role = 'operator'`) is an RTO clerk. They see *only* work
assigned to their jurisdiction, defined by rows in `operator_assignments`
(`state_id`, optional `service_id`, optional `rto_id`). They process applications;
they never configure the system. Their whole day is one queue. Optimise for
keyboard speed and low click count, not for dashboards.

**Admin** (`users.role = 'admin'`) is a state authority supervisor. They see every
application in every jurisdiction, manage operator accounts and assignments, edit
the master data that drives the citizen form (services, steps, fields, fees, RTOs,
test centres, document requirements), and audit what operators did. Optimise for
oversight, correctness of configuration, and traceability.

### Application status machine — implement this as a single shared module

Statuses that exist in `applications.status`:
`draft → payment_pending → paid → submitted → assigned → under_review →
(correction_required ⇄ resubmitted) → government_processing → completed`

Allowed transitions and who may perform them:

| From | To | Operator | Admin |
|---|---|---|---|
| submitted | assigned | ✓ self-claim, in-jurisdiction only | ✓ assign to any operator |
| assigned | under_review | ✓ assignee only | ✓ |
| under_review | correction_required | ✓ — **requires** `correction_reason` | ✓ |
| under_review | government_processing | ✓ — blocked unless every required document is `verified` and `payment_status = 'completed'` | ✓ |
| correction_required | resubmitted | citizen action only — staff may not set this | — |
| resubmitted | under_review | ✓ | ✓ |
| government_processing | completed | ✓ — **requires** `government_application_number` | ✓ |
| any | any (override) | ✗ | ✓ — requires a typed reason, written to history |

Rules:

- Put this table in `src/lib/applicationStatus.js` as data, export
  `canTransition(role, from, to)` and `requiredFieldsFor(to)`. The API enforces it;
  the UI merely reflects it. Never let the client be the only gate.
- Every transition writes an `application_status_history` row with `changed_by`,
  `from_status`, `to_status`, and `reason`/`notes` — inside the same
  `better-sqlite3` transaction as the `applications` UPDATE. Never one without the other.
- The current `/admin` page's free-form status `<select>` violates all of this.
  Replace it with explicit, named actions ("Start review", "Request correction",
  "Send to government", "Mark completed") that are disabled with a tooltip
  explaining *why* when the transition is not allowed.

### Other status vocabularies (do not invent new values)

- `applications.payment_status`: pending, processing, completed, failed, refunded
- `application_documents.upload_status`: uploaded, verified, rejected (rejection
  requires `rejection_reason`)

### Jurisdiction scoping — the single most important rule

Derive a `scopeClause(session)` helper in `src/lib/scope.js` and use it in **every**
staff-facing query:

- `role = 'admin'` → no restriction.
- `role = 'operator'` → application must match at least one of that operator's
  active `operator_assignments` rows: `state_id` must match, and `service_id` /
  `rto_id` must match when the assignment row specifies them.
- An operator hitting an out-of-jurisdiction application id gets **404, not 403** —
  do not leak the existence of records they may not see.

Re-check scope inside every API handler. Do not rely on `src/proxy.js` alone;
proxy handles page navigation, handlers handle data.

### PII handling

- List/queue endpoints return a **narrow explicit column projection**. Never `SELECT a.*`.
- Aadhaar / `identity_number` is masked to `XXXX XXXX 1234` in list views and in the
  default detail view. Revealing it is a deliberate per-record action that writes an
  audit row. Operators may reveal only within jurisdiction.
- Never log PII to the server console or into a toast message.
- CSV export is admin-only, logs an audit row with the row count and filter used,
  and excludes Aadhaar entirely unless explicitly requested and logged.

## INFORMATION ARCHITECTURE

Build one shared console shell, two role-scoped route trees. The shell (sidebar,
top bar, user card, sign-out, language switcher, breadcrumb) lives in
`src/components/console/` and is imported by both layouts. Nav items are derived
from the session role — never rendered-then-hidden.

### `/operator` — the workbench

```
/operator                       Today: my queue (default landing)
/operator/queue                 Full queue, filterable
/operator/applications/[id]     Case detail — the core screen
/operator/documents             Document verification queue (cross-application)
/operator/history               What I did (my own audit trail)
```

**`/operator` — Today.** Not a vanity dashboard. Four counters that are also
filters: *Awaiting my action*, *Correction pending on citizen*, *Overdue (>SLA)*,
*Completed today*. Below them, the queue itself, pre-sorted by age. An operator
should be able to land here and press Enter to open the oldest actionable case.

**`/operator/queue`.** A dense, server-paginated table. Columns: app no. + age,
applicant (name, masked mobile), service, RTO, status pill, docs (verified/total),
payment pill, assignee. Filters: status, service, RTO, date range, "assigned to me",
"unassigned". Sort by age, submitted date, status. Sticky header, row-level
keyboard focus, `j`/`k` to move, `Enter` to open, `?` for a shortcut cheatsheet.
Persist filters in the URL query string so a view is shareable and survives reload.

**`/operator/applications/[id]` — the case detail.** This is where the product
lives; give it the most care. Three-column at ≥1280px, stacked below:

- *Left (sticky):* status timeline built from `application_status_history` —
  who, what, when, why. Below it, the action panel with the named transition
  buttons, each disabled-with-reason per the state machine.
- *Centre:* the application itself in collapsible sections mirroring the citizen
  form steps (Applicant, Address, Licence, Vehicle classes, RTO & test centre,
  Fees, Payment). Every field shows label + value; empty values render as an
  explicit muted "Not provided", never blank. Minor applications surface the
  guardian block prominently. Flag internal inconsistencies inline (age vs
  vehicle class minimum age from `vehicle_classes.min_age`; medical required but
  no certificate; pincode/state mismatch).
- *Right:* documents. One card per required document from `service_documents`
  joined to what was actually uploaded. Each card: thumbnail/preview link,
  filename, size, uploaded date, and Verify / Reject actions. Reject opens a
  required-reason field. Show missing required documents as explicit empty
  cards, not as absence.
- Correction requests compose a message to the citizen: pick the offending
  fields/documents from checkboxes, add a note; the result is stored in
  `correction_reason` and is what the citizen sees on `/track`.

**`/operator/documents`.** Same verification affordance, batched across
applications, for a clerk who wants to do only doc checks for an hour.

### `/admin` — the console

```
/admin                       Oversight dashboard
/admin/applications          All applications (queue UI, unscoped) + export
/admin/applications/[id]     Case detail + override actions
/admin/operators             Operator accounts & jurisdiction assignments
/admin/services              Services, steps, fields, required documents
/admin/fees                  Fee structure per service × state, effective-dated
/admin/locations             States, districts, RTO offices, test centres
/admin/audit                 Full audit log, filterable by actor/action/date
/admin/settings              Portal-level toggles
```

**`/admin` — oversight.** Volume by status, by state, by service, over a selectable
date range. Throughput and median time-in-status. SLA breaches. Operator workload
(open cases per operator, oldest case age). Payment reconciliation: paid vs
submitted vs failed counts and rupee totals. Every number links to the filtered
list that produced it — a dashboard figure that cannot be drilled into is a
decoration; delete it rather than ship it.

**`/admin/operators`.** Create/deactivate operator accounts (bcrypt via `bcryptjs`,
existing `users` table). Assign jurisdictions as rows in `operator_assignments`
with a clear state → service → RTO scoping widget. Show each operator's current
load and last activity. Deactivation must reassign or explicitly orphan their open
cases — never silently strand work.

**`/admin/services`.** CRUD over `licence_services`, `service_steps`,
`service_fields`, `service_documents`, `service_vehicle_classes`. This is the
config that generates the citizen form — so it needs a live preview pane and hard
validation: no duplicate `step_number` per service, no orphan `condition_field`
pointing at a non-existent `field_key`, no removing a step that has in-flight
applications. Warn loudly before any change that would affect drafts already in
progress.

**`/admin/fees`.** `fee_structure` rows keyed by service × state with
`effective_from` / `effective_to`. Never let two active rows overlap for the same
pair. Show a computed total preview exactly as the citizen would see it. Changing
a fee must never mutate the snapshot fee columns on existing `applications` rows.

**`/admin/audit`.** Every staff action, filterable and exportable.

## APIS TO BUILD

Keep existing routes working. Add, under `src/app/api/`:

```
GET   /api/staff/queue                          scoped list, server pagination + filters
GET   /api/staff/applications/[id]              full detail + documents + history, scoped
POST  /api/staff/applications/[id]/transition   { to, reason, fields } — the state machine
POST  /api/staff/applications/[id]/assign       { operatorId } — admin, or self-claim
POST  /api/staff/documents/[docId]/verify       { decision, rejectionReason }
POST  /api/staff/applications/[id]/reveal-pii   audited unmask
GET   /api/admin/stats                          dashboard aggregates, admin only
GET   /api/admin/operators  POST/PATCH          accounts + assignments
CRUD  /api/admin/services | fees | locations
GET   /api/admin/audit
GET   /api/admin/export                         CSV, admin only, audited
```

Every handler, in this order, every time: `getSessionUser(request)` → role check →
Zod-parse input → scope-check the target row → do the work in a transaction →
write audit → return a narrow projection.

### Missing table — propose this migration

There is no general audit table today; `application_status_history` only covers
status. Add:

```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_role TEXT,
    action TEXT NOT NULL,        -- e.g. 'document.verify', 'pii.reveal', 'fee.update'
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    summary TEXT,
    metadata TEXT,               -- JSON, never PII values
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
```

Also add `applications.assigned_at` and `applications.sla_due_at` if you implement
SLA/ageing — do not fake ageing from `updated_at`, which changes on every edit.
Ask before running any migration.

## DESIGN DIRECTION

This is a government-service back office, not a SaaS dashboard. The bar is: a clerk
processes 80 cases a day on a 1366×768 screen and must never misread a status. Aim
for the density and calm of well-made operational software — airline ops, a bank
back office — not marketing gradients.

- **Extend the existing token system.** Primary `--color-primary: #159447`, Inter,
  the existing radii and shadows. The console may use a denser scale than the
  citizen portal; add console tokens rather than magic numbers.
- **Status colour is semantic and fixed.** Define one mapping in a shared module and
  use it everywhere: neutral (draft/submitted), blue/info (assigned/under_review),
  amber/warning (correction_required, payment failed), violet or deep blue
  (government_processing), green/success (completed). Never encode status by colour
  alone — every pill carries a text label, and every colour pairs with an icon or
  shape difference for colour-blind users.
- **Tables:** 12–13px body, ~40px rows, sticky header, zebra off, hairline
  `--color-border-light` dividers, right-aligned numerics with tabular figures,
  monospace for application numbers. Horizontal overflow scrolls inside the table
  container — the page body never scrolls sideways.
- **Density toggle** (comfortable / compact) persisted per user in `localStorage`.
- **Empty, loading, and error states are designed, not defaulted.** Skeleton rows
  matching the real table shape; empty states that say what to do next; errors that
  name the failure and offer retry. The current page's bare spinner is the floor,
  not the target.
- **Optimistic updates are forbidden for status changes.** Money and legal state:
  show a pending state, wait for the server, reconcile. Optimistic UI is fine for
  filters and column preferences.
- **Destructive and irreversible actions** (reject document, request correction,
  admin override, deactivate operator) use a confirm step that restates the
  consequence in plain language, in the user's chosen language.

### Accessibility — WCAG 2.2 AA, not optional

Keyboard reachable everything; visible focus rings that meet contrast; 44px minimum
tap targets (the `--tap-min` token already exists); `aria-live="polite"` for toasts
and queue updates; correct table semantics with `<caption>` and scoped headers; form
errors tied to inputs with `aria-describedby`; no positive `tabindex`; modals trap
focus and restore it on close; `prefers-reduced-motion` respected.

### Responsive

The workbench targets 1280–1920px. At <1024px the three-column case detail stacks in
order: actions → application → documents, with the action panel pinned to the bottom
as a sticky bar. The queue table collapses to stacked cards below 768px — a
horizontally scrolling 7-column table on a phone is a failure, not a fallback.

## ACCEPTANCE CRITERIA

Do not report done until each of these is true and you have verified it by running
the app, not by reading the source:

1. An operator signed into state GJ cannot read, list, or mutate an application in
   RJ — via the UI, via a direct API call, or by editing a URL. Verify with `curl`
   against a running `next build && next start`, not by inspection.
2. Every status change appears in `application_status_history` with the correct
   actor, and no `applications` row exists whose current status has no matching
   history row.
3. An illegal transition (e.g. `submitted → completed` by an operator) is rejected
   by the API with 4xx even when the client is bypassed.
4. `government_processing` cannot be reached while a required document is unverified
   or payment is not `completed`.
5. No list endpoint returns an unmasked `identity_number`. Grep the responses.
6. Zero hardcoded user-visible English strings in the new files; all three languages
   render without layout breakage (Gujarati and Devanagari are taller — check row
   heights).
7. Full keyboard traversal of the queue and case detail with no mouse.
8. `npm run lint` clean. `npm run build` clean.
9. Queue endpoint stays under 200ms with 10,000 seeded applications — add indexes if
   not, and say which.
10. Every dashboard number drills through to the list that produced it.

## BUILD SEQUENCE

Work in these phases, and **stop for review after each one**. Do not build all of it
before showing me anything.

1. **Foundations** — `src/lib/applicationStatus.js`, `src/lib/scope.js`, the audit
   helper, the `audit_log` migration proposal, and the console shell components.
   Show me the state machine and scoping module first; they determine everything else.
2. **Operator queue + case detail** with real transitions and document verification.
   This is the highest-value surface — get it right before touching admin config.
3. **Admin oversight dashboard + all-applications view + audit log.**
4. **Admin configuration** — operators/assignments, then services/fields, then fees,
   then locations. Each with its own validation rules.
5. **Polish pass** — empty/loading/error states, keyboard shortcuts, density toggle,
   responsive behaviour, i18n sweep, a11y audit.

## OUT OF SCOPE

Do not touch the citizen-facing flow (`/apply`, `/track`, `/dashboard`,
`/documents`), the payment gateway integration, or the login/OTP flow, except where
a staff action must write data the citizen reads (`correction_reason`, status). Do
not redefine `globals.css` tokens that the citizen portal depends on — add, never
change.

## HOW TO REPORT

After each phase: what you built, what you verified and how (commands + output),
what you assumed, what you deliberately left out, and any schema change you need. If
you hit a decision where two readings of this prompt lead to materially different
work, ask before building — but only then; make ordinary judgment calls yourself and
note them.
