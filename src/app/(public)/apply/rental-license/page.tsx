import { cookies, headers } from "next/headers";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { ComplexitySection } from "@/components/landing/complexity-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ValueStack } from "@/components/landing/value-stack";
import { SocialProof } from "@/components/landing/social-proof";
import { AddressTool } from "@/components/landing/address-tool";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { captureServer } from "@/lib/posthog";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Philadelphia Rental License Service | HubKey Real Estate",
  description:
    "Get your Philadelphia rental license without the headaches. HubKey handles city compliance checks, PHTIN setup, lead paint testing, and L&I submission. 100+ licenses processed, 3–5 day turnaround.",
};

type Variant = "control" | "v1" | "v2";

export default async function RentalLicenseLandingPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const rawVariant = cookieStore.get("lp_variant")?.value || "control";
  const variant: Variant = (["control", "v1", "v2"] as const).includes(rawVariant as Variant)
    ? (rawVariant as Variant)
    : "control";
  const domain = cookieStore.get("lp_domain")?.value || "hub";
  const host = headerStore.get("host") || "";

  // Fire a server-side page view with variant + domain context.
  captureServer("landing_view_server", host || "anonymous", {
    lp_variant: variant,
    lp_domain: domain,
    host,
  }).catch(() => {});

  // Variants now test only the Hero value prop (single-variable A/B).
  // Section order is the same across all variants so we isolate the
  // headline as the independent variable.
  return (
    <>
      <Hero variant={variant} />
      <ProblemSection />
      <ComplexitySection />
      <HowItWorks />
      <AddressTool />
      <ValueStack />
      <SocialProof />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
