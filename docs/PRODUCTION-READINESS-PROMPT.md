# Production-Readiness Prompt — Audit Every Flow, Strip the Scaffolding, Ship

Goal: take `driving1.0` from a demo-laced work-in-progress to something you can
put in front of real citizens who pay real money for a government-adjacent
service. Written after reading the code, so the findings below are verified, not
guessed — start from them, then sweep for the rest.

**Ground rules:**
- JavaScript only. Next.js 16 App Router. Preserve the shipped citizen-surface
  design (0 detector findings) — this is a *removal and hardening* pass, not a
  redesign.
- Any user-facing string change lands in all three of `en/hi/gu.json`.
- Nothing that weakens a real security control gets "gated behind a flag" as a
  shortcut — a backdoor behind an env var is still a backdoor if the env var can
  be set in production. Remove, don't hide, unless the gating is genuinely
  dev-only and fails closed.
- Behaviour that citizens rely on (application flow, tracking, the OTP relay
  just shipped) must keep working. Verify, don't assume.

---

## Read first — the audit already found these. Two are severe.

### FINDING 1 (severe): the app has two databases and neither is production-safe

- **53** API routes use **better-sqlite3** (`@/lib/db` → `database/db.js`).
- **1** route (`/api/auth/email`) uses **Supabase/Postgres** (`@/lib/supabase`).
- The tree also carries `database/supabase_schema.sql`, `supabase_seed.sql`,
  `scripts/generate_supabase_sql.js`, and new `oauth/` + `email/` auth routes.

This is a half-started migration, and it is the single biggest thing standing
between this repo and production:

- **better-sqlite3 does not survive on Vercel/serverless.** `database/db.js`
  already falls back to `/tmp/driving_license.db` when `process.env.VERCEL` is
  set — `/tmp` is ephemeral and per-instance, so **every deploy and most cold
  starts wipe all citizen data.** On the current hosting assumption, the app
  loses applications, users, and payments silently.
- Running two datastores means data written through one is invisible to the
  other. A citizen who signs up via `/api/auth/email` (Supabase) and one via
  `/api/auth/otp` (SQLite) are two different people in two different databases.

**This prompt cannot proceed past cleanup without a datastore decision. Make it
the first task and state it explicitly:**

- **Option A — commit to Supabase/Postgres.** The migration files suggest this
  was the intent. Port the 53 SQLite routes to Postgres, move the schema
  (including the `notifications`, `otp_relay_requests`, and
  `applications.fill_started_at` added for the OTP relay — currently created in
  `database/db.js`'s idempotent block) into `supabase_schema.sql`, and delete
  better-sqlite3. Large, but it is the only path that is Vercel-native.
- **Option B — commit to SQLite on a persistent host.** Keep better-sqlite3,
  but deploy somewhere with a real disk (a VM/container with a mounted volume),
  drop the `/tmp` fallback, and delete the Supabase scaffolding. Smaller, but
  rules out serverless hosting.

Do not ship the hybrid. Pick one, make all data flow through it, and delete the
other entirely — the dead datastore is itself "unnecessary parts."

### FINDING 2 (severe): the OTP login has a universal backdoor

`src/app/api/auth/otp/route.js`:
- generates a fixed OTP `'123456'` for every phone (lines 24-34)
- returns it to the client as `devOtp` (line 34) — anyone can read it in the
  network tab
- accepts `'123456'` for **any** number regardless of what was sent (line 48)

This means **anyone can log in as any citizen by entering 123456.** It is not a
demo convenience; it is an authentication bypass shipped to production. Replace
the stub with a real SMS OTP provider (e.g. an Indian SMS gateway / DLT-approved
sender), remove `devOtp` from the response, and remove the `'123456'` accept.
If a dev bypass is truly needed for local work, it must be gated on
`NODE_ENV !== 'production'` AND a non-default secret, and it must fail closed —
never a constant everyone knows.

### FINDING 3: demo scaffolding shipped to real users

Remove, or gate behind a genuinely dev-only `NEXT_PUBLIC_DEMO_MODE` that is off
in production:

- **Wizard "Fill Demo Data"** — `handleFillDemoData` + `#btn-fill-demo-data`
  (`apply/[stateSlug]/[serviceSlug]/page.js:126,751`). It injects a fake
  applicant, a fake Aadhaar-referencing FIR, and — worst — **six fake
  "verified" uploaded documents** (`uploadedDocuments` at ~line 202) into a real
  application. Fabricated document verifications on a government service are a
  liability. This must not exist in a production build.
- **Login demo buttons** (`login/page.js:220-238`) — auto-fill
  `admin@drivinglicenseform.com` / `admin123`, mobile `9876543210` / OTP
  `123456`, and `citizen.demo@example.com`. Staff credentials in a public bundle.
- **Demo notices in i18n** — `payment.demoModeNotice` ("no real payment is
  taken"), `auth.demoCredentialsNotice` ("Demo credentials available:
  admin@dlf.gov.in / Admin@123456"), and the `auth.demoFilled*` strings. Remove
  from all three language files once the buttons are gone.

### FINDING 4: config that masks its own absence

`src/lib/supabase.js` hardcodes a real-looking project URL and a dummy anon key
as `|| ` fallbacks (lines 4-6). Even though the key is a placeholder, this
pattern means a misconfigured production deploy **silently connects to the wrong
place or a dummy** instead of failing. Production config must fail fast: throw on
missing required env, ship a `.env.example` listing every variable, and remove
hardcoded fallbacks for anything environment-specific. (`.env*` is already
gitignored — good; keep it that way.)

### FINDING 5: 21 TODO/FIXME/HACK markers

Triage each: fix, convert to a tracked issue with a link, or delete if stale. A
production repo should not carry 21 unqualified "fix this later" notes in
shipped code.

---

## The audit — every route, every flow

Do this systematically and produce the artifacts below; do not spot-check.

### A. Route inventory

Enumerate every page under `src/app/**` and every handler under
`src/app/api/**`. For each, record in a table: purpose · datastore it hits ·
auth/role required · does it work end-to-end · demo/dead/fabricated content
present. This table is the deliverable that proves the audit happened.

### B. Flow walk-throughs (all three roles)

Walk each primary journey on the running app and confirm no dead ends, no
fabricated data, no demo affordances:

1. **Citizen apply** — state → service → wizard steps → documents → review →
   payment → submitted → track. Confirm the fee shown equals the fee charged
   (the redesign fixed fabricated fees on display; verify the *charged* amount,
   `total_payable`, has no invented fallback).
2. **Citizen account** — login (OTP + email), dashboard, track, notifications
   bell, the OTP-relay prompt, privacy centre, correction loop (no re-charge).
3. **Operator** — queue (jurisdiction-scoped) → case → reveal PII → verify docs
   → OTP relay → correction / complete.
4. **Admin** — the 21 admin pages: confirm each reads real data and its writes
   land. The DPDP suite (consents, requests, retention, incidents) must be real,
   not display-only.

### C. Dead-weight sweep

- Unused components, CSS classes, exports, and assets. (The redesign removed 73
  dead CSS classes from the home page; apply the same rigour repo-wide.)
- Unreachable routes and orphaned API handlers.
- The root-level working docs — `PANEL-PROMPT.md`, `REDESIGN-PROMPT.md`,
  `TRIM-PROMPT.md`, `ADMIN-OPERATOR-OTP-PROMPT.md`, this file, `PRODUCT.md`.
  Decide: move to a `/docs` folder or remove from the shipped repo. Working
  prompts do not belong in a production root.
- Placeholder/lorem content, `example.com` addresses, `Z1234567`-style sample
  values anywhere outside a clearly-labelled dev path.

### D. Production hardening checklist

- **Secrets**: none in source; `.env.example` complete; app throws on missing
  required env.
- **Errors**: no stack traces or raw error strings to the client; the shipped
  `error.js` / `not-found.js` cover the surface.
- **Rate limiting**: `src/lib/rateLimit.js` exists — confirm it actually guards
  auth and payment endpoints, not just imported and unused.
- **Security headers / CSP**: set via `next.config.mjs` or `src/proxy.js`.
- **Legal**: Terms and Refunds are English-only (zero `t()` calls) — a paid
  service promising trilingual support needs these professionally translated
  before launch. Flag for a human translator; do not machine-translate binding
  legal text.
- **Payment**: replace the "no real payment is taken" demo path with a real
  gateway integration, or — if the product is genuinely assistance-fee-only —
  make that explicit and honest in the flow. This is a business decision;
  surface it, don't guess.

---

## Verification

- `npm run build` exits 0; `npm run lint` 0 errors.
- `npx impeccable detect --json` — citizen surface stays at 0 findings.
- Every route in the inventory returns its expected status for its role;
  no route 500s.
- Grep the served client bundle: **no** `123456`, no `admin123`, no
  `example.com`, no `devOtp`, no demo credentials.
- The chosen datastore is the *only* one referenced in `src/`; the other's
  files are gone.
- A fresh environment (clean checkout + documented env) boots and runs the
  citizen apply flow without hand-editing a database.

## Stop and ask before

- **the datastore decision** (Option A vs B) — this is the user's call and
  everything else depends on it
- removing anything that turns out to be load-bearing rather than demo
- the payment model decision (real gateway vs explicit assistance fee)
- deleting the working `.md` docs vs relocating them
- touching legal text (Terms/Refunds) — translation is a human task

## Report back with

1. The full route-inventory table (A) and flow-walk results (B).
2. The datastore decision and the migration/cleanup plan that follows from it.
3. Every demo/backdoor artifact removed, with its old location.
4. What was left in place deliberately (e.g. dev-only bypass, gated correctly)
   and why, so the next person does not mistake it for an oversight.
5. The remaining pre-launch items that are human decisions, not code:
   legal translation, payment model, SMS provider, hosting.
