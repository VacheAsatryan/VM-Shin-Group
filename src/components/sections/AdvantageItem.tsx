"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { AdvantageConfigItem } from "@/config/advantages";
import { fadeInUp, reducedMotionVariants } from "@/config/animations";

interface AdvantageItemProps {
  item: AdvantageConfigItem;
}

export default function AdvantageItem({ item }: AdvantageItemProps) {
  const t = useTranslations("advantages.items");
  const prefersReducedMotion = useReducedMotion();

  const cardVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-custom bg-surface-elevated/40 backdrop-blur-md border border-white/5 hover:border-primary-yellow/30 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-glow/20 hover:-translate-y-1"
    >
      {/* Top thin yellow accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Industrial structural corner lines */}
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/10 group-hover:border-primary-yellow/40 transition-colors pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/10 group-hover:border-primary-yellow/40 transition-colors pointer-events-none" />

      {/* Large subtle architectural number in background */}
      <span
        aria-hidden="true"
        className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-black text-white/[0.04] group-hover:text-primary-yellow/[0.08] transition-colors duration-500 select-none font-mono tracking-tighter"
      >
        {item.number}
      </span>

      {/* Header element: small yellow indicator badge */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-primary-yellow/30 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-primary-yellow tracking-widest">
            {item.number}
          </span>
        </div>
      </div>

      {/* Body: Title and Description */}
      <div className="relative z-10">
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-text-primary group-hover:text-primary-yellow transition-colors mb-3">
          {t(`${item.key}.title`)}
        </h3>

        {/* Accent line separator */}
        <div className="w-8 h-[2px] bg-primary-yellow/40 group-hover:w-16 group-hover:bg-primary-yellow transition-all duration-500 mb-4" />

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
          {t(`${item.key}.description`)}
        </p>
      </div>
    </motion.div>
  );
}
