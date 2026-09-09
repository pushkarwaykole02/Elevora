"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type InterviewerCharacterState = "idle" | "speaking" | "listening" | "thinking";

interface ThreeAiCharacterProps {
  state: InterviewerCharacterState;
  isCodeQuestion?: boolean;
}

const STATE_LABELS: Record<InterviewerCharacterState, string> = {
  idle: "Ready",
  speaking: "Speaking",
  listening: "Listening to you",
  thinking: "Analyzing",
};

const STATE_COLORS: Record<InterviewerCharacterState, string> = {
  idle: "var(--color-on-surface-variant)",
  speaking: "var(--color-primary)",
  listening: "var(--color-tertiary)",
  thinking: "var(--color-secondary)",
};

export default function ThreeAiCharacter({ state, isCodeQuestion = false }: ThreeAiCharacterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const codeRef = useRef(isCodeQuestion);

  stateRef.current = state;
  codeRef.current = isCodeQuestion;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.12);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainLight.position.set(2, 4, 6);
    scene.add(mainLight);

    const primaryLight = new THREE.PointLight(0x00f1fe, 2.2, 12);
    primaryLight.position.set(-2.5, 2, 2);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0xd575ff, 1.6, 12);
    secondaryLight.position.set(2.5, -1.5, 2);
    scene.add(secondaryLight);

    const group = new THREE.Group();
    scene.add(group);

    const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      roughness: 0.15,
      metalness: 0.85,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    group.add(head);

    const facePlateGeo = new THREE.SphereGeometry(1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const facePlateMat = new THREE.MeshStandardMaterial({
      color: 0x0d1520,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const facePlate = new THREE.Mesh(facePlateGeo, facePlateMat);
    facePlate.position.y = 0.05;
    group.add(facePlate);

    const eyes = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0x00f1fe }));
    leftEye.position.set(-0.38, 0.22, 1.02);
    const rightEye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0x00f1fe }));
    rightEye.position.set(0.38, 0.22, 1.02);
    eyes.add(leftEye, rightEye);
    group.add(eyes);

    const mouthGeo = new THREE.BoxGeometry(0.48, 0.07, 0.06);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x00f1fe });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.38, 1.12);
    group.add(mouth);

    const rings = new THREE.Group();
    const haloGeo = new THREE.TorusGeometry(1.75, 0.045, 16, 100);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x00f1fe,
      emissive: 0x00f1fe,
      emissiveIntensity: 0.7,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2.4;
    rings.add(halo);

    const innerRingGeo = new THREE.TorusGeometry(1.45, 0.025, 12, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xd575ff,
      emissive: 0xd575ff,
      emissiveIntensity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.y = Math.PI / 3;
    rings.add(innerRing);
    group.add(rings);

    const particles = new THREE.Group();
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 48;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f1fe,
      size: 0.04,
      transparent: true,
      opacity: 0.55,
    });
    particles.add(new THREE.Points(particleGeo, particleMat));
    scene.add(particles);

    const clock = new THREE.Clock();
    let animId = 0;
    let blinkTimer = 0;
    let isBlinking = false;

    const accentColor = (code: boolean) => (code ? 0xffaa44 : 0x00f1fe);
    const accentSecondary = (code: boolean) => (code ? 0xff6600 : 0xd575ff);

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;
      const codeMode = codeRef.current;

      const primary = accentColor(codeMode);
      const secondary = accentSecondary(codeMode);

      group.position.y = Math.sin(elapsed * 1.2) * 0.12;

      blinkTimer += delta;
      if (blinkTimer > 3.5 + Math.sin(elapsed) * 0.5) {
        isBlinking = true;
        if (blinkTimer > 3.55) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      const eyeScaleY = isBlinking ? 0.15 : 1;
      eyes.children.forEach((eye) => {
        eye.scale.y = eyeScaleY;
        const mat = (eye as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.color.setHex(primary);
      });

      mouthMat.color.setHex(primary);
      (haloMat as THREE.MeshStandardMaterial).color.setHex(primary);
      (haloMat as THREE.MeshStandardMaterial).emissive.setHex(primary);
      (innerRingMat as THREE.MeshStandardMaterial).color.setHex(secondary);
      (innerRingMat as THREE.MeshStandardMaterial).emissive.setHex(secondary);
      primaryLight.color.setHex(primary);
      secondaryLight.color.setHex(secondary);
      (particleMat as THREE.PointsMaterial).color.setHex(primary);

      head.rotation.y = elapsed * 0.15;
      head.rotation.x = 0;

      switch (currentState) {
        case "speaking": {
          const talkWave = Math.sin(elapsed * 22);
          mouth.scale.y = 1 + Math.abs(talkWave) * 3;
          mouth.scale.x = 1 + Math.cos(elapsed * 11) * 0.25;
          rings.rotation.y = elapsed * 0.9;
          rings.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
          group.position.y += Math.sin(elapsed * 3) * 0.03;
          break;
        }
        case "listening": {
          mouth.scale.set(1, 1, 1);
          head.rotation.y = Math.sin(elapsed * 0.6) * 0.25;
          head.rotation.z = Math.sin(elapsed * 0.4) * 0.08;
          head.rotation.x = -0.12;
          const listenPulse = 1 + Math.sin(elapsed * 2.5) * 0.06;
          halo.scale.setScalar(listenPulse);
          innerRing.scale.setScalar(1.05 + Math.sin(elapsed * 3) * 0.04);
          rings.rotation.y = elapsed * 0.35;
          eyes.children.forEach((eye) => {
            eye.scale.x = 1.15;
          });
          break;
        }
        case "thinking": {
          mouth.scale.set(0.6, 1, 1);
          head.rotation.y = elapsed * 0.5;
          head.rotation.x = Math.sin(elapsed * 0.7) * 0.1;
          rings.rotation.y = elapsed * 0.15;
          rings.rotation.z = Math.sin(elapsed * 0.5) * 0.2;
          const thinkPulse = 0.85 + Math.sin(elapsed * 1.8) * 0.15;
          head.scale.setScalar(thinkPulse);
          particles.rotation.y = elapsed * 0.25;
          break;
        }
        default: {
          mouth.scale.set(1, 1, 1);
          head.scale.setScalar(1);
          head.rotation.x = 0;
          head.rotation.z = 0;
          eyes.children.forEach((eye) => {
            eye.scale.x = 1;
          });
          halo.scale.setScalar(1);
          innerRing.scale.setScalar(1);
          rings.rotation.y = elapsed * 0.4;
          rings.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
          particles.rotation.y = elapsed * 0.08;
          break;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      scene.clear();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div
        ref={containerRef}
        className="w-full flex-1 min-h-[180px] flex items-center justify-center relative overflow-hidden"
      />
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest border transition-colors duration-300"
        style={{
          color: STATE_COLORS[state],
          borderColor: `color-mix(in srgb, ${STATE_COLORS[state]} 40%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${STATE_COLORS[state]} 8%, transparent)`,
        }}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${state !== "idle" ? "animate-pulse" : ""}`}
          style={{ backgroundColor: STATE_COLORS[state] }}
        />
        {STATE_LABELS[state]}
        {isCodeQuestion && state === "idle" && (
          <span className="text-[var(--color-secondary)] normal-case tracking-normal">· Code mode</span>
        )}
      </div>
    </div>
  );
}
