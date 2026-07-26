"use client";

import { useTranslations } from "next-intl";
import type { PricingBreakdown } from "@/lib/calculator/calculator.types";

interface PriceSummaryProps {
  pricing: PricingBreakdown;
  deliveryEnabled: boolean;
}

export default function PriceSummary({ pricing, deliveryEnabled }: PriceSummaryProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");
  const isTBC = pricing.priceStatus === "to_be_confirmed";

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
      {deliveryEnabled && pricing.deliveryEstimate !== null && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-text-secondary">{t("results.delivery")}:</span>
          <span className="text-primary-yellow/90 font-mono font-bold">
            +{pricing.deliveryEstimate.toLocaleString()} {currency}
          </span>
        </div>
      )}

      {/* Total Divider */}
      <div className="h-px bg-gold-border my-1" />

      {/* Total */}
      <div className="flex items-center justify-between text-sm sm:text-base font-bold">
        <span className="text-text-primary uppercase tracking-wider">{t("results.total")}:</span>
        <span className="text-primary-yellow font-mono text-xl sm:text-2xl font-black">
          {isTBC
            ? t("priceTBC")
            : `${pricing.estimatedTotal.toLocaleString()} ${currency}`}
          {isTBC && deliveryEnabled && pricing.deliveryEstimate !== null && (
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
        pricing.isDemoPricing && (
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
