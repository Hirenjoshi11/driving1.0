# Audit checklist — driving1.0

End-to-end audit of the licence portal: every route, API endpoint and application step.
**51 findings.** Items marked ✅ **Verified** were reproduced against a real production
build (`next build` → `next start -p 3111`) using live HTTP calls and direct SQLite
queries — not read from source alone.

- **Audited:** 4 September 2026 · Next.js 16.3.4 · React 19.2.8 · better-sqlite3 13
- **Surface:** 12 API routes · 9 pages · 8 form steps
- **Report:** https://claude.ai/code/artifact/b5f257ee-ac48-4a15-9c9b-3a645eb64108

| Severity | Count | Meaning |
| --- | --- | --- |
| 🔴 Critical | 14 | Ship-blocking: data exposure, broken submission, simulated payment |
| 🟠 High | 16 | Data loss, privacy leaks, keyboard-inaccessible controls |
| 🔵 Medium | 14 | Correctness gaps and silent failures |
| ⚪ Low | 7 | Scale limits and polish |

Tick items as they land. Work order is at the bottom — it is sequenced by dependency,
not severity, because several critical items cannot be fixed correctly until the one
before them is done.

---

## Part A — Application & backend

The portal collects Aadhaar numbers, dates of birth, home addresses and card details,
and charges money for a government service. That raises the bar on everything below.

### A1 · Authentication & access control

- [x] **SEC-01** 🔴 **There is no authentication. The login page is a 400 ms timer.**
  Sign-in never contacts the server — any password works, and the "RTO Admin / Operator"
  tab hands out the admin role. No `/api/auth` route, no session, no cookie, no token.
  The `users` table and `bcryptjs` are unused; the only row is `Admin` with the
  placeholder hash `$2b$10$place…`.
  · `src/app/login/page.js:20-40`
  · **Fix:** mobile + OTP for citizens, bcrypt password for operators. Issue an httpOnly,
  SameSite=Lax session cookie and verify it server-side on every protected route.
  Everything else in A1 depends on this landing first.

- [x] **SEC-02** 🔴 **The admin console is reachable by typing the URL.**
  Neither the admin layout nor the page checks a role, a session, or even the client-side
  `isAuthenticated` flag. The sidebar hardcodes "Logged in as RTO Super Admin". There is
  no sign-out control anywhere in the app — the `LOGOUT` action exists but nothing
  dispatches it.
  · `src/app/admin/layout.js` · `src/app/admin/page.js:1-20`
  · **Fix:** guard `/admin` in middleware against a verified session with
  `role in ('operator','admin')`, re-check the role inside every admin API handler,
  and add a sign-out action.

- [x] **SEC-03** 🔴 ✅ **`GET /api/applications` hands every applicant's full record to anyone.**
  `SELECT a.*` with no authentication and no mandatory `userId`. Called with no query
  string from a logged-out browser it returned every application with all 95 columns —
  name, father's name, DOB, mobile, email, Aadhaar number, house number, street, city,
  pincode.
  · `src/app/api/applications/route.js:14-50`
  · **Fix:** require a session; scope to `user_id = session.userId` for citizens and to
  assigned jurisdiction for operators. Return an explicit column list, never `a.*` —
  summary fields for the index, detail fields only on the single-record route.

- [x] **SEC-04** 🔴 ✅ **The public tracking endpoint returns 101 columns, Aadhaar included.**
  Knowing an application number is the only thing between a stranger and a complete
  identity record. No second factor, no ownership check, no rate limit. `UPPER()` means
  guesses need not match case.
  · `src/app/api/applications/track/[appNo]/route.js:15-42`
  · **Fix:** require application number **plus** DOB or the registered mobile's last four
  digits. Return a narrow projection: status, service, RTO name, submitted date, next
  action — nothing identifying beyond a masked name.

- [x] **SEC-05** 🔴 **Application numbers are guessable and nothing limits guessing.**
  Format is `DLF-{GJ|RJ|UP}-{YYYYMM}-{5 digits}`. The prefix is fully predictable, leaving
  a keyspace of 100,000 per state per month. Combined with SEC-04 that is a bulk PII
  harvest. No rate limiting or bot protection exists on any route.
  · `database/db.js:41-48`
  · **Fix:** keep the friendly number for display, add an unguessable lookup component —
  a `crypto.randomUUID()` tracking token, or the DOB check from SEC-04. Add per-IP rate
  limiting on tracking and login.

- [x] **SEC-06** 🔴 **Anyone can change any application's status.**
  `PATCH /api/applications/[id]` takes status, government reference number and internal
  notes from the body with no authentication and no role check.
  · `src/app/api/applications/[id]/route.js:32`
  · **Fix:** require an operator session. Validate `status` against the allowed enum *and*
  against a legal transition from the current status. Record the real session user in
  `changed_by`.

- [x] **SEC-07** 🔴 ✅ **A client can self-approve an application and attribute it to another user.**
  `status` and `userId` are destructured straight from the POST body and written
  unvalidated. Verified: `{"status":"completed","userId":1}` was accepted verbatim.
  `payment_status` is hardcoded `'completed'` on every insert.
  · `src/app/api/applications/route.js:62-72`, `:207`
  · **Fix:** ignore client-supplied `status` and `userId` entirely. Force `status='draft'`
  on create, take the user from the session, and let only a verified gateway callback
  move `payment_status` forward.

- [x] **SEC-08** 🟠 **The "Citizen Dashboard" lists every citizen's applications.**
  Calls `/api/applications` with no `userId`, so the stat tiles and card list cover the
  whole table. The page does no auth check of its own either.
  · `src/app/dashboard/page.js:31`
  · **Fix:** let the server scope by session (SEC-03), drop the parameter from the client,
  and redirect unauthenticated visitors to `/login`.

- [x] **SEC-09** 🟠 **The public track page advertises other people's application numbers.**
  "Recent Applications" chips render each stranger's application number next to their
  first name, as one-click lookups — publishing the exact key SEC-04 needs.
  · `src/app/track/page.js:38-46`
  · **Fix:** remove the chips; for signed-in users populate from that user's own
  applications only.

- [x] **SEC-10** 🟠 ✅ **The SQLite database is not gitignored and is staged to be committed.**
  `.gitignore` covers `.env*` and `node_modules` but says nothing about the database.
  `git status` shows `driving_license.db`, `-shm` and `-wal` as untracked — one
  `git add .` away from applicant data entering history permanently.
  · `.gitignore`
  · **Fix:** add `database/*.db*` now, before the next commit. Keep `schema.sql` and
  `seed.sql` tracked — they are the reproducible parts.

- [x] **SEC-11** 🟠 **Aadhaar numbers are stored in the clear and never masked.**
  `applications.identity_number` holds the raw 12 digits. No screen masks it and two
  public endpoints return it in full. UIDAI regulations require encryption at rest and
  display only as `XXXX XXXX 9012`.
  · `database/schema.sql` · `steps/ReviewStep.js:96`
  · **Fix:** store an encrypted value plus a masked last-4, or only the last 4 and a
  verification reference. Mask everywhere in the UI, exclude from every API projection.

### A2 · Broken application flows

- [x] **FLOW-01** 🔴 ✅ **The admin status dropdown has never worked — every update returns 500.**
  The UPDATE uses `datetime("now")` in double quotes. better-sqlite3 13 compiles SQLite
  with the double-quoted-string misfeature disabled, so `"now"` parses as a column name:
  `no such column: "now"`. The UI checks `if (res.ok)` and on failure does nothing at
  all — no message, no toast; the dropdown just snaps back.
  · `src/app/api/applications/[id]/route.js:44`
  · **Fix:** use single quotes, `datetime('now')`. Then surface the failure in the UI —
  the silent `if (res.ok)` is what let this survive undetected.

- [x] **FLOW-02** 🔴 ✅ **The same route writes to two columns that do not exist.**
  PATCH updates `gov_reference_number` and `internal_notes`. Neither is in the schema —
  the real columns are `government_application_number` and `notes`. Even after FLOW-01,
  any request carrying a government reference or a note still fails.
  · `src/app/api/applications/[id]/route.js:52-63`
  · **Fix:** rename to the real columns. The track route already aliases correctly, which
  is why the read path looks fine while the write path is broken.

- [x] **FLOW-03** 🔴 **When submission fails, the form invents an application number and celebrates.**
  Both the error branch and the `catch` generate a client-side `DLF-…` string, and
  `finally { setSubmitted(true) }` runs unconditionally. If the API is down the applicant
  still sees "Application Submitted Successfully!" and a reference number that exists
  nowhere. They pay, walk away, and discover it only when tracking fails.
  · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:127-142`
  · **Fix:** delete both fallback generators. Show the real error, keep the user's data on
  screen, offer a retry. Only `setSubmitted(true)` when the response carries a
  server-issued application number.

- [x] **FLOW-04** 🔴 **Uploaded documents are never uploaded.**
  The handler keeps only `{name, size, type, uploadedAt}` in React state and drops the
  `File`. No upload endpoint, no storage, zero rows ever written to
  `application_documents`. "✓ All Documents Attached" is theatre — the operator has
  nothing to review.
  · `steps/DocumentsStep.js:66-88`
  · **Fix:** add `POST /api/applications/[id]/documents` accepting multipart, validating
  MIME by magic bytes (not just the `accept` attribute), writing outside the web root or
  to object storage, and inserting into `application_documents`. Save the application as
  a draft first so uploads have an ID to attach to.

- [x] **FLOW-05** 🔴 ✅ **A completely blank application submits successfully.**
  No validation on either side. `handleNext` only increments the step index. The
  `required` attributes are inert — the inputs are not inside a `<form>` and Next/Submit
  sit outside any form. Server-side every field falls back to `|| ''`. Verified:
  `POST {"stateId":2,"serviceId":3}` → 200 with a real application number and blank
  name, DOB, mobile and Aadhaar.
  · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:93` · `src/app/api/applications/route.js:110-160`
  · **Fix:** one schema per step (Zod or similar), shared: block Next until the current
  step passes, re-validate the whole payload in the POST handler before the insert.
  Enforce the Motor Vehicles Act rules you already model — 16+ with guardian consent for
  MCWOG, 18+ otherwise, a valid learner licence for a new DL.

- [x] **FLOW-06** 🟠 **Refreshing the page destroys the whole application.**
  `formData` lives only in component state. A refresh, back-navigation, phone call or
  dead battery loses up to eight steps of typing with no warning and no recovery. The
  schema already has `current_step`, `completed_steps` and a `draft` status for this.
  · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:38`
  · **Fix:** persist to `localStorage` on every change keyed by state+service, and save a
  server-side draft once the applicant step is valid. Add a "Resume your application"
  prompt.

- [x] **FLOW-07** 🟠 ✅ **Five services never ask for an RTO, so they save with none.**
  `service_steps` for renewal, duplicate, change-address, change-name and
  international-permit (ids 3, 4, 6, 7, 8) have no `rto` step, so `rto_id` and
  `district_id` save as NULL. The track page then renders "Designated RTO: null (null)"
  and there is no jurisdiction to route to.
  · `database/seed.sql` (service_steps) · `steps/RtoStep.js`
  · **Fix:** add the `rto` step to those five, or derive the RTO from the address pincode.
  Either way make `rto_id` required at submission and guard the track page against nulls.

- [x] **FLOW-08** 🟠 ✅ **Deep-linking any state validates the service against Gujarat.**
  The init effect dispatches `SET_STATE` then immediately reads
  `appState.selectedState?.id` from the same closure — still `null` — so it falls back to
  `stateId || 1`. Every direct load or refresh checks service availability against
  Gujarat's list. Rajasthan does not offer the international permit, but
  `/apply/rajasthan/international-permit` loads anyway because Gujarat does.
  · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:63-64`
  · **Fix:** use the `found` object you just resolved:
  `const stateId = found?.id ?? appState.selectedState?.id`. Drop the `|| 1` default and
  fail loudly instead.

- [x] **FLOW-09** 🟠 ✅ **32 of 76 districts have no RTO, and the fallback is silent.**
  When a district has no office, RtoStep quietly refetches state-wide offices and
  auto-selects the first one. The applicant sees their district in one dropdown and an
  office from a different district in the next, with no explanation — and the application
  is filed in the wrong jurisdiction.
  · `steps/RtoStep.js:57-72`
  · **Fix:** seed the missing offices, or say so in the UI: "No RTO in {district}. Nearest
  offices:" with distance ordering. Never silently auto-select a jurisdiction the
  applicant did not choose.

- [x] **FLOW-10** 🔵 **Operator status changes will never reach the tracking timeline.**
  PATCH writes `changed_by: 99` — the hardcoded ID the fake admin login invents. No such
  user exists, `foreign_keys` is ON, so the insert violates the FK and is swallowed by
  `console.warn`. Once FLOW-01 lands, statuses will move but the applicant-facing history
  stays empty.
  · `src/app/api/applications/[id]/route.js:73`
  · **Fix:** write the real session user ID. Stop swallowing the error — a lost audit
  trail on a government application should fail loudly, not warn.

- [x] **FLOW-11** 🔵 **The legal declaration and the minor's guardian consent are decorative.**
  The review step renders an undertaking citing the Motor Vehicles Act 1988 and stores
  the tick in `formData.declared`. The minor flow collects guardian name, relationship,
  mobile, Aadhaar and a Section 4(1) consent tick. None of it is checked before
  submission, and `guardian_declaration` stays 0 even when consented.
  · `steps/ReviewStep.js:232` · `steps/ApplicantStep.js:340`
  · **Fix:** block submission until `declared` is true, and until `guardianConsent` is true
  whenever the applicant is a minor. Persist both with a timestamp — a consent you cannot
  evidence is not a consent.

- [x] **FLOW-12** 🔵 **Test-centre availability is modelled but never shown.**
  `driving_test_centres` carries `status` (`active` / `temporarily_unavailable` /
  `verify_before_appointment`) and a `status_note`. The API filters on `is_active` only
  and the UI ignores both, so an unavailable track would still be offered and
  auto-selected. Every seeded row is currently `active`, which is why this will not be
  noticed until it matters.
  · `src/app/api/test-centres/route.js:12` · `steps/RtoStep.js`
  · **Fix:** return `status` and `status_note`, badge them in the option list, and stop
  auto-selecting anything that is not `active`.

### A3 · Payments, legal & data protection

- [x] **PAY-01** 🔴 **Payment is simulated, recorded as completed, and described as secure.**
  No gateway. UPI shows a mock QR that no app can scan; every insert writes
  `payment_status: 'completed'` and stamps `payment_date`. The screen tells the applicant
  "🔒 256-Bit SSL Encrypted Payment" and "Instant Receipt & SMS Confirmation" — neither
  exists. For a paid service that is a misrepresentation, not a placeholder.
  · `src/app/api/applications/route.js:207` · `steps/PaymentStep.js:118`, `:176`
  · **Fix:** integrate a real gateway (Razorpay, PayU, Cashfree), create the order
  server-side from the DB fee — never a client-sent amount — and move `payment_status`
  only on a signature-verified webhook. Until then label the flow "Demo — no payment is
  taken" and remove the security claims.

- [x] **PAY-02** 🔴 **Card number, expiry and CVV are captured into application state.**
  Plain inputs bound to `formData.cardNumber`, `cardExpiry` and `cardCvv`. That whole
  `formData` object is POSTed to your own server on submit. Raw PAN and CVV must never
  enter your JavaScript or cross your server, and CVV must never be stored at all — the
  bright line in PCI-DSS.
  · `steps/PaymentStep.js:150-180` · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:113`
  · **Fix:** delete these three inputs. Card data belongs in the gateway's hosted checkout
  or iframe, which returns a token. Confirm no earlier build logged a request body
  containing them.

- [x] **PAY-03** 🟠 **Privacy Policy, Terms and Fee Policy are all links to the help page.**
  Five footer links — About, Contact, Privacy Policy, Terms & Conditions, Transparent Fee
  Policy — point at `/help`. No privacy notice for a service collecting Aadhaar numbers
  and card details (DPDP Act 2023 requires one), and no published terms, refund policy or
  contact address — which every Indian payment gateway requires before onboarding.
  · `src/components/Footer/Footer.js:63-67`
  · **Fix:** write real `/privacy`, `/terms`, `/refunds` and `/contact` pages. State what
  is collected, why, how long it is kept, who it is shared with, and how to request
  deletion. The "not a government portal" disclaimer is already good and prominent —
  keep it.

- [x] **PAY-04** 🔵 **A hardcoded ₹449 fallback fabricates fees and inflates reported revenue.**
  `total_fee || 449` in four places. Because `0 || 449` is 449, a genuinely free or
  unpriced service displays ₹449, and the admin console's "Collected Fees" total invents
  ₹449 for every row with a missing fee.
  · `admin/page.js:66`, `:271` · `track/page.js:298` · `PaymentStep.js:26` · `ReviewStep.js:213`
  · **Fix:** remove every fallback. Show "Fee unavailable" and block the payment step when
  `fee_structure` has no active row for that service and state.

### A4 · Data integrity & content accuracy

- [x] **DATA-01** 🟠 **Application numbers can collide, and a collision is an unexplained 500.**
  `Math.floor(Math.random() * 99999)` against a `UNIQUE` column, with no uniqueness check
  and no retry. By the birthday bound, duplicates become likely in the low hundreds of
  applications per state-month. The expression also never produces 99999 and is not
  uniformly distributed.
  · `database/db.js:41-48`
  · **Fix:** use `crypto.randomInt` and retry on constraint violation, or take a
  per-state-per-month sequence inside the same transaction as the insert.

- [x] **DATA-02** 🔵 **Client and server disagree about who is a minor.**
  The form does a correct birthday-aware calculation; the API subtracts calendar years
  only. Someone born in March 2008 applying in January 2026 is 17 to the form — which
  shows the guardian-consent block — and 18 to the server, which writes `is_minor = 0`.
  Eligibility for MCWOG turns on exactly this.
  · `steps/ApplicantStep.js:8-17` · `src/app/api/applications/route.js:88`
  · **Fix:** one `calculateAge(dob)` in `src/lib/`, called from both. The server's answer
  governs.

- [x] **DATA-03** 🔵 **Fields are collected, shown on the review screen, then dropped.**
  The POST handler maps a fixed field list, so anything outside it is discarded silently:
  `relationType` (so "Mother" or "Husband" is saved into `father_name`),
  `guardianMobile`, `guardianAadhaar`, `guardianConsent`, `declared`, and the
  permanent-address building / area / district / state columns. The `form_data` JSON blob
  column exists for exactly this and is never written.
  · `src/app/api/applications/route.js:120`
  · **Fix:** add the missing columns to the insert, store `relationType` alongside the
  name, and write leftover keys to `form_data` so nothing an applicant typed disappears.

- [x] **DATA-04** 🔵 ✅ **The homepage advertises numbers the database contradicts.**
  Hardcoded `STATES_DATA` claims 33/33/75 districts and 38/45/75+ RTOs; the DB has
  25/26/25 districts and 20/15/14 RTOs. It also says "2 Supported Services" while 8 are
  live — underselling as much as overselling.
  · `src/app/page.js:32-66`
  · **Fix:** make the homepage a Server Component and count from the database (see FE-01).
  One query removes the whole class of drift.

- [x] **DATA-05** ⚪ **The admin table loads every application and filters in the browser.**
  `fetchApplications()` requests the unbounded list, then filters by search, state and
  status client-side — even though the API already supports `search`, `status` and
  `stateId`. Fine at one row; unusable at ten thousand, and it ships full PII for records
  the operator never views.
  · `admin/page.js:22`, `:55`
  · **Fix:** push filters into the query string, add `LIMIT`/`OFFSET` with a server-side
  count, and paginate.

- [x] **DATA-06** ⚪ **The service list fires one fee request per service.**
  Eight round-trips to render one grid, on top of the services call.
  · `src/app/apply/[stateSlug]/page.js:40-49`
  · **Fix:** join `fee_structure` into `/api/services`, or fetch it all in one Server
  Component query.

---

## Part B — Front end

The visual design is genuinely good — a coherent token system, a restrained green
palette, clean spacing and a well-composed multi-step layout. What follows is not a
redesign; it is the architecture, accessibility and interaction work the design is
currently outrunning.

### B1 · Architecture & performance

- [x] **FE-01** 🟠 ✅ **All 21 components are client components. Nothing renders on the server.**
  Every page carries `'use client'` and fetches its own data on mount, so the homepage,
  documents guide and help page ship an empty shell, then a spinner, then content. For a
  service that lives or dies on "driving licence renewal Gujarat" search traffic, the
  content Google sees is a loading state. It also creates avoidable waterfalls: state →
  services → fees, three sequential hops before anything is readable.
  · `'use client'` in 21 of 21 files under `src/app` and `src/components`
  · **Fix:** the highest-leverage frontend change. Make `/`, `/documents`, `/apply` and
  `/apply/[stateSlug]` Server Components calling `getDb()` directly — content arrives in
  the HTML, ~9 API round-trips disappear, and DATA-04 stops being possible. Keep
  `'use client'` only on the genuinely interactive leaves: the step forms, the language
  switcher, the admin table.

- [x] **FE-09** 🔵 **Fonts load through a render-blocking CSS `@import`.**
  Serialises behind the stylesheet and costs a third-party connection plus a layout shift
  on every first paint — on the mobile connections most of these applicants are using.
  Six weights are loaded.
  · `src/app/globals.css:6`
  · **Fix:** use `next/font/google` in the root layout. It self-hosts, preloads and
  reserves metrics, removing both the third-party hop and the shift. Subset to the
  weights actually used.

- [x] **FE-08** 🔵 **No error, loading or not-found boundaries — and `alert()` for errors.**
  No `error.js`, `not-found.js` or `loading.js` anywhere in the app tree, so a thrown
  render error gives a blank page. An oversized upload raises a native `alert()`, and the
  admin status failure (FLOW-01) reports nothing at all.
  · `src/app/**` · `steps/DocumentsStep.js:71` · `admin/page.js:45`
  · **Fix:** add a root `error.js` and `not-found.js`, plus `loading.js` for the routes
  that fetch. Replace `alert()` with inline field errors and add a small toast for
  background failures.

- [x] **FE-13** 🔵 ✅ **ESLint reports 8 errors, and several are real bugs.**
  Not style noise — `handleSearch` is referenced by an effect declared above it, Header
  sets state synchronously inside an effect on every navigation, and two components
  mutate `document.documentElement` from render-adjacent code. The nine warnings are all
  missing effect dependencies, the family FLOW-08 came from. Note `npx next lint` no
  longer exists in Next 16, and the `package.json` script is bare `eslint` with no
  target path.
  · `npx eslint src` → 17 problems (8 errors, 9 warnings)
  · `Header.js:24`, `Header.js:50`, `track/page.js:42`, `apply/page.js:68`
  · **Fix:** clear all eight, then wire `npm run lint` into CI.

### B2 · Accessibility

- [x] **FE-02** 🟠 **Keyboard users cannot select a gender.**
  The gender radios are hidden with `display:none`, which removes them from the tab order
  and the accessibility tree entirely. The styled labels are not focusable substitutes. A
  keyboard or screen-reader user cannot complete step one of a mandatory government form.
  · `steps/ApplicantStep.js:137`
  · **Fix:** keep the input in the tree and hide it visually only —
  `position:absolute; opacity:0; width:1px; height:1px` — then style the label from
  `:focus-visible` and `:checked` on the sibling. Same pattern for every custom control.

- [x] **FE-03** 🟠 **`<div onClick>` is used for four real controls.**
  FAQ accordion headers, document upload dropzones, payment-method cards and language
  options are clickable divs — no tab stop, no Enter/Space, no role, no `aria-expanded`.
  Between them they cover choosing how to pay and attaching every document.
  · `help/page.js:120` · `steps/DocumentsStep.js:186` · `steps/PaymentStep.js:74,84,94`
  · **Fix:** accordion headers become `<button aria-expanded>`; the dropzone becomes a
  `<label>` wrapping its file input, which gets keyboard support for free; payment methods
  become a `<fieldset>` of radios. Zero visual change, four controls that work.

- [x] **FE-04** 🟠 ✅ **No focus-visible styles, no skip link, no screen-reader utility.**
  Across 699 lines of `globals.css` and every CSS module there is not one
  `:focus-visible` rule, no `.sr-only` class and no skip-to-content link. Keyboard users
  navigating an eight-step form past a five-item header have no idea where they are.
  · `src/app/globals.css` and all `*.module.css`
  · **Fix:** a global `:focus-visible` ring using the existing `--color-border-focus`
  token, an `.sr-only` utility, and a skip link as the first element in `<body>`. Roughly
  fifteen lines.

- [x] **FE-06** 🟠 **`<html lang>` is frozen at English.**
  The root layout hardcodes `lang="en"`. Switching to हिन्दी or ગુજરાતી only mutates
  `document.documentElement.lang` client-side after a click — so the server HTML, every
  crawler and every screen reader on first load are told the Gujarati page is English,
  and pronounce it accordingly.
  · `src/app/layout.js:19` · `Header.js:50`
  · **Fix:** move language into the route — `/[lang]/…` with `generateStaticParams` — or
  read a language cookie in the layout and set `lang` server-side. That also earns real
  hreflang and three indexable language versions.

- [x] **FE-11** 🔵 **The mobile drawer does not trap focus or lock the page.**
  Focus stays behind it, so tabbing walks invisibly through the page underneath; the
  background still scrolls; Escape does nothing; the toggle has an `aria-label` but no
  `aria-expanded`. Most of this portal's traffic will be mobile.
  · `Header.js:200-250`
  · **Fix:** render as a `<dialog>` or add a small focus trap, set `aria-expanded`, close
  on Escape, and lock body scroll while open.

- [x] **FE-12** 🔵 **The language dropdown is mouse-only.**
  Closes on outside `mousedown` but not on Escape or blur, exposes no `aria-expanded` or
  `aria-haspopup`, and does not move focus into the list or support arrow keys. The
  language switcher is the first thing a non-English speaker needs to reach.
  · `Header.js:29-36`
  · **Fix:** add `aria-expanded` and `aria-haspopup="listbox"`, close on Escape with focus
  returned to the trigger, and support Up/Down/Home/End.

- [x] **FE-10** 🔵 **Entrance animations ignore `prefers-reduced-motion`.**
  State and service cards stagger in with per-item `animationDelay`, and there is no
  reduced-motion query anywhere in the CSS.
  · `apply/page.js:96` · `apply/[stateSlug]/page.js:130`
  · **Fix:** one global block —
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important } }`

- [x] **FE-14** ⚪ **Touch targets fall below the 44 px minimum.**
  The admin "Track View" link at `4px 8px` padding on 11 px text, the filter chips and the
  language pills are all well under the 44×44 CSS-pixel target WCAG 2.2 asks for, on a
  form most people will complete on a phone.
  · `admin/page.js:334` · no `min-height:44px` anywhere in `src/**/*.css`
  · **Fix:** set a `--tap-min: 44px` token and apply `min-height` to buttons,
  links-as-buttons, chips and select controls.

### B3 · The application experience

- [x] **FE-05** 🟠 **The language switcher changes the menu and almost nothing else.**
  The i18n layer is well built — three complete translation files, a fallback chain, and
  `getLocalizedField` reading the `_hi` / `_gu` columns the database already carries. But
  `t()` is only used in the header, footer and a few page titles. All eight step
  components, the admin console, the tracking page, the dashboard, help and documents are
  hardcoded English. Switching to ગુજરાતી changes the navigation and leaves the actual
  form in English — arguably worse than not offering it, because it promises support that
  is not there.
  · `src/lib/i18n.js` · all files under `steps/` · `admin/`, `track/`, `dashboard/`, `help/`, `documents/`
  · **Fix:** highest-value UX work after FE-01. Route the eight step components through
  `t()` first — that is the screen where language actually matters — then the tracking
  page. The database side is already done.

- [x] **FE-07** 🔵 ✅ **"Print Acknowledgement" prints the website.**
  The button calls `window.print()` and there is no `@media print` block in the entire
  codebase. The output carries the sticky header, navigation, the disclaimer bar, the
  footer and the buttons themselves. An acknowledgement receipt is the one artefact an
  applicant carries to the RTO counter.
  · `track/page.js:352`
  · **Fix:** a print stylesheet that hides chrome, forces black on white, expands the
  timeline and prints the application number as a scannable monospace block. Better still,
  generate a server-side PDF receipt so the document is identical every time.

- [x] **FE-15** ⚪ **Nothing warns before abandoning a part-finished application.**
  Closing the tab, hitting back, or clicking a header link mid-form discards everything
  silently. The header stays fully interactive throughout the flow, so a stray tap on
  "Documents" or the logo loses twenty minutes of typing.
  · no `beforeunload` handler anywhere
  · **Fix:** pairs naturally with FLOW-06. Add a `beforeunload` guard once the form is
  dirty, and an in-app confirm on header navigation.

- [x] **FE-16** ⚪ **No inline field errors and no error summary.**
  No mechanism to mark a field invalid, no `aria-describedby` wiring, and no summary at
  the top of a step listing what needs attention. The moment FLOW-05 adds validation this
  becomes the blocker.
  · `steps/steps.module.css` — `.hint` and `.required` exist; no error state
  · **Fix:** add an error state to the shared input styles, wire `aria-invalid` and
  `aria-describedby`, and render a focusable summary at the top of any step that fails,
  linking to each field.

- [x] **FE-17** ⚪ **The success screen is a dead end.**
  Submission confirms with an application number and two links. No downloadable
  acknowledgement, no email or SMS, no copy-to-clipboard, no "save this" prompt — yet that
  number is the only key to the application. The applicant step already promises "All
  application updates and OTPs will be sent to this number"; nothing sends anything.
  · `src/app/apply/[stateSlug]/[serviceSlug]/page.js:170-200` · `steps/ApplicantStep.js:196`
  · **Fix:** add copy-to-clipboard, a downloadable PDF acknowledgement, and email/SMS
  confirmation to match the promise the form already makes.

- [x] **FE-18** ⚪ **Failed fetches leave silent empty states.**
  Most data loads follow `.catch(() => setLoading(false))` or `.catch(console.error)`.
  When a request fails the spinner stops and an empty grid appears, indistinguishable
  from "this state genuinely has no services". No offline detection, no retry.
  · `apply/page.js:24` · `track/page.js:44` · `apply/[stateSlug]/page.js:52`
  · **Fix:** distinguish empty from failed. Show a retry affordance on failure and an
  explanatory empty state otherwise.

---

## Suggested order of work

Sequenced by dependency rather than severity — several critical items cannot be fixed
correctly until the one before them lands.

1. **Stop the bleeding, today.** Three changes with no dependencies that reduce real
   exposure immediately: gitignore the database before the next commit, change
   `datetime("now")` to single quotes, and point the PATCH at columns that exist.
   — `SEC-10` · `FLOW-01` · `FLOW-02`

2. **Build real authentication.** Everything in A1 hangs off this. Session cookie, bcrypt
   for operators, OTP for citizens, a middleware guard on `/admin`, and a server-side
   identity to scope queries by. Then close the endpoints: scope the list, narrow the
   projections, gate the PATCH.
   — `SEC-01` → `SEC-09`

3. **Make submission honest.** Delete the fabricated application number, add shared
   per-step validation, enforce the declaration and guardian consent, and build the
   document upload the flow already claims to have. Until this lands the portal accepts
   blank applications and reports fake successes.
   — `FLOW-03` · `FLOW-04` · `FLOW-05` · `FLOW-11` · `DATA-03`

4. **Decide what payment is.** Either integrate a gateway with server-side order creation
   and webhook verification, or label the flow a demo and remove the security claims.
   Both paths start by deleting the card inputs. Publishing the legal pages is a
   prerequisite for gateway onboarding anyway.
   — `PAY-01` · `PAY-02` · `PAY-03` · `PAY-04`

5. **Fix the state and jurisdiction bugs.** The stale-closure fallback to Gujarat, the
   five services with no RTO step, the 32 districts with no office, and draft
   persistence. These are the correctness issues an applicant hits without ever knowing
   why their application went wrong.
   — `FLOW-06` · `FLOW-07` · `FLOW-08` · `FLOW-09` · `DATA-01` · `DATA-02`

6. **Move rendering to the server.** Convert the content and selection pages to Server
   Components. It fixes SEO and first paint, removes nine round-trips, deletes the
   homepage-versus-database drift, and makes the remaining frontend work easier rather
   than harder.
   — `FE-01` · `FE-09` · `DATA-04` · `DATA-06`

7. **Make it usable by everyone.** The keyboard fixes are small and mostly mechanical:
   real radios, buttons instead of divs, a focus ring, a skip link, reduced motion. Then
   translate the eight step components — the language switcher currently promises support
   the form does not deliver.
   — `FE-02` · `FE-03` · `FE-04` · `FE-05` · `FE-06` · `FE-10` · `FE-11` · `FE-12`

8. **Finish the experience.** Error boundaries, inline validation display, the print
   stylesheet and PDF acknowledgement, admin pagination, touch targets, Aadhaar masking,
   and clearing the ESLint errors into CI.
   — `FE-07` · `FE-08` · `FE-13` → `FE-18` · `DATA-05` · `FLOW-10` · `FLOW-12` · `SEC-11`
