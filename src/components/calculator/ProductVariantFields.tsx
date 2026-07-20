"use client";

import { useTranslations } from "next-intl";
import type { ProductVariantConfig } from "@/lib/calculator/calculator.types";

interface ProductVariantFieldsProps {
  variants: ProductVariantConfig[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariantConfig) => void;
}

export default function ProductVariantFields({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductVariantFieldsProps) {
  const t = useTranslations("calculator");

  if (!variants || variants.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
        {t("inputs.variantLabel")}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-center justify-between gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
                isSelected
                  ? "bg-surface-elevated border-primary-yellow/60 text-primary-yellow shadow-glow/10"
                  : "bg-background/80 border-white/10 text-text-primary hover:border-primary-yellow/30"
              }`}
            >
              <span className="text-xs font-bold font-mono">
                {t(`blocks.${variant.nameKey}`)}
              </span>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isSelected ? "bg-primary-yellow" : "bg-white/20"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
