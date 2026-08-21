---
version: 1.0
name: Saarthi-design-system
description: >
  Institutional-trust B2B design system for Saarthi, an AI compliance and
  business-enablement platform for Indian MSMEs. Adapted from the
  Amplemarket warm-neutral / dark-band reference and the Convix rounded
  full-viewport hero pattern, re-grounded for a dashboard-heavy, data-dense,
  bilingual (Hindi + English) compliance product. Canvas is warm off-white,
  ink is near-black navy, the action layer stays monochrome, and every
  saturated accent (blue, green, amber, red, saffron) is reserved for status
  meaning inside real product chrome — never decoration.
status: Phase 0 deliverable — approved reference for all subsequent phases.
---

# Saarthi — DESIGN.md

> **How to read this document.** This is the single source of truth for how
> every Saarthi surface should look and behave — marketing site, app
> dashboard, WhatsApp-copilot touchpoints, and PDF/export artifacts. Antigravity
> (or any engineer) implementing UI must reference the token names in this
> file (`{colors.*}`, `{typography.*}`, `{spacing.*}`, `{rounded.*}`,
> `{component.*}`) rather than inlining raw values. If a screen needs
> something not defined here, stop and extend this document first — do not
> invent a one-off style.

---

## 0. Design Thesis

Saarthi is not a marketing-flashy consumer app. It is trust infrastructure for
a small business owner who is often non-technical, time-poor, and anxious
about penalties, notices, and paperwork. The UI's job is to make a stressful
domain (compliance, notices, government schemes) feel **calm, legible, and
in-control** — in whichever language the owner is more comfortable reading.

Three inherited ideas from the Amplemarket reference map directly onto this
goal, and are kept:

1. **A colorless action layer.** Primary buttons stay ink/navy, never a loud
   accent — because the loud accents are reserved for *status meaning*
   (overdue, compliant, at-risk), and if buttons also used those colors the
   status signal would be diluted.
2. **Warm off-white canvas, not clinical white.** A pure-white,
   spreadsheet-like interface reads as cold and bureaucratic — the opposite
   of what a stressed MSME owner needs. The warm canvas keeps things human.
3. **Dark bands for "big moment" surfaces.** Where Amplemarket used dark
   product bands to showcase Duo Copilot, Saarthi uses a dark band for the
   **Compliance Health Score reveal**, the **verification/trust moment**, and
   the **marketing hero** — the handful of places the product wants a beat of
   gravity and confidence before returning to the calm working canvas.

Two ideas are deliberately **not** inherited, and the deviation is intentional:

- **Single-weight typography.** Amplemarket uses one weight (400) and lets
  tracking do the hierarchy work. Saarthi is data-dense (currency figures,
  deadlines, tabular scores) and bilingual — Devanagari does not carry
  negative tracking well, and dense data tables need real weight contrast to
  scan quickly. Saarthi uses a normal 400/500/600/700 weight ladder instead.
- **A single accent used sparingly for decoration.** Saarthi's accents
  (green/amber/red/blue) are a **semantic status system**, not a brand-flavor
  choice — see §2.4. This is non-negotiable across every surface.

---

## 1. Product Surfaces This System Covers

| Surface | Description | Governing sections |
|---|---|---|
| **Marketing site** | Public landing page, pricing, about — first-touch, unauthenticated | §6 |
| **App shell** | Authenticated dashboard: sidebar + topbar, used by Owner/Team/CA/Admin roles | §7 |
| **Compliance workspace** | Calendar, tasks, notices, licences | §7, §8 |
| **Marketplace (Supplier / Creator)** | Discovery, RFQ, campaigns | §7, §8 |
| **WhatsApp copilot bubbles** | Rendered previews of outbound WhatsApp messages inside the app | §8.9 |
| **PDF/export artifacts** | Contracts, compliance reports, score certificates | §8.10 |

All surfaces share one token set. There is no separate "marketing design
system" and "app design system" — only a marketing **layout pattern** (§6)
and an app-shell **layout pattern** (§7) built from the same tokens.

---

## 2. Colors

```yaml
colors:
  # Ink & neutrals
  ink: "#12151A"            # primary text, primary CTA background
  ink-pressed: "#1E2228"    # active/pressed state of ink surfaces
  neutral-700: "#4B5563"    # secondary body text
  neutral-500: "#6B7280"    # tertiary text, placeholders, captions
  neutral-300: "#C7C4BC"    # disabled text/icons

  # Canvas & surface
  canvas: "#F7F6F3"         # page floor — warm off-white, every light screen
  surface-white: "#FFFFFF"  # cards, inputs, tables, modals
  surface-soft: "#FBFAF8"   # nested panels, secondary cards on canvas
  surface-faint: "#F1F0EC"  # zebra rows, disabled fields, skeleton base

  # Dark band (big-moment surfaces only)
  surface-dark: "#14181F"   # CHS reveal, verification moment, marketing hero
  surface-dark-raised: "#1D2230"  # cards floating on the dark band
  on-dark: "#FFFFFF"
  on-dark-muted: "#A6ACBB"

  # Hairlines
  hairline: "#E4E2DD"       # 1px borders on light surfaces
  hairline-on-dark: "#2B3040"

  # Brand primary (trust)
  brand-navy: "#123A73"     # links, secondary emphasis, active nav item
  brand-blue: "#2C6FE0"     # interactive/info accent inside product chrome
  brand-blue-deep: "#154FB0"
  brand-blue-light: "#D6E4FA"

  # Status system — semantic, used consistently everywhere (see §2.4)
  status-success: "#1E8A5F"       # compliant / on-time / verified
  status-success-bg: "#E4F4EC"
  status-warning: "#C87F12"       # due soon / action recommended
  status-warning-bg: "#FBF0DC"
  status-danger: "#B3362A"        # overdue / expired / non-compliant
  status-danger-bg: "#F8E5E2"
  status-info: "#2C6FE0"          # informational / regulatory update
  status-info-bg: "#E7EFFC"
  status-neutral: "#6B7280"       # not applicable / no data
  status-neutral-bg: "#F1F0EC"

  # Identity accent (India nod — used sparingly: onboarding, badges, illustration fills only, never status)
  saffron: "#E8871E"

  # Sandbox / demo indicator (mandatory wherever a MockProvider is behind a feature — see §9)
  sandbox: "#8A4FD1"
  sandbox-bg: "#F1E9FB"
```

### 2.1 How canvas vs. dark band is chosen

- **Canvas (`{colors.canvas}`)** is the default for 95% of the product: every
  dashboard, table, form, list, settings page.
- **Dark band (`{colors.surface-dark}`)** is reserved for exactly three
  moments, and must never appear elsewhere:
  1. The marketing hero (§6.2).
  2. The Compliance Health Score full reveal (score detail page hero block,
     §8.4).
  3. The verification-complete moment (business/supplier/creator badge award
     screen, §8.5).

  If a designer or engineer wants a dark band anywhere else, that's a signal
  the moment isn't actually "big enough" to warrant it — use `surface-soft`
  instead.

### 2.2 Ink vs. brand-navy vs. brand-blue

- `ink` is text and the primary-button background everywhere. It is **not**
  a "brand color" — it's near-black.
- `brand-navy` is for links and the active state of navigation items — the
  one place a hint of blue is allowed outside status chrome, because
  navigation needs to visually separate from body ink.
- `brand-blue` lives inside product chrome only (charts, info badges, the
  "regulatory update" status tag) — same rule as Amplemarket's cyan.

### 2.3 Primary CTA stays monochrome

`{component.button-primary}` is always `{colors.ink}` background /
`{colors.on-dark}` text, regardless of what the button does (Save, Get
Started, Pay Now, Submit RFQ). This mirrors the Amplemarket rule exactly:
**the action layer is colorless.** Never use `status-success` or
`brand-blue` as a button fill — those are reserved for meaning, not action.

### 2.4 The status system is load-bearing — treat it as an API, not a palette

Every place in the product that shows compliance state, payment state, order
state, or verification state MUST map to exactly one of these five tokens.
Do not introduce a sixth status color, and do not reuse `status-danger` for
anything that isn't actually urgent — the whole point of the CHS and
dashboard hierarchy (per WORKFLOW.md §1) is that red must always mean
"needs attention now."

| Token | Meaning | Example usage |
|---|---|---|
| `status-success` | Compliant, on-time, verified, paid | Green badge on a completed filing |
| `status-warning` | Due soon, action recommended, pending review | Amber badge on a deadline in 7 days |
| `status-danger` | Overdue, expired, missed, rejected | Red badge on an expired licence |
| `status-info` | Informational, new, unread | Blue dot on a new regulatory update |
| `status-neutral` | Not applicable, draft, no data yet | Gray badge on a not-yet-started task |

---

## 3. Typography

```yaml
typography:
  # Latin-first stack (default / en locale)
  font-stack-en: "'Inter', 'Noto Sans Devanagari', system-ui, sans-serif"
  # Devanagari-first stack (hi locale) — see §3.3
  font-stack-hi: "'Noto Sans Devanagari', 'Inter', system-ui, sans-serif"

  display:
    fontSize: 48px
    fontWeight: 600
    lineHeight-en: 1.1
    lineHeight-hi: 1.35
    letterSpacing: -0.02em
  title-lg:
    fontSize: 32px
    fontWeight: 600
    lineHeight-en: 1.15
    lineHeight-hi: 1.4
    letterSpacing: -0.01em
  title-md:
    fontSize: 24px
    fontWeight: 600
    lineHeight-en: 1.2
    lineHeight-hi: 1.45
  title-sm:
    fontSize: 18px
    fontWeight: 600
    lineHeight-en: 1.25
    lineHeight-hi: 1.5
  body-lg:
    fontSize: 16px
    fontWeight: 400
    lineHeight-en: 1.5
    lineHeight-hi: 1.7
  body:
    fontSize: 14px
    fontWeight: 400
    lineHeight-en: 1.5
    lineHeight-hi: 1.7
  body-sm:
    fontSize: 13px
    fontWeight: 400
    lineHeight-en: 1.45
    lineHeight-hi: 1.65
  caption:
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.01em
  button:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
  data-numeral:
    fontSize: inherit
    fontWeight: 600
    fontFeatureSettings: "'tnum' 1, 'lnum' 1"   # tabular, lining figures — always for ₹ amounts, scores, dates
```

### 3.1 Font choice rationale

- **Inter** (Latin): free, has a genuinely complete weight range, excellent
  at small sizes in dense UI, already familiar from the Convix reference —
  safe institutional choice.
- **Noto Sans Devanagari** (Hindi): the most complete, actively-maintained
  free Devanagari family with weight parity (400/500/600/700) against Inter,
  so the two scripts don't visually clash when they appear side-by-side
  (e.g., a bilingual toggle, or Hindi labels with English proper nouns like
  "GST" or "Udyam" inline).
- Do **not** license or depend on Labil Grotesk or any commercial face — this
  product needs an open, redistributable stack from day one.

### 3.2 Weight carries hierarchy, not just size

Unlike the Amplemarket reference, Saarthi uses a 400/500/600/700 ladder.
Headings and card titles sit at 600; body copy at 400; buttons and captions
at 500–600. This is because dense data screens (a compliance task table, a
score breakdown) need weight contrast to scan in under a second — tracking
alone doesn't do that job for numerals or Devanagari glyphs.

### 3.3 Bilingual typography rules (mandatory)

1. **Line-height must switch with locale.** Devanagari has taller
   ascenders/descenders and matras that sit above/below the baseline; every
   type token above has a `lineHeight-hi` that is meaningfully larger than
   `lineHeight-en`. Never ship a fixed line-height that only accounts for
   Latin.
2. **Never mix scripts inside one weight-critical word.** Proper nouns like
   "GST", "Udyam", "FSSAI", "PAN" stay in Latin characters even inside Hindi
   copy (this matches how these terms are actually used/searched in India) —
   render them in the `font-stack-en` fallback chain even when the
   surrounding sentence is `hi`.
3. **Numerals stay Western Arabic numerals (0–9) in both locales**, set with
   `data-numeral` (tabular figures) — do not switch to Devanagari numerals.
   This is a deliberate product decision: GST numbers, dates, and ₹ amounts
   must be scannable and copy-pasteable identically regardless of language
   toggle.
4. **Truncation width budgets differ by ~15–20%.** Hindi strings typically
   render 10–20% longer than their English equivalent at the same font
   size — badges, nav labels, and button copy must be tested in `hi` and
   given breathing room, not just `en`. Never hardcode a pixel width for a
   text container that holds translated copy; use `min-width` + padding, not
   fixed `width`.
5. **The language toggle is a first-class nav element**, present in both the
   marketing top nav and the app topbar (`{component.language-toggle}`,
   §4.9) — never buried in a settings menu.

---

## 4. Spacing, Radius, Elevation

```yaml
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 28px
  xxl: 40px
  xxxl: 64px

rounded:
  xs: 4px      # tiny inline chips, badge pills
  sm: 6px      # small controls, table row hover
  md: 8px      # inputs, secondary buttons
  lg: 10px     # primary buttons
  xl: 14px     # cards, modals — dominant radius
  xxl: 20px    # marketing hero container, large panels
  pill: 999px  # status badges, language toggle, avatar frames
```

### 4.1 Elevation scale

| Level | Treatment | Use |
|---|---|---|
| Flat | none | Dark bands, table rows, plain text sections |
| Hairline | `0 0 0 1px {colors.hairline} inset` | Default card/input outline — the system's default border |
| Soft raised | `0 1px 2px rgba(18,21,26,.04), 0 4px 10px rgba(18,21,26,.04)` | Cards that need to lift off canvas slightly (dashboard widgets) |
| Floating | `0 20px 48px -8px rgba(18,21,26,.14), 0 6px 16px -4px rgba(18,21,26,.08)` | Modals, the hero dashboard-preview mockup, dropdown menus |
| Dark-band raised | `0 1px 0 rgba(255,255,255,.06) inset` | Cards floating on `surface-dark` — a light inset line, not a shadow (shadows don't read on dark) |

Same philosophy as the reference: soft, low-alpha, multi-layer, no hard
edges, no neumorphism, no glassmorphism.

---

## 5. Core Components

```yaml
components:
  button-primary:
    background: "{colors.ink}"
    text: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "10px 18px"
    pressed: { background: "{colors.ink-pressed}" }
    disabled: { background: "{colors.neutral-300}", text: "{colors.surface-white}" }

  button-secondary:
    background: "{colors.surface-white}"
    text: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "10px 18px"

  button-danger:
    background: "{colors.surface-white}"
    text: "{colors.status-danger}"
    border: "1px solid {colors.status-danger}"
    rounded: "{rounded.lg}"
    note: "Only for destructive confirms (revoke consent, delete document) — never a filled red button, filled red is reserved for status badges."

  status-badge:
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.caption}"
    variants: [success, warning, danger, info, neutral]
    structure: "background = {colors.status-*-bg}, text = {colors.status-*}, optional leading 6px dot"

  card:
    background: "{colors.surface-white}"
    rounded: "{rounded.xl}"
    elevation: "hairline | soft-raised"
    padding: "{spacing.lg}"

  card-dark:
    background: "{colors.surface-dark}"
    text: "{colors.on-dark}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xl}"
    note: "Reserved for the three dark-band moments in §2.1 only."

  input:
    background: "{colors.surface-white}"
    text: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    focus: { border: "1px solid {colors.brand-blue}", shadow: "0 0 0 3px {colors.brand-blue-light}" }
    error: { border: "1px solid {colors.status-danger}" }

  score-gauge:
    note: "See §8.4 for full spec — semicircular arc, 0–900 scale, color bands."

  language-toggle:
    structure: "pill container, two segments EN / हिं, active segment = surface-white on {colors.surface-faint} pill background"
    rounded: "{rounded.pill}"
    typography: "{typography.button}"

  sandbox-tag:
    background: "{colors.sandbox-bg}"
    text: "{colors.sandbox}"
    rounded: "{rounded.xs}"
    typography: "{typography.caption}"
    label: "Sandbox data · not a live government/bank connection"
    note: "Mandatory anywhere a MockProvider (VerificationProvider, PaymentProvider, SocialMediaProvider, etc.) is powering the screen — see §9 and security.md."

  sidebar-nav:
    background: "{colors.surface-soft}"
    text: "{colors.neutral-700}"
    active-item: { text: "{colors.brand-navy}", background: "{colors.brand-blue-light}", rounded: "{rounded.md}" }

  app-topbar:
    background: "{colors.surface-white}"
    border-bottom: "1px solid {colors.hairline}"
    contains: [business-switcher, search, notifications-bell, language-toggle, avatar-menu]

  whatsapp-preview-bubble:
    background: "#E9FBE7"
    text: "{colors.ink}"
    rounded: "{rounded.xl}"
    note: "Used only to preview outbound WhatsApp copy inside the app — never a real WhatsApp chrome clone/trademark reproduction, keep it abstracted (rounded bubble + timestamp only, no WhatsApp logo)."
```

---

## 6. Marketing Site Layout

The public marketing site borrows the **rounded full-viewport hero pattern**
from the Convix reference, retextured into Saarthi's palette and toned down
(no autoplay background video by default — see §6.4 for why).

### 6.1 Page frame

- Outer wrapper: `min-h-screen w-full bg-{colors.canvas} p-3 sm:p-4`
- Hero container: `relative w-full h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-{colors.surface-dark} rounded-[{rounded.xxl}]`
- The hero sits on the **dark band** (one of the three sanctioned dark-band
  moments) — this is the first-impression "big moment," matching Amplemarket's
  showcase logic and the Convix rounded-hero structure at once.

### 6.2 Floating navbar (from Convix pattern, retextured)

- Wrapper: `flex justify-center pt-4 sm:pt-6 px-3 sm:px-4`, positioned over
  the dark hero.
- Pill: `bg-surface-white rounded-full shadow-sm border border-hairline
  pl-2 pr-2 py-2 w-full max-w-[760px]`
- Left: Saarthi wordmark + mark (simple geometric compass/route motif —
  "साथी/companion" concept — not a flower, keep it distinct from any
  reference asset).
- Center (desktop, `hidden md:flex`): Home · Compliance · Marketplace ·
  Pricing.
- Right cluster: `{component.language-toggle}` (EN / हिं), then
  `{component.button-primary}` "Get early access" / "जल्दी एक्सेस पाएं".
- Mobile: hamburger (`md:hidden`) opens a dropdown panel matching the
  Convix pattern exactly (`absolute top-full left-2 right-2 mt-2 bg-white
  rounded-2xl shadow-lg border p-3 z-20`).

### 6.3 Hero content

- `flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 text-center`, all text
  `{colors.on-dark}`.
- Badge: `inline-flex items-center gap-2 bg-surface-dark-raised rounded-full
  px-4 py-1.5`, small `status-success` dot + "AI-powered compliance for
  Indian MSMEs" / "भारतीय MSME के लिए AI अनुपालन सहायक".
- Headline: `{typography.display}` scaled with `clamp(32px, 6vw, 56px)`,
  bilingual two-line pattern, e.g. **EN:** "Compliance, handled." /
  **HI:** "अनुपालन, अब आसान।" — copy must be written natively per locale,
  never machine-translated word-for-word (see WORKFLOW.md i18n content rule).
- Subtitle: `{typography.body-lg}`, `{colors.on-dark-muted}`.
- CTA: `{component.button-primary}` — but on the dark band the primary
  button *inverts* to `{colors.on-dark}` background / `{colors.ink}` text,
  since ink-on-dark is illegible. This is the one documented exception to
  "always ink background" — the token still means "the primary action," the
  fill just flips for contrast.

### 6.4 Why no autoplay hero video by default

The Convix spec uses a looping muted background video. Saarthi may adopt
this **only for campaign-specific landing pages** (e.g., a hackathon demo
page) — the default marketing hero uses a static, calm illustration or the
dashboard-preview mockup itself as the visual anchor instead of video,
because autoplay motion behind text reduces legibility for users who may be
reading in a second language, and increases mobile data cost for
budget-conscious MSME owners on shared connections. If a future campaign
page does use video, it must follow the exact technical spec from the
Convix reference (`autoPlay loop muted playsInline`, poster fallback,
`bg-white/10` overlay) unchanged.

### 6.5 Dashboard-preview band (below hero, still inside the rounded dark container)

Three cards, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`, on a
`{colors.surface-dark-raised}` tray — directly analogous to the Convix
three-card dashboard preview, but domain-correct:

1. **Compliance Health Score card** — mini `{component.score-gauge}` at
   e.g. 742/900, `status-success` colored, caption "12 on-time filings in a
   row" / "लगातार 12 समय पर फाइलिंग".
2. **Upcoming Deadline card** — a task row with `status-warning` badge,
   "GST Return · due in 4 days" / "GST रिटर्न · 4 दिनों में देय".
3. **Notice / Regulatory Update card** — `status-info` badge, "New labour
   law update relevant to your business" / "श्रम कानून में नया अपडेट,
   आपके व्यवसाय पर लागू".

This directly foreshadows the real dashboard hierarchy from §8.1/WORKFLOW.md
— the marketing site is not decorative, it's a truthful preview.

---

## 7. App Shell Layout (authenticated product)

- **Left sidebar** (`{component.sidebar-nav}`, fixed, collapsible on
  tablet/mobile to a drawer): Dashboard · Compliance Calendar · Notices ·
  Schemes · Payments · Supplier Marketplace · Creator Marketplace · Score ·
  Team · Settings. Admin/CA roles see a scoped subset per rbac.md.
- **Topbar** (`{component.app-topbar}`): business switcher (for users who
  are members of multiple businesses), global search, notification bell,
  `{component.language-toggle}`, avatar menu.
- **Main canvas**: `bg-{colors.canvas}`, content max-width container,
  `{spacing.xl}` outer padding.
- **Right-rail (contextual, optional)**: used on the Compliance workspace
  and Notice detail views for the AI explanation / RAG citation panel —
  never on list/table-heavy screens, to avoid crowding data.

Grid, spacing, and card rules follow §2–§5 exactly — the app shell
introduces no new tokens, only a layout pattern.

---

## 8. Domain-Specific Patterns

### 8.1 Dashboard information hierarchy

Per the product's UX priority (PRD.md §7 / master spec §18), the dashboard
renders top-to-bottom in this fixed order — never reorder for visual
variety:

1. Urgent compliance items (`status-danger` items first)
2. Upcoming deadlines (`status-warning`)
3. Regulatory changes affecting this business (`status-info`)
4. Business verification status
5. Compliance Health Score summary (links to full §8.4 view)
6. Recommended government schemes
7. Outstanding payments/refunds
8. Marketplace activity

### 8.2 Status badges everywhere

Any list row representing a compliance task, licence, order, campaign, or
payment must carry exactly one `{component.status-badge}` using the §2.4
mapping. Never encode status via color alone without the badge text/label —
color is a reinforcement, not the sole channel (accessibility).

### 8.3 Empty / loading / error states

- **Empty:** an icon (line-style, `neutral-500`), one sentence in
  `{typography.body}`, and — where actionable — a `button-secondary` (e.g.,
  "Add your first licence" / "अपना पहला लाइसेंस जोड़ें").
- **Loading:** skeleton blocks using `{colors.surface-faint}`, matching the
  exact shape of the content that will load — never a generic spinner for
  list/table content (spinners are acceptable only for button in-progress
  states and full-page transitions).
- **Error:** inline, `status-danger` text + icon, plain-language message
  (never a raw error code or stack trace — see security.md for the API
  error contract), with a retry action where applicable.

### 8.4 Compliance Health Score (CHS) — score-gauge component

The CHS is the product's signature visual and gets the dark-band treatment
on its own detail page (§2.1, moment #2).

- **Scale:** 0–900 (matches the credit-score mental model MSME owners and
  lenders already have).
- **Shape:** semicircular arc, viewBox `0 0 200 120`, same tick-mark
  construction pattern as the Convix `Gauge` component (40 ticks across a
  180° arc, `strokeLinecap="round"`) — but re-banded by status color instead
  of a single accent:
  - 0–549: `{colors.status-danger}`
  - 550–699: `{colors.status-warning}`
  - 700–900: `{colors.status-success}`
  - Inactive ticks: `{colors.hairline-on-dark}` on the dark-band version,
    `{colors.neutral-300}` on the compact/light version used in dashboard
    widgets and the marketing preview.
- **Center label:** the numeral in `{typography.data-numeral}` at large
  size, "/ 900" suffix in `{colors.on-dark-muted}` at `body-sm`.
- **Explanation list beneath:** every score contribution rendered as a signed
  row (`+45` in `status-success`, `-18` in `status-danger`) with a one-line
  plain-language reason — this is a hard product requirement (PRD.md,
  "score must be explainable") and therefore a hard design requirement: the
  gauge is never shown without its explanation list within one scroll.
- **History:** a simple sparkline/small multiple beneath the explanation
  list, `brand-blue` line on `surface-dark-raised`.

### 8.5 Verification badge

A small pill (`{rounded.pill}`, `status-success-bg`/`status-success`) with a
checkmark glyph, label "Verified" / "सत्यापित". Appears next to business
names, supplier cards, and creator profiles once `business_verifications`
(database.md) is in a verified state. The **verification-complete** screen
itself (first time a business gets verified) uses the dark band as a
one-time celebratory-but-restrained moment — no confetti/animation, a still
composition with the badge, business name, and a "What this unlocks" list.

### 8.6 Marketplace cards (Supplier & Creator)

Shared card pattern (`{component.card}`) across both marketplaces for
consistency:
- Top: avatar/logo, name, `{component.status-badge}` verification state.
- Middle: 2–3 key stat chips (category, state/location for suppliers;
  follower/engagement band for creators) — chips use `status-neutral`
  styling, not the compliance status colors, to avoid implying a
  compliance meaning where there isn't one.
- Bottom: primary action (`button-secondary` — "Request Quote" /
  "View Profile"), never `button-primary` on a list card (primary is
  reserved for the one main action per screen, e.g., inside the RFQ form
  itself).

### 8.7 Notice OCR / explanation view

Two-column on desktop (single column, stacked, on mobile): left = the
original uploaded document (image/PDF preview, `surface-white` card,
hairline border); right = extracted structured fields + the AI explanation
in plain language, each explanatory paragraph tagged with a small
`status-info` "Source" citation chip that expands to show the regulatory
document it was grounded in (never render an explanation without at least
one source chip — matches ai-rag.md's no-uncited-legal-claims rule).

### 8.8 Compliance calendar

Month/list toggle. Each day cell with an item shows a colored dot using the
§2.4 status tokens (max 3 dots + "+N more"). List view is the default on
mobile (calendars compress poorly to narrow widths and Devanagari day/month
names run long — see §3.3 rule 4).

### 8.9 WhatsApp copilot preview

Rendered strictly as `{component.whatsapp-preview-bubble}` inside Saarthi's
own chrome — never a pixel-accurate WhatsApp UI clone (trademark/brand
safety). Used on the Notices and Reminders screens to preview exactly what
message will be/was sent.

### 8.10 PDF/export artifacts (contracts, score certificates, compliance reports)

Exports use `{colors.ink}` on `{colors.surface-white}` only (no dark band, no
status colors except small badges) — printed/exported documents must remain
legible in black-and-white printing, which is still common for MSME back
offices.

---

## 9. Sandbox / Demo State Visual Language

Per the master spec's anti-hallucination and mocking policy: **any screen
whose data is currently served by a `Mock*Provider`** (verification,
payments, social metrics, government data — see security.md/ai-rag.md) MUST
show `{component.sandbox-tag}` adjacent to the relevant data, plus a
one-line tooltip: "Sandbox data · not a live government/bank connection" /
"सैंडबॉक्स डेटा · यह लाइव सरकारी/बैंक कनेक्शन नहीं है". This is a design
requirement, not just an engineering one — a judge, pilot user, or real
MSME owner must never be able to mistake mocked verification for a real
DigiLocker/bank/social-platform connection.

---

## 10. Do's and Don'ts

### Do
- Keep the primary action monochrome ink everywhere except the dark-band
  hero exception in §6.3.
- Reserve `status-*` colors strictly for compliance/payment/verification
  meaning — never as generic brand decoration.
- Use the dark band only for the three sanctioned moments (§2.1).
- Increase line-height for Hindi copy per §3.3 — test every text container
  in both locales before shipping.
- Show the CHS explanation list in the same view as the gauge, always.
- Tag every mock-backed screen with `{component.sandbox-tag}`.

### Don't
- Don't invent a sixth status color or reuse red for non-urgent items.
- Don't put a filled destructive-red button anywhere — use
  `{component.button-danger}`'s outline style instead.
- Don't hardcode fixed pixel widths on any container holding translated
  copy.
- Don't render a WhatsApp-look-alike full chat UI — abstracted bubble only.
- Don't add motion/animation to the CHS reveal or verification moment.
- Don't ship a compliance explanation, score contribution, or notice
  summary without a visible source/citation.

---

## 11. Responsive Behavior

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 768px | Sidebar becomes a bottom-sheet/drawer; marketing nav collapses to hamburger; calendar defaults to list view; dashboard cards stack 1-up |
| Tablet | 768–1024px | Sidebar collapses to icon-rail with flyout labels; dashboard cards 2-up |
| Desktop | 1024–1440px | Full sidebar + topbar; dashboard cards up to 3-up; two-column notice view |
| Wide | > 1440px | Same as desktop, content max-width caps at ~1280px with extra canvas breathing room either side |

Touch targets: minimum 44px height for all interactive elements regardless
of visual padding, per accessibility baseline (security.md/testing.md cover
functional a11y checks; this file governs the visual sizing that satisfies
them).

---

## 12. Iteration Guide (for anyone extending this system)

1. Extend one component at a time; add it to §5 with the same
   `{component.*}` key style before using it anywhere.
2. Never inline a raw hex/px value in implementation — always reference a
   token from §2–§4.
3. If a new status meaning is needed, it must fit one of the five §2.4
   tokens — do not add a sixth.
4. Every new screen gets checked against §3.3 (bilingual) and §9 (sandbox
   tagging) before it's considered done.
5. When in doubt about a surface's background, choose `{colors.canvas}`
   over `{colors.surface-white}` — white is for cards/inputs, not page
   floors.

## 13. Known Gaps (to close during Phase 1 / Phase 3 UI work)

- Exact Devanagari-safe icon set for compliance-domain glyphs (licence,
  notice, escrow, RFQ) is not yet chosen — default to `lucide-react`
  (already used in the Convix reference) with text labels always paired,
  never icon-only navigation.
- Illustration style for empty states / onboarding is undefined — should be
  simple line-art, ink-on-canvas, no stock photography of people (avoids
  representational bias and keeps the institutional tone).
- Dark-mode is out of scope for the hackathon build; token names are
  structured (`ink`/`on-dark` pairing) to make a future dark theme
  additive rather than a rewrite.
- Saarthi wordmark/logo mark itself is not finalized — placeholder
  geometric mark only, per §6.2.
