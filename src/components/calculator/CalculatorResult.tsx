"use client";

import { useTranslations } from "next-intl";
import type { CalculationResult, EstimateSummaryPayload } from "@/lib/calculator/calculator.types";
import { LinkButton } from "@/components/ui/Button";
import PriceSummary from "./PriceSummary";
import DeliveryEstimator from "./DeliveryEstimator";
import MapPreview from "./MapPreview";

interface CalculatorResultProps {
  result: CalculationResult;
  deliveryEnabled: boolean;
  onToggleDeliveryEnabled: (enabled: boolean) => void;
  destinationAddress: string;
  onAddressChange: (address: string) => void;
  distanceKm: number;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
}

export default function CalculatorResult({
  result,
  deliveryEnabled,
  onToggleDeliveryEnabled,
  destinationAddress,
  onAddressChange,
  distanceKm,
  onRequestOffer,
}: CalculatorResultProps) {
  const t = useTranslations("calculator");

  const handleRequestOfferClick = () => {
    const payload: EstimateSummaryPayload = {
      category: result.category,
      variantId: result.variant.id,
      input: {
        type: "quantity_product",
        quantity: result.metrics.primaryQuantity,
        variantId: result.variant.id,
      },
      metrics: result.metrics,
      pricing: result.pricing,
      deliveryAddress: destinationAddress,
      estimatedDistanceKm: distanceKm,
      isDemoData: true,
      timestamp: new Date().toISOString(),
    };

    if (onRequestOffer) {
      onRequestOffer(payload);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-surface-elevated/90 backdrop-blur-md border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Top Subtle Yellow Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
          {t("results.title")}
        </h3>
        <span className="text-[11px] font-mono text-text-secondary uppercase">
          {t(`blocks.${result.variant.nameKey}`)}
        </span>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Quantity */}
        <div className="p-4 rounded-lg bg-background/60 border border-white/5 flex flex-col">
          <span className="text-xs text-text-secondary mb-1">
            {t("results.primaryQuantity")}
          </span>
          <div className="flex items-baseline gap-1.5 mt-auto">
            <span className="text-2xl sm:text-3xl font-black font-mono text-primary-yellow tracking-tight">
              {result.metrics.primaryQuantity.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-primary-yellow/80 font-mono uppercase">
              {t(`units.${result.metrics.primaryUnitKey}`)}
            </span>
          </div>
        </div>

        {/* Secondary / Pallet Metrics */}
        {result.metrics.palletsCount ? (
          <div className="p-4 rounded-lg bg-background/60 border border-white/5 flex flex-col">
            <span className="text-xs text-text-secondary mb-1">
              {t("results.palletsCount")}
            </span>
            <div className="flex items-baseline gap-1.5 mt-auto">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text-primary tracking-tight">
                {result.metrics.palletsCount}
              </span>
              <span className="text-xs font-bold text-primary-yellow/80 font-mono uppercase">
                {t("units.pallets")}
              </span>
            </div>
          </div>
        ) : result.metrics.secondaryQuantity ? (
          <div className="p-4 rounded-lg bg-background/60 border border-white/5 flex flex-col">
            <span className="text-xs text-text-secondary mb-1">
              {t("results.secondaryQuantity")}
            </span>
            <div className="flex items-baseline gap-1.5 mt-auto">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text-primary tracking-tight">
                {result.metrics.secondaryQuantity.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-primary-yellow/80 font-mono uppercase">
                {t(`units.${result.metrics.secondaryUnitKey}`)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Pricing Summary */}
      <PriceSummary pricing={result.pricing} deliveryEnabled={deliveryEnabled} />

      {/* Delivery Estimator Control */}
      <DeliveryEstimator
        enabled={deliveryEnabled}
        onToggleEnabled={onToggleDeliveryEnabled}
        destinationAddress={destinationAddress}
        onAddressChange={onAddressChange}
        distanceKm={distanceKm}
      />

      {/* Map Preview Placeholder when Delivery is active */}
      {deliveryEnabled && (
        <MapPreview
          destinationAddress={destinationAddress}
          distanceKm={distanceKm}
        />
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <p className="text-[11px] text-text-secondary leading-relaxed font-mono">
          ⚠ {t("results.disclaimer")}
        </p>
      </div>

      {/* Primary CTA */}
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
  );
}
