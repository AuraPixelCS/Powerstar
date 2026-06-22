"use client";

import { useState } from "react";
import { FAQ } from "@/lib/site";
import { Reveal } from "./Reveal";

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="block section-pad" id="faq">
      <div className="wrap">
        <Reveal className="section-head" style={{ marginBottom: 48 }}>
          <p className="eyebrow">FAQ</p>
          <h2>The questions shippers actually ask.</h2>
        </Reveal>

        <Reveal delay={1} className="faq">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item${isOpen ? " open" : ""}`} key={item.q}>
                <button
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {item.q} <span className="pm">▾</span>
                </button>
                <div className="faq-a">
                  <div className="inner-wrap">
                    <div className="inner">{item.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
