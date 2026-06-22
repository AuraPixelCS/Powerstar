"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Counts up from 0 to `value` when scrolled into view (respects reduced motion). */
export function StatNumber({ value, sup }: { value: string; sup?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = parseInt(value, 10);
    if (!Number.isFinite(target)) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value;
      return;
    }

    el.textContent = "0";
    const obj = { n: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          n: target,
          duration: 1.7,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.n).toString();
          },
        });
      },
    });
    return () => st.kill();
  }, [value]);

  return (
    <div className="num">
      <span ref={ref}>{value}</span>
      {sup && <small>{sup}</small>}
    </div>
  );
}
