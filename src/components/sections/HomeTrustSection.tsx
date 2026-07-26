"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, useReducedMotion } from "motion/react";
import { fadeInUp, reducedMotionVariants } from "@/config/animations";

export default function HomeTrustSection() {
  const t = useTranslations("documents");
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  const previewDocs = [
    {
      id: "verification-sb210-2kg-145302",
      image: "/images/documents/equipment-verification/verification-certificate-sb210-2kg-145302.webp",
      titleKey: "items.verificationSb2102kg145302.title",
    },
    {
      id: "verification-sb210-20kg-145306",
      image: "/images/documents/equipment-verification/verification-certificate-sb210-20kg-145306.webp",
      titleKey: "items.verificationSb21020kg145306.title",
    },
    {
      id: "appreciation-arstor-karine-85",
      image: "/images/documents/awards/appreciation-arstor-karine-85.webp",
      titleKey: "items.appreciationArstorKarine85.title",
    },
  ];

  return (
    <section className="py-20 border-t border-gold-border/30 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-primary/10 rounded-full blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12"
        >
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase mb-3 block">
              {t("homeTrust.title")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight max-w-2xl">
              {t("homeTrust.title")}
            </h2>
            <p className="text-sm text-text-secondary mt-3 max-w-xl">
              {t("homeTrust.text")}
            </p>
          </div>

          <Link 
            href="/documents"
            className="inline-flex items-center justify-center px-6 py-3 border border-primary-yellow/40 hover:border-primary-yellow bg-primary-yellow/5 hover:bg-primary-yellow text-primary-yellow hover:text-black font-mono text-xs uppercase tracking-wider rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow shrink-0"
          >
            {t("homeTrust.btn")}
          </Link>
        </motion.div>

        {/* 3 columns grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {previewDocs.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col bg-[#121212]/90 border border-gold-border/30 hover:border-gold-primary/50 hover:shadow-gold-glow/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              {/* Document Image Container */}
              <div className="relative aspect-[3/4] w-full bg-[#1c1c1c] p-4 flex items-center justify-center group-hover:bg-[#222] transition-colors duration-300">
                <div className="relative w-full h-full">
                  <Image
                    src={doc.image}
                    alt={t(`${doc.titleKey}`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Overlay link icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="px-4 py-2 bg-black/80 border border-primary-yellow/40 text-primary-yellow rounded-lg text-xs font-mono uppercase tracking-wider">
                    {t("actions.enlarge")}
                  </span>
                </div>
              </div>

              {/* Document Text */}
              <div className="p-5 flex flex-col justify-between flex-1 border-t border-gold-border/30">
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary-yellow transition-colors line-clamp-2">
                  {t(`${doc.titleKey}`)}
                </h3>
                <Link
                  href="/documents"
                  className="text-[11px] font-mono uppercase text-primary-yellow/70 group-hover:text-primary-yellow transition-colors mt-4 inline-flex items-center gap-1.5"
                >
                  {t("actions.open")} &rarr;
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
