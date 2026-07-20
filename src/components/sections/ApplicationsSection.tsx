"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { APPLICATIONS } from "@/config/applications";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";
import ApplicationMedia from "./ApplicationMedia";
import ApplicationList from "./ApplicationList";

export default function ApplicationsSection() {
  const t = useTranslations("applications");
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(APPLICATIONS[0].id);

  const containerVariants = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  const activeItem = APPLICATIONS.find((item) => item.id === activeId) || APPLICATIONS[0];

  return (
    <section
      id="applications"
      className="relative z-20 pt-20 pb-28 w-full border-t border-white/5 overflow-hidden"
      aria-labelledby="applications-heading"
    >
      {/* Soft gradient transition connecting from section above */}
      <div
        className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background/90 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-12"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
              <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase font-mono">
                {t("eyebrow")}
              </p>
            </div>

            {/* Title */}
            <h2
              id="applications-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary uppercase tracking-tight leading-tight mb-4"
            >
              {t("title")}
            </h2>

            {/* Accent line separator */}
            <div className="h-0.5 w-14 bg-primary-yellow mb-6" />

            {/* Description */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {t("description")}
            </p>
          </motion.div>

          {/* Asymmetric Editorial Grid: Featured Media + Application Categories List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Featured Visual Panel (Desktop ~58% / 7 cols) */}
            <motion.div variants={itemVariants} className="lg:col-span-7 sticky top-28">
              <ApplicationMedia activeItem={activeItem} />
            </motion.div>

            {/* Categories Selector List (Desktop ~42% / 5 cols) */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <ApplicationList
                items={APPLICATIONS}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </motion.div>
          </div>

          {/* Supporting Statement Banner */}
          <motion.div
            variants={itemVariants}
            className="p-6 sm:p-8 rounded-xl bg-surface-elevated/60 backdrop-blur-md border border-primary-yellow/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-yellow shrink-0 animate-pulse" />
              <p className="text-sm sm:text-base font-semibold text-text-primary">
                {t("supporting")}
              </p>
            </div>
            <div className="shrink-0 text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase px-3 py-1 rounded bg-primary-yellow/10 border border-primary-yellow/20">
              VM SHIN GROUP
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
