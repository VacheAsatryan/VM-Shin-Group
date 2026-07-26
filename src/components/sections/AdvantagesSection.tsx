"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ADVANTAGES } from "@/config/advantages";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";
import AdvantageItem from "./AdvantageItem";

export default function AdvantagesSection() {
  const t = useTranslations("advantages");
  const prefersReducedMotion = useReducedMotion();

  const container = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const header = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <section
      id="about"
      className="relative z-20 pt-16 pb-24 w-full border-t border-gold-border"
      aria-labelledby="advantages-heading"
    >
      {/* Soft gradient transition connecting from Product Carousel above */}
      <div
        className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background/90 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start"
        >
          {/* Left Column: Asymmetric Editorial Section Header */}
          <motion.div
            variants={header}
            className="lg:col-span-4 flex flex-col justify-between sticky top-28"
          >
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
                <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase font-mono">
                  {t("eyebrow")}
                </p>
              </div>

              {/* Main Title */}
              <h2
                id="advantages-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary uppercase tracking-tight leading-tight mb-6"
              >
                {t("title")}
              </h2>

              {/* Yellow Divider Accent */}
              <div className="h-0.5 w-14 bg-primary-yellow mb-6" />

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md">
                {t("description")}
              </p>
            </div>
          </motion.div>

          {/* Right Column: 2x2 Architectural Advantage Panels */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ADVANTAGES.map((item) => (
              <AdvantageItem key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
