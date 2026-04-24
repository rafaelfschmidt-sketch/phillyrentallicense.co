"use client";

import { useState } from "react";
import { Animate } from "./animate";

const faqs = [
  {
    q: "What is a PHTIN and do I need one?",
    a: "A PHTIN (Philadelphia Tax Identification Number) is required for every landlord in Philadelphia. It's your unique ID for the Philadelphia Tax Center. If you don't have one, we'll guide you through the setup process — it takes about 15 minutes online.",
  },
  {
    q: "How long does the rental license process take?",
    a: "Once we have all your information and your tax account is set up, we typically submit within 3–5 business days. The most common delay is waiting for PHTIN setup or tax clearance, which we help you resolve.",
  },
  {
    q: "What if my property has open violations?",
    a: "You can actually check this right now — the free compliance preview above pulls live data from Philadelphia's violations database for your address. Open violations must be resolved before L&I will issue a license, but we flag them upfront so there are no surprises. If anything shows up, we'll walk you through the fastest path to resolution before we submit the application.",
  },
  {
    q: "Does my property need a lead paint test?",
    a: "If your property was built in 1978 or earlier, a lead-safe certification is required. We coordinate the testing with our certified inspectors. Cost depends on bedrooms per unit ($130–$280/unit).",
  },
  {
    q: "What's included in the $69 per unit city fee?",
    a: "The $69 per unit is the City of Philadelphia's licensing fee — it goes directly to L&I. This is mandatory regardless of who files your application. Our service fee covers everything else.",
  },
  {
    q: "What if I'm also using HubKey for tenant placement?",
    a: "If you're already working with HubKey for tenant placement, the rental license can be bundled at a reduced rate. Just let us know when you get started and we'll apply the discount.",
  },
  {
    q: "What if you can't get my license approved?",
    a: "If we're unable to get your rental license approved due to something within our control, you don't pay our service fee. City fees and lead paint testing costs (if already performed) are non-refundable as they go to third parties.",
  },
  {
    q: "Can I track the status of my application?",
    a: "Yes! After you submit your information, you'll have access to real-time status updates showing exactly where your application stands — from compliance checks to L&I submission to license issuance.",
  },
  {
    q: "What happens to the license if I sell the property?",
    a: "Rental licenses are tied to the owner and property — they don't transfer when a property changes hands. The new owner has to apply for their own license before renting. If you're buying a property with an existing rental license, budget for a fresh application.",
  },
  {
    q: "What are the penalties if I rent without a license?",
    a: "Philadelphia can fine unlicensed rentals up to $2,000 per day per unit. Worse, rent collected without a license isn't legally enforceable — if a tenant disputes it, you may not be able to recover it. Evictions also get complicated without a valid license.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <Animate>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-12"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Questions? We&apos;ve got <span className="highlight-word">answers</span>.
          </h2>
        </Animate>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <Animate key={i} delay={i * 50}>
              <div className="rounded-xl border overflow-hidden transition-colors"
                style={{ borderColor: openIndex === i ? "#50b8a2" : "#e8e7e4" }}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50/50"
                >
                  <span className="font-medium text-[15px] pr-4" style={{ color: "#333543" }}>
                    {faq.q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 transition-transform duration-300"
                    style={{
                      color: openIndex === i ? "#50b8a2" : "#b0b2bc",
                      transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openIndex === i ? "200px" : "0",
                    opacity: openIndex === i ? 1 : 0,
                  }}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: "#6b6d7b" }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
