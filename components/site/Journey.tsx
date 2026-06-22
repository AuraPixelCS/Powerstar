"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WA_QUOTE } from "@/lib/site";

// 3D globe is client-only (WebGL) — load with no SSR to avoid hydration work
const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
});

// the stitched video (container + ship) covers this fraction of the scroll;
// the globe cross-dissolves in and owns the rest.
const VIDEO_END = 0.62;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const FRAMES = 140; // stills across the ~10s clip — denser = smoother scrub
const MAXW = 1024; // cap source width (keeps memory sane across 140 frames)
const VIDEO_SRC = "/media/journey.mp4";

type Frame = ImageBitmap | HTMLCanvasElement | null;

/**
 * "The Journey" — one continuous cinematic take decoded into cached still
 * frames at load, painted to a canvas indexed by scroll. Ported from the
 * concept's frame-scrubber. Three narrative beats track scroll progress.
 */
export function Journey() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeLayerRef = useRef<HTMLDivElement>(null);
  const globeProgRef = useRef(0);

  const [act, setAct] = useState(0);
  const [cueHidden, setCueHidden] = useState(false);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const journey = journeyRef.current;
    if (!canvas || !journey) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const frames: Frame[] = new Array(FRAMES).fill(null);
    let loadedCount = 0;
    let allReady = false;
    let firstUp = false;
    let targetP = 0;
    let curP = 0;
    let raf = 0;
    let dpr = 1;
    let cancelled = false;

    const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

    /* ---------- canvas ---------- */
    function resize() {
      if (!canvas) return;
      const host = canvas.parentElement || document.body;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = host.clientWidth;
      const h = host.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    function drawCover(bmp: ImageBitmap | HTMLCanvasElement) {
      if (!ctx || !canvas) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = bmp.width / bmp.height;
      const cr = cw / ch;
      let dw: number, dh: number;
      if (ir > cr) {
        dh = ch;
        dw = ch * ir;
      } else {
        dw = cw;
        dh = cw / ir;
      }
      ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
    function frameAt(p: number): Frame {
      const maxIdx = allReady ? FRAMES - 1 : Math.max(0, loadedCount - 1);
      const idx = Math.min(maxIdx, Math.max(0, Math.round(p * (FRAMES - 1))));
      return frames[idx] || frames[Math.max(0, Math.min(idx, loadedCount - 1))];
    }
    function render() {
      if (cancelled || !ctx || !canvas) return;
      raf = requestAnimationFrame(render);
      curP += (targetP - curP) * (reduced ? 1 : 0.12);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bmp = frameAt(curP);
      if (bmp) drawCover(bmp);
    }
    function begin() {
      if (raf) return;
      resize();
      render();
    }

    /* ---------- hidden source video + frame extraction ---------- */
    function makeVideo(src: string) {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      v.style.cssText =
        "position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:-10px;top:-10px;";
      document.body.appendChild(v);
      return v;
    }
    function seekTo(v: HTMLVideoElement, t: number) {
      return new Promise<void>((res) => {
        let finished = false;
        const fin = () => {
          if (finished) return;
          finished = true;
          v.removeEventListener("seeked", fin);
          res();
        };
        v.addEventListener("seeked", fin);
        try {
          v.currentTime = t;
        } catch {
          fin();
        }
        setTimeout(fin, 900);
      });
    }
    function bufferReady(v: HTMLVideoElement) {
      return new Promise<void>((res) => {
        if (v.readyState >= 3) return res();
        const ok = () => {
          v.removeEventListener("canplaythrough", ok);
          v.removeEventListener("canplay", ok);
          res();
        };
        v.addEventListener("canplaythrough", ok, { once: true });
        v.addEventListener("canplay", ok, { once: true });
        try {
          v.load();
        } catch {}
        const pr = v.play();
        if (pr && pr.catch) pr.catch(() => {});
        setTimeout(res, 9000);
      });
    }
    async function grab(
      v: HTMLVideoElement,
      w: number,
      h: number,
    ): Promise<Frame> {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return await createImageBitmap(v, {
            resizeWidth: w,
            resizeHeight: h,
            resizeQuality: "high",
          });
        } catch {
          await new Promise((r) => setTimeout(r, 60));
        }
      }
      try {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(v, 0, 0, w, h);
        return c;
      } catch {
        return null;
      }
    }
    // Download the whole clip up front so frame-seeking is instant and reliable
    // on any host/tunnel. Streaming + seeking is flaky over slow connections
    // (seeks outrun the download and stall → blank frames). Returns a same-origin
    // object URL, or the original src if the fetch fails. (download = 0–50% of bar)
    async function downloadClip(): Promise<{ src: string; objectUrl: string | null }> {
      try {
        const resp = await fetch(VIDEO_SRC);
        if (!resp.ok || !resp.body) return { src: VIDEO_SRC, objectUrl: null };
        const total = Number(resp.headers.get("content-length")) || 0;
        const reader = resp.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total) setPct(Math.round((received / total) * 50));
          }
        }
        if (cancelled) return { src: VIDEO_SRC, objectUrl: null };
        const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        return { src: url, objectUrl: url };
      } catch {
        return { src: VIDEO_SRC, objectUrl: null };
      }
    }

    async function extract() {
      const { src, objectUrl } = await downloadClip();
      if (cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }
      const v = makeVideo(src);
      await bufferReady(v);
      if (cancelled) {
        v.remove();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }
      try {
        v.pause();
      } catch {}
      const dur = v.duration && isFinite(v.duration) ? v.duration : 10;
      const nativeW = v.videoWidth || MAXW;
      const nativeH = v.videoHeight || 720;
      const w = Math.min(MAXW, nativeW);
      const h = Math.round(w * (nativeH / nativeW));

      for (let i = 0; i < FRAMES; i++) {
        if (cancelled) break;
        const t = (i / (FRAMES - 1)) * (dur - 0.05);
        await seekTo(v, t);
        let img = await grab(v, w, h);
        if (!img && i > 0) img = frames[i - 1];
        frames[i] = img;
        loadedCount++;
        // frames = 50–100% of the bar (download was the first 50%)
        setPct(50 + Math.round((loadedCount / FRAMES) * 50));
        if (i === 0 && !firstUp) {
          firstUp = true;
          begin();
        }
        if (i % 6 === 5) await new Promise((r) => setTimeout(r, 16));
      }
      v.remove();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      allReady = true;
      setDone(true);
    }

    /* ---------- scroll orchestration ---------- */
    const globeLayer = globeLayerRef.current;
    let lastAct = -1;
    let lastCue = false;
    function onScroll() {
      const rect = journey!.getBoundingClientRect();
      const total = journey!.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));

      // video (container + ship) plays across the first VIDEO_END of the scroll
      targetP = clamp(p / VIDEO_END);

      // cross-dissolve video -> globe, then drive the globe's own progress
      const globeOpacity = smoothstep(0.56, 0.68, p);
      if (canvas) canvas.style.opacity = String(1 - smoothstep(0.54, 0.66, p));
      if (globeLayer) globeLayer.style.opacity = String(globeOpacity);
      globeProgRef.current = clamp((p - 0.58) / (1 - 0.58));

      // beats: container (0–30%) · ship (30–60%) · globe (60–100%)
      const a = p < 0.3 ? 0 : p < 0.6 ? 1 : 2;
      if (a !== lastAct) {
        lastAct = a;
        setAct(a);
      }
      const hide = p > 0.04;
      if (hide !== lastCue) {
        lastCue = hide;
        setCueHidden(hide);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    extract();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      frames.forEach((f) => {
        if (f && "close" in f) (f as ImageBitmap).close();
      });
    };
  }, []);

  const ticks = ["Your cargo", "Across the sea", "To the world"];

  return (
    <div id="journey" ref={journeyRef}>
      <div className="canvas-sticky">
        <div className="sky" aria-hidden="true" />
        <canvas id="seq" className="hero-seq" ref={canvasRef} aria-hidden="true" />
        <div className="globe-layer" ref={globeLayerRef} aria-hidden="true">
          <Globe progressRef={globeProgRef} />
        </div>
        <div className="scrim" aria-hidden="true" />

        <div className="journey-progress" aria-hidden="true">
          {ticks.map((label, i) => (
            <div key={label} className={`tick${i <= act ? " on" : ""}`}>
              <span className="label">{label}</span>
              <span className="dot" />
            </div>
          ))}
        </div>

        {/* narrative beats */}
        <div className={`beat${act === 0 ? " is-on" : ""}`}>
          <div className="wrap">
            <div className="beat-inner">
              <p className="eyebrow">Total Logistics · Est. 2012 · Klang, MY</p>
              <h1>
                Guiding your cargo
                <br />
                <span className="tag">with respect</span> for the journey.
              </h1>
              <p className="lede">
                Your end-to-end logistics partner for Malaysia and the world —
                sea, air and land freight, documentation, warehousing and cargo
                insurance, delivered with a measurable commitment to sustainable
                practice.
              </p>
              <div className="beat-cta">
                <a
                  className="btn btn-primary"
                  href={WA_QUOTE}
                  target="_blank"
                  rel="noopener"
                >
                  Get a quote <span className="arrow">→</span>
                </a>
                <a className="btn btn-ghost" href="#services">
                  Explore services
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`beat${act === 1 ? " is-on" : ""}`}>
          <div className="wrap">
            <div className="beat-inner">
              <p className="eyebrow">Sea Freight</p>
              <h2>
                The ocean is <span className="tag">our road.</span>
              </h2>
              <p className="lede">
                Full container, LCL and break-bulk across the world&apos;s trade
                lanes — cost-effective bulk shipping, fully documented,
                VGM-compliant, and tracked from quay to quay.
              </p>
            </div>
          </div>
        </div>

        <div className={`beat${act === 2 ? " is-on" : ""}`}>
          <div className="wrap">
            <div className="beat-inner">
              <p className="eyebrow">Global Reach · Local Care</p>
              <h2>
                One partner.
                <br />
                <span className="tag">Every port.</span>
              </h2>
              <p className="lede">
                Sea, air and land woven into a single, sustainable supply
                chain — over a decade of moving goods between Malaysia and 200+
                destinations.
              </p>
              <div className="beat-cta">
                <a className="btn btn-primary" href="#services">
                  See how we move <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`seq-loader${done ? " done" : ""}`}
          aria-hidden="true"
        >
          <div className="seq-loader-row">
            <span className="seq-loader-label">Loading the journey</span>
            <span className="seq-loader-pct">{pct}%</span>
          </div>
          <div className="seq-loader-track">
            <div className="seq-loader-bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div
          className="scroll-cue"
          style={{ opacity: cueHidden ? 0 : 1 }}
        >
          <span>Scroll the journey</span>
          <span className="rail" />
        </div>
      </div>
    </div>
  );
}
