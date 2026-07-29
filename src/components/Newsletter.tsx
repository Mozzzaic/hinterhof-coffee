"use client";

import { useState } from "react";

/**
 * NOTE: front-end only. There is no mailing-list backend wired up yet.
 * To make it real, replace the submit handler with a POST to your provider
 * (Buttondown / Mailchimp / a Route Handler at src/app/api/subscribe/route.ts).
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <p className="label">The Thursday note</p>
      <p className="mt-3 text-[0.9375rem] leading-snug">
        One email a week: what came off the roaster and what is nearly gone.
      </p>

      {done ? (
        <p role="status" className="mt-5 font-bold">
          Filed. See you Thursday.
        </p>
      ) : (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex items-center gap-3 border-b-2 border-sky pb-2">
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
              Sign up
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
