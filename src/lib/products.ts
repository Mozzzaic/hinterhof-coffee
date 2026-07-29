/**
 * The shop window. Presentational only — no cart, no checkout.
 * Each entry maps 1:1 to an image in /public/images/products (see MANIFEST.md).
 */

export type Roast = "Light" | "Medium" | "Dark";

export type Product = {
  slug: string;
  name: string;
  origin: string;
  roast: Roast;
  notes: [string, string, string];
  copy: string;
  price: number;
  weight: string;
  image: string;
  status?: string;
};

export const products: Product[] = [
  {
    slug: "goerli",
    name: "Görli",
    origin: "Brazil × Ethiopia",
    roast: "Medium",
    notes: ["Cocoa nib", "Red plum", "Brown sugar"],
    copy: "The blend the bar runs on. Sweet, heavy in the middle, holds its nerve under milk.",
    price: 14,
    weight: "250 g",
    image: "/images/products/goerli.jpg",
    status: "House",
  },
  {
    slug: "kanal",
    name: "Kanal",
    origin: "Ethiopia, Yirgacheffe",
    roast: "Light",
    notes: ["Bergamot", "White peach", "Jasmine"],
    copy: "Roasted light enough to keep the florals intact. Delicate, tea-like, best drunk slowly.",
    price: 17,
    weight: "250 g",
    image: "/images/products/kanal.jpg",
    status: "New",
  },
  {
    slug: "nachtschicht",
    name: "Nachtschicht",
    origin: "Sumatra, Aceh Gayo",
    roast: "Dark",
    notes: ["Dark chocolate", "Cedar", "Treacle"],
    copy: "Our one genuinely dark roast, and unapologetic about it. Built for the end of a long shift.",
    price: 15,
    weight: "250 g",
    image: "/images/products/nachtschicht.jpg",
  },
  {
    slug: "kalt-achtzehn",
    name: "Kalt 18",
    origin: "Blend, rotating",
    roast: "Medium",
    notes: ["Hazelnut", "Cane sugar", "Fig"],
    copy: "Eighteen hours in cold water, nothing added, bottled the same morning. Drink within five days.",
    price: 6,
    weight: "500 ml",
    image: "/images/products/kalt-achtzehn.jpg",
    status: "Last",
  },
];

export type BrewMethod = {
  name: string;
  german: string;
  time: string;
  price: number;
  copy: string;
};

export const brewMethods: BrewMethod[] = [
  {
    name: "Espresso",
    german: "Der Doppelte",
    time: "28 sec",
    price: 2.8,
    copy: "18 g in, 40 g out, on a lever machine that predates most of the staff.",
  },
  {
    name: "Filter",
    german: "Der Handaufguss",
    time: "3 min 30",
    price: 4.2,
    copy: "One cone, one origin, ground to order. We tell you what it is before you drink it.",
  },
  {
    name: "Cold Brew",
    german: "Der Kalte",
    time: "18 hours",
    price: 4.5,
    copy: "Steeped overnight in the cellar, poured over a single block of ice.",
  },
];
