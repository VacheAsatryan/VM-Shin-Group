"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import type { ApplicationConfigItem } from "@/config/applications";
import { fadeInUp, reducedMotionVariants } from "@/config/animations";

interface ApplicationItemProps {
  item: ApplicationConfigItem;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ApplicationItem({
  item,
  isSelected,
  onSelect,
}: ApplicationItemProps) {
  const t = useTranslations("applications");
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <motion.div variants={itemVariants}>
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={`application-panel-${item.id}`}
        id={`application-tab-${item.id}`}
        onClick={onSelect}
        onMouseEnter={onSelect}
        className={`w-full text-left p-4 sm:p-5 rounded-lg border transition-all duration-300 relative overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
          isSelected
            ? "bg-surface-elevated/90 border-gold-primary/60 shadow-gold-glow/20"
            : "bg-surface/50 border-gold-border/30 hover:border-gold-primary/50 hover:bg-surface-elevated/40"
        }`}
      >
        {/* Left vertical yellow accent bar for active item */}
        <div
          aria-hidden="true"
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-yellow to-primary-yellow-dark transition-all duration-300 ${
            isSelected ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50 group-hover:opacity-40 group-hover:scale-y-75"
          }`}
        />

        <div className="flex items-start justify-between gap-3 pl-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-primary-yellow tracking-wider">
                {item.number}
              </span>
              <h3
                className={`text-sm sm:text-base font-bold uppercase tracking-wider transition-colors ${
                  isSelected ? "text-primary-yellow" : "text-text-primary group-hover:text-primary-yellow-light"
                }`}
              >
                {t(`items.${item.key}.title`)}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
              {t(`items.${item.key}.description`)}
            </p>
          </div>

          {/* Indicator Dot / Chevron */}
          <div
            aria-hidden="true"
            className={`w-2 h-2 rounded-full mt-1.5 transition-all duration-300 ${
              isSelected ? "bg-primary-yellow shadow-[0_0_8px_#f5b800]" : "bg-white/20 group-hover:bg-primary-yellow/50"
            }`}
          />
        </div>
      </button>
    </motion.div>
  );
}
