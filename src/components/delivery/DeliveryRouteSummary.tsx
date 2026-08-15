"use client";

import { useTranslations } from "next-intl";
import type { DeliveryRoute } from "@/lib/maps/geoapify/types";
import type { DeliveryPricingResult } from "@/lib/maps/delivery-pricing";
import VatIncludedNote from "@/components/ui/VatIncludedNote";

interface DeliveryRouteSummaryProps {
  route: DeliveryRoute | null;
  pricing: DeliveryPricingResult | null;
  deliveryLocationAdjustedManually: boolean;
  onResetLocation?: () => void;
  isConcrete?: boolean;
}

export default function DeliveryRouteSummary({
  route,
  pricing,
  deliveryLocationAdjustedManually,
  isConcrete,
}: DeliveryRouteSummaryProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");

  if (!route || !pricing) {
    return null;
  }

  const distanceKmFormatted = route.distanceKm.toFixed(1);
  const totalDeliveryPrice = pricing.totalDeliveryPrice ?? pricing.price;
  const isOverMaxDistance = route.distanceKm > 40;
  const showManagerConfirmation = isOverMaxDistance || totalDeliveryPrice === null;

  return (
    <div className="p-4 rounded-xl bg-background/80 border border-gold-border flex flex-col gap-3 shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-gold-border/30 text-xs font-mono">
        {/* Distance */}
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary uppercase">
            {t("delivery.distanceLabel")}
          </span>
          <span className="text-sm sm:text-base font-bold text-primary-yellow">
            {distanceKmFormatted} km
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] text-text-secondary uppercase">
            {t("delivery.estimatedDeliveryPrice")}
          </span>
          <span className="text-sm sm:text-base font-bold text-primary-yellow text-right">
            {showManagerConfirmation ? (
              t("delivery.deliveryPriceDeterminedAfterOrder")
            ) : isConcrete ? (
              <span className="text-xs font-normal text-text-secondary">
                {t("delivery.concretePriceCalculatedAfterDelivery")}
              </span>
            ) : (
              `${totalDeliveryPrice!.toLocaleString()} ${currency}`
            )}
          </span>

          {!showManagerConfirmation && !isConcrete && (
            <VatIncludedNote namespace="calculator" className="text-[9px] text-text-muted font-normal block text-right mt-0.5" />
          )}
        </div>
      </div>

      {/* Manual Location Adjustment Note */}
      {deliveryLocationAdjustedManually && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-gold-primary/10 border border-gold-border/60 text-gold-bright text-[11px] font-mono">
          <span>🎯</span>
          <span>{t("delivery.manuallyAdjustedLocation")}</span>
        </div>
      )}
    </div>
  );
}
