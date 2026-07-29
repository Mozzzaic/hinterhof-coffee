/**
 * Single source of truth for brand-level content.
 * Edit here — nothing in the components hardcodes copy.
 */

export const site = {
  name: "Hinterhof",
  fullName: "Hinterhof Coffee",
  tagline: "Second courtyard, third door.",
  description:
    "A specialty coffee bar and roastery in the back courtyards of Kreuzberg, Berlin. Six origins, roasted on site, rested seventy-two hours.",
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

  hours: [
    { days: "Monday — Friday", time: "07:30 — 18:00" },
    { days: "Saturday", time: "09:00 — 18:00" },
    { days: "Sunday", time: "10:00 — 17:00" },
    { days: "Roastery tours", time: "Thursdays, 16:00" },
  ],

  transit: "U1 / U8 Kottbusser Tor — 4 minutes on foot",
} as const;

export const nav = [
  { label: "Coffee", href: "/#coffee" },
  { label: "Bar", href: "/#bar" },
  { label: "Story", href: "/#story" },
  { label: "Visit", href: "/#visit" },
] as const;

export const stats = [
  { figure: "72", unit: "hours resting" },
  { figure: "06", unit: "origins on rotation" },
  { figure: "40", unit: "steps, bean to bar" },
] as const;
