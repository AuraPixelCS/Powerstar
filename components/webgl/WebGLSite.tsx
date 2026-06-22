"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ScrollControls,
  Scroll,
  useScroll,
  Text,
  Stars,
  useTexture,
  AdaptiveDpr,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const DISPLAY = "/fonts/SchibstedGrotesk.ttf";
const BODY = "/fonts/HankenGrotesk.ttf";

const RED = "#ff2a2a";
const GOLD = "#f2b23c";
const INK = "#aeb8c4";

const PAGES = 4;

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
const HUB = { lat: 3.0, lng: 101.4 };
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
      const mid = start
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(Rg + dist * 0.55 + 0.12);
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
    // arcs draw across the hero page (scroll range 0..1 of page 0)
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

/* ---------------- sections ---------------- */
function Hero() {
  const { width, height } = useThree((s) => s.viewport);
  const big = Math.min(width * 0.058, 0.74);
  const x = -width * 0.5 + width * 0.07;
  return (
    <group>
      <GlobeGroup scale={Math.min(width, height) * 0.38} position={[width * 0.34, 0, -2.4]} />
      <Text font={DISPLAY} fontSize={big * 0.42} color={RED} anchorX="left" position={[x, big * 1.05, 0]}
        outlineWidth={big * 0.004} outlineColor={RED} letterSpacing={-0.02}>
        TOTAL LOGISTICS — KLANG, MY
      </Text>
      <Text font={DISPLAY} fontSize={big} color="#ffffff" anchorX="left" lineHeight={1.02}
        position={[x, 0, 0]} outlineWidth={big * 0.01} outlineColor="#ffffff" letterSpacing={-0.03}
        maxWidth={width * 0.5}>
        Guiding your cargo
      </Text>
      <Text font={DISPLAY} fontSize={big} color={RED} anchorX="left" position={[x, -big * 1.12, 0]}
        outlineWidth={big * 0.01} outlineColor={RED} letterSpacing={-0.03}>
        with respect.
      </Text>
      <Text font={BODY} fontSize={big * 0.2} color={INK} anchorX="left" maxWidth={width * 0.4}
        position={[x, -big * 2.0, 0]} lineHeight={1.4}>
        Your end-to-end logistics partner for Malaysia and the world — sea, air and land freight,
        delivered with a measurable commitment to sustainable practice.
      </Text>
    </group>
  );
}

function Services() {
  const { width, height } = useThree((s) => s.viewport);
  const y = -height; // page 1
  const items = ["Sea Freight", "Air Freight", "Domestic", "Warehouse", "Cargo Insurance", "Halal Logistics"];
  const cols = 3;
  const cw = (width * 0.78) / cols;
  const ch = cw * 0.62;
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
            <mesh>
              <planeGeometry args={[cw * 0.9, ch]} />
              <meshStandardMaterial color="#0e141f" roughness={0.6} metalness={0.1} />
            </mesh>
            <Text font={DISPLAY} fontSize={cw * 0.1} color="#ffffff" anchorX="center" position={[0, 0, 0.02]}>
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function FinalCta() {
  const { width, height } = useThree((s) => s.viewport);
  return (
    <group position={[0, -height * (PAGES - 1), 0]}>
      <Text font={DISPLAY} fontSize={Math.min(width * 0.08, 1.0)} color="#ffffff" anchorX="center"
        position={[0, 0.4, 0]} outlineWidth={0.01} outlineColor="#ffffff" letterSpacing={-0.035} textAlign="center" maxWidth={width * 0.8}>
        Let&apos;s get your goods moving.
      </Text>
      <Text font={BODY} fontSize={Math.min(width * 0.02, 0.18)} color={GOLD} anchorX="center" position={[0, -0.55, 0]}>
        rain@powerstar.com.my   ·   +603 3324 9788
      </Text>
    </group>
  );
}

function Rig() {
  const scroll = useScroll();
  useFrame((state) => {
    // subtle parallax tilt as you scroll
    const o = scroll.offset;
    state.camera.position.x = Math.sin(o * Math.PI) * 0.15;
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
        scene.fog = new THREE.FogExp2("#05070d", 0.06);
      }}
      style={{ position: "fixed", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 5]} intensity={2.4} color="#fff4e6" />
      <Stars radius={80} depth={40} count={3000} factor={4} saturation={0} fade speed={0.3} />
      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.18}>
          <Rig />
          <Scroll>
            <Hero />
            <Services />
            <FinalCta />
          </Scroll>
        </ScrollControls>
      </Suspense>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
