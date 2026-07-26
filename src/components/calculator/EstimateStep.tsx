"use client";

import { useTranslations } from "next-intl";
import type { CalculationResult, EstimateSummaryPayload } from "@/lib/calculator/calculator.types";
import { Button, LinkButton } from "@/components/ui/Button";

interface EstimateStepProps {
  result: CalculationResult;
  onChangeParameters: () => void;
  onAddDelivery: () => void;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
}

export default function EstimateStep({
  result,
  onChangeParameters,
  onAddDelivery,
  onRequestOffer,
}: EstimateStepProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");

  const handleRequestOfferClick = () => {
    const payload: EstimateSummaryPayload = {
      category: result.category,
      variantId: result.variant.id,
      input: result.input,
      metrics: result.metrics,
      pricing: result.pricing,
      accessories: result.input.accessories,
      isDemoData: true,
      timestamp: new Date().toISOString(),
      productName: t(`categories.${result.category}`),
      variantName: t(`blocks.${result.variant.nameKey}`),
      imageFilename: result.variant.image ? result.variant.image.split("/").pop() : undefined,
      note: result.pricing.priceStatus === "to_be_confirmed" ? "exact size and price pending confirmation" : undefined,
    };

    if (onRequestOffer) {
      onRequestOffer(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="p-6 sm:p-8 rounded-xl bg-surface-elevated/90 backdrop-blur-md border border-gold-border relative overflow-hidden shadow-2xl flex flex-col gap-6">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent"
          aria-hidden="true"
        />

        {/* Category & Variant Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-gold-border">
          <span className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t(`categories.${result.category}`)}
          </span>
          <span className="text-xs font-mono text-text-secondary">
            {t(`blocks.${result.variant.nameKey}`)}
          </span>
        </div>

        {/* Selected Accessories / Configuration */}
        {result.input.accessories && Object.keys(result.input.accessories).length > 0 && (
          <div className="bg-white/5 border border-gold-border rounded-xl p-4">
            <h4 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
              {t("stepper.configuration")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.input.accessories).map(([groupId, optionId]) => (
                <span
                  key={groupId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-sm font-medium"
                >
                  {t(`accessories.${optionId}`)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 1. Large Main Primary Result */}
        <div className="p-6 rounded-xl bg-background/80 border border-gold-border flex flex-col items-center text-center">
          <span className="text-xs font-mono text-text-secondary uppercase mb-2">
            {t("results.primaryQuantity")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-primary-yellow tracking-tight">
              {result.metrics.primaryQuantity.toLocaleString()}
            </span>
            <span className="text-sm sm:text-base font-bold text-primary-yellow/90 font-mono uppercase">
              {t(`units.${result.metrics.primaryUnitKey}`)}
            </span>
          </div>
        </div>

        {/* 2. Secondary Data Row (Pallets / Secondary Units) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.metrics.palletsCount ? (
            <div className="p-3.5 rounded-lg bg-background/60 border border-gold-border flex items-center justify-between">
              <span className="text-xs text-text-secondary">{t("results.palletsCount")}:</span>
              <span className="text-sm font-bold font-mono text-text-primary">
                {result.metrics.palletsCount} {t("units.pallets")}
              </span>
            </div>
          ) : null}

          {result.metrics.secondaryQuantity ? (
            <div className="p-3.5 rounded-lg bg-background/60 border border-gold-border flex items-center justify-between">
              <span className="text-xs text-text-secondary">{t("results.secondaryQuantity")}:</span>
              <span className="text-sm font-bold font-mono text-text-primary">
                {result.metrics.secondaryQuantity.toLocaleString()} {t(`units.${result.metrics.secondaryUnitKey}`)}
              </span>
            </div>
          ) : null}
        </div>

        {/* 3. Product Cost Subtotal */}
        <div className="p-4 rounded-lg bg-background/80 border border-gold-border flex items-center justify-between">
          <span className="text-xs sm:text-sm text-text-secondary font-semibold">
            {t("results.subtotal")}:
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-primary-yellow">
            {result.pricing.productSubtotal.toLocaleString()} {currency}
          </span>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded bg-white/[0.02] border border-gold-border text-[11px] text-text-secondary font-mono">
          ℹ {t("results.disclaimer")}
        </div>

        {/* Step 3 Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onChangeParameters}
            className="flex-1 text-center"
          >
            {t("stepper.changeParameters")}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onAddDelivery}
            className="flex-1 text-center border-primary-yellow/40 text-primary-yellow hover:bg-primary-yellow/10"
          >
            {t("stepper.addDelivery")}
          </Button>
        </div>

        {/* Main CTA */}
        <div>
          <LinkButton
            href="#contact"
            variant="primary"
            className="w-full text-center"
            onClick={handleRequestOfferClick}
          >
            {t("results.cta")}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
