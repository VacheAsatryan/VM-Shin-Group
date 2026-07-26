"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";

interface Firefly {
  id: number;
  size: number;
  left: number; // percentage
  top: number; // percentage
  duration: number; // seconds
  delay: number; // seconds
  tx1: number; // drift offset x 1
  ty1: number; // drift offset y 1
  tx2: number; // drift offset x 2
  ty2: number; // drift offset y 2
  glowRadius: number;
}

export default function FirefliesBackground() {
  const prefersReducedMotion = useReducedMotion();

  // Generate deterministic particle configurations on client render
  const fireflies = useMemo<Firefly[]>(() => {
    const count = 35;
    const list: Firefly[] = [];

    // Simple pseudo-random helper for consistent generation
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        size: Math.floor(random() * 5) + 2, // 2px to 6px
        left: Math.floor(random() * 96) + 2, // 2% to 98%
        top: Math.floor(random() * 96) + 2, // 2% to 98%
        duration: Math.floor(random() * 10) + 12, // 12s to 22s float cycle
        delay: Number((random() * 5).toFixed(2)), // 0s to 5s delay
        tx1: Math.floor(random() * 160) - 80, // -80px to +80px
        ty1: Math.floor(random() * 160) - 80,
        tx2: Math.floor(random() * 200) - 100, // -100px to +100px
        ty2: Math.floor(random() * 200) - 100,
        glowRadius: Math.floor(random() * 12) + 8, // 8px to 20px
      });
    }

    return list;
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {fireflies.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-primary-yellow animate-firefly"
          style={{
            width: `${f.size}px`,
            height: `${f.size}px`,
            left: `${f.left}%`,
            top: `${f.top}%`,
            boxShadow: `0 0 ${f.glowRadius}px var(--gold-primary), 0 0 ${f.glowRadius * 2}px var(--gold-bright)`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            // Custom CSS variables for chaotic individual trajectories
            ["--tx1" as string]: `${f.tx1}px`,
            ["--ty1" as string]: `${f.ty1}px`,
            ["--tx2" as string]: `${f.tx2}px`,
            ["--ty2" as string]: `${f.ty2}px`,
          }}
        />
      ))}
    </div>
  );
}
