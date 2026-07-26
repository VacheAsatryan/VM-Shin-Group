"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface DustParticle {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  opacity: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulseAngle: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
  color: string;
}

export default function IndustrialDustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Centralized metallic gold particle palette
    const colors = [
      "rgba(245, 194, 27, ",  // Metallic Gold (#F5C21B)
      "rgba(255, 226, 89, ",  // Luminous Gold (#FFE259)
      "rgba(224, 176, 24, ",  // Deep Warm Gold (#E0B018)
    ];

    const particleCount = Math.min(Math.floor((width * height) / 14000), 85);
    const particles: DustParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const layer = Math.random() < 0.45 ? 0 : Math.random() < 0.8 ? 1 : 2;
      // Increased base opacity for clear visibility on desktop
      const baseOpacity = layer === 0 ? 0.3 + Math.random() * 0.2 : layer === 1 ? 0.45 + Math.random() * 0.25 : 0.6 + Math.random() * 0.25;
      const radius = layer === 0 ? 1.2 + Math.random() * 0.8 : layer === 1 ? 2.0 + Math.random() * 1.0 : 2.8 + Math.random() * 1.2;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseOpacity,
        opacity: baseOpacity,
        vx: (Math.random() - 0.5) * (layer === 0 ? 0.2 : layer === 1 ? 0.35 : 0.5),
        vy: -(Math.random() * (layer === 0 ? 0.3 : layer === 1 ? 0.55 : 0.8) + 0.1),
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulseAngle: Math.random() * Math.PI * 2,
        layer,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      if (isPaused) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update particle drift
        p.x += p.vx + Math.sin(p.pulseAngle * 0.4) * 0.25;
        p.y += p.vy;

        // Desynchronized warm pulse
        p.pulseAngle += p.pulseSpeed;
        p.opacity = p.baseOpacity + Math.sin(p.pulseAngle) * (p.baseOpacity * 0.3);

        // Screen wrap
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.layer === 0) {
          // Far layer: soft amber glow
          ctx.fillStyle = `${p.color}${Math.max(0.1, p.opacity)})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(245, 184, 0, 0.4)";
        } else if (p.layer === 1) {
          // Mid layer: warm golden glow
          ctx.fillStyle = `${p.color}${Math.max(0.2, p.opacity)})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(245, 184, 0, 0.6)";
        } else {
          // Near layer: bright warm industrial particle
          ctx.fillStyle = `${p.color}${Math.max(0.3, p.opacity)})`;
          ctx.shadowBlur = 16;
          ctx.shadowColor = "rgba(255, 212, 90, 0.85)";
        }

        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      aria-hidden="true"
    />
  );
}
