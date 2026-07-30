# Handoff: Hinterhof Coffee — Homepage (V2)

## Overview
Single-page marketing site for a fictional Kreuzberg specialty coffee roastery + bar ("Hinterhof",
German for *back courtyard*). One scrolling page, five blocks: hero, shelf (bags for sale),
bar menu, story, visit. Prices are shown but there is **no cart and no checkout** — deliberate:
the shelf and the bar are a menu, selling happens over the counter.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes of the intended
look and behaviour, not production code to copy. The task is to **recreate these designs in the
target codebase's environment** (React/Next, Vue, Astro, whatever exists) using its established
patterns, component library and build pipeline. If no environment exists yet, pick the framework
that suits a mostly-static marketing site (Astro or Next static export are both good fits) and
implement there.

Two implementation notes carried over from the prototype:
- The prototype is written with **inline styles only** (a constraint of the authoring environment).
  In a real codebase, move these to the project's styling layer (CSS modules / Tailwind /
  styled-components). The token list below is what to encode.
- Animation is driven by **GSAP + ScrollTrigger + Lenis** loaded from CDN. Keep, swap for the
  project's animation stack, or drop — all of it is progressive enhancement, the page is complete
  and readable without JS.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, copy and interaction behaviour.
Recreate closely. Illustrations are inline SVG line drawings with a `feTurbulence` +
`feDisplacementMap` "rough pencil" filter — copy the SVG source verbatim from the HTML.

## Design Tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| Blue (ink) | `#2450be` | Primary ink, buttons, rules, dark section background |
| Blue deep | `#16337c` | Button hover, image underlay |
| Periwinkle (page) | `#c5d9f5` | Page background; text colour on blue sections |
| Ice (alt section) | `#eaf1fc` | Alternate section background (shelf, visit) |

Only three surfaces exist: periwinkle (hero, story), ice (shelf, visit), blue (bar, footer,
marquee). No gradients. `::selection` is inverted blue-on-periwinkle.

### Typography
- **Display**: `Bagel Fat One` (Google), weight 400 only, always `text-transform: lowercase`,
  `line-height: .86–.9`, `letter-spacing: -0.01em`. Used for the wordmark, all h1/h2/h3, prices,
  and the big stat numbers.
- **Text**: `Familjen Grotesk` (Google), 400–700.
- **Eyebrow / label style** (used everywhere, ~40 instances): `font-size: 11px; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase`. Encode this as one utility/class.
- Body copy: 15–16px, `line-height: 1.4–1.5`. Lead paragraphs: `clamp(1.5rem, 2.4vw, 2.25rem)`,
  weight 500, `text-wrap: pretty`.
- Heading scale: h1 `clamp(3.5rem, 11vw, 9rem)`; section h2 `clamp(2.5rem, 5vw, 4.25rem)`
  (shelf/bar h2 `clamp(2.75rem, 6.5vw, 5.5rem)`); bar drink names `clamp(1.75rem, 3.2vw, 3.25rem)`;
  bag names `clamp(1.25rem, 2.1vw, 1.875rem)` (lead bag `clamp(2rem, 3vw, 2.75rem)`).

### Spacing & shape
- Page gutter: `clamp(18px, 4vw, 44px)`. Content max-width: `1440px`, centred.
- Section vertical padding: `clamp(64px, 8vw, 104px)`.
- Rules: `2px` hairlines between list rows; `6px` rule opening each section; `8px` rule closing
  the shelf image row. Always solid, current ink colour.
- Radii: `999px` pills (buttons, product circles); shelf product images are perfect circles
  (`aspect-ratio: 1`); story image `1rem 18rem 1rem 18rem`; visit image `14rem 14rem 1rem 1rem`.
  No box-shadows anywhere except the sticky header's `0 2px 0 0 currentColor` hairline on scroll.
- Grid gaps: `40px 56px` (section two-columns), `28px 36px` (shelf four-columns).

### Image treatment (important, and easy to get wrong)
Every photo is duotoned into the palette with blend modes, no filters baked into the asset:

```
wrapper: position:relative; background:#16337c; isolation:isolate; overflow:hidden
wrapper::after: inset:0; background:#c5d9f5; mix-blend-mode:multiply
img: object-fit:cover; filter:grayscale(1) contrast(1.15) brightness(1.02); mix-blend-mode:screen
```

Shelf images also scale to `1.04` on hover, `.7s cubic-bezier(.22,1,.36,1)`.

## Screens / Views

Single page, id-anchored sections: `#top`, `#coffee`, `#bar`, `#story`, `#visit`.

### Header (sticky)
Full-width, `position: sticky; top: 0; z-index: 49`, periwinkle background. Left: arch logomark
(26px, rough-filtered SVG) + "hinterhof" wordmark 22px display. Right: nav labels
COFFEE / BAR / STORY / VISIT (label style, 2px transparent bottom border that turns blue on hover)
and a **Reserve** pill (`tel:+493061204488`, 2px blue border, radius 999px, inverts to blue
background + periwinkle text on hover). Flex, `flex-wrap: wrap`, `gap: 14px 40px`.
On `scrollY > 24` the header gains a `0 2px 0 0 currentColor` shadow.

### 1. Hero (`#top`)
Two columns, `minmax(0,7fr) minmax(0,5fr)`, `align-items: center`.
Left: eyebrow "Specialty coffee · Kreuzberg, Berlin · Est. 2016"; h1 "hinterhof";
lead paragraph (34ch max) "Second courtyard, third door. A roastery and coffee bar two yards back
from Oranienstraße."; two CTAs — filled pill "See the coffee →" (`#2450be` bg, hover `#16337c`)
and outlined pill "Find the door"; then a 3-up stat row above a 2px rule, cells split by 2px
vertical rules: **10** days resting · **07** origins on rotation · **38** steps, bean to bar
(numbers 44px display, counting up on scroll).
Right: the pour-over illustration (kettle → cone → mug, ~380×470 viewBox) with a rotating
circular-text badge ("ROASTED IN THE COURTYARD · SINCE 2016 ·", 118px, 26s linear spin) pinned
top-right. The illustration parallaxes `yPercent: -14` through the viewport.
An optional prop (`masthead`) swaps in a full-bleed SVG wordmark stretched to the container width.

### 2. Marquee band
Blue full-bleed strip, 12px vertical padding, label-style text scrolling right-to-left,
34s linear infinite, duplicated track for a seamless loop. Six origins, each with lot + process:
Ethiopia · Yirgacheffe — Chelbesa, washed / Brazil · Cerrado — Fazenda Rainha, natural /
Colombia · Huila — La Esperanza, washed / Sumatra · Aceh Gayo — Ketiara co-op, wet-hulled /
Kenya · Nyeri — Gatomboya AA, washed / Guatemala · Huehuetenango — La Maravilla, honey.
Separated by 6px round dots. Scroll velocity speeds the marquee up (duration `34 / (1..3.2)`,
eased toward the target each frame).

### 3. The shelf (`#coffee`) — ice background
Header row: two columns `minmax(0,1fr) minmax(0,34ch)`, `align-items: end`, above a 6px rule —
left "01 / The shelf" + h2 "four bags, no filler", right the blurb about fortnightly lots.
Then a 4-column grid `1.4fr 1fr 1fr 1fr`: first a row of circular product images (the lead bag's
circle is larger by virtue of the wider column), each with an optional corner label
(HOUSE / NEW / — / LAST), closed by an 8px rule; then a matching 4-column row of details.
Each detail cell: name (display), weight + price-per-kilo eyebrow, price (26px display),
description, then a bottom-aligned block with a 2px top rule containing the tasting notes and a
5-segment roast meter (filled = solid blue, empty = 2px outline; the row wraps under the label on
narrow columns, meter `flex: 1 1 90px; max-width: 112px`).

| Bag | Origin | Weight | Price | Roast (of 5) | Notes |
|---|---|---|---|---|---|
| Görli | Brazil × Ethiopia | 250 g · €56/kg | €14 | 3 | Cocoa nib · Red plum · Brown sugar |
| Kanal | Ethiopia, Yirgacheffe | 250 g · €68/kg | €17 | 1 | Bergamot · White peach · Jasmine |
| Nachtschicht | Sumatra, Aceh Gayo | 250 g · €60/kg | €15 | 5 | Dark chocolate · Cedar · Treacle |
| Kalt 18 | Blend, rotating | 500 ml · €12/l | €6 | 3 | Hazelnut · Cane sugar · Fig |

Closing note above a 2px rule: sold over the counter, or at the roastery window Thursdays from
16:00; cash and card; no bag over three weeks past its roast date.
A roast-meter visibility flag exists as a prop (`roastScale`).

### 4. Wordmark scroll band
Ice background, "hinterhof · hinterhof · hinterhof" at `clamp(3.5rem, 13vw, 11rem)`, `nowrap`,
translated `xPercent: -18 → 8` as the band crosses the viewport (scrub `.5`).

### 5. On the bar (`#bar`) — blue background, periwinkle text
Header row as in the shelf but with a periwinkle 6px rule: "02 / On the bar", h2 "nine ways in",
blurb ("No sizes, no secret menu…").
Body: two columns `minmax(0,1.75fr) minmax(0,1fr)`, `align-items: start`.
Left = the menu as a `<dl>`; each row is a 2-column grid `minmax(0,1fr) auto`, 22px vertical
padding, 2px top rule (last row also bottom rule): drink name (display, wraps only at spaces),
right-aligned price `clamp(1.5rem, 2.6vw, 2.25rem)`, a label-style meta row (German nickname +
timing, or "Unser eigenes" for the house drinks), and a full-width 15px description.

| Drink | Price | Meta |
|---|---|---|
| Espresso | €2,80 | Der Doppelte · 28 sec |
| Cortado | €3,20 | Der Kurze · 120 ml |
| Flat White | €4,00 | Der Weiße · 180 ml |
| Batch Brew | €3,00 | Der Kannenkaffee · refill €1,50 |
| Filter | €4,20 | Der Handaufguss · 3 min 30 |
| Cold Brew | €4,50 | Der Kalte · 18 hours |
| Espresso Tonic | €5,20 | Der Blitz · Unser eigenes |
| Kardamom Flat | €4,60 | Der Grüne · Unser eigenes |
| Cascara Spritz | €4,80 | Der Rote · Unser eigenes |

Right column is `position: sticky; top: 88px; align-self: start` — the lever-machine illustration
(max 340px, right-aligned) and below it a "Good to know" block (2px top rule): milk defaults,
bring-your-own-cup discount, last shot fifteen minutes before closing. Sticky matters: the menu
column is ~1250px tall and the column would otherwise leave a screen of dead space.

### 6. Our story (`#story`) — periwinkle
6px rule, then two columns `minmax(0,5fr) minmax(0,7fr)`.
Left: the roaster photo, `aspect-ratio: 4/5`, radius `1rem 18rem 1rem 18rem`, offset 2px outline
of the same shape behind it (16px right/bottom), caption below in label style.
Right: "03 / Our story", h2 "nine years, one courtyard", a lead paragraph, then two prose columns
(`columns: 260px 2; column-gap: 40px`) on the 2016 lease, the 12 kg Probat, importer contracts,
and the ten-day rest.

### 7. Visit (`#visit`) — ice background
6px rule, then two columns `minmax(0,7fr) minmax(0,5fr)`.
Left: "04 / Visit", h2 "through the passage, keep going" (20ch max); address block —
"Oranienstraße 147" (30px display) + "2. Hinterhof, Aufgang C · 10999 Berlin" (label style);
"U1 / U8 Kottbusser Tor — 4 minutes on foot"; a **live open/closed line** (9px blue dot + label
style, see State); the hours table (`<dl>`, rows split by 2px rules, `font-variant-numeric:
tabular-nums`): Mon–Fri 07:30–18:00, Sat 09:00–18:00, Sun 10:00–17:00, Roastery tours
Thursdays 16:00 · 8 places; a note that tours are free, capped at eight, booked by email, closed
24–26 Dec and 1 Jan; then the "Open in maps →" filled pill (Google Maps search for
"Kottbusser Tor, 10999 Berlin", opens in a new tab) and the mailto link.
Right: the passage photo, `aspect-ratio: 4/5`, radius `14rem 14rem 1rem 1rem`, with the
"walk past the bins" caption (38ch, 15px).

### 8. Footer — blue
Three equal columns above a 2px rule: (a) logomark + wordmark + "Second courtyard, third door."
in 30px display; (b) address, phone `+49 30 6120 4488`, `hallo@hinterhof.coffee`,
`@hinterhof.coffee` — each with an animated 2px underline on hover; (c) newsletter — copy, then
a transparent email input on a 2px bottom rule with a "Subscribe →" text button, and a status line.
Below: footer nav (same four anchors) and "© 2026 Hinterhof Coffee · Roasted in Kreuzberg".
Closing flourish: the wordmark as an SVG stretched to 100% width and cropped ~3% at the bottom
(`textLength="1000" lengthAdjust="spacingAndGlyphs"`, `margin-bottom: -3%`).

## Interactions & Behavior
- **Smooth scroll**: Lenis (`duration 1.05`, `wheelMultiplier .9`). All in-page anchors are
  intercepted and scrolled with `offset: -72` (clears the sticky header), `duration 1.15`.
- **Reveals**: every `[data-reveal]` starts at `opacity: 0; translate3d(0, 2rem, 0)` *only if it
  is below 92% of the viewport*, then transitions in (`.8s cubic-bezier(.22,1,.36,1)`) with an
  `80ms` stagger as it crosses that line. Elements already on screen at load are never hidden —
  and a scroll/resize listener re-checks, so a deep link or a fast scroll can't leave anything
  invisible. Reimplement with IntersectionObserver, but keep both of those guarantees.
- **Counters**: the three hero stats tween 0 → value over 1.5s (`power2.out`), zero-padded to the
  original string length ("07"), fire once, and snap to the final string if interrupted.
- **Marquee**: CSS `@keyframes marquee` translating `-50%`; scroll velocity shortens the duration.
- **Parallax**: hero illustration `yPercent: -14`; wordmark band `xPercent: -18 → 8`.
- **Hovers**: nav + footer links grow a 2px underline (`border-color .3s`); filled pills darken to
  `#16337c`; outlined pills invert; shelf images scale `1.04`.
- **Newsletter**: submit is intercepted, no request; the status line renders
  "On the list. One mail a month, nothing else." Wire to a real list in production.
- **Reduced motion**: `prefers-reduced-motion: reduce` cancels all animation/transition durations
  (`.01ms`) and the script exits before installing reveals, GSAP and Lenis.
- **Responsive**: the design holds its horizontal, left-to-right composition as long as possible —
  this is deliberate and was specifically requested. Two-column sections collapse only under
  **620px**; the shelf's 4-up becomes 2-up at 620px and 1-up at 440px; the footer's 3-up becomes
  2-up at 760px and 1-up at 620px. Everything else is fluid via `clamp()`.

## State Management
Small and local — no store needed.
- `subscribeNote: string` — newsletter confirmation copy, set on submit.
- `openStatus: string` — derived, not stored. Computed from an hours table (index = day, 0 =
  Sunday; hours as decimal, e.g. `7.5` = 07:30) evaluated **in `Europe/Berlin`**, not the
  visitor's timezone. Open → "Open now — until HH:MM Berlin time"; closed → "Closed — opens
  today/tomorrow/<Weekday> at HH:MM". In production, compute server-side or on mount, and note it
  ignores the holiday closures listed in the copy — wire it to the same source as the hours table.
- Optional design flags, exposed as props in the prototype:
  `numbered` (show "01 /" prefixes, default on), `masthead` (stretched SVG wordmark in the hero,
  default off), `roastScale` (roast meters on the shelf, default on).
- Scroll position drives the animations only; nothing is persisted.

## Assets
All in `images/` in this bundle, all photography, all rendered through the duotone treatment above:
- `images/products/goerli.jpg`, `kanal.jpg`, `nachtschicht.jpg`, `kalt-achtzehn.jpg` — shelf
  circles (bean/brew macros).
- `images/roastery.jpg` — the drum roaster mid-batch (story).
- `images/street.jpg` — the lit passage off Oranienstraße (visit).

These are **placeholders**: generic bean/brew macros standing in for photography of a real place.
They should be replaced with real shots of the venue, the passage and the roaster — the copy
describes specific things ("walk past the bins", "the Probat mid-batch") that the current images
do not show.

Illustrations and the logomark are inline SVG (no files): pour-over set-up, lever machine, the
arch mark, the rotating badge. They rely on a `feTurbulence`/`feDisplacementMap` filter for their
hand-drawn wobble — **give each filter a unique id per page instance**, duplicated ids collide.
Fonts are loaded from Google Fonts; self-host in production.

## Known gaps (deliberate, flagged for the developer)
- No cart, no product pages — prices are a menu, by design.
- No Impressum / Datenschutz page and no cookie notice. Both are legally required for a German
  business; add them before launch.
- Contact details, prices, lots, farm names and the story are fictional placeholder content.
- The newsletter form is inert. "Reserve" is a `tel:` link, not a booking system.

## Files
- `Hinterhof Home - V2.dc.html` — the design being handed off (V2, current).
- `Hinterhof Home - V1.dc.html` — earlier saved version, for reference on what changed.
- `images/` — the photography used above.

Both HTML files open directly in a browser. They are authored in a component format whose runtime
is not included in this bundle: the markup between `<x-dc>…</x-dc>` and the class in the trailing
`<script type="text/x-dc">` are the two halves to read. Template holes look like `{{ name }}` and
resolve to values returned by `renderVals()`; `<sc-if>` is a conditional. Read them as
"this value comes from state/props" and implement with the target framework's own syntax.
