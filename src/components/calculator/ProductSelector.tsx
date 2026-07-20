"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import type { ProductCategoryConfig, ProductCategoryType } from "@/lib/calculator/calculator.types";

interface ProductSelectorProps {
  selectedCategory: ProductCategoryConfig;
  onSelectCategory: (category: ProductCategoryConfig) => void;
}

export default function ProductSelector({
  selectedCategory,
  onSelectCategory,
}: ProductSelectorProps) {
  const t = useTranslations("calculator");

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase">
        {t("categories.pemzablok") ? t("eyebrow") : "SELECT PRODUCT"}
      </label>

      {/* Desktop Grid of Product Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CALCULATOR_PRODUCTS.map((prod) => {
          const isSelected = prod.id === selectedCategory.id;
          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => onSelectCategory(prod)}
              className={`p-3 rounded-lg border transition-all duration-300 text-left flex items-center gap-3 relative overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
                isSelected
                  ? "bg-surface-elevated/90 border-primary-yellow/60 shadow-glow/20"
                  : "bg-surface/50 border-white/10 hover:border-primary-yellow/30 hover:bg-surface-elevated/40"
              }`}
            >
              <div className="w-10 h-10 rounded-md bg-background/80 relative overflow-hidden shrink-0 border border-white/5">
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

      {/* Mobile Select Dropdown */}
      <div className="sm:hidden relative">
        <select
          value={selectedCategory.id}
          onChange={(e) => {
            const found = CALCULATOR_PRODUCTS.find((p) => p.id === (e.target.value as ProductCategoryType));
            if (found) onSelectCategory(found);
          }}
          className="w-full bg-surface-elevated text-text-primary text-sm font-semibold rounded-lg px-4 py-3 border border-primary-yellow/30 outline-none"
        >
          {CALCULATOR_PRODUCTS.map((prod) => (
            <option key={prod.id} value={prod.id} className="bg-surface text-text-primary">
              {t(`categories.${prod.nameKey}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
