"use client";

import { Animate } from "./animate";

const features = [
  "Full city compliance check (5 databases)",
  "PHTIN setup guidance & troubleshooting",
  "Commercial Activity License verification",
  "RLSI form prep & filing",
  "Eclipse L&I submission",
  "Direct line to your coordinator",
  "Dedicated team support",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-6" style={{ backgroundColor: "#f7f6f3" }}>
      <div className="max-w-2xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pricing
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Simple, <span className="highlight-word">transparent</span> pricing
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-12" style={{ color: "#6b6d7b" }}>
            One flat fee. Full-service processing. No surprises.
          </p>
        </Animate>

        <Animate delay={300}>
          <div className="rounded-2xl border bg-white p-8 md:p-10 text-center" style={{ borderColor: "#e8e7e4" }}>
            <h3 className="text-lg font-bold" style={{ color: "#333543" }}>
              Full-Service Rental License
            </h3>

            <div className="mt-4 mb-8">
              <span className="text-5xl font-extrabold" style={{ color: "#50b8a2" }}>$500</span>
              <span className="text-sm ml-2" style={{ color: "#6b6d7b" }}>one-time service fee</span>
            </div>

            <div className="space-y-3 mb-8 inline-block text-left">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-[#50b8a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: "#333543" }}>{f}</span>
                </div>
              ))}
            </div>

            <p className="text-xs mb-6" style={{ color: "#b0b2bc" }}>
              City fees calculated based on your property.
            </p>

            <a
              href="/apply/rental-license/intake?service=license_only"
              className="block w-full text-center px-6 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
              style={{ backgroundColor: "#50b8a2" }}
            >
              Get Started
            </a>
          </div>
        </Animate>
      </div>
    </section>
  );
}
