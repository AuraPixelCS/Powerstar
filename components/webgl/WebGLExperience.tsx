"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

export const PAGES = 6;

const WebGLSite = dynamic(() => import("./WebGLSite").then((m) => m.WebGLSite), {
  ssr: false,
  loading: () => (
    <div style={{ position: "fixed", inset: 0, background: "#05070d" }} />
  ),
});

/**
 * Native-scroll driver with DETERMINISTIC sizing.
 * The canvas parent is sized in explicit pixels from window.innerWidth/Height
 * (React state), and the canvas only mounts once the real size is known — so
 * R3F never has to measure a fixed/vw element (which mis-measured in some
 * browsers, rendering only a narrow strip).
 */
export function WebGLExperience() {
  const progress = useRef(0);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onResize();
    onScroll();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: size.w > 0 ? size.w : "100vw",
          height: size.h > 0 ? size.h : "100vh",
          background: "#05070d",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {size.w > 0 && (
          <WebGLSite progressRef={progress} pages={PAGES} width={size.w} height={size.h} />
        )}
      </div>
      <div style={{ height: `${PAGES * 100}vh` }} aria-hidden />
    </>
  );
}
