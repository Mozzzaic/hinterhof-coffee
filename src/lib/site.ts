/**
 * Single source of truth for brand-level content.
 * Edit here — nothing in the components hardcodes copy.
 */

export const site = {
  name: "Hinterhof",
  fullName: "Hinterhof Coffee",
  tagline: "Second courtyard, third door.",
  description:
    "A specialty coffee bar and roastery in the back courtyards of Kreuzberg, Berlin. Seven origins on rotation, roasted on site, rested ten days.",
  url: "https://hinterhof.coffee",
  founded: 2016,

  address: {
    street: "Oranienstraße 147",
    detail: "2. Hinterhof, Aufgang C",
    postcode: "10999",
    city: "Berlin",
    country: "Germany",
  },

  contact: {
    email: "hallo@hinterhof.coffee",
    phone: "+49 30 6120 4488",
    instagram: "https://instagram.com",
    instagramHandle: "@hinterhof.coffee",
  },

  /** Display table for the Visit section. */
  hours: [
    { days: "Monday — Friday", time: "07:30 — 18:00" },
    { days: "Saturday", time: "09:00 — 18:00" },
    { days: "Sunday", time: "10:00 — 17:00" },
    { days: "Roastery tours", time: "Thursdays, 16:00 · 8 places" },
  ],

  toursNote:
    "Tours are free and capped at eight people — write to us and we will put your name down. Closed 24–26 December and 1 January.",

  /**
   * Machine-readable opening hours for the live status line, indexed by
   * `Date#getDay()` (0 = Sunday) with hours as decimals (7.5 = 07:30).
   * Keep in sync with `hours` above — this ignores the holiday closures
   * named in `toursNote`, same gap the design handoff flags for a future pass.
   */
  weeklyHours: [
    [10, 17],
    [7.5, 18],
    [7.5, 18],
    [7.5, 18],
    [7.5, 18],
    [7.5, 18],
    [9, 18],
  ] as [number, number][],

  transit: "U1 / U8 Kottbusser Tor — 4 minutes on foot",

  mapsQuery: "Kottbusser Tor, 10999 Berlin",
} as const;

export const nav = [
  { label: "Coffee", href: "/#coffee" },
  { label: "Bar", href: "/#bar" },
  { label: "Story", href: "/#story" },
  { label: "Visit", href: "/#visit" },
] as const;

/** Hero credit bar. `figure` is also the count-up target — keep the leading
    zero where the design shows one, it drives the zero-padding on count-up. */
export const stats = [
  { figure: "10", unit: "days resting" },
  { figure: "07", unit: "origins on rotation" },
  { figure: "38", unit: "steps, bean to bar" },
] as const;

export const origins = [
  { line: "Ethiopia · Yirgacheffe — Chelbesa, washed" },
  { line: "Brazil · Cerrado — Fazenda Rainha, natural" },
  { line: "Colombia · Huila — La Esperanza, washed" },
  { line: "Sumatra · Aceh Gayo — Ketiara co-op, wet-hulled" },
  { line: "Kenya · Nyeri — Gatomboya AA, washed" },
  { line: "Guatemala · Huehuetenango — La Maravilla, honey" },
] as const;
