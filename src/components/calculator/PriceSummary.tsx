"use client";

import { useTranslations } from "next-intl";
import type { PricingBreakdown } from "@/lib/calculator/calculator.types";
import VatIncludedNote from "@/components/ui/VatIncludedNote";

interface PriceSummaryProps {
  pricing: PricingBreakdown;
  deliveryEnabled: boolean;
  isConcrete?: boolean;
  distanceKm?: number;
  pricePerUnit?: number;
  quantity?: number;
}

export default function PriceSummary({
  pricing,
  deliveryEnabled,
  isConcrete,
  distanceKm = 0,
  quantity,
}: PriceSummaryProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");
  const isTBC = pricing.priceStatus === "to_be_confirmed";
  const isDistanceOverLimit = deliveryEnabled && distanceKm > 40;

  if (isConcrete) {
    const isRevealReady = deliveryEnabled && distanceKm > 0 && distanceKm <= 40 && pricing.deliveryEstimate !== null;

    return (
      <div className="flex flex-col gap-3 p-5 rounded-xl bg-background/80 border border-gold-border relative overflow-hidden">
        {/* Quantity (m³) */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.primaryQuantity")}:</span>
          <span className="text-text-primary font-mono font-bold">
            {quantity ? `${quantity.toLocaleString()} ${t("units.m3")}` : "0"}
          </span>
        </div>

        {/* Delivery distance */}
        {deliveryEnabled && distanceKm > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-text-secondary">{t("delivery.distanceLabel")}:</span>
            <span className="text-text-primary font-mono font-bold">
              {distanceKm.toFixed(1)} km
            </span>
          </div>
        )}

        {/* Total Divider */}
        <div className="h-px bg-gold-border my-1" />

        {/* Price Output / Notice */}
        <div className="flex flex-col items-end">
          {!deliveryEnabled || distanceKm === 0 ? (
            <span className="text-xs font-medium text-text-secondary text-right block">
              {t("delivery.concretePriceCalculatedAfterDelivery")}
            </span>
          ) : isDistanceOverLimit ? (
            <span className="text-xs sm:text-sm font-bold text-primary-yellow text-right block">
              {t("delivery.deliveryPriceDeterminedAfterOrder")}
            </span>
          ) : isRevealReady ? (
            <div className="flex flex-col items-end w-full">
              <div className="flex items-center justify-between w-full text-sm sm:text-base font-bold">
                <span className="text-text-secondary font-medium uppercase tracking-wider text-xs sm:text-sm">
                  {t("delivery.estimatedPrice")}:
                </span>
                <span className="text-primary-yellow font-mono text-xl sm:text-2xl font-black text-right">
                  ≈ {pricing.estimatedTotal.toLocaleString()} {currency}
                </span>
              </div>
              <VatIncludedNote namespace="calculator" className="text-[10px] text-text-muted font-normal mt-1 text-right" />
            </div>
          ) : (
            <span className="text-xs font-medium text-text-secondary text-right block">
              {t("delivery.concretePriceCalculatedAfterDelivery")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-background/80 border border-gold-border relative overflow-hidden">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="text-text-secondary">{t("results.subtotal")}:</span>
        <span className="text-text-primary font-mono font-bold">
          {isTBC ? t("priceTBC") : `${pricing.productSubtotal.toLocaleString()} ${currency}`}
        </span>
      </div>

      {/* Delivery Estimate */}
      {deliveryEnabled && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.delivery")}:</span>
          <span className="text-primary-yellow/90 font-mono font-bold text-right">
            {isDistanceOverLimit ? (
              t("delivery.deliveryPriceDeterminedAfterOrder")
            ) : pricing.deliveryEstimate !== null ? (
              `+${pricing.deliveryEstimate.toLocaleString()} ${currency}`
            ) : (
              t("stepper.notCalculated")
            )}
          </span>
        </div>
      )}

      {/* Total Divider */}
      <div className="h-px bg-gold-border my-1" />

      {/* Total */}
      <div className="flex flex-col items-end">
        <div className="flex items-center justify-between w-full text-sm sm:text-base font-bold">
          <span className="text-text-primary uppercase tracking-wider">{t("results.total")}:</span>
          <span className="text-primary-yellow font-mono text-xl sm:text-2xl font-black text-right">
            {isTBC ? (
              t("priceTBC")
            ) : isDistanceOverLimit ? (
              t("delivery.deliveryPriceDeterminedAfterOrder")
            ) : (
              `${pricing.estimatedTotal.toLocaleString()} ${currency}`
            )}
            {isTBC && deliveryEnabled && pricing.deliveryEstimate !== null && !isDistanceOverLimit && (
              <span className="text-xs text-text-muted font-normal block sm:inline sm:ml-2">
                (+ {pricing.deliveryEstimate.toLocaleString()} {currency} {t("results.delivery")})
              </span>
            )}
          </span>
        </div>
        {!isTBC && !isDistanceOverLimit && (
          <VatIncludedNote namespace="calculator" className="text-[10px] text-text-muted font-normal mt-1 text-right" />
        )}
      </div>

      {/* Demo Pricing or Manager Confirmation Disclaimer Banner */}
      {isTBC ? (
        <div className="mt-2 p-2.5 rounded bg-primary-yellow/5 border border-primary-yellow/20">
          <p className="text-[11px] text-primary-yellow/90 font-mono leading-tight">
            ℹ {t("priceConfirmedByManager")}
          </p>
        </div>
      ) : (
        !isDistanceOverLimit && pricing.isDemoPricing && (
          <div className="mt-2 p-2.5 rounded bg-primary-yellow/5 border border-primary-yellow/20">
            <p className="text-[11px] text-primary-yellow/90 font-mono leading-tight">
              ℹ {t("results.pricingDisclaimer")}
            </p>
          </div>
        )
      )}
    </div>
  );
}
