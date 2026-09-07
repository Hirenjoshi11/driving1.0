# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: private citizens in Gujarat, Rajasthan, and Uttar Pradesh applying for a
Learner's Licence or a new Driving Licence, mostly on mobile, in English, Hindi,
or Gujarati. Many are first-time applicants unfamiliar with RTO paperwork, unsure
which documents they need, and wary of being scammed by an unofficial service —
so trust signals and plain-language guidance matter as much as the form itself.

Secondary (out of scope for this redesign round): RTO operators and admins who
review submitted applications, verify documents, and manage state/service/fee
configuration through `/admin`.

## Product Purpose

Driving License Form is a guided, self-serve web application that walks a
citizen through preparing a driving-licence application: choosing their state
and service, filling in applicant/address/licence/vehicle details, uploading the
right documents, paying the applicable statutory + service fees, and tracking
the application's status afterward. It exists to replace the confusing,
often-broken official state RTO/Parivahan portals with a clear, step-by-step,
multilingual alternative.

## Positioning

This is a **paid private assistance service, explicitly not a government
portal** — the disclaimer bar and footer state this on every page. Its
differentiator versus both the official portals and other private agents is a
transparent, itemized process: a dynamic step-by-step form scoped to the
citizen's exact state/service/vehicle-class combination, an explicit document
checklist before they start, a visible fee breakdown (government fee, service
fee, smart-card fee, test fee, gateway fee — never a lump sum), and a public
application tracker — rather than an opaque "give us your documents and wait"
agent relationship.

## Operating Context

- Supported states today: Gujarat (GJ), Rajasthan (RJ), Uttar Pradesh (UP).
- Supported services today: Learner's Licence, New Driving Licence (the schema
  anticipates renewal, duplicate, addition-of-class, and international permit
  services later — do not design as if only two services will ever exist).
- The application flow is a multi-step wizard: Applicant → Address → Licence →
  Vehicle → RTO/test-centre → Documents → Review → Payment. Steps, fields, fees,
  and required documents are all data-driven per state+service (`service_steps`,
  `service_fields`, `service_documents`, `fee_structure`), not hardcoded — a
  redesign should treat form structure as dynamic and design the *system*, not
  a fixed set of screens.
- Minors can apply for a learner's licence with a guardian declaration; that
  path (guardian name/mobile/Aadhaar/consent) is a real, not edge-case, flow.
- After submission, an applicant can look up status by application number
  (`/track`) or sign in to see their own applications (`/dashboard`,
  `/documents`).
- Three working languages: English, Hindi, Gujarati, switchable via
  `LanguagePills`, with every UI string routed through `t()`/`localize()`
  against `src/lib/translations/{en,hi,gu}.json`. Gujarati and Devanagari
  scripts run visibly taller than Latin — layouts must tolerate that.

## Capabilities and Constraints

- Next.js 16.3.4 App Router, React 19, CSS Modules only (no Tailwind/CSS-in-JS/
  component library), `better-sqlite3` for data, Zod for validation. This
  redesign must work within that stack — see `AGENTS.md` for the Next.js
  version's breaking-change notes.
- Session/auth model, application status machine, and jurisdiction scoping are
  security-relevant and out of this redesign's scope; do not alter API
  behavior while restyling.
- Constraint (legal/trust, non-negotiable): the "not an official Government
  portal" disclaimer must remain visible and unambiguous — on the disclaimer
  bar and in the footer — through any redesign. Softening or hiding it is not
  an option.
- Constraint: full fee transparency (itemized fee breakdown, `/refunds` policy)
  must stay legible and prominent; this is the product's core trust claim.
- Open/undecided: whether the /admin and /operator staff surfaces get a
  matching redesign is deferred to a later round (see Redesign Scope decision
  below) — do not restyle `/admin` in this pass.

## Brand Commitments

- Name: "Driving License Form" (DLF in code/application-number prefixes).
- Existing identity to preserve, not replace: primary green `#159447` /
  `#0d7a38`, Inter typeface (with Devanagari/Gujarati fallbacks already wired
  into `--font-family`), the existing spacing/radius/shadow token scale in
  `globals.css`. This round is a refinement of the current identity — see
  Redesign Scope below — not a rebrand. Elevate craft, hierarchy, motion, and
  polish on every page while keeping the brand recognizable at a glance.

## Evidence on Hand

- Live schema and seed data (`database/schema.sql`,
  `database/driving_license.db`): 3 states, 2 active services today, full
  fee/document/step/field configuration tables.
- `AUDIT.md`: a prior 51-finding audit of this codebase (security, data
  integrity, UX correctness). Several findings concern citizen-facing pages
  (toasts, accessibility, form validation) that this redesign should not
  regress and may resolve incidentally.
- No customer testimonials, press, or case studies exist; do not fabricate any.
- No logo/mark file was found beyond a generic `favicon.ico`; treat wordmark
  treatment as open unless the user supplies one.

## Product Principles

1. **Clarity beats decoration.** Every page must make the next required action
   obvious to a first-time, possibly non-technical, possibly non-English-first
   applicant — this is a task-completion product (Operate mode), not a
   marketing showcase, even on the homepage.
2. **Trust is a design requirement, not a footnote.** The disclaimer, fee
   transparency, and "how this differs from a scam" story must read as
   confidently placed, not legally-mandated-and-hidden.
3. **The form is data-driven; the design must be too.** Steps/fields/documents
   vary by state and service — components must handle 1 state or 12, 2
   services or 20, without redesign.
4. **Multilingual by default.** No layout, spacing, or component may assume
   Latin-script string lengths.
5. **Refine, don't replace.** Keep the current green identity and token system
   as the visual authority; the bar is craft and coherence, not a new brand.

## Accessibility & Inclusion

WCAG 2.2 AA is an explicit product requirement — the audience skews toward
first-time, possibly low-tech-literacy users on varied devices; keyboard
navigation, 44px tap targets, and correctly localized error/help copy all
matter more here than on a typical marketing site.

---

## Redesign Scope (this engagement)

- **In scope:** the citizen-facing site — Home, Apply flow (state → service →
  wizard steps), Track, Dashboard, Documents guide, Login, Help, Contact,
  Privacy/Terms/Refunds.
- **Out of scope for now:** `/admin` and any future `/operator` console
  (tracked separately in `PANEL-PROMPT.md`).
- **Depth:** refinement of the current visual identity (green/Inter/current
  token system), not a rebrand — raise execution quality page by page.
