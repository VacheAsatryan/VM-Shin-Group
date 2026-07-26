"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ProductionFactItem } from "@/config/production";
import { fadeInUp, reducedMotionVariants } from "@/config/animations";

interface ProductionFactProps {
  fact: ProductionFactItem;
}

export default function ProductionFact({ fact }: ProductionFactProps) {
  const t = useTranslations("production.facts");
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <motion.div
      variants={variants}
      className="group relative flex items-start gap-5 p-5 rounded-custom bg-surface-elevated/30 backdrop-blur-md border border-gold-border hover:border-primary-yellow/30 transition-all duration-300 shadow-md hover:bg-surface-elevated/50"
    >
      {/* Number Badge */}
      <div className="flex-none flex items-center justify-center w-10 h-10 rounded-custom bg-white/5 border border-gold-border group-hover:border-primary-yellow/40 group-hover:bg-primary-yellow/10 transition-all">
        <span className="font-mono text-xs font-bold text-primary-yellow tracking-wider">
          {fact.number}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-text-primary group-hover:text-primary-yellow transition-colors mb-1 truncate">
          {t(`${fact.key}.title`)}
        </h4>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
          {t(`${fact.key}.description`)}
        </p>
      </div>

      {/* Vertical accent line indicator on right edge */}
      <div className="w-0.5 h-6 bg-primary-yellow/20 group-hover:bg-primary-yellow transition-colors self-center rounded-full" />
    </motion.div>
  );
}
