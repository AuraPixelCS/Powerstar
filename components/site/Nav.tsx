"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS, WA_QUOTE } from "@/lib/site";

export function Nav() {
  // single state: are we past the cinematic hero/journey?
  // controls BOTH the glassmorphic background and the menu links.
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const journey = document.getElementById("journey");
      if (!journey) {
        setPastHero(window.scrollY > 40);
        return;
      }
      // "crossed the hero" = the journey's bottom has reached the viewport,
      // i.e. the sticky canvas is unpinning and real content is arriving.
      const bottom = journey.getBoundingClientRect().bottom;
      setPastHero(bottom <= window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`nav${pastHero ? " scrolled" : " over-hero"}`}
      id="nav"
    >
      <a className="brand" href="#top" aria-label="Power Star Freight home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="brand-logo"
          src="/powerstar-logo.png"
          width={1762}
          height={202}
          alt="Power Star Freight"
        />
      </a>
      <div className="nav-links">
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="nav-cta">
        <a className="btn btn-ghost" href="#contact">
          Talk to us
        </a>
        <a className="btn btn-primary" href={WA_QUOTE} target="_blank" rel="noopener">
          Get a quote
        </a>
      </div>
    </nav>
  );
}
