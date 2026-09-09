---
name: Driving License Form
description: Guided, transparent driving-licence application assistance for Gujarat, Rajasthan, and Uttar Pradesh
colors:
  primary: "#159447"
  primary-rgb: "21, 148, 71"
  primary-dark: "#0d7a38"
  primary-darker: "#0a6330"
  primary-light: "#eaf6ee"
  primary-lighter: "#d4eede"
  primary-50: "#f0faf4"
  ink: "#18232d"
  ink-body: "#2d3748"
  ink-secondary: "#5b6470"
  ink-muted: "#8896a6"
  ink-faint: "#a0aec0"
  paper: "#f7faf8"
  paper-alt: "#f0f4f1"
  white: "#ffffff"
  border: "#e2e8f0"
  border-light: "#edf2f7"
  success: "#159447"
  success-light: "#eaf6ee"
  warning: "#e6a817"
  warning-light: "#fef9e7"
  error: "#e53e3e"
  error-light: "#fed7d7"
  info: "#3182ce"
  info-light: "#ebf8ff"
typography:
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Gujarati', 'Shruti', 'Gujarati Sangam MN', 'Noto Sans Devanagari', 'Mangal', 'Devanagari Sangam MN', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  display:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "clamp(2.25rem, 1.35rem + 4.2vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  label:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-primary-active:
    backgroundColor: "{colors.primary-darker}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Driving License Form

## Overview

**Creative North Star: "The Trusted Counter"**

The system reads like the calm, competent window at a well-run government
office — official-adjacent confidence without cold bureaucracy. A citizen
arrives unsure of a confusing process; the interface's job is to feel like a
person behind glass who knows exactly what to do next, hands over one thing
at a time, and never hides a fee or a form field. The palette carries this
directly: an official, saffron-adjacent-but-cooler green paired with a warm,
paper-toned off-white — trustworthy rather than clinical, civic rather than
corporate.

Density stays moderate: generous section padding (`--space-16`/`--space-24`)
on marketing-mode surfaces, tighter form rhythm (`--space-5` between fields)
where the citizen is doing task work. Every interactive surface has a small,
tactile lift — a card or button visibly responds to touch, the way a good
physical counter clerk visibly acknowledges you.

**Key Characteristics:**
- Official-but-warm green + paper-white, never stark white or corporate blue
- Cards and buttons lift on hover/press — tactile, responsive, alive
- Generous whitespace in Persuade sections, tighter rhythm in Operate/form sections
- Rounded-but-restrained geometry (6–20px), never sharp, never pill-everything
- Devanagari/Gujarati-aware type rhythm (looser line-height, more vertical breathing room on non-Latin scripts)

## Colors

An official green anchors the system; a warm off-white paper tone stands in
for pure white almost everywhere; state colors (success/warning/error/info)
stay desaturated enough to read as institutional rather than alarming.

### Primary
- **Counter Green** (`#159447`): the brand color and every primary action —
  primary buttons, active nav states,  links, focus rings, the accent dot before section eyebrows. Also exported as
  RGB (`21, 148, 71`) for wash and shadow compositing. Used with restraint outside of CTAs and status;
  it marks "this is the way forward."
- **Counter Green — Pressed** (`#0d7a38` / `#0a6330`): hover and active states
  for anything using Counter Green as a fill.
- **Counter Green — Wash** (`#eaf6ee` / `#d4eede` / `#f0faf4`): tinted
  backgrounds for success states, selected cards, and the trust strip — never
  used as a large solid field, always a quiet backdrop.

### Neutral
- **Ink** (`#18232d`): headings and highest-emphasis text.
- **Body Ink** (`#2d3748`): running body copy.
- **Secondary Ink** (`#5b6470`): supporting copy, captions, metadata.
- **Muted Ink** (`#8896a6`): placeholders, disabled text, least-emphasis labels.
- **Paper** (`#f7faf8`): the page background — warm, not stark white.
- **Paper Alt** (`#f0f4f1`): secondary surface tint (alt sections, hover backgrounds).
- **White** (`#ffffff`): card and input surfaces sit on true white, distinct from the paper ground behind them.
- **Border / Border Light** (`#e2e8f0` / `#edf2f7`): dividers and input strokes; light variant for the quietest separators.

### State colors
- **Success** reuses Counter Green — completion and "verified" states are
  literally the brand color, reinforcing that finishing the process is the
  point.
- **Warning** (`#e6a817` on `#fef9e7`): used deliberately for the disclaimer
  bar and correction-needed states — never softened or hidden.
- **Error** (`#e53e3e` on `#fed7d7`): validation and failure states.
- **Info** (`#3182ce` on `#ebf8ff`): neutral informational callouts, used sparingly to avoid competing with green as "the important color."

### Named Rules
**The Trust-Never-Recolors Rule.** The disclaimer bar and its warning color
are never restyled toward brand green or hidden behind a lower-contrast
treatment — the "not a government portal" notice must always read as a
warning, not a footnote.

## Typography

**Body & Display Font:** Inter, falling back through system UI fonts to
Devanagari/Gujarati-capable faces (`Noto Sans Gujarati`, `Noto Sans
Devanagari`, `Mangal`, `Shruti`) so Hindi and Gujarati never fall back to a
mismatched serif or a missing-glyph box.

**Reference Font:** the platform monospace stack (`--font-family-mono`),
used *only* for codes a person reads aloud, copies, or transcribes —
application numbers and payment references. Fixed advance width and
unambiguous digit shapes are the reason; monospace as a "technical" costume
anywhere else is a defect.

**Character:** A plain, high-legibility grotesque doing civic-service work —
no display personality, no decorative pairing. Trust here comes from clarity,
not typographic flourish.

### Hierarchy

- **Display** (800, `clamp(2.25rem, 1.35rem + 4.2vw, 4rem)`, 1.12 line-height, -0.03em): hero headlines only, one per page. Fluid rather than stepped at breakpoints so a longer Hindi or Gujarati headline scales down instead of wrapping to an extra line.
- **Headline** (700, 1.875rem→2.25rem at ≥768px, 1.3 line-height): section titles, page H1s on marketing surfaces.
- **Title** (600, 1.125rem, 1.3 line-height): card titles, step titles, sub-section headings.
- **Body** (400, 1rem, 1.6 line-height): running copy; Hindi/Gujarati use 1.65 line-height instead.
- **Label** (500, 0.875rem, 1.5 line-height): form labels, nav items, buttons.
- **Micro** (0.75rem): captions, badges, helper/error text under fields.

### Named Rules
**The Script-Height Rule.** Devanagari and Gujarati headings get looser
line-height (1.45 vs 1.3) and small top/bottom padding to prevent matra and
conjunct clipping — a heading that fits Latin text at `line-height: 1.3` is
not automatically correct once translated.

## Layout

A centered container capping at `1200px`, with responsive side padding
(`--space-4` mobile → `--space-6` at 768px → `--space-8` at 1024px). Marketing
sections (`.section`) use generous vertical rhythm (`--space-16` / `--space-24`
between major blocks); form/task surfaces run tighter (`--space-5` between
fields, `--space-6`–`--space-8` card padding). Grids collapse to a single
column below 640px and step up to 2/3/4 columns at 640/768/1024px
breakpoints — never a fixed pixel grid that breaks mid-width.

## Elevation & Depth

Hybrid: mostly flat, with a small, consistent shadow-and-lift vocabulary that
activates on interaction rather than sitting on every surface at rest. This
was a deliberate choice to keep the tactile, responsive feel of a real
counter interaction rather than flattening into a purely administrative,
inert document.

### Shadow Vocabulary
- **Ambient card** (`box-shadow: 0 2px 12px rgba(0,0,0,0.06)`): resting state for cards and panels.
- **Card hover** (`box-shadow: 0 8px 25px rgba(0,0,0,0.1)`, `translateY(-2px)`): interactive cards lift on hover — the system's signature tactile response.
- **Button primary** (`box-shadow: 0 4px 14px rgba(21,148,71,0.25)`, deepening to `0 6px 20px rgba(21,148,71,0.35)` on hover): primary CTAs carry a tinted, brand-colored shadow rather than a neutral one.
- **Elevated/xl** (`--shadow-lg` / `--shadow-xl`): reserved for modals, dropdowns, and the skip-to-content link — true overlay content only.

### Named Rules
**The Press-Response Rule.** Every clickable card or button visibly responds
on press (`translateY(1px)` and a deeper shadow) as well as on hover — touch
users on the dominant mobile audience get the same tactile confirmation as
mouse users.

## Shapes

Rounded-but-restrained: `6px` for the smallest controls, `8px` as the default
(buttons, inputs, badges-as-rectangles), up to `12–20px` for cards and larger
containers, and full pill radius reserved for badges, toggle tracks, and the
disclaimer/skip-link corner treatments. Never sharp right angles on
interactive elements, never a fully pill-shaped button or card.

## Components

### Buttons
- **Shape:** `8px` radius by default, `12px` on large (`.btn-lg`) buttons.
- **Primary:** Counter Green fill, white text, brand-tinted shadow; darkens one step on hover, two on active/press, with a `1px` lift/press translate.
- **Secondary:** white fill, green text, `1.5px` green border; fills with the green wash tint on hover.
- **Outline / Ghost:** transparent, neutral text/border; used for tertiary actions that must not compete with the primary green CTA.
- **Minimum touch target:** `44px` height on mobile viewports — non-negotiable given the audience.

### Cards
- **Corner style:** `12px` radius (`--radius-lg`).
- **Background:** true white on the paper-toned page background — the white/paper contrast is what separates "content" from "page."
- **Shadow strategy:** ambient card shadow at rest, hover shadow + 2px lift when interactive (`.card-interactive`).
- **Border:** `1px` light border in addition to shadow — belt-and-suspenders definition so cards read clearly even where shadow contrast is weak (bright ambient light, print, low-end displays).

### Inputs / Fields
- **Style:** `1.5px` neutral border, `8px` radius, white background, full width by default.
- **Focus:** border shifts to Counter Green plus a soft `3px` green glow (`box-shadow: 0 0 0 3px rgba(21,148,71,0.1)`) — never an outline-only focus state on form fields.
- **Error:** border and focus-glow shift to the error red; error text sits directly under the field with an icon.
- **Mobile:** `16px` font-size and `44px` min-height to prevent iOS auto-zoom and guarantee tap target size.

### Badges
- **Style:** full-pill radius, tinted background + matching text color (success/warning/error/info/neutral), never a solid saturated fill — status is legible without shouting.

### Navigation
- Header is fixed-height (`68px`), green accent on active/hover link state, mobile collapses to a drawer. (Full nav treatment lives with the Header component itself; this system record does not duplicate route-specific behavior.)

### Browser surfaces

The parts the page does not draw still carry the system. Text selection uses the
green wash with the darkest green as its foreground (`--color-primary-lighter` /
`--color-primary-darker`); the text caret in every input is Counter Green; the
scrollbar thumb uses the border neutral; numerals in any tabular or step context
use `font-variant-numeric: tabular-nums`. Shipping browser defaults here is the
cheapest tell that a page was assembled rather than built.

### Icons

One drawn system, never emoji: 24×24 viewBox, 1.75 stroke, round caps and joins,
`currentColor`, decorative by default (`aria-hidden`) with the adjacent text
carrying the meaning. Defined in `src/components/icons/Icons.js`. An emoji
standing in for an icon is a defect, not a shortcut — it breaks stroke
consistency, ignores `currentColor`, and renders differently on every platform.

### Disclaimer Bar (signature component)
A full-width warning-toned strip (`#fef9e7` background, `#92610e` text) sitting
above the header on every page, stating plainly that this is not an official
government portal. This is the system's one component that must never be
themed toward the brand green or visually minimized — see the Trust-Never-
Recolors rule above.

## Do's and Don'ts

### Do:
- **Do** use Counter Green for exactly one primary action per view — the "way forward" reads clearly because the color is rare.
- **Do** give every interactive card and button a hover lift and a press response (translateY + shadow shift), on both mouse and touch.
- **Do** widen line-height and add vertical padding on headings when rendering Hindi or Gujarati.
- **Do** keep the disclaimer bar and fee-transparency language in warning/neutral tones, never recolored into the brand palette.
- **Do** use the paper (`#f7faf8`)/white (`#ffffff`) contrast to separate content surfaces from the page, rather than introducing a second neutral gray.

### Don't:
- **Don't** introduce a second accent color competing with Counter Green for primary-action attention.
- **Don't** flatten cards and buttons to a shadowless, borderless style — the tactile lift is a deliberate, confirmed system trait, not an oversight to "clean up."
- **Don't** let a translated string change a component's box model — headings and buttons must absorb longer Hindi/Gujarati strings without breaking their grid.
- **Don't** use pill radius on primary buttons or content cards — pill shape is reserved for badges, toggles, and a few signature chrome elements.
