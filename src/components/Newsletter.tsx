"use client";

import { useState } from "react";

/**
 * NOTE: front-end only. There is no mailing-list backend wired up yet.
 * To make it real, replace the submit handler with a POST to your provider
 * (Buttondown / Mailchimp / a Route Handler at src/app/api/subscribe/route.ts).
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="w-full max-w-sm">
      <p className="label">What is on the roaster</p>
      <p className="mt-3 max-w-[32ch] text-[0.9375rem] leading-snug">
        One mail a month: the new lots, the ones running out, and the
        Thursday tour list. Nothing else.
      </p>

      <form
        className="mt-5 flex items-center gap-0 border-b-2 border-sky pb-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          setNote("On the list. One mail a month, nothing else.");
        }}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full bg-transparent text-[0.9375rem] placeholder:text-sky/60 focus:outline-none"
        />
        <button type="submit" className="label shrink-0">
          Subscribe →
        </button>
      </form>
      <p role="status" className="mt-2.5 min-h-[1.125rem] text-[0.8125rem]">
        {note}
      </p>
    </div>
  );
}
