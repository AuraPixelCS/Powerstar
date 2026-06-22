"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  idx: string;
  title: string;
  desc: string;
  icon: ReactNode;
  feature?: boolean;
};

const SERVICES: Service[] = [
  {
    idx: "01",
    title: "Sea Freight",
    desc: "Cost-effective bulk shipping — full container, LCL or break-bulk — fully documented and VGM-compliant across every major trade lane.",
    feature: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 16l1.5-5h15L21 16M3 16l9 4 9-4M3 16l9-3 9 3M6 11V7h6l3 4" />
      </svg>
    ),
  },
  {
    idx: "02",
    title: "Air Freight",
    desc: "Speed & security with global reach for urgent and sensitive cargo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12l20-7-7 20-3-8-10-5z" />
      </svg>
    ),
  },
  {
    idx: "03",
    title: "Domestic Distribution",
    desc: "Last-mile, door-to-door delivery with real-time updates.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 6h13v9H1zM14 9h4l3 3v3h-7M5.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    ),
  },
  {
    idx: "04",
    title: "Warehouse",
    desc: "Secure, flexible storage with inventory and distribution support.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 21V9l9-5 9 5v12M3 21h18M8 21v-6h8v6" />
      </svg>
    ),
  },
  {
    idx: "05",
    title: "Cargo Insurance",
    desc: "Total all-risk protection guarding your assets against loss or damage.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    idx: "06",
    title: "Book & Plan",
    desc: "Optional scheduling so shipment dates meet your buyers' deadlines.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4M8 13h3M8 17h6" />
      </svg>
    ),
  },
  {
    idx: "07",
    title: "Transparent Pricing",
    desc: "All-inclusive quotes covering every step of logistics and protection.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M7 5h8a3.5 3.5 0 010 7H7m0 0h9" />
      </svg>
    ),
  },
  {
    idx: "08",
    title: "Halal Logistics",
    desc: "Certified Halal compliance, with integrity from customs to final delivery.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
  },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    // Desktop: pin the section and scrub the cards horizontally (the "conveyor").
    mm.add("(min-width: 900px)", () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
      const tween = gsap.to(track, { x: () => -distance(), ease: "none" });
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        animation: tween,
        invalidateOnRefresh: true,
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="svc-section">
      <div className="wrap svc-head">
        <Reveal className="section-head">
          <p className="eyebrow">Services</p>
          <h2>All your logistics. One trusted roof.</h2>
          <p className="lede">
            Deep expertise in sea, air and land freight — plus documentation,
            warehousing, insurance and Halal-certified handling.
          </p>
        </Reveal>
      </div>

      <div className="svc-rail" ref={trackRef}>
        {SERVICES.map((s) => (
          <article key={s.idx} className={`svc svc-card${s.feature ? " feature" : ""}`}>
            <div className="idx">{s.idx}</div>
            <div className="ico">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
