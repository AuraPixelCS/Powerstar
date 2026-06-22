"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

export const PAGES = 6;

const WebGLSite = dynamic(() => import("./WebGLSite").then((m) => m.WebGLSite), {
  ssr: false,
  loading: () => (
    <div style={{ position: "fixed", inset: 0, background: "#05070d" }} />
  ),
});

/**
 * Native-scroll driver: a fixed full-viewport canvas + a tall spacer that
 * gives the document real scroll height. window.scrollY -> progress ref drives
 * the 3D world. Rock-solid and predictable (no ScrollControls layer to fight).
 */
export function WebGLExperience() {
  const progress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#05070d",
          zIndex: 0,
        }}
      >
        <WebGLSite progressRef={progress} pages={PAGES} />
      </div>
      <div style={{ height: `${PAGES * 100}vh` }} aria-hidden />
    </>
  );
}
