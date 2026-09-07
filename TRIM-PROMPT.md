# Scope-Trim Prompt — Footer, Service Catalogue, Hero CTA

Three changes to the citizen-facing surface of `driving1.0`.
Written after reading the code, so the facts below are verified, not assumed.

**Ground rules carried over from `REDESIGN-PROMPT.md`:**
- Citizen surface only. `/admin`, `/operator`, `src/components/console/`, and
  `src/app/api/**` are out of scope unless a task below names a file explicitly.
- Behaviour is frozen: no auth, route, or validation-logic changes.
- Copy is frozen unless a task says otherwise. Any string change lands in all
  three of `en.json` / `hi.json` / `gu.json` — never one.
- Refine the existing identity. No rebrand, no new colour, no new font.
- Craft floor still applies: no eyebrows above headings, no emoji as icons,
  no `border-left` > 1px on cards, no scattered motion.

---

## Read this before starting — the brief rests on three wrong assumptions

**1. The six services are already deactivated. On this machine only.**

`database/driving_license.db` shows `is_active = 0` for all six, and
`state_services` carries active rows for services 1 and 2 only. So the local
dev site already behaves the way the brief asks.

But `.gitignore:44` is `database/*.db*` — the database is **not tracked**. The
file every other environment builds from is `database/seed.sql`, and it still:

- inserts all 8 services with `is_active` defaulting to `1` (`seed.sql:194-202`)
- maps Gujarat and Uttar Pradesh to all 8, Rajasthan to 7 (`seed.sql:208-217`)

**A fresh checkout or a Vercel deploy brings all six back.** The task is not to
change the running database — that is already done and will not survive. The
task is to make `seed.sql` produce the two-service catalogue.

**2. No application code needs to change to deactivate a service.**

Every read path already filters on the flag. Verified at five call sites:

| Path | Filter |
|---|---|
| `src/app/page.js:16` | `WHERE is_active = 1` |
| `src/app/api/services/route.js:18,22` | `ls.is_active = 1` (both branches) |
| `src/app/apply/[stateSlug]/page.js:45` | `ss.is_active = 1 AND ls.is_active = 1` |
| `src/app/apply/[stateSlug]/[serviceSlug]/page.js:351` | finds within the filtered API response |
| `src/app/api/admin/services/route.js:112` | admin `PATCH` can flip it back |

Deep-linking `/apply/gujarat/renewal` already bounces to `/apply/gujarat`
(`page.js:353-356`). This is a data change with a copy tail, not a code change.

**3. Removing the hero button does not remove the "How It Works" section.**

Four things point at `#how-it-works`. The brief names one:

- `src/components/HomeContent.js:84` — the hero button *(the one to remove)*
- `src/components/HomeContent.js:207` — the section itself, still on the page
- `src/components/Header/Header.js:148,169` — desktop and mobile nav
- `src/components/Footer/Footer.js:42` — footer resources link

Remove only the hero button and the section stays reachable from the nav and
the footer. That is a coherent outcome. State it as the intended one before you
start, and confirm the user agrees — do not silently remove the section too.

---

## Task 1 — Compress the footer for mobile

### What is actually there

`src/components/Footer/Footer.js` renders four columns that collapse to one at
narrow widths (`Footer.module.css:20-23`, single column until the 640px
breakpoint at line 31):

| Column | Contents |
|---|---|
| Brand | logo + name, tagline, and a ~45-word description |
| Licence Services | 2 links |
| Citizen Resources | 5 links |
| Platform & Policies | 7 links |
| Bottom | copyright + a ~55-word disclaimer |

That is **14 links and roughly 100 words of prose stacked vertically** on a
phone, plus a `--space-12` (3rem) divider margin above the bottom block.

### Step 1 — measure before you cut

Do not guess. Render at 390 x 844 and record the footer's pixel height and how
many viewport-heights of scrolling it costs. Repeat in Hindi and Gujarati —
per the Script-Height Rule in `DESIGN.md`, both scripts run taller, so the
worst case is not English. Put the three numbers in your report.

### Step 2 — pick the mechanism

Two viable approaches. Recommend one with reasoning; do not do both.

**A. Collapse the link columns into accordions below 640px.** Titles stay
visible as tap targets, lists hidden until opened. Preserves every link.
Requires real `<button aria-expanded>` disclosure semantics, not a CSS
checkbox hack, and the groups must be open and static above 640px.

**B. Cut the link count and tighten the prose.** Faster, no new interaction,
but it is a content decision. Candidates worth raising with the user before
touching:
- "About Our Service" and "Help & Support" both resolve to `/help`
- "Citizen Privacy Center" and "DPDP Grievance Redressal" are one journey
- the brand description restates the tagline directly above it

**Whichever you choose, these are non-negotiable:**
- The legal disclaimer text does not shrink, move behind a toggle, or lose
  contrast. It is a compliance statement on a service that charges money.
  Trust-Never-Recolors applies.
- Every legal route (`/privacy`, `/terms`, `/refunds`, the DPDP grievance
  path) stays reachable from the footer at every width.
- Desktop layout is unchanged. This is a mobile fix.

### Step 3 — two things to fix while you are in the file

**A real bug.** Both Services links point at the same place:

```jsx
<Link href="/apply">{t('services.learnerLicence') ...}</Link>
<Link href="/apply">{t('services.newDrivingLicence') ...}</Link>
```

Two differently-labelled links landing on the identical generic page. They
should carry the user toward their named service. Note that a service URL needs
a state (`/apply/[stateSlug]/[serviceSlug]`), so `/apply` may genuinely be the
only honest destination — in which case the two links are redundant and the
column should say so rather than fake a choice. Decide and explain.

**Dead motion.** `Footer.module.css:88-91` puts `transform: translateX(2px)` on
hover across all 14 links. Hover does not exist on the device this task is
about, and a nudge repeated 14 times is the scattered motion the craft floor
names. Remove it or justify keeping it.

---

## Task 2 — Two active services, six deactivated

**Keep:** `learner-licence` (id 1), `new-driving-licence` (id 2)
**Deactivate:** `renewal` (3), `duplicate` (4), `add-vehicle-class` (5),
`change-address` (6), `change-name` (7), `international-permit` (8)

### Step 1 — decide dormant vs deleted, then say which

Ask the user this before writing anything, because it changes the whole shape:

- **Dormant (recommended).** Rows stay, `is_active = 0`. Reversible from the
  existing admin panel with no deploy. `is_active` exists for exactly this.
- **Deleted.** Rows and their code branches removed. Cleaner, but a
  reactivation becomes a migration, and it orphans a live application (below).

Everything after this assumes **dormant**. If the user picks deleted, come back
and re-plan — the FK from `applications.service_id` makes it a different job.

### Step 2 — make `seed.sql` the source of truth

This is the actual fix. In `database/seed.sql`:

- Give services 3-8 an explicit `is_active = 0` in the `licence_services`
  insert. The column is `NOT NULL DEFAULT 1` (`schema.sql:128`), so it must be
  written explicitly — omitting it activates them.
- Reduce the three `state_services` inserts to services 1 and 2, or set those
  rows `is_active = 0`. Prefer the latter: it keeps the mapping intact for a
  later reactivation and matches the current database.
- Leave `service_steps` for 3-8 alone. Unreachable, harmless, and needed if the
  services come back.

Then prove it: build a fresh database from `schema.sql` + `seed.sql` in the
scratchpad, query `licence_services` and `state_services`, and paste the result.
A claim that `seed.sql` is correct is worth nothing without that output.

### Step 3 — the copy tail nobody will notice until a user does

Deactivating the rows leaves six places still advertising the services:

1. **`src/app/layout.js:16-17`** — the site description and keywords sell
   "Renewal, Duplicate DL and more". That is now false, and it is the text
   Google shows. Rewrite both.
2. **`src/app/help/page.js:115-116`** — `renewal` and `duplicate` FAQ filter
   chips, with real FAQ entries behind them (`help/page.js:51,61`). A citizen
   filters to Renewal, reads how renewal works, and finds nowhere to do it.
   Decide: drop the chips and their FAQs, or keep them as pure information and
   make the answers say the service is not offered here. Recommend the second —
   the answers are genuinely useful and removing them makes the help page
   thinner for no gain — but they must not imply this site handles it.
3. **`src/components/Footer/Footer.js:32-36`** — already lists only the two.
   No change.
4. **`src/components/ServiceSelectionView.js:22-31`** — `SERVICE_ICONS` keeps
   entries for all 8. Leave them. Dormant services keep their marks, and the
   `IconFile` fallback already covers anything unmapped.
5. **`LicenceStep.js:19,21` and `RtoStep.js:22`** — branches on `duplicate`,
   `international-permit`, `add-vehicle-class`. Leave them. Unreachable while
   dormant, required if the services return.
6. **`src/lib/translations/*.json` `services.*`** — all 8 names in three
   languages. Leave them. The help page still uses two of them.

### Step 4 — the live application on a deactivated service

`applications` holds one row with `service_id = 3` (renewal), alongside 11 on
service 1 and 2 on service 2. Local dev data, but the same will be true in
production the day this ships.

Check what that citizen sees now: `/track` with their application number, the
dashboard card, and the resume-draft path into the wizard. If the wizard bounces
them to `/apply/[stateSlug]` with no explanation, that is a person locked out of
work they already paid for. Report what you find. Fix it only if it is broken
and the fix is contained; otherwise flag it and let the user decide.

---

## Task 3 — Remove "See How It Works" from the home hero

The smallest of the three. Three files:

1. **`src/components/HomeContent.js:84-86`** — delete the `<a>`.
2. **`src/app/page.module.css:100-123`** — `.secondaryCta` and its `:hover` /
   `:active` rules become dead. Remove them. Confirm no other file imports the
   class first.
3. **`src/lib/translations/{en,hi,gu}.json:92`** — `home.howItWorksCta` becomes
   unused. Remove from all three, or none.

Then look at what is left. `.heroActions` (`page.module.css:72-79`) is a centred
flex row with `gap` and `flex-wrap`, now holding one child. A single button in a
wrapping flex row is not wrong, but the spacing was balanced for two. Check
`margin-bottom: var(--space-8)` against `.heroChecks` below it and adjust if the
hero now reads bottom-heavy. Do not add anything to fill the gap.

Leave `home.howItWorksTitle` and `home.howItWorksSubtitle` alone — the section
they title is staying.

---

## Verification — run all of it, paste the output

```bash
# no raw i18n keys, no emoji, no regressions from the redesign
npx impeccable detect --json > /tmp/after.json   # compare to the 0-finding citizen baseline
npm run lint

# every citizen route still 200s
for p in / /apply /track /dashboard /help /contact /privacy /terms /refunds /documents /login; do
  printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000$p"; done

# deactivated services are gone from the API and the pages
curl -s localhost:3000/api/services | grep -c '"slug"'                                # expect 2
curl -s localhost:3000/apply/gujarat | grep -ci 'renewal\|duplicate\|international'    # expect 0

# the seed produces what the running database has
#   (build fresh from schema.sql + seed.sql in the scratchpad, then compare)
```

Also required, and not scriptable:

- Footer height at 390px in **all three languages**, before and after.
- Home hero at 390px and 1440px with the button gone.
- `/help` with the renewal and duplicate chips in whatever state you chose.

`npm run build` still fails on the pre-existing `requireAuth` import in
`src/app/api/admin/privacy/policy/route.js`. That is not yours. Verify against
`next dev` and say so in the report.

---

## Stop points

Stop and ask before:

- deleting service rows rather than deactivating them
- removing the How It Works **section** rather than the hero button
- dropping any footer link, or any of the six named merge candidates
- touching the legal disclaimer's text, size, or placement
- changing what an existing applicant on a deactivated service can do

## Report back with

1. Footer height at 390px, three languages, before and after — the actual numbers.
2. Which footer mechanism you chose and why the other was worse.
3. Fresh-database query output proving `seed.sql` yields two active services.
4. What you found for the stranded renewal application.
5. Anything you left dormant rather than deleted, so the next person knows it
   is deliberate and not an oversight.
