"use client";

import { useState } from "react";
import { Animate } from "./animate";

const testimonials = [
  {
    initial: "M",
    name: "Maria P.",
    location: "Fishtown, Philadelphia",
    quote:
      "I had no idea what a PHTIN was or how to navigate the Philadelphia Tax Center. HubKey walked me through everything and had my rental license in 4 days. Worth every penny.",
  },
  {
    initial: "S",
    name: "Sarah C.",
    location: "Graduate Hospital, Philadelphia",
    quote:
      "I own three units in Philly and the annual renewal was a nightmare until I found HubKey. Now I get an email, sign what I need to sign, and it&rsquo;s done. They&rsquo;ve saved me hours.",
  },
  {
    initial: "R",
    name: "Robert P.",
    location: "Old City, Philadelphia",
    quote:
      "I was about to list my place and realized I didn&rsquo;t have a rental license. HubKey handled the whole thing — lead paint test, city fees, L&amp;I submission. I didn&rsquo;t miss a showing.",
  },
];

export function SocialProof() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 md:py-28 px-6" style={{ backgroundColor: "#333543" }}>
      <div className="max-w-4xl mx-auto">
        <Animate>
          <div className="text-center mb-10">
            <div className="text-5xl font-serif mb-6" style={{ color: "#50b8a2" }}>
              &ldquo;
            </div>

            <blockquote
              className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed text-white/90 max-w-3xl mx-auto min-h-[6rem]"
              dangerouslySetInnerHTML={{ __html: testimonials[active].quote }}
            />

            <div className="mt-8 flex items-center justify-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: "#50b8a2" }}
              >
                {testimonials[active].initial}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">{testimonials[active].name}</div>
                <div className="text-xs text-white/50">{testimonials[active].location}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View testimonial ${i + 1}`}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: i === active ? "#50b8a2" : "rgba(255,255,255,0.2)",
                    width: i === active ? "20px" : "8px",
                  }}
                />
              ))}
            </div>
          </div>
        </Animate>

        {/* Stats row */}
        <Animate delay={200}>
          <div
            className="mt-14 rounded-2xl p-8 md:p-10"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">100+</div>
                <div className="text-xs md:text-sm mt-1 text-white/50">Licenses Processed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">3–5</div>
                <div className="text-xs md:text-sm mt-1 text-white/50">Day Turnaround</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">0</div>
                <div className="text-xs md:text-sm mt-1 text-white/50">Clients Fined After</div>
              </div>
            </div>
          </div>
        </Animate>

        {/* Trust badges */}
        <Animate delay={300}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-white/50 uppercase tracking-widest">
            <span>NARPM Affiliate</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>CCBA Member</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Philadelphia-Based</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Licensed Real Estate Brokerage</span>
          </div>
        </Animate>
      </div>
    </section>
  );
}
