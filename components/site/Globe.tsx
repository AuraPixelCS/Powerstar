"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";

type ProgressRef = { current: number };

const R = 1; // earth radius

// lat/lng -> point on sphere
function latLng(lat: number, lng: number, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const HUB = { lat: 3.0, lng: 101.4 }; // Port Klang, Malaysia
const DESTS = [
  { lat: 19.0, lng: 72.8 }, // India (Nhava Sheva)
  { lat: 25.0, lng: 55.1 }, // Dubai
  { lat: 31.2, lng: 121.5 }, // Shanghai
  { lat: 35.7, lng: 139.7 }, // Tokyo
  { lat: -33.9, lng: 151.2 }, // Sydney
  { lat: 51.9, lng: 4.5 }, // Rotterdam (wraps over the top)
];

function Arcs({ progressRef }: { progressRef: ProgressRef }) {
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
        .multiplyScalar(R + dist * 0.55 + 0.12);
      const pts = new THREE.QuadraticBezierCurve3(start.clone(), mid, end).getPoints(120);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      geom.setDrawRange(0, 0);
      const color = i % 3 === 2 ? "#f2b23c" : "#ff3030";
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geom, mat);
      return { line, geom, total: pts.length, startAt: 0.12 + i * 0.08 };
    });
  }, []);

  useFrame(() => {
    const p = progressRef.current;
    for (const a of arcs) {
      const ap = THREE.MathUtils.clamp((p - a.startAt) / 0.22, 0, 1);
      a.geom.setDrawRange(0, Math.floor(ap * a.total));
    }
  });

  return (
    <group>
      {arcs.map((a, i) => (
        <primitive key={i} object={a.line} />
      ))}
    </group>
  );
}

function Earth({ progressRef }: { progressRef: ProgressRef }) {
  const [day, clouds, normal, spec] = useTexture([
    "/textures/earth_atmos_2048.jpg",
    "/textures/earth_clouds_1024.png",
    "/textures/earth_normal_2048.jpg",
    "/textures/earth_specular_2048.jpg",
  ]);
  day.colorSpace = THREE.SRGBColorSpace;

  const earthGroup = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color("#5aa9ff") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vN; uniform vec3 glowColor; void main(){ float i = pow(1.0 - abs(vN.z), 2.6); gl_FragColor = vec4(glowColor, i); }`,
        blending: THREE.AdditiveBlending,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state) => {
    const p = progressRef.current;
    const t = state.clock.elapsedTime;
    // gentle reveal pull-back, then hold
    const ease = THREE.MathUtils.smoothstep(p, 0, 0.5);
    camera.position.z = THREE.MathUtils.lerp(2.5, 3.05, ease);
    camera.lookAt(0, 0, 0);
    // Malaysia faces camera (base yaw ~PI) + very slow continuous drift
    if (earthGroup.current) earthGroup.current.rotation.y = Math.PI + t * 0.014;
    if (cloudRef.current) cloudRef.current.rotation.y = Math.PI + t * 0.02;
  });

  return (
    // offset right so the hero headline (left) stays clear
    <group position={[0.42, -0.05, 0]}>
      <group ref={earthGroup}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial
            map={day}
            normalMap={normal}
            roughnessMap={spec}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
        <Arcs progressRef={progressRef} />
      </group>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[R * 1.012, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh material={atmosphereMat}>
        <sphereGeometry args={[R * 1.18, 64, 64]} />
      </mesh>
    </group>
  );
}

export function Globe({ progressRef }: { progressRef: ProgressRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 34 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#04060d", 1);
        scene.background = new THREE.Color("#04060d");
      }}
    >
      <ambientLight intensity={0.22} />
      <directionalLight position={[5, 3, 5]} intensity={2.6} color="#fff4e6" />
      <Stars radius={60} depth={30} count={2600} factor={3.5} saturation={0} fade speed={0.4} />
      <Suspense fallback={null}>
        <Earth progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
