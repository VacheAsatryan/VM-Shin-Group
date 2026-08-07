"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { COMPANY_DOCUMENTS, CompanyDocument } from "@/config/documents";
import PageBackLink from "@/components/ui/PageBackLink";

export default function DocumentsPageClient() {
  const t = useTranslations("documents");
  const [activeCategory, setActiveCategory] = useState<"all" | "equipment-verification" | "recognition">("all");
  const [selectedDoc, setSelectedDoc] = useState<CompanyDocument | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDoc(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock background scroll when lightbox is active
  useEffect(() => {
    if (selectedDoc) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDoc]);

  // Filtered documents
  const filteredDocs = COMPANY_DOCUMENTS.filter(
    (doc) => activeCategory === "all" || doc.category === activeCategory
  );

  return (
    <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Back to Home Button */}
      <div className="flex justify-start mb-6">
        <PageBackLink destination="home" />
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary uppercase tracking-tight mb-6">
          {t("pageTitle")}
        </h1>
        <div className="w-16 h-[2px] bg-primary-yellow mx-auto mb-6" />
        <p className="text-sm sm:text-base leading-relaxed text-text-secondary">
          {t("pageDescription")}
        </p>
      </div>

      {/* Category Tabs/Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12" role="tablist">
        {(["all", "equipment-verification", "recognition"] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
              activeCategory === cat
                ? "bg-gold-primary border-gold-primary text-black font-bold shadow-gold-glow/20"
                : "border-gold-border/30 text-text-secondary hover:text-gold-text hover:border-gold-primary/60 bg-[#0d0d0d]"
            }`}
          >
            {cat === "all" && t("categories.all")}
            {cat === "equipment-verification" && t("categories.equipmentVerification")}
            {cat === "recognition" && t("categories.recognition")}
          </button>
        ))}
      </div>

      {/* Grid of Documents */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredDocs.map((doc) => (
            <motion.div
              layout
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col bg-[#0f0f0f] border border-gold-border/30 hover:border-gold-primary/50 hover:shadow-gold-glow/20 rounded-xl overflow-hidden shadow-lg transition-colors group"
            >
              {/* Document Image Container with Consistent Aspect Ratio */}
              <div 
                onClick={() => setSelectedDoc(doc)}
                className="relative aspect-[3/4] w-full bg-[#161616] p-4 sm:p-5 flex items-center justify-center cursor-pointer overflow-hidden border-b border-gold-border/30 group-hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={doc.image}
                    alt={t(doc.titleKey)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Enlarge Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <span className="px-4 py-2 bg-black/80 border border-gold-border/60 text-gold-primary rounded-lg text-xs font-mono uppercase tracking-widest">
                    {t("actions.enlarge")}
                  </span>
                </div>
              </div>

              {/* Document Info Card Footer */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  {/* Category Pill */}
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-gold-primary bg-gold-primary/10 border border-gold-border/40 px-2 py-0.5 rounded mb-3">
                    {doc.category === "equipment-verification" ? t("categories.equipmentVerification") : t("categories.recognition")}
                  </span>

                  <h3 className="text-base font-bold text-text-primary group-hover:text-gold-primary transition-colors mb-3 line-clamp-2">
                    {t(doc.titleKey)}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed mb-5 line-clamp-3">
                    {t(doc.descriptionKey)}
                  </p>

                  {/* Metadata Specification Details */}
                  {doc.category === "equipment-verification" && (
                    <div className="space-y-2 border-t border-gold-border/30 pt-4 text-[11px] font-mono">
                      {doc.documentNumber && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t("labels.documentNumber")}:</span>
                          <span className="text-text-primary font-bold">{doc.documentNumber}</span>
                        </div>
                      )}
                      {doc.equipmentModel && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t("labels.equipmentModel")}:</span>
                          <span className="text-text-primary font-bold">{doc.equipmentModel}</span>
                        </div>
                      )}
                      {doc.capacity && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t("labels.capacity")}:</span>
                          <span className="text-text-primary font-bold">{doc.capacity}</span>
                        </div>
                      )}
                      {doc.issueDate && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t("labels.issueDate")}:</span>
                          <span className="text-text-primary">{doc.issueDate}</span>
                        </div>
                      )}
                      {doc.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">{t("labels.validUntil")}:</span>
                          <span className="text-text-primary">{doc.validUntil}</span>
                        </div>
                      )}
                      {doc.status && doc.status !== "unknown" && (
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">{t("labels.status")}:</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-text-secondary">
                            {doc.status === "archived" && t("status.archived")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full mt-6 py-2.5 text-center bg-transparent hover:bg-primary-yellow border border-primary-yellow/40 hover:border-primary-yellow text-primary-yellow hover:text-black font-mono text-xs uppercase tracking-wider rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow"
                >
                  {t("labels.openDocument")}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox / Modal Modal View */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            role="dialog"
            aria-modal="true"
            aria-label={t(selectedDoc.titleKey)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full h-[80vh] flex flex-col bg-[#121212] border border-gold-border rounded-xl overflow-hidden cursor-default shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold-border bg-[#161616]">
                <h2 className="text-sm sm:text-base font-bold text-text-primary truncate pr-4">
                  {t(selectedDoc.titleKey)}
                </h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  aria-label={t("actions.close")}
                  className="p-1 text-text-secondary hover:text-primary-yellow hover:bg-white/5 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body (Uncropped Responsive Image) */}
              <div className="flex-1 relative p-6 bg-[#0a0a0a] flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={selectedDoc.image}
                    alt={t(selectedDoc.titleKey)}
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
