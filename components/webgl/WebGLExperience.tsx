"use client";

import dynamic from "next/dynamic";

const WebGLSite = dynamic(() => import("./WebGLSite").then((m) => m.WebGLSite), {
  ssr: false,
  loading: () => (
    <div style={{ position: "fixed", inset: 0, background: "#05070d" }} />
  ),
});

export function WebGLExperience() {
  return <WebGLSite />;
}
