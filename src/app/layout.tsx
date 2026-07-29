import type { Metadata } from "next";
import { Bagel_Fat_One, Familjen_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import SmoothScroll from "@/components/SmoothScroll";

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} — Kreuzberg, Berlin`,
    template: `%s — ${site.fullName}`,
  },
  description: site.description,
  keywords: [
    "specialty coffee Berlin",
    "Kreuzberg roastery",
    "coffee shop Kreuzberg",
    "filter coffee Berlin",
    "Oranienstraße coffee",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.fullName,
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
    images: [
      { url: "/images/og.jpg", width: 1200, height: 630, alt: site.fullName },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
    images: ["/images/og.jpg"],
  },
  alternates: { canonical: "/" },
};

export const viewport = {
  themeColor: "#c5d9f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bagel.variable} ${familjen.variable} h-full`}
    >
      <body className="min-h-full bg-sky text-ink">
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-sky"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
