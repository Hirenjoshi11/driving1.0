# Step-by-step redesign prompt — citizen-facing site

Paste everything below the line into a fresh Claude Code session in this repo, or
work through it here one stage at a time. It is a **loop**: the same seven steps
run once per page, with a stop for review between pages. Do not batch pages.

---

## WHERE THIS PICKS UP

Three things are already done. Do not redo them.

1. **`PRODUCT.md`** — confirmed product truth. A private, paid application-assistance
   service (explicitly *not* a government portal) helping citizens in Gujarat,
   Rajasthan and Uttar Pradesh apply for Learner's and Driving Licences, in
   English/Hindi/Gujarati, mostly on mobile.
2. **`DESIGN.md` + `.impeccable/design.json`** — the visual system, extracted from the
   incumbent code and confirmed with the user. North Star: **"The Trusted Counter."**
   This file is now **binding authority**, not a suggestion. The mechanical detector
   reads it and scores every literal color and font-size against it.
3. **`AUDIT.md`** — all 51 prior findings are closed. Nothing here is bug-fixing.
   This is a craft pass.

**Scope decision already made by the user:** citizen-facing pages only. Depth is
**refine the existing identity**, not rebrand — keep Counter Green (`#159447`), Inter,
and the current token scale; raise execution quality.

## SCOPE CORRECTION — READ THIS

The `/admin` and `/operator` consoles **already exist and are built out** (24 admin
routes, 5 operator routes, plus a full DPDP privacy suite). `PANEL-PROMPT.md` in this
repo was written before that was discovered; treat it as a spec document, not a to-do.

**Out of scope for this redesign — do not edit:**
`src/app/admin/**`, `src/app/operator/**`, `src/components/console/**`, and every API
route under `src/app/api/**`.

**In scope** is the full citizen-facing surface, which is larger than a first pass
suggests — it includes the six `/account/privacy/*` pages (the DPDP data-principal
rights portal: consent, data access, grievances, nomination, requests).

## HARD RULES

- **Next.js 16.3.4 App Router, React 19, JavaScript only.** No TypeScript. Read
  `AGENTS.md` — this Next version has breaking changes; consult
  `node_modules/next/dist/docs/` before using any framework API you are unsure of.
  Middleware here is `src/proxy.js` exporting `proxy()`, not `middleware.js`.
- **CSS Modules + the tokens in `src/app/globals.css`.** No Tailwind, no CSS-in-JS, no
  component library, no new dependencies.
- **`DESIGN.md` is authority.** Every color and font-size you write must come from the
  documented ramp. When a page genuinely needs a step that is not on the ramp, you may
  add it to `globals.css` **and** `DESIGN.md` in the same change — deliberately, and
  say so in your report. Silently shipping an off-ramp literal is the failure mode the
  detector exists to catch.
- **Three named rules from `DESIGN.md` are non-negotiable:**
  - *The Trust-Never-Recolors Rule* — the disclaimer bar keeps its warning tone. Never
    recolor toward brand green, never reduce its contrast, never move it below the fold.
  - *The Script-Height Rule* — Hindi/Gujarati headings keep looser line-height and
    vertical padding. Never let a layout assume Latin string metrics.
  - *The Press-Response Rule* — interactive cards and buttons respond on press as well
    as hover. Do not flatten the lift-and-shadow language while "cleaning up."
- **Behavior is frozen.** No API changes, no route changes, no auth/session changes, no
  form-validation logic changes. If a visual fix appears to require a behavior change,
  stop and report it instead of doing it.
- **Copy is frozen unless asked.** Do not rewrite factual copy, invent testimonials,
  add customer counts, or soften legal language. UX microcopy fixes (a clearer button
  label, a better error message) are allowed but must be reported explicitly and must
  go through `t()` in all three languages.
- **i18n:** every user-visible string routes through `t()`; DB-backed names through
  `localize()`. A hardcoded English string in JSX is a defect, not a shortcut.

## THE LOOP — run these seven steps once per page

### 1. Read the incumbent
Open the page's `page.js` and its `.module.css` in full before editing. Note what the
page currently does well — refinement preserves identity, and you cannot preserve what
you have not read. Check which shared components it pulls from `src/components/`.

### 2. Get the page's detector baseline
```
.claude/skills/impeccable/scripts/impeccable detect --json <the page's files>
```
Record the count. This is the number you will move, and the before/after pair is your
evidence at step 7.

### 3. Load the craft floor
Read `.claude/skills/impeccable/reference/craft-floor.md` **immediately before editing
UI** — it carries the quality floor and the absolute bans. Load it once per page, not
once per session; it is the thing most likely to be skipped under time pressure and it
is the reason the output is not generic.

### 4. Decide the page's mode, then edit
Assign the page one mode and design to it:
- **Persuade** (Home) — the visitor decides and acts. Earn attention, expose one clear
  primary action, prove something only this product can prove.
- **Operate** (apply wizard, track, dashboard, login, account/privacy) — the visitor
  completes a task. Scanability, state clarity, and familiar affordances outrank
  expression. Brand lives in precise details, not decoration.
- **Read** (documents, help, contact, privacy, terms, refunds) — the visitor
  understands something. Structure for comprehension first, then make it worth staying in.

Then make the changes: hierarchy and spacing rhythm first, typography second, color and
state third, motion last. Token conformance is a byproduct of doing this properly, not
a find-and-replace exercise — a literal `11px` that should be `--font-size-xs` is a
hierarchy decision, not a lint fix.

### 5. Verify it builds and lints
```
npm run lint
npm run build
```
Both must be clean before you look at anything else. A page that does not build has not
been redesigned.

### 6. Look at it, in one batched round
Run the app (`npm run dev`) and inspect the page at **desktop (1440) and mobile (390)
together**, in **all three languages** — Gujarati and Devanagari run taller and are
where layouts break. Fix everything the round shows in one batch, confirm with at most
one more round, then stop. Two rounds is the ceiling. Open-ended self-QA burns budget
doing worse what a fresh review does better.

### 7. Re-run the detector and report, then STOP
```
.claude/skills/impeccable/scripts/impeccable detect --json <the same files>
```
Then report, and wait for the user's go-ahead before starting the next page:
- before/after detector counts for that page;
- what you changed, in design terms, not file terms;
- any DESIGN.md token you added and why;
- anything you deliberately left alone;
- anything that would need a behavior change to fix properly.

**Do not start the next page without an explicit go-ahead.**

## THE PAGE QUEUE

Ordered by impact. Detector baselines are real, measured 2026-09-06 against the
DESIGN.md just written — 500 citizen-facing findings total, almost all
`design-system-color` and `design-system-font-size` advisories (literal values off the
documented ramp), plus a handful of `side-tab` and `layout-transition` warnings.

| # | Page | Route | Mode | Key files (lines) | Detector |
|---|---|---|---|---|---|
| 1 | **Home** | `/` | Persuade | `page.js` (31) + `page.module.css` (1815) + `components/HomeContent.js` | **39** |
| 2 | **Apply — state & service select** | `/apply`, `/apply/[state]` | Operate | `apply.module.css` (131), `services.module.css` (185) | **3** |
| 3 | **Apply — the wizard** | `/apply/[state]/[service]` | Operate | `page.js` (975), `form.module.css` (509), `steps/*` (752 css + 8 step components) | **~110** |
| 4 | **Track** | `/track` | Operate | `page.js` (953), `track.module.css` (1232) | **91** |
| 5 | **Dashboard** | `/dashboard` | Operate | `page.js` (253), `dashboard.module.css` (260) | **17** |
| 6 | **Account privacy portal** | `/account/privacy/*` (6 pages) | Operate | `privacy.module.css` (345) + 6 pages (120–199 each) | **63** |
| 7 | **Login** | `/login` | Operate | `page.js` (357), `login.module.css` (175) | **9** |
| 8 | **Documents guide** | `/documents` | Read | `page.js` (52), `documents.module.css` (271) | **6** |
| 9 | **Help & Contact** | `/help`, `/contact` | Read | `help.module.css` (208), pages (230/110) | **4** |
| 10 | **Public privacy page** | `/privacy` | Read | `page.js` (727), `privacy_public.module.css` (345) | **64** |
| 11 | **Terms & Refunds** | `/terms`, `/refunds` | Read | shared `legal.module.css` (265) | **10** |
| 12 | **Shared chrome** | Header, Footer, validation, error/404 | — | `components/Header` (18), `validation.module.css` (29), `error.js`, `not-found.js` | **~55** |

### Per-page notes

**1 · Home.** The page everyone judges the service by, and the one place Persuade mode
applies. The hero is text-only with an eyebrow, two CTAs and three check items; below it
a trust strip, a six-step timeline, service cards and state sections. Focus: does the
first viewport answer *what is this, why trust it, what do I do* — in that order, in one
screen, on a phone? The trust story (transparent fees, real tracking, not-a-government-
portal) is the thing a competitor cannot copy; make sure it is *shown*, not just stated.
1815 lines of CSS for one page is a signal — look for accumulated one-off rules that
should collapse into the token system.

**3 · The wizard.** Highest craft ROI in the queue. Eight dynamic steps whose fields
come from the database, so design the *system*: how a step renders with 4 fields versus
14, how progress reads on a phone, how errors surface, how the guardian/minor branch
appears without feeling bolted on. `PaymentStep.js` alone carries 43 findings — the fee
breakdown is the product's core trust claim and deserves the most care on this page.

**4 · Track.** 1232 lines of CSS and 91 findings. The status timeline is the emotional
centre — an applicant checking whether their licence is progressing. Make status state
unmistakable and the next action explicit. Empty and error states matter as much as the
happy path here.

**6 · Account privacy portal.** Six pages of DPDP rights tooling (consent, data access,
grievances, nomination, requests) that were clearly built fast — 63 findings against a
345-line stylesheet. These are legally significant surfaces; clarity outranks polish.

**10 · Public privacy page.** 727 lines with its own `HeroVisual.js` component and a
separate stylesheet. Verify it still reads as part of the same system.

**12 · Shared chrome.** Do this **last**, deliberately: changes here touch every page
above, so doing it early means re-verifying everything. When you get here, re-run the
detector across the whole citizen surface, not just the chrome files.

## ACCEPTANCE CRITERIA

Per page, before you report it done:
- `npm run lint` and `npm run build` both clean.
- Detector count for that page's files is materially down, and every remaining finding
  is one you can justify in a sentence (or is a token you deliberately added to
  `DESIGN.md`).
- Renders correctly at 1440 and 390 in **en, hi, and gu** — no clipped matras, no
  overflowing buttons, no horizontal page scroll.
- Full keyboard traversal with a visible focus ring on every interactive element.
- 44px minimum tap targets on mobile.
- Empty, loading, and error states are designed, not defaulted.
- No user-visible hardcoded English string introduced.
- Disclaimer bar untouched in tone and prominence.
- No API, route, auth, or validation-logic change.

At the very end of the whole queue:
- Re-run the detector across the full citizen surface and report the total against the
  500 baseline.
- Spawn the shipped finish reviewer (`impeccable-finish-reviewer`) with the changed
  pages, screenshots, and `DESIGN.md`; act on its disposition word.
- Re-run `/impeccable document` so `DESIGN.md` describes what actually shipped rather
  than what was planned.

## WHAT WOULD MAKE THIS FAIL

- Doing several pages at once and reporting them together — the review gate is the
  point, and it is where the user steers.
- Treating the 500 detector findings as a find-and-replace task. They are a symptom;
  the hierarchy decisions behind them are the work.
- Flattening the tactile shadow/lift language because it reads as "dated." The user
  confirmed it deliberately.
- Redesigning toward a look that a generic AI pass would produce for a
  government-services site. If someone could guess the result from the category alone,
  it has not been designed.
- Quietly touching `/admin` or `/operator` because a shared component made it easy.
