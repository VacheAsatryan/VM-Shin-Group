"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ApplicationConfigItem } from "@/config/applications";

interface ApplicationMediaProps {
  activeItem: ApplicationConfigItem;
}

export default function ApplicationMedia({ activeItem }: ApplicationMediaProps) {
  const t = useTranslations("applications");
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      id={`application-panel-${activeItem.id}`}
      role="tabpanel"
      aria-labelledby={`application-tab-${activeItem.id}`}
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-surface shadow-2xl group"
    >
      {/* Background Subtle Industrial Overlay Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Dark Ambient Radial Glow */}
      <div
        className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Animated Crossfade Image Layer */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeItem.id}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.4, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={activeItem.image}
            alt={t(`items.${activeItem.key}.imageAlt`)}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Directional Vignette Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Architectural Corner Brackets */}
      <div
        className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary-yellow/60 z-30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary-yellow/60 z-30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary-yellow/60 z-30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary-yellow/60 z-30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Background Subtle Watermark Category Number */}
      <span
        aria-hidden="true"
        className="absolute top-4 right-6 text-7xl sm:text-8xl lg:text-9xl font-black text-white/[0.04] font-mono select-none z-20 pointer-events-none tracking-tighter"
      >
        {activeItem.number}
      </span>

      {/* Technical Category Overlay Badge (Bottom Left) */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-primary-yellow/30 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-primary-yellow uppercase">
              {t("technicalLabel")} • {activeItem.number}
            </span>
          </div>
          <h4 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-text-primary drop-shadow-md">
            {t(`items.${activeItem.key}.label`)}
          </h4>
        </div>
      </div>
    </div>
  );
}
