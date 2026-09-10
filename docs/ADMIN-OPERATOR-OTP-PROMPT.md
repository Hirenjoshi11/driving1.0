# Build Prompt — Admin Control, Operator Fill Desk, and the Assisted-Fill OTP Loop

Three connected systems for `driving1.0`. Written after reading the codebase,
so what follows separates **what already exists** from **what to add**.

**Ground rules (carried from the redesign work):**
- JavaScript only. Next.js 16 App Router. CSS Modules + tokens in
  `globals.css`. No Tailwind, no CSS-in-JS, no component library.
- Middleware is `src/proxy.js` exporting `proxy()`, not `middleware.js`.
- Reuse the existing console shell (`src/components/console/*`) and the
  `ConsoleShell` / `ConsoleNav` / `StatusPill` primitives. Do not invent a
  second admin design language.
- PII discipline is already established and must be matched: identity numbers
  are masked, revealed only through `reveal-pii`, and every reveal is written
  to `audit_log`. Any new PII surface follows the same pattern.
- Every state change goes through the existing state machine in
  `src/lib/applicationStatus.js`. Do not bypass it with raw `UPDATE status`.
- Any user-facing string lands in all three of `en/hi/gu.json`, never one.

---

## Do not start from scratch — this is what is already here

Verified by reading the tree. Repeating an earlier mistake of assuming these
were missing would waste the whole effort.

**Admin console — `src/app/admin/` (21 pages):**
dashboard (`page.js`), `applications/` + `applications/[id]`, `audit`, `fees`,
`locations`, `operators`, `services`, `settings`, and a full DPDP privacy suite
under `privacy/` (consents, data-inventory, incidents, policy, processors,
requests, retention, audit). Backed by `src/app/api/admin/**`.

**Operator console — `src/app/operator/` (6 pages):**
dashboard (`page.js`), `queue`, `applications/[id]`, `documents`, `history`.
Backed by `src/app/api/staff/**`: `queue`, `applications/[id]` (read),
`assign`, `reveal-pii`, `transition`, `documents/[docId]/verify`.

**The state machine already exists** (`src/lib/applicationStatus.js`):
`draft → payment_pending → paid → submitted → assigned → under_review →
(correction_required ⇄ resubmitted) → government_processing → completed`.
Operators self-claim (`assigned`), start review (`under_review`), request a
correction (`correction_required`, reason required), and complete with a
`government_application_number`. Jurisdiction scoping is enforced by
`src/lib/scope.js` (out-of-scope returns 404, not 403).

**What does NOT exist yet and this work must add:**
- an in-app **notifications** system (no `notifications` table)
- the **assisted-fill / OTP-relay** loop of Part C in any form
- a citizen-visible signal that "an operator is filling your form right now"

Each part below is therefore an **audit-then-fill-the-gaps** job. Step one of
each part is to read the existing pages and list what is present, partial, or
missing, before writing code.

---

# PART A — Admin: everything needed to run this website

The admin is the single operator of a paid, multi-state, DPDP-regulated
service. Treat admin as **control + oversight + configuration + compliance**,
not just a bigger dashboard.

## A1. Audit first

Open all 21 admin pages against the running app as an admin session. For each,
record: does it load, does it read real data, can it write, is it wired to a
real `/api/admin` route or stubbed. Produce a table (page → state → gap) and
put it at the top of your report. Everything after this is filling those gaps.

## A2. The domains admin must own

Map each to what exists and what is missing.

**1. Live operations overview.** Applications by status, by state, by operator;
today's intake; stuck cases (in a status beyond an SLA threshold);
correction-loop count; payment failures. `admin/page.js` +
`/api/admin/stats` exist — verify the numbers are real, not placeholders.

**2. Application oversight.** Full list with filters (state, status, operator,
date, service), search by application number, and a read-through to the same
detail the operator sees — but with admin override powers the state machine
already supports (`isOverride` / `overrideReason` in the transition route).
Every override is already audited; confirm it is surfaced in the UI.

**3. Operator management.** Create, deactivate, and scope operators to states;
see each operator's load and throughput. `admin/operators` +
`/api/admin/operators` exist — verify create/deactivate actually work and that
an operator cannot be left able to log in after deactivation.

**4. Catalogue & pricing.** Services (`admin/services`), fees
(`admin/fees`), and locations/RTOs (`admin/locations`). These are the levers
that change what citizens see and pay. Confirm a fee edit here is what the
citizen wizard and the payment step read — a mismatch means citizens are quoted
one price and charged another.

**5. Compliance & DPDP.** The privacy suite is the legally load-bearing part.
Confirm data-subject **requests**, **consents**, **incidents**, **retention**,
**processors**, and **policy** are backed by real routes and that the
retention timers actually do something. A DPDP console that only displays is a
liability, not a control.

**6. Audit trail.** `admin/audit` + `/api/admin/audit`. Every PII reveal,
override, and status change should be here, filterable by actor and entity.
This is how the business defends itself. Verify completeness against the
actions that call `logAudit`.

**7. Settings.** Whatever is global — support contact, feature flags (see the
demo-mode item below), notification templates. `admin/settings` exists.

## A3. Two known liabilities to resolve here

- ~~`npm run build` fails on the `requireAuth` import.~~ **Resolved** — verified
  `npm run build` exits 0 and `requireAuth` is exported from `src/lib/auth.js`.
  Keep the build green as the gate for the DPDP suite.
- **Demo credentials in the client bundle.** Admin/operator demo passwords and
  a "Demo Admin" button ship to every visitor. Gate them behind
  `NEXT_PUBLIC_DEMO_MODE` (a setting admin controls in A2.7) and strip them
  from the translation files. Do not leave staff credentials in a public JS
  chunk.

## A4. Design

Match the existing console shell. Dense but legible tables, real empty states,
`StatusPill` for every status (one colour system, already built). No card
`border-left > 1px`, no eyebrows, no emoji as icons (use the drawn
`src/components/icons/Icons.js` set). Admin is a working tool — optimise for
scanning many rows and acting fast, not for marketing polish.

---

# PART B — Operator: the fill desk that extracts every field

The operator's job, in your words: take each submitted application, read every
detail the citizen entered, and use it to fill the official government form.
The console already has the case detail, PII reveal, document verify, and
correction flow. What is thin is the **"give me this application as fill-ready
data"** experience.

## B1. Audit first

Read `src/app/operator/applications/[id]/page.js` and
`src/app/api/staff/applications/[id]/route.js`. List exactly which application
fields the detail page currently shows. The `applications` table carries the
full set — applicant identity, both addresses, identity type/number, guardian
details, RTO/test-centre, vehicle class, service. Confirm which are surfaced
and which are silently dropped.

## B2. The fill-ready view (the core of this part)

The operator is retyping data into a separate government portal. Optimise for
exactly that.

- **Complete field inventory, grouped** the way the government form is
  sectioned: Applicant → Address (current/permanent) → Identity → Vehicle
  class → RTO/Test centre → Documents. Nothing the citizen entered is hidden
  from the assigned operator.
- **Copy affordance per field and per group.** A one-tap copy on each value,
  and a "copy this whole section" action, so the operator can paste into the
  portal without transcription errors. Transcription is where mistakes and
  correction loops come from.
- **PII stays masked until revealed.** Identity number and guardian Aadhaar
  render masked; the existing `reveal-pii` call unmasks them, writes the reveal
  to `audit_log`, and — add this — starts a visible countdown after which the
  UI re-masks. Revealed PII must never be persisted client-side.
- **Document panel.** Each uploaded document viewable, with the existing
  verify/reject actions (`documents/[docId]/verify`). Reject requires a reason;
  that reason is what the citizen sees.
- **Data-quality flags.** Where a field is empty, malformed (pincode length,
  DOB implausible for the service's minimum age), or a document is rejected,
  flag it inline so the operator catches it before filling rather than after
  the portal rejects it.

## B3. Queue and history

`operator/queue` and `operator/history` exist. Verify the queue respects
jurisdiction scope (an operator only ever sees their states — `src/lib/scope.js`),
self-claim works (`assign` → `assigned`), and history shows what that operator
handled with outcomes. The queue is the operator's workday; it should sort by
oldest-waiting and flag anything past SLA.

## B4. Design

Same console shell. The fill-ready view is a reading-and-copying surface:
generous line height, clear field labels, values in a slightly heavier weight
than labels, copy buttons that confirm the copy. Do not use monospace as
decoration — use it only where a value is literally a code (application number,
identity number) that someone will compare character by character.

---

# PART C — OTP verification and the assisted-fill loop

This is the flow you described, built the way it can actually ship. Read the
box first — it changes one mechanism and nothing else.

## C0. What we will NOT build, and why (read before designing)

**We will not read the user's SMS or notifications to capture their OTP.**

- The product is a **web app**. Browsers cannot read SMS. The only browser OTP
  API (WebOTP) auto-fills the *user's own* code on the *user's own* device for
  *your own* domain; it cannot forward the government portal's OTP to a remote
  operator. So this is not merely disallowed here — it is not possible in a
  browser.
- Even as a native Android app, Google Play restricts SMS-reading and
  notification-listener access to apps whose core function is being the SMS
  handler. An assistance app is rejected or delisted for requesting it. iOS
  offers no API to read another app's SMS at all.
- The OTP is the government portal's proof that the citizen is present.
  Harvesting it so a third party can act is credential interception — against
  the portal's terms, and under the DPDP Act, reading a person's full SMS
  stream (which carries their banking OTPs) is maximally sensitive. One breach
  is catastrophic and uninsurable.

**What we build instead gives you the identical workflow:** the citizen enters
the OTP they received into the app, and it is relayed to the operator
**end-to-end encrypted**, in real time. Every other step you listed is
unchanged. The only difference is the box fills because the citizen tapped
their own code, not because we read their messages — and that is the version
that is legal, ships, and keeps the citizen's other OTPs untouched.

## C1. The flow, mapped to what exists

| Your step | How it is built |
|---|---|
| User submits form | Already: application reaches `submitted`. |
| Form reaches the operator | Already: appears in the scoped `queue`. |
| Operator clicks "I am filling this form" | Operator self-claims → `assigned` → starts → `under_review` (both exist). Add a `fill_started_at` timestamp + notification on this transition. |
| User is notified "your form is being filled" | **New:** in-app notification (C3) fired on that transition. |
| OTP box for operator — empty, then fills | **New:** the OTP-relay session (C2). The citizen is prompted for the code they receive; it appears E2E-encrypted in the operator's box. |
| Operator returns the form for a bad field; user fixes it without paying again | Already: `correction_required ⇄ resubmitted`. Payment happens *before* `submitted`, so a correction loop **never re-charges**. Verify and make the "no new payment" explicit in the citizen UI. |
| Operator presses one button: "submitted" | Already: `government_processing` / `completed` with the `government_application_number`. Fire a completion notification. |

**Do not add a new status** for "being filled." Reuse `under_review` plus the
`fill_started_at` timestamp and the notification. Adding a status means
rewriting the state machine and every guard around it — not worth it.

## C2. The OTP relay — end-to-end encrypted (CONFIRMED)

**Decisions locked with the user:**
- **Encrypted, server never reads it.** The citizen's app encrypts the code to
  the operator's browser key before it leaves the device; the server relays
  ciphertext only and purges it. Chosen over a plain server relay.
- **The OTP still arrives as a phone SMS** from the government portal — we do
  not generate it and cannot make it in-app; the RTO sends it. What is in-app
  is *our* part: the prompt to enter it, the entry box, and the encrypted
  delivery to the operator.
- **The 60-second timer is our relay window, not the OTP's own life.**
  Government OTPs are typically valid ~10 minutes. The countdown creates
  urgency, but never tell the citizen their code "expired" while it is still
  valid: always offer a "didn't get it / resend" path and let the operator
  re-request. No hard lockout on a still-good code.

The operator triggers the government portal to send an OTP to the citizen's
phone, then needs that code. The relay carries it from the citizen's app to the
operator without the server ever holding it in the clear.

**Design (pragmatic E2E for a short-lived, low-entropy secret):**

1. **Operator opens a relay request** on the case. This records an event
   (`otp_requested`) and pushes a notification to the citizen: "Your operator
   needs the OTP that was just sent to your phone by the RTO portal."
2. **Key exchange.** The operator's browser generates an ephemeral keypair for
   this request. The public key travels to the citizen's live session; the
   private key never leaves the operator's browser.
3. **Citizen enters their OTP** in their own app. The app encrypts it to the
   operator's public key (Web Crypto, `subtle.encrypt`) **before it leaves the
   device**. The server relays only ciphertext.
4. **Operator's browser decrypts** and shows the code in the box (the box that
   was empty until now). The operator reads it and types it into the portal.
5. **The server stores ciphertext only**, with a short TTL, and **purges it the
   moment the operator confirms use or the request expires** (minutes). Raw OTP
   is never written to the database or to `audit_log`.
6. **Audit the event, never the value.** `otp.relay.requested`,
   `otp.relay.fulfilled`, `otp.relay.expired` — actor, application, timestamp.
   Never the digits.

Be honest in the report about what "E2E" means here: the operator must see the
plaintext to type it into the portal, so the guarantee is *the server and the
database never see or keep the OTP; it is encrypted in transit and at rest for
its brief life, decryptable only by the requesting operator's browser, and
auto-purged.* That is the responsible reading of your "to end encrypted".

**New table** `otp_relay_requests` (ciphertext, operator public key,
application_id, requested_by, status, created_at, expires_at, fulfilled_at).
No plaintext column exists on this table by design.

## C3. Notifications (new system, needed by C1 and C2)

No notifications table exists. Add one and a small delivery surface.

- **Table** `notifications` (user_id, application_id, type, title, body_key,
  data JSON, read_at, created_at). Store a translation **key** + params, not a
  baked English sentence, so the citizen sees it in their language.
- **Events to fire:** fill started, correction requested (with the operator's
  note), OTP requested, application submitted/completed, document rejected.
- **Citizen surface:** a bell/count in the header and a list on the dashboard
  or `/track`. Mark-as-read on open. Poll on an interval; a websocket is
  out of scope unless you already have one.
- **Live prompts** (C2's OTP request) need near-real-time delivery to the
  citizen's open session — a short poll (e.g. 5s) while a relay request is
  pending is acceptable; do not build a socket layer for this alone.

## C4. Consent (DPDP)

Even without SMS-reading, the relay processes an authentication code. Before the
first relay on an application, capture explicit citizen consent ("I agree to
share the OTP I receive with the operator assisting my application for the sole
purpose of submitting it"), record it against the existing consent system in
the privacy suite, and let the citizen withdraw. No dark patterns, no
pre-ticked boxes.

## C5. Design

The citizen's OTP-entry prompt must be unmistakable and calm: who is asking,
why, what it is for, and that it is single-use and encrypted. The operator's
box stays visibly empty with a clear "waiting for citizen" state until the code
arrives, then shows it with a copy action and a "used it / clear now" button
that triggers the purge. Never show a fake or placeholder code in the box.

---

## Verification

- `npm run lint` clean; `npx impeccable detect --json` shows no regression on
  the citizen surface (baseline 0) and no emoji / raw i18n keys on any new UI.
- `npm run build` **passes** once A3's `requireAuth` fix lands — this is the
  gate that proves the DPDP suite compiles.
- Walk the full C1 flow end to end on the running app with three roles
  (citizen, operator, admin): submit → claim → fill-start notification →
  OTP relay round trip → correction loop with no re-charge → complete
  notification. Paste the audit-log rows produced (event names only; confirm no
  OTP digits appear anywhere in the DB).
- Grep the served client bundle to confirm no staff credentials and no OTP
  plaintext are present.

## Stop and ask before

- adding or renaming any application **status** (reuse the machine)
- changing what a citizen is **charged**, or the correction loop's no-re-pay
  guarantee
- storing any OTP, revealed PII, or identity number in `audit_log` or in any
  new table's plaintext column
- shipping any new staff surface without jurisdiction scoping
- anything that would require SMS/notification-reading permissions (out of
  scope per C0 — bring it back for discussion, do not build it)

## Report back with

1. The admin-page audit table (page → state → gap) from A1.
2. The operator-detail field inventory from B1 — what was shown vs dropped.
3. The C1 walkthrough result with the audit rows.
4. Confirmation that `npm run build` passes and how A3 was fixed.
5. Anything deferred, with the reason, so the next person is not surprised.
