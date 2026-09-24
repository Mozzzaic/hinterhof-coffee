/**
 * The shop window. Presentational only — no cart, no checkout.
 * Each entry maps 1:1 to an image in /public/images/products (see MANIFEST.md).
 */

export type Product = {
  slug: string;
  name: string;
  origin: string;
  weight: string;
  pricePerKg: string;
  /** Filled segments out of 5. */
  roast: number;
  notes: [string, string, string];
  copy: string;
  price: number;
  image: string;
  /**
   * The crop the press prints: the subject the round frame centres on (0 to
   * 1, from the top left) and how far it closes in, so one thing fills it.
   */
  focus: readonly [number, number];
  zoom: number;
  status?: string;
};

export const products: Product[] = [
  {
    slug: "goerli",
    name: "Görli",
    origin: "Brazil × Ethiopia",
    weight: "250 g",
    pricePerKg: "€56/kg",
    roast: 3,
    notes: ["Cocoa nib", "Red plum", "Brown sugar"],
    copy: "The blend the bar runs on. Sweet, heavy in the middle, holds its nerve under milk.",
    price: 14,
    image: "/images/products/goerli.jpg",
    // The portafilter full of fresh grounds.
    focus: [0.3, 0.6],
    zoom: 1.8,
    status: "House",
  },
  {
    slug: "kanal",
    name: "Kanal",
    origin: "Ethiopia, Yirgacheffe",
    weight: "250 g",
    pricePerKg: "€68/kg",
    roast: 1,
    notes: ["Bergamot", "White peach", "Jasmine"],
    copy: "Roasted light enough to keep the florals intact. Delicate, tea-like, best drunk slowly.",
    price: 17,
    image: "/images/products/kanal.jpg",
    // The grid of beans, green to roasted.
    focus: [0.59, 0.5],
    zoom: 1.35,
    status: "New",
  },
  {
    slug: "nachtschicht",
    name: "Nachtschicht",
    origin: "Sumatra, Aceh Gayo",
    weight: "250 g",
    pricePerKg: "€60/kg",
    roast: 5,
    notes: ["Dark chocolate", "Cedar", "Treacle"],
    copy: "Our one genuinely dark roast, and unapologetic about it. Built for the end of a long shift.",
    price: 15,
    image: "/images/products/nachtschicht.jpg",
    // A handful of dark beans, big enough to read as beans.
    focus: [0.5, 0.5],
    zoom: 2.4,
  },
  {
    slug: "kalt-achtzehn",
    name: "Kalt 18",
    origin: "Blend, rotating",
    weight: "500 ml",
    pricePerKg: "€12/l",
    roast: 3,
    notes: ["Hazelnut", "Cane sugar", "Fig"],
    copy: "Eighteen hours in cold water, nothing added, bottled the same morning. Drink within five days.",
    price: 6,
    image: "/images/products/kalt-achtzehn.jpg",
    // The glass.
    focus: [0.42, 0.68],
    zoom: 1.6,
    status: "Last",
  },
];

export type Drink = {
  name: string;
  german: string;
  /** Either a brew time ("28 sec") or "Unser eigenes" for house originals. */
  meta: string;
  price: number;
  copy: string;
};

export const drinks: Drink[] = [
  {
    name: "Espresso",
    german: "Der Doppelte",
    meta: "28 sec",
    price: 2.8,
    copy: "18 g in, 40 g out, on a lever machine that predates most of the staff.",
  },
  {
    name: "Cortado",
    german: "Der Kurze",
    meta: "120 ml",
    price: 3.2,
    copy: "Same shot, milk barely past body temperature. The one the neighbours drink standing up.",
  },
  {
    name: "Flat White",
    german: "Der Weiße",
    meta: "180 ml",
    price: 4.0,
    copy: "Görli under milk, poured flat. Whole milk unless you say otherwise; oat costs nothing extra.",
  },
  {
    name: "Batch Brew",
    german: "Der Kannenkaffee",
    meta: "refill €1,50",
    price: 3.0,
    copy: "The filter of the day, already brewed. Take it away or sit with it — refills all morning.",
  },
  {
    name: "Filter",
    german: "Der Handaufguss",
    meta: "3 min 30",
    price: 4.2,
    copy: "One cone, one origin, ground to order. We tell you what it is before you drink it.",
  },
  {
    name: "Cold Brew",
    german: "Der Kalte",
    meta: "18 hours",
    price: 4.5,
    copy: "Steeped overnight in the cellar, poured over a single block of ice.",
  },
  {
    name: "Espresso Tonic",
    german: "Der Blitz",
    meta: "Unser eigenes",
    price: 5.2,
    copy: "Kanal over tonic and one long strip of lemon peel. Bitter, floral, gone in four minutes.",
  },
  {
    name: "Kardamom Flat",
    german: "Der Grüne",
    meta: "Unser eigenes",
    price: 4.6,
    copy: "Green cardamom ground into the basket with the coffee. No syrup — the spice is in the puck.",
  },
  {
    name: "Cascara Spritz",
    german: "Der Rote",
    meta: "Unser eigenes",
    price: 4.8,
    copy: "Coffee-cherry husk from the Chelbesa lot, cold-steeped and carbonated. Tastes of hibiscus and dried apple.",
  },
];

export const goodToKnow = [
  "Whole milk by default, oat at no extra cost. Bring your own cup and take 30 cents off.",
  "The bar stops pulling shots fifteen minutes before closing — the grinder needs the same care as the coffee.",
];
