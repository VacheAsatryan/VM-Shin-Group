"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import type {
  ProductCategoryConfig,
  ProductVariantConfig,
  CalculatorProductInput,
} from "@/lib/calculator/calculator.types";
import ProductVariantFields from "./ProductVariantFields";
import DynamicCalculatorForm from "./DynamicCalculatorForm";
import { Button } from "@/components/ui/Button";

interface ParametersStepProps {
  category: ProductCategoryConfig;
  selectedVariant: ProductVariantConfig;
  onSelectVariant: (variant: ProductVariantConfig) => void;
  input: CalculatorProductInput;
  onChangeInput: (input: CalculatorProductInput) => void;
  onSubmit: () => void;
}

export default function ParametersStep({
  category,
  selectedVariant,
  onSelectVariant,
  input,
  onChangeInput,
  onSubmit,
}: ParametersStepProps) {
  const t = useTranslations("calculator");

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Supportive Header with Compact Product Banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface/80 border border-gold-border/40 shadow-lg">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg relative overflow-hidden shrink-0 border border-gold-border/40">
          <Image
            src={selectedVariant.image || category.image}
            alt={t(`categories.${category.nameKey}`)}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t("stepper.step2")}
          </span>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-text-primary">
            {t(`categories.${category.nameKey}`)}
          </h3>
          <span className="text-xs text-text-secondary font-mono">
            {t(`blocks.${selectedVariant.nameKey}`)}
          </span>
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="p-6 sm:p-8 rounded-xl bg-surface/90 border border-gold-border/40 shadow-xl flex flex-col gap-6">
        {/* Product Variant Picker */}
        <ProductVariantFields
          variants={category.variants}
          selectedVariantId={selectedVariant.id}
          onSelectVariant={onSelectVariant}
        />

        {/* Product-Specific Inputs */}
        <DynamicCalculatorForm input={input} onChangeInput={onChangeInput} />

        {/* Primary Action Button */}
        <div className="pt-4 border-t border-gold-border/30">
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            className="w-full text-center"
          >
            {t("stepper.showEstimate")}
          </Button>
        </div>
      </div>
    </div>
  );
}
