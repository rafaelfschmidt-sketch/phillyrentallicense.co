"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (ph) => {
        const domainCookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("lp_domain="))
          ?.split("=")[1];
        const variantCookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("lp_variant="))
          ?.split("=")[1];
        ph.register({
          lp_domain: domainCookie || "hub",
          lp_variant: variantCookie || "control",
          host: window.location.hostname,
        });
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
