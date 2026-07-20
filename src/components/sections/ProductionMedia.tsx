"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { PRODUCTION_CONFIG } from "@/config/production";
import { scaleUp, reducedMotionVariants } from "@/config/animations";

export default function ProductionMedia() {
  const t = useTranslations("production");
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? reducedMotionVariants : scaleUp;

  return (
    <motion.div variants={variants} className="relative w-full">
      {/* Main Production Media Framing Container */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-custom overflow-hidden border border-white/10 bg-surface shadow-2xl group">
        {/* Main Production Image */}
        <Image
          src={PRODUCTION_CONFIG.mainImage}
          alt={t(PRODUCTION_CONFIG.imageAltKey)}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover opacity-90 group-hover:scale-102 transition-transform duration-700"
          priority
        />

        {/* Subtle Dark Gradient Overlay for Contrast & Industrial Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Architectural Golden Corner Lines */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary-yellow/60 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary-yellow/60 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary-yellow/60 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary-yellow/60 pointer-events-none" />

        {/* Restrained Industrial Information Label Badge */}
        <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-custom bg-black/70 backdrop-blur-md border border-primary-yellow/30 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t(PRODUCTION_CONFIG.badgeKey)}
          </span>
        </div>
      </div>

      {/* Secondary Accent Detail Image (Overlapping Desktop Floating Card) */}
      <div className="hidden sm:block absolute -bottom-6 -right-6 w-48 sm:w-56 aspect-[4/3] rounded-custom overflow-hidden border border-primary-yellow/30 bg-surface-elevated shadow-glow/30 z-20">
        <Image
          src={PRODUCTION_CONFIG.secondaryImage}
          alt={t(PRODUCTION_CONFIG.imageAltKey)}
          fill
          sizes="224px"
          className="object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </motion.div>
  );
}
