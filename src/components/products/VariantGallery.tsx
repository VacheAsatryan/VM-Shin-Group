"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { ProductVariant } from "@/config/productDetails";
import VatIncludedNote from "@/components/ui/VatIncludedNote";

interface VariantGalleryProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariant) => void;
}

export default function VariantGallery({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantGalleryProps) {
  const t = useTranslations("products");
  const tGlobal = useTranslations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [updateScrollButtons]);

  // Scroll to active card when selectedVariantId changes
  useEffect(() => {
    const activeEl = cardRefs.current.get(selectedVariantId);
    if (activeEl && scrollContainerRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      activeEl.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedVariantId]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 220;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior,
      });
    }
  };

  return (
    <div className="w-full relative group/gallery">
      {/* Header & Controls Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {t("selectVariant")}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-primary-yellow font-medium">
            {variants.length} {t("breadcrumbProducts").toLowerCase()}
          </span>

          {/* Slider Controls */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              type="button"
              aria-label={t("previousVariant") || "Previous variant"}
              disabled={!canScrollLeft}
              onClick={() => scroll("left")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gold-border bg-surface/90 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-light hover:border-primary-yellow/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={t("nextVariant") || "Next variant"}
              disabled={!canScrollRight}
              onClick={() => scroll("right")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gold-border bg-surface/90 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-light hover:border-primary-yellow/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar px-[calc(50%-105px)] sm:px-0"
      >
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;

          return (
            <VariantCard
              key={variant.id}
              ref={(el) => {
                if (el) cardRefs.current.set(variant.id, el);
                else cardRefs.current.delete(variant.id);
              }}
              variant={variant}
              isSelected={isSelected}
              onSelect={() => onSelectVariant(variant)}
              t={t}
              tGlobal={tGlobal}
            />
          );
        })}
      </div>
    </div>
  );
}

import React from "react";

const VariantCard = React.forwardRef<
  HTMLButtonElement,
  {
    variant: ProductVariant;
    isSelected: boolean;
    onSelect: () => void;
    t: (key: string) => string;
    tGlobal: (key: string) => string;
  }
>(function VariantCard({ variant, isSelected, onSelect, t, tGlobal }, ref) {
  const fallbackThumb = variant.thumbnail || variant.image;
  const [imageSrc, setImageSrc] = useState(fallbackThumb);
  const [imageError, setImageError] = useState(false);
  const [prevThumbnail, setPrevThumbnail] = useState(fallbackThumb);

  if (fallbackThumb !== prevThumbnail) {
    setPrevThumbnail(fallbackThumb);
    setImageSrc(fallbackThumb);
    setImageError(false);
  }

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(variant.fallbackImage);
    }
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex-none w-[210px] sm:w-[190px] p-3 rounded-xl border text-left transition-all duration-300 snap-center sm:snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
        isSelected
          ? "bg-surface border-gold-primary shadow-gold-glow/35 ring-1 ring-gold-primary/60"
          : "bg-surface/60 border-gold-border/30 hover:border-gold-primary/60 hover:bg-surface"
      }`}
    >
      {/* Selected Indicator Badge */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-primary-yellow text-black flex items-center justify-center shadow-md">
          <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Variant Thumbnail Image */}
      <div className="relative aspect-[4/3] w-full rounded-lg bg-[#0a0a0a] overflow-hidden mb-2.5 p-1 border border-gold-border/30">
        <Image
          src={imageSrc}
          alt={variant.altKey ? tGlobal(variant.altKey) : variant.sizeLabel}
          fill
          sizes="(max-width: 640px) 210px, 190px"
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
      </div>

      {/* Variant Details */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-extrabold text-white group-hover:text-primary-yellow transition-colors leading-tight">
          {variant.titleKey ? t(variant.titleKey) : variant.sizeLabelKey ? t(variant.sizeLabelKey) : variant.sizeLabel}
        </div>

        <div className="text-[11px] font-medium text-text-muted line-clamp-1">
          {t(variant.subtitleKey)}
        </div>

        {/* Price & Stock */}
        <div className="mt-1 pt-1.5 border-t border-gold-border/30 flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="font-bold text-primary-yellow">
              {variant.priceStatus === "to_be_confirmed"
                ? t("priceTBC")
                : `${variant.price.amount} ${t(variant.price.unitKey)}`}
            </span>
            {variant.priceStatus !== "to_be_confirmed" && (
              <VatIncludedNote className="text-[9px] text-text-muted/70 font-normal block" />
            )}
          </div>
          <span className="text-[10px] text-text-muted">
            {variant.weightKg && variant.weightKg > 0 ? `${variant.weightKg} kg` : ""}
          </span>
        </div>
      </div>
    </motion.button>
  );
});
