"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import { DELIVERY_CONFIG } from "@/config/delivery";
import type {
  ProductCategoryConfig,
  ProductVariantConfig,
  CalculatorProductInput,
  ProductCategoryType,
} from "@/lib/calculator/calculator.types";
import { calculateProductEstimate } from "@/lib/calculator/calculateProductEstimate";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";

import ProductSelector from "@/components/calculator/ProductSelector";
import SelectedProductPreview from "@/components/calculator/SelectedProductPreview";
import ProductVariantFields from "@/components/calculator/ProductVariantFields";
import DynamicCalculatorForm from "@/components/calculator/DynamicCalculatorForm";
import CalculatorResult from "@/components/calculator/CalculatorResult";

interface CalculatorSectionProps {
  initialProductCategory?: ProductCategoryType;
}

function getDefaultInputForCategory(category: ProductCategoryConfig): CalculatorProductInput {
  const variantId = category.variants[0]?.id || "";

  switch (category.calculationType) {
    case "wall_blocks":
      return {
        type: "wall_blocks",
        lengthMeters: 10,
        heightMeters: 3,
        wallCount: 1,
        variantId,
        reservePercent: 5,
      };
    case "paving_area":
      return {
        type: "paving_area",
        lengthMeters: 10,
        widthMeters: 5,
        variantId,
        reservePercent: 5,
      };
    case "curbstones":
      return {
        type: "curbstones",
        linearLengthMeters: 50,
        variantId,
        reservePercent: 5,
      };
    case "concrete_volume":
      return {
        type: "concrete_volume",
        mode: "direct",
        directVolumeM3: 20,
        lengthMeters: 10,
        widthMeters: 10,
        depthMeters: 0.2,
        variantId,
        reservePercent: 5,
      };
    case "quantity_product":
      return {
        type: "quantity_product",
        quantity: 10,
        variantId,
      };
  }
}

export default function CalculatorSection({ initialProductCategory }: CalculatorSectionProps) {
  const t = useTranslations("calculator");
  const prefersReducedMotion = useReducedMotion();

  // Selected Category
  const defaultCategory =
    CALCULATOR_PRODUCTS.find((p) => p.id === initialProductCategory) || CALCULATOR_PRODUCTS[0];

  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryConfig>(defaultCategory);

  // Selected Variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantConfig>(
    defaultCategory.variants[0]
  );

  // Dynamic Input State
  const [input, setInput] = useState<CalculatorProductInput>(
    getDefaultInputForCategory(defaultCategory)
  );

  // Delivery State
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean>(true);
  const [destinationAddress, setDestinationAddress] = useState<string>("Yerevan");
  const distanceKm = destinationAddress.trim().length > 0 ? DELIVERY_CONFIG.defaultDistanceKm : 0;

  // Handle Category Switch
  const handleSelectCategory = (newCategory: ProductCategoryConfig) => {
    setSelectedCategory(newCategory);
    const newVariant = newCategory.variants[0];
    setSelectedVariant(newVariant);

    const newInput = getDefaultInputForCategory(newCategory);
    newInput.variantId = newVariant.id;
    setInput(newInput);
  };

  // Handle Variant Switch
  const handleSelectVariant = (newVariant: ProductVariantConfig) => {
    setSelectedVariant(newVariant);
    setInput((prev) => ({ ...prev, variantId: newVariant.id }));
  };

  // Calculate Result
  const estimateResult = calculateProductEstimate(
    selectedCategory,
    input,
    selectedVariant,
    deliveryEnabled,
    distanceKm
  );

  const containerVariants = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <section
      id="calculator"
      className="relative z-20 pt-20 pb-28 w-full border-t border-white/5 overflow-hidden bg-background/95"
      aria-labelledby="calculator-heading"
    >
      {/* Soft Top Gradient Transition */}
      <div
        className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background/95 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-10"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
              <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase font-mono">
                {t("eyebrow")}
              </p>
            </div>
            <h2
              id="calculator-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary uppercase tracking-tight leading-tight mb-4"
            >
              {t("title")}
            </h2>
            <div className="h-0.5 w-14 bg-primary-yellow mb-6" />
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {t("description")}
            </p>
          </motion.div>

          {/* Product Category Selector Bar */}
          <motion.div variants={itemVariants}>
            <ProductSelector
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </motion.div>

          {/* Main 2-Column Calculator Control Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Product Image Preview & Dynamic Inputs (~45% / 5 cols) */}
            <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col gap-6">
              {/* Product Preview Card */}
              <SelectedProductPreview product={selectedCategory} />

              {/* Dynamic Inputs Form Box */}
              <div className="p-6 sm:p-8 rounded-xl bg-surface/80 border border-white/10 shadow-xl flex flex-col gap-6">
                {/* Variant Picker */}
                <ProductVariantFields
                  variants={selectedCategory.variants}
                  selectedVariantId={selectedVariant.id}
                  onSelectVariant={handleSelectVariant}
                />

                {/* Dynamic Fields */}
                <DynamicCalculatorForm input={input} onChangeInput={setInput} />
              </div>
            </motion.div>

            {/* Right Column: Live Result Summary, Pricing, Delivery & CTA (~55% / 7 cols) */}
            <motion.div variants={itemVariants} className="lg:col-span-7">
              <CalculatorResult
                result={estimateResult}
                deliveryEnabled={deliveryEnabled}
                onToggleDeliveryEnabled={setDeliveryEnabled}
                destinationAddress={destinationAddress}
                onAddressChange={setDestinationAddress}
                distanceKm={distanceKm}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
