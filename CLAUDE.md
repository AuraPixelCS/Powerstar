# CLAUDE.md — Powerstar

> Scaffolded by `/pilot` on 2026-06-08
> Power Star Freight — Total Logistics, Beautifully Moved. A landing page for a freight & logistics company.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.ts`)
- **UI library**: shadcn/ui (primitives under `components/ui/`)
- **Motion**: Award-level + 3D — `gsap`, `lenis`, `motion` (Framer Motion), `three`, `@react-three/fiber`, `@react-three/drei`

## Brand

Two themes, both defined as OKLCH tokens in `app/globals.css`. The **default is Signal Red**
(`<html data-theme="red">` in `app/layout.tsx`) — the client's brand `#D91010` — matching the
concept's shipped default (`__TWEAKS.accent = "red"`). The bare `:root` is the alternate
**Ocean Blue** scheme. Switch by changing/removing the `data-theme` attribute.

- **Signal Red** (default): primary `oklch(0.555 0.215 27)` (#D91010), gold secondary glow, warm-neutral surfaces.
- **Ocean Blue** (alternate): primary `oklch(0.540 0.150 248)`, aqua secondary, cool near-white surfaces.
- **Mode**: Light only.

The active palette drives both the UI and the 3D/video hero. Token names: `--ocean`
(= primary), `--aqua` (= secondary), `--amber`, `--paper`/`--paper-2`/`--mist` (surfaces),
`--ink`/`--ink-soft`/`--ink-faint` (text), `--line`, `--shadow-color`. Brand tokens are also
exposed as Tailwind utilities (`bg-ocean`, `text-ink`, `bg-paper`…) and mapped onto shadcn
semantic tokens (`--primary`, `--secondary`, `--accent`, `--muted`, `--border`, `--ring`).

The bespoke marketing-page styles (nav, journey, sections, footer) live in `app/site.css`,
ported from the concept and referencing the same tokens.

### Type

- **Display / headings**: Schibsted Grotesk → `font-heading` / `font-display`
- **Body**: Hanken Grotesk → `font-sans` (default)
- **Mono**: IBM Plex Mono → `font-mono`

All three are loaded via `next/font/google` in `app/layout.tsx`.

## Design reference

`design-reference/powerstar-homepage-standalone.html` is the **source-of-truth design** — a
Claude artifact export (~6MB). Its assets are stored in a `__bundler/manifest` JSON: 1 hero
MP4, 21 woff2 fonts, a JS runtime. The page markup lives JSON-encoded in a `__bundler/template`
tag. Decoded copies are kept alongside it:
- `design-reference/decoded-design.html` — the readable HTML + full CSS design system.
- `design-reference/journey-scrubber.reference.js` — the original frame-scrubber.

The hero MP4 was extracted to `public/media/journey.mp4` (4.2 MB).

## Page architecture (the revamp — built)

Single-page site composed in `app/page.tsx` from `components/site/*`:
- **Journey.tsx** (client) — the cinematic hero, a 600vh sticky section. Two layers:
  1. A scroll-scrubbed video (`journey.mp4` = Veo clips scene1 *container* + scene2 *ship*,
     stitched, ~16s). It's downloaded to a Blob first (reliable seeking on any host/tunnel),
     decoded into 140 stills (MAXW 1024) and painted to a `<canvas>` indexed by scroll, eased
     at 0.12/frame. Covers scroll 0 → `VIDEO_END` (0.62).
  2. **Globe.tsx** — a react-three-fiber 3D globe (scene 3, *world + connections*). The video
     cross-dissolves into it at ~0.58–0.68 scroll; the globe owns the rest. Veo could not do the
     sea→space reveal (it morphed a second Earth), so this beat is real-time WebGL.
  Beats + ticks: container 0–30% · ship 30–60% · globe 60–100%. Honors `prefers-reduced-motion`.
- **Globe.tsx** (client, `next/dynamic` ssr:false) — photoreal Earth (textures in
  `public/textures/`), atmosphere fresnel glow, drei `<Stars>`, and thin additive red/gold arcs
  drawn from the **Malaysia (Port Klang) hub** to ~6 world ports — no nodes/labels. Scroll-driven
  via a `progressRef` (no React re-renders): gentle camera pull-back reveal, staggered arc
  draw-on, then a slow continuous settle spin. Earth offset right so the left headline stays clear.
  Source Veo clips kept in `design-reference/journey-clips/`.
- **Nav.tsx** (client) — fixed nav showing the `powerstar-logo.png` lockup (44px tall, 38px
  scrolled). `.scrolled` state adds the blur background; the menu links are hidden over the
  hero (`.hide-links`) and fade in once `#journey` is scrolled past. Footer uses the same logo,
  inverted to white for the dark band.
- **CredStrip / About / Services / WhyUs / FinalCta / Footer** — server components.
- **BookingBand.tsx** (client) — canvas route-line decoration + booking widget → WhatsApp.
- **Faq.tsx** (client) — single-open accordion (grid-rows transition).
- **Reveal.tsx** (client) — IntersectionObserver fade-up wrapper (`.reveal` + `d1/d2/d3`).
- **WhatsAppFab.tsx**, **icons.tsx** — floating CTA + shared SVGs.

All copy/contacts/services live in `lib/site.ts` (single source). WhatsApp `60126212929`,
tel `+603 3324 9788`, email `rain@powerstar.com.my`.

> Note: smooth-scroll is wired via Lenis in `app/providers.tsx`; the journey reads native
> scroll position so it works with Lenis. The concept's host-only "tweaks panel" (theme
> switcher via postMessage) was intentionally dropped — theme is fixed via `data-theme`.

## Ecosystem

Part of [[Standalone]] — see Second Brain hub.

## Conventions

- Server Components by default. Add `'use client'` only when state, effects, or browser APIs are required.
- Data fetching in Server Components via `fetch` with appropriate `cache`/`next.revalidate` options.
- Mutations via Server Actions.
- File structure: route segments under `app/`, shared components under `components/`, UI primitives from shadcn under `components/ui/`.
- Smooth scroll + scroll-driven animation are pre-wired in `app/providers.tsx` (`<ReactLenis root>` + GSAP ticker driving `ScrollTrigger`). Use `useGSAP` + `ScrollTrigger` for scroll work; Lenis already feeds the ticker.

## Skills to use

- `/blockbuster` — rebuild the hero + landing sections from the design reference (motion-heavy)
- `gsap-scrolltrigger`, `gsap-react`, `lenis`, `motion-framer` — animation (Lenis already wired in `app/providers.tsx`)
- `react-three-fiber`, `threejs-webgl` — 3D scenes
- `vercel:shadcn` — adding more shadcn primitives
- `/taster` — run before deploying to production

## Environment

Copy `.env.example` to `.env.local` and fill in values before running.
