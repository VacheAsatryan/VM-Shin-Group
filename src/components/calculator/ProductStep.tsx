"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import type { ProductCategoryConfig } from "@/lib/calculator/calculator.types";

interface ProductStepProps {
  selectedCategory: ProductCategoryConfig;
  onSelectCategory: (category: ProductCategoryConfig) => void;
}

export default function ProductStep({
  selectedCategory,
  onSelectCategory,
}: ProductStepProps) {
  const t = useTranslations("calculator");

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-text-primary mb-1">
          {t("stepper.question")}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t("description")}
        </p>
      </div>

      {/* Responsive Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CALCULATOR_PRODUCTS.map((prod) => {
          const isSelected = prod.id === selectedCategory.id;
          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => onSelectCategory(prod)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
                isSelected
                  ? "bg-surface-elevated border-primary-yellow/70 shadow-glow/20 scale-[1.02]"
                  : "bg-surface/60 border-white/10 hover:border-primary-yellow/40 hover:bg-surface-elevated/50"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-background/80 relative overflow-hidden shrink-0 border border-white/5">
                <Image
                  src={prod.image}
                  alt={t(`categories.${prod.nameKey}`)}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-bold uppercase tracking-wider truncate transition-colors ${
                    isSelected ? "text-primary-yellow" : "text-text-primary group-hover:text-primary-yellow-light"
                  }`}
                >
                  {t(`categories.${prod.nameKey}`)}
                </span>
                <span className="text-[10px] font-mono text-text-secondary uppercase">
                  {t(`units.${prod.unitLabelKey}`)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
