"use client";

import { useEffect, useRef } from "react";
import { WA_BOOK } from "@/lib/site";
import { Reveal } from "./Reveal";

export function BookingBand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bc = canvasRef.current;
    if (!bc) return;
    const ctx = bc.getContext("2d");
    if (!ctx) return;
    let pts: { x: number; y: number }[] = [];

    function setup() {
      if (!bc) return;
      bc.width = bc.offsetWidth;
      bc.height = bc.offsetHeight;
      pts = Array.from({ length: 7 }, () => ({
        x: Math.random() * bc.width,
        y: Math.random() * bc.height,
      }));
    }
    function draw() {
      if (!ctx || !bc) return;
      ctx.clearRect(0, 0, bc.width, bc.height);
      const red =
        document.documentElement.getAttribute("data-theme") === "red";
      ctx.strokeStyle = red
        ? "rgba(242,178,60,0.28)"
        : "rgba(87,199,230,0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < bc.width * 0.34) {
            ctx.beginPath();
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - d * 0.18;
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(mx, my, b.x, b.y);
            ctx.stroke();
          }
        }
      pts.forEach((pn) => {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(pn.x, pn.y, 2, 0, 7);
        ctx.fill();
      });
    }
    const onResize = () => {
      setup();
      draw();
    };
    setup();
    draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section className="band section-pad" id="book">
      <canvas className="band-routes" ref={canvasRef} aria-hidden="true" />
      <div className="wrap">
        <div className="split" style={{ alignItems: "center" }}>
          <Reveal>
            <p className="eyebrow">Book &amp; Plan</p>
            <h2>Plan your shipment now.</h2>
            <p className="lede" style={{ marginTop: 20, maxWidth: "46ch" }}>
              Tell us what&apos;s moving and where. We&apos;ll come back with the
              best route, an all-inclusive quote, and a plan that hits your
              deadline — usually within the day.
            </p>
          </Reveal>

          <Reveal delay={1} className="book-card">
            <div className="book-grid">
              <div className="book-row-2">
                <div>
                  <label className="book-label">Origin</label>
                  <div className="book-field">Port Klang, MY</div>
                </div>
                <div>
                  <label className="book-label">Destination</label>
                  <div className="book-field muted">Anywhere…</div>
                </div>
              </div>
              <div className="book-row-3">
                <div className="book-mode">Sea</div>
                <div className="book-mode on">Air</div>
                <div className="book-mode">Land</div>
              </div>
              <a
                className="btn btn-primary book-submit"
                href={WA_BOOK}
                target="_blank"
                rel="noopener"
              >
                Start my booking on WhatsApp →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
