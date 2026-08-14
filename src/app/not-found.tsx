import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArchMark from "@/components/ArchMark";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="flex min-h-[70vh] flex-col items-center justify-center bg-chalk px-6 py-20 text-center md:px-10 md:py-32"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="flex items-center gap-3">
            <ArchMark className="h-10 w-auto text-ink" />
            <p className="label text-ink">404 / Page Not Found</p>
          </div>

          <h1 className="display mt-6 text-[clamp(3.5rem,9vw,7rem)] lowercase leading-none text-ink">
            wrong courtyard
          </h1>

          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-ink md:text-lg">
            You took a wrong turn in the passage. The page you are looking for
            doesn’t exist or has been moved.
          </p>

          <div className="mt-10">
            <Link
              href="/"
              className="label group inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-sky transition-colors duration-200 hover:bg-ink-deep"
            >
              Back to homepage
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
