"use client";

import { useTranslations } from "next-intl";
import type { PricingBreakdown } from "@/lib/calculator/calculator.types";

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
  pricePerUnit,
  quantity,
}: PriceSummaryProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");
  const isTBC = pricing.priceStatus === "to_be_confirmed";
  const isDistanceOverLimit = deliveryEnabled && distanceKm > 40;

  if (isConcrete) {
    return (
      <div className="flex flex-col gap-3 p-5 rounded-xl bg-background/80 border border-gold-border relative overflow-hidden">
        {/* Price per m³ */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.pricePerM3")}:</span>
          <span className="text-text-primary font-mono font-bold">
            {pricePerUnit ? `${pricePerUnit.toLocaleString()} ${currency} / ${t("units.m3")}` : t("priceTBC")}
          </span>
        </div>

        {/* Quantity (m³) */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.primaryQuantity")}:</span>
          <span className="text-text-primary font-mono font-bold">
            {quantity ? `${quantity.toLocaleString()} ${t("units.m3")}` : "0"}
          </span>
        </div>

        {/* Concrete subtotal */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.subtotal")}:</span>
          <span className="text-text-primary font-mono font-bold">
            {pricing.productSubtotal.toLocaleString()} {currency}
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

        {/* Delivery price */}
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

        {/* Final Total */}
        <div className="flex items-center justify-between text-sm sm:text-base font-bold">
          <span className="text-text-primary uppercase tracking-wider">{t("results.total")}:</span>
          <span className="text-primary-yellow font-mono text-xl sm:text-2xl font-black text-right">
            {isDistanceOverLimit ? (
              t("delivery.deliveryPriceDeterminedAfterOrder")
            ) : (
              `${pricing.estimatedTotal.toLocaleString()} ${currency}`
            )}
          </span>
        </div>

        {/* Disclaimer Banner */}
        {!isDistanceOverLimit && pricing.isDemoPricing && (
          <div className="mt-2 p-2.5 rounded bg-primary-yellow/5 border border-primary-yellow/20">
            <p className="text-[11px] text-primary-yellow/90 font-mono leading-tight">
              ℹ {t("results.pricingDisclaimer")}
            </p>
          </div>
        )}
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
      <div className="flex items-center justify-between text-sm sm:text-base font-bold">
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
