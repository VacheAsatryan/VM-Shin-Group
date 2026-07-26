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

import { calculateProductEstimate } from "@/lib/calculator/calculateProductEstimate";
import { yandexMapProvider } from "@/lib/maps/yandexMapProvider";
import { useDeliveryRoute } from "@/hooks/useDeliveryRoute";
import { staggerContainer, fadeInUp, reducedMotionVariants } from "@/config/animations";

import CalculatorStepper from "@/components/calculator/CalculatorStepper";
import ProductStep from "@/components/calculator/ProductStep";
import ParametersStep from "@/components/calculator/ParametersStep";
import EstimateStep from "@/components/calculator/EstimateStep";
import DeliveryStep from "@/components/calculator/DeliveryStep";

interface CalculatorSectionProps {
  initialProductCategory?: ProductCategoryType;
  initialVariantId?: string;
  initialAccessories?: Record<string, string>;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
}

function getDefaultInputForCategory(
  category: ProductCategoryConfig,
  variantIdOverride?: string
): CalculatorProductInput {
  const variantId =
    variantIdOverride ||
    (category.variants.find((v) => v.id === variantIdOverride)?.id) ||
    category.variants[0]?.id ||
    "";

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
  initialVariantId,
  initialAccessories,
  onRequestOffer,
}: CalculatorSectionProps) {
  const t = useTranslations("calculator");
  const prefersReducedMotion = useReducedMotion();

  const isProductPageMode = Boolean(initialProductCategory);
  const defaultCategory =
    CALCULATOR_PRODUCTS.find((p) => p.id === initialProductCategory) || CALCULATOR_PRODUCTS[0];

  const defaultVariant =
    (initialVariantId && defaultCategory.variants.find((v) => v.id === initialVariantId)) ||
    defaultCategory.variants[0];

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(isProductPageMode ? 2 : 1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<1 | 2 | 3 | 4>(isProductPageMode ? 2 : 1);

  // Category & Variant State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryConfig>(defaultCategory);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantConfig>(defaultVariant);
  const [input, setInput] = useState<CalculatorProductInput>(() => {
    const defInput = getDefaultInputForCategory(defaultCategory, defaultVariant.id);
    if (initialAccessories) {
      defInput.accessories = initialAccessories;
    }
    return defInput;
  });

  const [prevVariantId, setPrevVariantId] = useState(initialVariantId);
  const [prevAccessories, setPrevAccessories] = useState(initialAccessories);

  // Sync state during render when initialVariantId or initialAccessories prop changes
  let stateSynced = false;
  if (initialVariantId && initialVariantId !== prevVariantId) {
    setPrevVariantId(initialVariantId);
    stateSynced = true;
  }
  
  // Basic deep compare for accessories
  const accessoriesChanged = JSON.stringify(initialAccessories) !== JSON.stringify(prevAccessories);
  if (accessoriesChanged) {
    setPrevAccessories(initialAccessories);
    stateSynced = true;
  }

  if (stateSynced) {
    const matchedVariant = initialVariantId
      ? selectedCategory.variants.find((v) => v.id === initialVariantId) || selectedVariant
      : selectedVariant;

    if (matchedVariant !== selectedVariant) {
      setSelectedVariant(matchedVariant);
    }
    
    setInput((prev) => ({ 
      ...prev, 
      variantId: matchedVariant.id,
      accessories: initialAccessories || prev.accessories
    }));
  }

  // Delivery Autocomplete & Route State
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);

  const isMapAvailable = yandexMapProvider.isApiKeyAvailable;

  const {
    status: routeStatus,
    routeEstimate,
    routeGeometry,
    destinationCoords,
    startMapSelection,
    confirmCoordinates,
    clearRoute,
    errorMessageKey,
  } = useDeliveryRoute(isMapAvailable);

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
    clearRoute();
  };

  // Handle Autocomplete Selection -> Triggers Map Selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedSuggestion(suggestion);
    setDestinationAddress(suggestion.label);

    if (isMapAvailable) {
      startMapSelection(suggestion.label);
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
      className="relative z-20 pt-20 pb-28 w-full border-t border-gold-border/30 overflow-hidden bg-background/95"
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
                routeGeometry={routeGeometry}
                destinationCoords={destinationCoords}
                routeStatus={routeStatus}
                errorMessageKey={errorMessageKey}
                onConfirmCoordinates={confirmCoordinates}
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
