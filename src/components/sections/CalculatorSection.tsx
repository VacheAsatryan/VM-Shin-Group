"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import type {
  ProductCategoryConfig,
  ProductVariantConfig,
  CalculatorProductInput,
  ProductCategoryType,
  EstimateSummaryPayload,
} from "@/lib/calculator/calculator.types";
import type { AddressSuggestion } from "@/lib/maps/addressProvider.types";
import type { MapRouteEstimate } from "@/lib/maps/mapProvider.types";
import { calculateProductEstimate } from "@/lib/calculator/calculateProductEstimate";
import { yandexMapProvider } from "@/lib/maps/yandexMapProvider";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";

import CalculatorStepper from "@/components/calculator/CalculatorStepper";
import ProductStep from "@/components/calculator/ProductStep";
import ParametersStep from "@/components/calculator/ParametersStep";
import EstimateStep from "@/components/calculator/EstimateStep";
import DeliveryStep from "@/components/calculator/DeliveryStep";

interface CalculatorSectionProps {
  initialProductCategory?: ProductCategoryType;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
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

export default function CalculatorSection({
  initialProductCategory,
  onRequestOffer,
}: CalculatorSectionProps) {
  const t = useTranslations("calculator");
  const prefersReducedMotion = useReducedMotion();

  const isProductPageMode = Boolean(initialProductCategory);
  const defaultCategory =
    CALCULATOR_PRODUCTS.find((p) => p.id === initialProductCategory) || CALCULATOR_PRODUCTS[0];

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(isProductPageMode ? 2 : 1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<1 | 2 | 3 | 4>(isProductPageMode ? 2 : 1);

  // Category & Variant State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryConfig>(defaultCategory);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantConfig>(defaultCategory.variants[0]);
  const [input, setInput] = useState<CalculatorProductInput>(getDefaultInputForCategory(defaultCategory));

  // Delivery Autocomplete & Route State
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [routeEstimate, setRouteEstimate] = useState<MapRouteEstimate | null>(null);
  const [isRouteCalculating, setIsRouteCalculating] = useState<boolean>(false);

  const isMapAvailable = yandexMapProvider.isApiKeyAvailable;

  // Handle Category Selection (Step 1 -> Step 2)
  const handleSelectCategory = (newCategory: ProductCategoryConfig) => {
    setSelectedCategory(newCategory);
    const newVariant = newCategory.variants[0];
    setSelectedVariant(newVariant);

    const newInput = getDefaultInputForCategory(newCategory);
    newInput.variantId = newVariant.id;
    setInput(newInput);

    setStep(2);
    setMaxAccessibleStep((prev) => (prev < 2 ? 2 : prev));
  };

  // Handle Variant Selection (Step 2)
  const handleSelectVariant = (newVariant: ProductVariantConfig) => {
    setSelectedVariant(newVariant);
    setInput((prev) => ({ ...prev, variantId: newVariant.id }));
  };

  // Submit Step 2 (Parameters -> Estimate Step 3)
  const handleSubmitParameters = () => {
    setStep(3);
    setMaxAccessibleStep((prev) => (prev < 3 ? 3 : prev));
  };

  // Advance to Delivery (Step 3 -> Delivery Step 4)
  const handleAddDelivery = () => {
    setStep(4);
    setMaxAccessibleStep(4);
  };

  // Handle Address Invalidation when user types manually
  const handleInvalidateAddress = () => {
    setSelectedSuggestion(null);
    setRouteEstimate(null);
  };

  // Handle Autocomplete Selection -> Triggers Automatic Route Calculation
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedSuggestion(suggestion);
    setDestinationAddress(suggestion.label);

    if (isMapAvailable) {
      setIsRouteCalculating(true);
      yandexMapProvider
        .calculateRoute(suggestion.label)
        .then((est) => {
          setRouteEstimate(est);
        })
        .finally(() => {
          setIsRouteCalculating(false);
        });
    }
  };

  const isAddressValidated = Boolean(selectedSuggestion && routeEstimate?.isAvailable);

  // Compute Calculation Result
  const estimateResult = calculateProductEstimate(
    selectedCategory,
    input,
    selectedVariant,
    step === 4 && isAddressValidated,
    routeEstimate?.distanceKm || 0,
    routeEstimate?.isAvailable || false
  );

  const containerVariants = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariants = prefersReducedMotion ? reducedMotionVariants : fadeInUp;

  return (
    <section
      id="calculator"
      className="relative z-20 pt-20 pb-28 w-full border-t border-white/5 overflow-hidden bg-background/95"
      aria-labelledby="calculator-heading"
    >
      {/* Top Soft Gradient */}
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
          className="flex flex-col gap-8"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="max-w-3xl text-center mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
              <p className="text-xs sm:text-sm font-bold tracking-widest text-primary-yellow uppercase font-mono">
                {t("eyebrow")}
              </p>
            </div>
            <h2
              id="calculator-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary uppercase tracking-tight leading-tight mb-3"
            >
              {t("title")}
            </h2>
            <div className="h-0.5 w-14 bg-primary-yellow mx-auto mb-4" />
          </motion.div>

          {/* Stepper Navigation Bar */}
          <motion.div variants={itemVariants}>
            <CalculatorStepper
              currentStep={step}
              onSelectStep={(s) => setStep(s)}
              maxAccessibleStep={maxAccessibleStep}
              isProductPageMode={isProductPageMode}
            />
          </motion.div>

          {/* Dynamic Step Panels */}
          <motion.div variants={itemVariants} className="min-h-[380px]">
            {step === 1 && (
              <ProductStep
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {step === 2 && (
              <ParametersStep
                category={selectedCategory}
                selectedVariant={selectedVariant}
                onSelectVariant={handleSelectVariant}
                input={input}
                onChangeInput={setInput}
                onSubmit={handleSubmitParameters}
              />
            )}

            {step === 3 && (
              <EstimateStep
                result={estimateResult}
                onChangeParameters={() => setStep(2)}
                onAddDelivery={handleAddDelivery}
                onRequestOffer={onRequestOffer}
              />
            )}

            {step === 4 && (
              <DeliveryStep
                result={estimateResult}
                destinationAddress={destinationAddress}
                onAddressChange={setDestinationAddress}
                selectedSuggestion={selectedSuggestion}
                onSelectSuggestion={handleSelectSuggestion}
                onInvalidateAddress={handleInvalidateAddress}
                isMapAvailable={isMapAvailable}
                routeEstimate={routeEstimate}
                isRouteCalculating={isRouteCalculating}
                onBackToEstimate={() => setStep(3)}
                onRequestOffer={onRequestOffer}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
