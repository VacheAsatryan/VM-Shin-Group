"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ProductCategoryConfig } from "@/lib/calculator/calculator.types";

interface SelectedProductPreviewProps {
  product: ProductCategoryConfig;
}

export default function SelectedProductPreview({ product }: SelectedProductPreviewProps) {
  const t = useTranslations("calculator");

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-surface shadow-xl group">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Product Image */}
      <Image
        src={product.image}
        alt={t(`categories.${product.nameKey}`)}
        fill
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        priority
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-20 pointer-events-none" />

      {/* Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-primary-yellow/60 z-30" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-primary-yellow/60 z-30" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-primary-yellow/60 z-30" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-primary-yellow/60 z-30" />

      {/* Title & Unit Tag */}
      <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-2">
        <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-text-primary drop-shadow">
          {t(`categories.${product.nameKey}`)}
        </h4>
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary-yellow uppercase px-2 py-0.5 rounded bg-black/70 border border-primary-yellow/30">
          {t(`units.${product.unitLabelKey}`)}
        </span>
      </div>
    </div>
  );
}
