"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ScrollControls,
  Scroll,
  useScroll,
  Text,
  Stars,
  useTexture,
  RoundedBox,
  AdaptiveDpr,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { STATS, WHY, WA_QUOTE, TEL, TEL_HREF } from "@/lib/site";

const DISPLAY = "/fonts/SchibstedGrotesk.ttf";
const BODY = "/fonts/HankenGrotesk.ttf";
const RED = "#ff2a2a";
const GOLD = "#f2b23c";
const INK = "#aeb8c4";
const PAGES = 5;

const open = (url: string) => window.open(url, "_blank", "noopener");
const useViewport = () => useThree((s) => s.viewport);

/* ---------------- globe ---------------- */
const Rg = 1;
function latLng(lat: number, lng: number, r = Rg) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}
const HUB = { lat: 3, lng: 101.4 };
const DESTS = [
  { lat: 19, lng: 72.8 },
  { lat: 25, lng: 55.1 },
  { lat: 31.2, lng: 121.5 },
  { lat: 35.7, lng: 139.7 },
  { lat: -33.9, lng: 151.2 },
  { lat: 51.9, lng: 4.5 },
];

function GlobeGroup({ scale = 1.6, position = [0, 0, 0] as [number, number, number] }) {
  const [day, clouds, normal, spec] = useTexture([
    "/textures/earth_atmos_2048.jpg",
    "/textures/earth_clouds_1024.png",
    "/textures/earth_normal_2048.jpg",
    "/textures/earth_specular_2048.jpg",
  ]);
  day.colorSpace = THREE.SRGBColorSpace;
  const earth = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color("#4aa3ff") } },
        vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vN;uniform vec3 c;void main(){float i=pow(1.0-abs(vN.z),2.6);gl_FragColor=vec4(c,i);}`,
        blending: THREE.AdditiveBlending,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  const arcs = useMemo(() => {
    const start = latLng(HUB.lat, HUB.lng);
    return DESTS.map((d, i) => {
      const end = latLng(d.lat, d.lng);
      const dist = start.distanceTo(end);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(Rg + dist * 0.55 + 0.12);
      const pts = new THREE.QuadraticBezierCurve3(start.clone(), mid, end).getPoints(120);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      geom.setDrawRange(0, 0);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(i % 3 === 2 ? GOLD : RED),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      return { line: new THREE.Line(geom, mat), geom, total: pts.length, startAt: 0.12 + i * 0.08 };
    });
  }, []);

  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.05;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.065;
    const p = scroll.range(0, 1 / PAGES);
    for (const a of arcs) {
      const ap = THREE.MathUtils.clamp((p - a.startAt) / 0.22, 0, 1);
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
        <group>
          {arcs.map((a, i) => (
            <primitive key={i} object={a.line} />
          ))}
        </group>
      </group>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[Rg * 1.012, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh material={atmosphere}>
        <sphereGeometry args={[Rg * 1.18, 64, 64]} />
      </mesh>
    </group>
  );
}

/* ---------------- clickable button ---------------- */
function Button3D({
  label,
  onClick,
  position,
  width = 1.6,
  height = 0.42,
  color = RED,
  text = "#ffffff",
}: {
  label: string;
  onClick: () => void;
  position: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  text?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      scale={hover ? 1.05 : 1}
    >
      <RoundedBox args={[width, height, 0.08]} radius={height * 0.45} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover ? 0.5 : 0.25} roughness={0.4} />
      </RoundedBox>
      <Text font={DISPLAY} fontSize={height * 0.4} color={text} anchorX="center" anchorY="middle" position={[0, 0, 0.06]}>
        {label}
      </Text>
    </group>
  );
}

/* ---------------- fixed nav (HUD) ---------------- */
function Nav() {
  const { width, height } = useViewport();
  const logo = useTexture("/powerstar-logo.png");
  const whiteLogo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: logo } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `uniform sampler2D map;varying vec2 vUv;void main(){float a=texture2D(map,vUv).a;gl_FragColor=vec4(1.0,1.0,1.0,a);}`,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [logo],
  );
  const lw = Math.min(width * 0.24, 2.6);
  const lh = lw * (202 / 1762);
  return (
    <group renderOrder={10}>
      <mesh
        material={whiteLogo}
        position={[-width / 2 + lw / 2 + width * 0.04, height / 2 - lh / 2 - height * 0.06, 1]}
      >
        <planeGeometry args={[lw, lh]} />
      </mesh>
    </group>
  );
}

/* ---------------- sections ---------------- */
function Hero() {
  const { width, height } = useViewport();
  const big = Math.min(width * 0.058, 0.74);
  const x = -width * 0.5 + width * 0.07;
  return (
    <group>
      <GlobeGroup scale={Math.min(width, height) * 0.38} position={[width * 0.34, 0, -2.4]} />
      <Text font={DISPLAY} fontSize={big * 0.42} color={RED} anchorX="left" position={[x, big * 1.4, 0]} letterSpacing={0.04}>
        TOTAL LOGISTICS — KLANG, MY
      </Text>
      <Text font={DISPLAY} fontSize={big} color="#ffffff" anchorX="left" lineHeight={1.02} position={[x, big * 0.4, 0]}
        outlineWidth={big * 0.01} outlineColor="#ffffff" letterSpacing={-0.03} maxWidth={width * 0.5}>
        Guiding your cargo
      </Text>
      <Text font={DISPLAY} fontSize={big} color={RED} anchorX="left" position={[x, -big * 0.72, 0]}
        outlineWidth={big * 0.01} outlineColor={RED} letterSpacing={-0.03}>
        with respect.
      </Text>
      <Text font={BODY} fontSize={big * 0.2} color={INK} anchorX="left" maxWidth={width * 0.4} position={[x, -big * 1.55, 0]} lineHeight={1.4}>
        Your end-to-end logistics partner for Malaysia and the world — sea, air and land freight,
        delivered with a measurable commitment to sustainable practice.
      </Text>
      <Button3D label="Get a quote" onClick={() => open(WA_QUOTE)} position={[x + big * 1.1, -big * 2.5, 0.2]}
        width={big * 2.4} height={big * 0.6} />
    </group>
  );
}

function Stats() {
  const { width, height } = useViewport();
  const y = -height;
  const colW = (width * 0.84) / 4;
  const startX = -((4 - 1) / 2) * colW;
  return (
    <group position={[0, y, 0]}>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.045, 0.55)} color="#ffffff" anchorX="center"
        position={[0, height * 0.26, 0]} outlineWidth={0.005} outlineColor="#ffffff" letterSpacing={-0.03} textAlign="center" maxWidth={width * 0.8}>
        Fluctuating demand won&apos;t slow you down.
      </Text>
      {STATS.map((s, i) => (
        <group key={s.cap} position={[startX + i * colW, -height * 0.02, 0]}>
          <Text font={DISPLAY} fontSize={colW * 0.42} color={RED} anchorX="center" anchorY="middle" letterSpacing={-0.03}>
            {s.num + s.sup}
          </Text>
          <Text font={BODY} fontSize={colW * 0.085} color={INK} anchorX="center" anchorY="top" position={[0, -colW * 0.3, 0]} maxWidth={colW * 0.85} textAlign="center" lineHeight={1.3}>
            {s.cap}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Services() {
  const { width, height } = useViewport();
  const y = -height * 2;
  const items = ["Sea Freight", "Air Freight", "Domestic", "Warehouse", "Cargo Insurance", "Halal Logistics"];
  const cols = 3;
  const cw = (width * 0.78) / cols;
  const ch = cw * 0.6;
  const startX = -((cols - 1) / 2) * cw;
  return (
    <group position={[0, y, 0]}>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.05, 0.6)} color="#ffffff" anchorX="center"
        position={[0, height * 0.3, 0]} outlineWidth={0.006} outlineColor="#ffffff" letterSpacing={-0.03}>
        All your logistics. One roof.
      </Text>
      {items.map((label, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const px = startX + col * cw;
        const py = height * 0.05 - row * (ch + cw * 0.08);
        return (
          <group key={label} position={[px, py, 0]}>
            <RoundedBox args={[cw * 0.9, ch, 0.06]} radius={0.06} smoothness={3}>
              <meshStandardMaterial color="#0e141f" roughness={0.6} metalness={0.1} />
            </RoundedBox>
            <Text font={DISPLAY} fontSize={cw * 0.095} color="#ffffff" anchorX="center" position={[0, 0, 0.05]}>
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function WhyUs() {
  const { width, height } = useViewport();
  const y = -height * 3;
  const x = -width * 0.5 + width * 0.08;
  return (
    <group position={[0, y, 0]}>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.045, 0.5)} color="#ffffff" anchorX="left"
        position={[x, height * 0.36, 0]} outlineWidth={0.005} outlineColor="#ffffff" letterSpacing={-0.03} maxWidth={width * 0.6}>
        We move better — measurably.
      </Text>
      {WHY.map((w, i) => {
        const titleSize = width * 0.026;
        const py = height * 0.16 - i * height * 0.22;
        return (
          <group key={w.n} position={[x, py, 0]}>
            <Text font={BODY} fontSize={width * 0.015} color={RED} anchorX="left" anchorY="top" position={[0, 0, 0]}>
              {w.n}
            </Text>
            <Text font={DISPLAY} fontSize={titleSize} color="#ffffff" anchorX="left" anchorY="top" position={[width * 0.055, 0, 0]} letterSpacing={-0.02}>
              {w.h}
            </Text>
            <Text font={BODY} fontSize={width * 0.0145} color={INK} anchorX="left" anchorY="top" position={[width * 0.055, -titleSize * 1.5, 0]} maxWidth={width * 0.5} lineHeight={1.4}>
              {w.p}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function FinalCta() {
  const { width, height } = useViewport();
  const big = Math.min(width * 0.08, 1.0);
  return (
    <group position={[0, -height * (PAGES - 1), 0]}>
      <Text font={DISPLAY} fontSize={big} color="#ffffff" anchorX="center" position={[0, big * 0.7, 0]}
        outlineWidth={0.01} outlineColor="#ffffff" letterSpacing={-0.035} textAlign="center" maxWidth={width * 0.8} lineHeight={1.0}>
        Let&apos;s get your goods moving.
      </Text>
      <Button3D label="Get a quote" onClick={() => open(WA_QUOTE)} position={[-big * 1.85, -big * 0.5, 0.2]} width={big * 2.6} height={big * 0.6} />
      <Button3D label={TEL} onClick={() => open(TEL_HREF)} position={[big * 1.75, -big * 0.5, 0.2]} width={big * 2.7} height={big * 0.6} color="#0e141f" text={GOLD} />
    </group>
  );
}

function Rig() {
  const scroll = useScroll();
  useFrame((state) => {
    const o = scroll.offset;
    state.camera.position.x = Math.sin(o * Math.PI) * 0.12;
    state.camera.lookAt(0, state.camera.position.y, 0);
  });
  return null;
}

export function WebGLSite() {
  return (
    <Canvas
      gl={{ antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 42 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#05070d");
        scene.fog = new THREE.FogExp2("#05070d", 0.05);
      }}
      style={{ position: "fixed", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 5]} intensity={2.4} color="#fff4e6" />
      <Stars radius={80} depth={40} count={3000} factor={4} saturation={0} fade speed={0.3} />
      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.18}>
          <Rig />
          <Nav />
          <Scroll>
            <Hero />
            <Stats />
            <Services />
            <WhyUs />
            <FinalCta />
          </Scroll>
        </ScrollControls>
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette offset={0.2} darkness={0.85} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
