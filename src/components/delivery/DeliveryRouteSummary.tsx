"use client";

import { useTranslations } from "next-intl";
import type { DeliveryRoute } from "@/lib/maps/geoapify/types";
import type { DeliveryPricingResult } from "@/lib/maps/delivery-pricing";

interface DeliveryRouteSummaryProps {
  route: DeliveryRoute | null;
  pricing: DeliveryPricingResult | null;
  deliveryLocationAdjustedManually: boolean;
  onResetLocation?: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMinutes} min`;
}

export default function DeliveryRouteSummary({
  route,
  pricing,
  deliveryLocationAdjustedManually,
}: DeliveryRouteSummaryProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");

  if (!route || !pricing) {
    return null;
  }

  const distanceKmFormatted = route.distanceKm.toFixed(1);
  const durationText = formatDuration(route.durationMinutes);

  return (
    <div className="p-4 rounded-xl bg-background/80 border border-gold-border flex flex-col gap-3 shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 border-b border-gold-border/30 text-xs font-mono">
        {/* Distance */}
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary uppercase">
            {t("delivery.distanceLabel")}
          </span>
          <span className="text-sm font-bold text-primary-yellow">
            {distanceKmFormatted} km
          </span>
        </div>

        {/* Travel Time */}
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary uppercase">
            {t("delivery.estimatedTravelTime")}
          </span>
          <span className="text-sm font-bold text-text-primary">
            ⏱ {durationText}
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary uppercase">
            {t("delivery.estimatedDeliveryPrice")}
          </span>
          <span className="text-sm font-bold text-primary-yellow">
            {pricing.price !== null
              ? `${pricing.price.toLocaleString()} ${currency}`
              : t("priceConfirmedByManager")}
          </span>
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
