"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars, useTexture, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  STATS, WHY, FAQ, WA_QUOTE, TEL, TEL_HREF, EMAIL, ADDRESS,
} from "@/lib/site";

type PRef = RefObject<number>;

/* ---- type system (editorial / exaggerated minimalism on dark) ---- */
const DISPLAY = "/fonts/SchibstedGrotesk.ttf";
const BODY = "/fonts/HankenGrotesk.ttf";
const WHITE = "#f5f7fa";
const INK = "#93a1b2";
const RED = "#ff2e2e";
const GOLD = "#f4b740";
const CARD = "#0d1422";

const open = (url: string) => window.open(url, "_blank", "noopener");
const useVP = () => useThree((s) => s.viewport);

const SERVICES = [
  { t: "Sea Freight", d: "Full-container, LCL & break-bulk across every trade lane." },
  { t: "Air Freight", d: "Speed & security for urgent, sensitive cargo." },
  { t: "Domestic Distribution", d: "Last-mile, door-to-door with live updates." },
  { t: "Warehouse", d: "Secure, flexible storage & inventory support." },
  { t: "Cargo Insurance", d: "All-risk protection against loss or damage." },
  { t: "Book & Plan", d: "Scheduling that meets your buyers' deadlines." },
  { t: "Transparent Pricing", d: "All-inclusive quotes, every step covered." },
  { t: "Halal Logistics", d: "Certified Halal integrity, customs to delivery." },
];

/* ---------------- globe ---------------- */
const Rg = 1;
function latLng(lat: number, lng: number, r = Rg) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
const HUB = { lat: 3, lng: 101.4 };
const DESTS = [
  { lat: 19, lng: 72.8 }, { lat: 25, lng: 55.1 }, { lat: 31.2, lng: 121.5 },
  { lat: 35.7, lng: 139.7 }, { lat: -33.9, lng: 151.2 }, { lat: 51.9, lng: 4.5 },
];

function GlobeGroup({ progressRef, scale, position }: { progressRef: PRef; scale: number; position: [number, number, number] }) {
  const [day, clouds, normal, spec] = useTexture([
    "/textures/earth_atmos_2048.jpg", "/textures/earth_clouds_1024.png",
    "/textures/earth_normal_2048.jpg", "/textures/earth_specular_2048.jpg",
  ]);
  day.colorSpace = THREE.SRGBColorSpace;
  const earth = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const atmosphere = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color("#4aa3ff") } },
    vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec3 vN;uniform vec3 c;void main(){float i=pow(1.0-abs(vN.z),2.6);gl_FragColor=vec4(c,i);}`,
    blending: THREE.AdditiveBlending, transparent: true, side: THREE.BackSide, depthWrite: false,
  }), []);

  const arcs = useMemo(() => {
    const start = latLng(HUB.lat, HUB.lng);
    return DESTS.map((d, i) => {
      const end = latLng(d.lat, d.lng);
      const dist = start.distanceTo(end);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(Rg + dist * 0.55 + 0.12);
      const pts = new THREE.QuadraticBezierCurve3(start.clone(), mid, end).getPoints(120);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      geom.setDrawRange(0, 0);
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(i % 3 === 2 ? GOLD : RED), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      return { line: new THREE.Line(geom, mat), geom, total: pts.length, startAt: 0.02 + i * 0.012 };
    });
  }, []);

  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.05;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.065;
    const p = progressRef.current ?? 0;
    for (const a of arcs) {
      const ap = THREE.MathUtils.clamp((p - a.startAt) / 0.04, 0, 1);
      a.geom.setDrawRange(0, Math.floor(ap * a.total));
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={earth} rotation={[0, Math.PI, 0]}>
        <mesh>
          <sphereGeometry args={[Rg, 64, 64]} />
          <meshStandardMaterial map={day} normalMap={normal} roughnessMap={spec} roughness={0.85} metalness={0.05} />
        </mesh>
        <group>{arcs.map((a, i) => <primitive key={i} object={a.line} />)}</group>
      </group>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[Rg * 1.012, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh material={atmosphere}><sphereGeometry args={[Rg * 1.18, 64, 64]} /></mesh>
    </group>
  );
}

/* ---------------- button ---------------- */
function Button3D({ label, onClick, position, width, height, color = RED, text = "#ffffff" }: {
  label: string; onClick: () => void; position: [number, number, number]; width: number; height: number; color?: string; text?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <group position={position} scale={hover ? 1.05 : 1}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}>
      <RoundedBox args={[width, height, 0.08]} radius={height * 0.45} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.55 : 0.28} roughness={0.4} />
      </RoundedBox>
      <Text font={DISPLAY} fontSize={height * 0.36} color={text} anchorX="center" anchorY="middle" position={[0, 0, 0.06]} letterSpacing={-0.01}>
        {label}
      </Text>
    </group>
  );
}

/* small helpers for consistent type */
function Eyebrow({ children, x, y }: { children: string; x: number; y: number }) {
  const { width } = useVP();
  return (
    <Text font={BODY} fontSize={width * 0.0105} color={RED} anchorX="left" anchorY="middle" position={[x, y, 0]} letterSpacing={0.28}>
      {children.toUpperCase()}
    </Text>
  );
}

/* ---------------- nav (fixed HUD) ---------------- */
function Nav() {
  const { width, height } = useVP();
  const logo = useTexture("/powerstar-logo.png");
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { map: { value: logo } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D map;varying vec2 vUv;void main(){float a=texture2D(map,vUv).a;gl_FragColor=vec4(1.0,1.0,1.0,a);}`,
    transparent: true, depthTest: false, depthWrite: false,
  }), [logo]);
  const lw = Math.min(width * 0.22, 2.4);
  const lh = lw * (202 / 1762);
  return (
    <mesh material={mat} renderOrder={20} position={[-width / 2 + lw / 2 + width * 0.045, height / 2 - lh / 2 - height * 0.06, 1]}>
      <planeGeometry args={[lw, lh]} />
    </mesh>
  );
}

/* ---------------- sections ---------------- */
function Hero({ progressRef }: { progressRef: PRef }) {
  const { width, height } = useVP();
  const big = Math.min(width * 0.046, 0.52);
  const lh = big * 1.02;
  const x = -width / 2 + width * 0.08;
  const top = lh * 0.95; // headline top
  return (
    <group position={[0, height * 0.06, 0]}>
      <GlobeGroup progressRef={progressRef} scale={Math.min(width, height) * 0.36} position={[width * 0.33, -height * 0.04, -2.6]} />
      <Eyebrow x={x} y={top + lh * 0.7}>Total Logistics · Est. 2012 · Klang, MY</Eyebrow>
      <Text font={DISPLAY} fontSize={big} color={WHITE} anchorX="left" anchorY="top" lineHeight={1.02} position={[x, top, 0]}
        outlineWidth={big * 0.012} outlineColor={WHITE} letterSpacing={-0.04} maxWidth={width * 0.6}>
        {"Guiding your\ncargo"}
      </Text>
      <Text font={DISPLAY} fontSize={big} color={RED} anchorX="left" anchorY="top" position={[x, top - 2 * lh - lh * 0.08, 0]}
        outlineWidth={big * 0.012} outlineColor={RED} letterSpacing={-0.04}>
        with respect.
      </Text>
      <Text font={BODY} fontSize={width * 0.0145} color={INK} anchorX="left" anchorY="top" maxWidth={width * 0.33}
        position={[x, top - 3 * lh - big * 0.4, 0]} lineHeight={1.5}>
        Your end-to-end logistics partner for Malaysia and the world — sea, air and land freight.
      </Text>
      <Button3D label="Get a quote" onClick={() => open(WA_QUOTE)} position={[x + big * 1.15, top - 4.7 * lh, 0.2]} width={big * 2.3} height={big * 0.56} />
    </group>
  );
}

function Stats({ page }: { page: number }) {
  const { width, height } = useVP();
  const x = -width / 2 + width * 0.08;
  const colW = (width * 0.84) / 4;
  const sx = -((4 - 1) / 2) * colW;
  return (
    <group position={[0, -page * height, 0]}>
      <Eyebrow x={x} y={height * 0.3}>About Power Star</Eyebrow>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.038, 0.46)} color={WHITE} anchorX="left" anchorY="top"
        position={[x, height * 0.24, 0]} outlineWidth={0.004} outlineColor={WHITE} letterSpacing={-0.03} maxWidth={width * 0.62} lineHeight={1.02}>
        Fluctuating demand won&apos;t slow you down.
      </Text>
      {STATS.map((s, i) => (
        <group key={s.cap} position={[sx + i * colW, -height * 0.08, 0]}>
          <Text font={DISPLAY} fontSize={colW * 0.32} color={i === 0 ? RED : WHITE} anchorX="center" anchorY="middle" letterSpacing={-0.035} outlineWidth={colW * 0.004} outlineColor={i === 0 ? RED : WHITE}>
            {s.num + s.sup}
          </Text>
          <Text font={BODY} fontSize={colW * 0.082} color={INK} anchorX="center" anchorY="top" position={[0, -colW * 0.28, 0]} maxWidth={colW * 0.82} textAlign="center" lineHeight={1.35}>
            {s.cap}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Services({ page }: { page: number }) {
  const { width, height } = useVP();
  const x = -width / 2 + width * 0.08;
  const cols = 4;
  const cw = (width * 0.84) / cols;
  const ch = cw * 0.74;
  const sx = -((cols - 1) / 2) * cw;
  return (
    <group position={[0, -page * height, 0]}>
      <Eyebrow x={x} y={height * 0.34}>Services</Eyebrow>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.038, 0.46)} color={WHITE} anchorX="left" anchorY="top"
        position={[x, height * 0.28, 0]} outlineWidth={0.004} outlineColor={WHITE} letterSpacing={-0.03}>
        All your logistics. One roof.
      </Text>
      {SERVICES.map((s, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const px = sx + col * cw, py = -height * 0.04 - row * (ch + cw * 0.1);
        return (
          <group key={s.t} position={[px, py, 0]}>
            <RoundedBox args={[cw * 0.92, ch, 0.05]} radius={0.06} smoothness={3}>
              <meshStandardMaterial color={CARD} roughness={0.7} metalness={0.05} />
            </RoundedBox>
            <Text font={DISPLAY} fontSize={cw * 0.085} color={WHITE} anchorX="left" anchorY="top" position={[-cw * 0.38, ch * 0.32, 0.04]} maxWidth={cw * 0.78} letterSpacing={-0.02} lineHeight={1.05}>
              {s.t}
            </Text>
            <Text font={BODY} fontSize={cw * 0.055} color={INK} anchorX="left" anchorY="top" position={[-cw * 0.38, -ch * 0.02, 0.04]} maxWidth={cw * 0.8} lineHeight={1.4}>
              {s.d}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function WhyUs({ page }: { page: number }) {
  const { width, height } = useVP();
  const x = -width / 2 + width * 0.08;
  return (
    <group position={[0, -page * height, 0]}>
      <Eyebrow x={x} y={height * 0.36}>Why Choose Us</Eyebrow>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.038, 0.46)} color={WHITE} anchorX="left" anchorY="top"
        position={[x, height * 0.3, 0]} outlineWidth={0.004} outlineColor={WHITE} letterSpacing={-0.03} maxWidth={width * 0.7}>
        We move better — measurably.
      </Text>
      {WHY.map((w, i) => {
        const ts = width * 0.022;
        const py = height * 0.1 - i * height * 0.22;
        return (
          <group key={w.n} position={[x, py, 0]}>
            <Text font={BODY} fontSize={width * 0.015} color={RED} anchorX="left" anchorY="top" position={[0, 0, 0]} letterSpacing={0.1}>{w.n}</Text>
            <Text font={DISPLAY} fontSize={ts} color={WHITE} anchorX="left" anchorY="top" position={[width * 0.055, 0, 0]} letterSpacing={-0.02}>{w.h}</Text>
            <Text font={BODY} fontSize={width * 0.0145} color={INK} anchorX="left" anchorY="top" position={[width * 0.055, -ts * 1.5, 0]} maxWidth={width * 0.52} lineHeight={1.45}>{w.p}</Text>
          </group>
        );
      })}
    </group>
  );
}

function Faq({ page }: { page: number }) {
  const { width, height } = useVP();
  const x = -width / 2 + width * 0.08;
  return (
    <group position={[0, -page * height, 0]}>
      <Eyebrow x={x} y={height * 0.38}>FAQ</Eyebrow>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.036, 0.44)} color={WHITE} anchorX="left" anchorY="top"
        position={[x, height * 0.32, 0]} outlineWidth={0.004} outlineColor={WHITE} letterSpacing={-0.03} maxWidth={width * 0.8}>
        The questions shippers actually ask.
      </Text>
      {FAQ.map((f, i) => {
        const py = height * 0.13 - i * height * 0.155;
        return (
          <group key={f.q} position={[x, py, 0]}>
            <Text font={DISPLAY} fontSize={width * 0.0185} color={WHITE} anchorX="left" anchorY="top" position={[0, 0, 0]} maxWidth={width * 0.82} letterSpacing={-0.015} lineHeight={1.1}>
              {f.q}
            </Text>
            <Text font={BODY} fontSize={width * 0.0125} color={INK} anchorX="left" anchorY="top" position={[0, -width * 0.026, 0]} maxWidth={width * 0.8} lineHeight={1.4}>
              {f.a}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function Contact({ page }: { page: number }) {
  const { width, height } = useVP();
  const big = Math.min(width * 0.052, 0.62);
  return (
    <group position={[0, -page * height, 0]}>
      <Text font={DISPLAY} fontSize={big} color={WHITE} anchorX="center" anchorY="middle" position={[0, big * 0.95, 0]}
        outlineWidth={big * 0.012} outlineColor={WHITE} letterSpacing={-0.035} textAlign="center" maxWidth={width * 0.7} lineHeight={1.0}>
        Let&apos;s get your goods moving.
      </Text>
      <Text font={BODY} fontSize={width * 0.015} color={INK} anchorX="center" anchorY="middle" position={[0, -big * 0.1, 0]} maxWidth={width * 0.5} textAlign="center" lineHeight={1.5}>
        {ADDRESS}
      </Text>
      <Text font={BODY} fontSize={width * 0.016} color={GOLD} anchorX="center" anchorY="middle" position={[0, -big * 0.5, 0]} letterSpacing={0.02}>
        {`${EMAIL}    ·    ${TEL}`}
      </Text>
      <Button3D label="Get a quote" onClick={() => open(WA_QUOTE)} position={[-big * 1.5, -big * 1.15, 0.2]} width={big * 2.5} height={big * 0.6} />
      <Button3D label="Call us" onClick={() => open(TEL_HREF)} position={[big * 1.5, -big * 1.15, 0.2]} width={big * 2.2} height={big * 0.6} color={CARD} text={GOLD} />
    </group>
  );
}

/* Force the renderer to EXACTLY the parent's known pixel size (passed from
   React state), so it never depends on R3F measuring a fixed/vw element. */
function SyncSize({ width, height }: { width: number; height: number }) {
  const setSize = useThree((s) => s.setSize);
  useEffect(() => {
    if (width > 0 && height > 0) setSize(width, height);
  }, [width, height, setSize]);
  return null;
}

function World({ progressRef, pages, children }: { progressRef: PRef; pages: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { height } = useVP();
  useFrame(() => {
    if (ref.current) ref.current.position.y = (progressRef.current ?? 0) * (pages - 1) * height;
  });
  return <group ref={ref}>{children}</group>;
}

export function WebGLSite({ progressRef, pages, width, height }: { progressRef: PRef; pages: number; width: number; height: number }) {
  return (
    <Canvas
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 42 }}
      resize={{ offsetSize: true }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#05070d");
        scene.fog = new THREE.FogExp2("#05070d", 0.045);
      }}
      style={{ width: `${width}px`, height: `${height}px`, display: "block" }}
    >
      <SyncSize width={width} height={height} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 3, 5]} intensity={2.4} color="#fff4e6" />
      <Stars radius={80} depth={40} count={2600} factor={4} saturation={0} fade speed={0.25} />
      <Suspense fallback={null}>
        <Nav />
        <World progressRef={progressRef} pages={pages}>
          <Hero progressRef={progressRef} />
          <Stats page={1} />
          <Services page={2} />
          <WhyUs page={3} />
          <Faq page={4} />
          <Contact page={5} />
        </World>
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.22} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  );
}
