"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

export default function Hero() {
  const t = useTranslations("hero");
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoError, setVideoError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Attempt to play the video; handle blocked autoplay or missing files
  useEffect(() => {
    if (prefersReducedMotion) return;

    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => {
      setIsVideoLoaded(true);
      video.play().catch((err) => {
        console.warn("Video autoplay was blocked:", err);
        setVideoError(true);
      });
    };

    if (video.readyState >= 3) {
      handleLoad();
    } else {
      video.addEventListener("loadedmetadata", handleLoad, { once: true });
    }
  }, [prefersReducedMotion]);

  // Framer Motion variants — simplified when reduced motion is preferred
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0.03 : 0.18,
      },
    },
  };

  const itemVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 70, damping: 14 },
        },
      };

  const showVideo = !prefersReducedMotion && !videoError;
  const showPoster = !showVideo && !posterError;
  const showFallback = !showVideo && posterError;

  return (
    <section
      id="hero"
      className="relative min-h-[620px] h-[92vh] w-full flex items-center justify-start overflow-hidden bg-transparent border-b border-gold-border/30"
      aria-label="Welcome area"
    >
      {/* ── Background Media Layer ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Video (supports placeholder & production fallback paths) */}
        {showVideo && (
          <video
            ref={videoRef}
            poster="/images/hero-poster.jpg"
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-85" : "opacity-0"
            }`}
          >
            <source src="/media/hero-placeholder.mp4" type="video/mp4" />
            <source src="/media/hero-production.mp4" type="video/mp4" />
          </video>
        )}

        {/* Poster image fallback */}
        {showPoster && (
          <Image
            src="/images/hero-poster.jpg"
            alt="VM Shin Group production facility"
            fill
            priority
            className="object-cover opacity-65"
            onError={() => setPosterError(true)}
          />
        )}

        {/* Industrial geometric grid + cinematic animated gradient fallback when video & poster are missing */}
        {showFallback && (
          <div
            className="w-full h-full relative animated-hero-gradient-pulse"
            style={{
              backgroundImage: `
                linear-gradient(rgba(245,194,27,0.18) 1px, transparent 1px),
                linear-gradient(90deg, rgba(245,194,27,0.18) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        )}

        {/* Directional Overlay: Left strong dark for text legibility, Center/Right clear & visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent/20" />
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 relative mt-16 sm:mt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl text-left"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
            <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase">
              {t("eyebrow")}
            </p>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary uppercase tracking-tight leading-[1.1] mb-6"
          >
            {t("title")}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed mb-8 max-w-xl"
          >
            {t("description")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <LinkButton href="#products" variant="primary">
              {t("primaryBtn")}
            </LinkButton>
            <LinkButton href="#calculator" variant="secondary">
              {t("secondaryBtn")}
            </LinkButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Part 5 — Seamless transition blending Hero into the product carousel */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-background/70 to-background pointer-events-none z-10" />
    </section>
  );
}
