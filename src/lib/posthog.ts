import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
  "https://eu.posthog.com";

let initialized = false;

/**
 * Initialize PostHog analytics + session replay.
 * Calls are no-op when VITE_POSTHOG_KEY is not set (dev/local).
 *
 * RODO note: maskAllInputs=true masks every <input>/<textarea> value
 * in session recordings, so passwords / PII never leave the browser.
 */
export const initPostHog = () => {
  if (initialized) return;
  if (!POSTHOG_KEY) {
    console.info(
      "[PostHog] VITE_POSTHOG_KEY not set — analytics disabled.",
    );
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // we trigger pageviews manually on route change
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-private]",
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  initialized = true;
};

export { posthog };
