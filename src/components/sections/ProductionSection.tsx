"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { PRODUCTION_CONFIG } from "@/config/production";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";
import { LinkButton } from "@/components/ui/Button";
import ProductionMedia from "./ProductionMedia";
import ProductionFact from "./ProductionFact";

export default function ProductionSection() {
  const t = useTranslations("production");
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <section
      id="production"
      className="relative z-20 pt-20 pb-28 w-full border-t border-gold-border/30 overflow-hidden"
      aria-labelledby="production-heading"
    >
      <div id="about" className="absolute -top-24 left-0" aria-hidden="true" />
      {/* Background Subtle Radial Warm Glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/10 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          {/* Left Column (Desktop ~58% width): Production Media */}
          <div className="lg:col-span-7">
            <ProductionMedia />
          </div>

          {/* Right Column (Desktop ~42% width): Content & Supporting Facts */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
              <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase font-mono">
                {t("eyebrow")}
              </p>
            </div>

            {/* Title */}
            <h2
              id="production-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary uppercase tracking-tight leading-tight mb-6"
            >
              {t("title")}
            </h2>

            {/* Divider */}
            <div className="h-0.5 w-14 bg-primary-yellow mb-6" />

            {/* Description */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-8">
              {t("description")}
            </p>

            {/* Supporting Facts List */}
            <div className="flex flex-col gap-4 mb-8">
              {PRODUCTION_CONFIG.facts.map((fact) => (
                <ProductionFact key={fact.id} fact={fact} />
              ))}
            </div>

            {/* Primary CTA Button */}
            <div>
              <LinkButton href="#contact" variant="primary">
                {t("primaryCta")}
              </LinkButton>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
