"use client";

import { useTranslations } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";

interface DeliveryEstimatorProps {
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  destinationAddress: string;
  onAddressChange: (address: string) => void;
  distanceKm: number;
}

export default function DeliveryEstimator({
  enabled,
  onToggleEnabled,
  destinationAddress,
  onAddressChange,
  distanceKm,
}: DeliveryEstimatorProps) {
  const t = useTranslations("calculator.delivery");

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl bg-background/60 border border-white/10">
      <div className="flex items-center justify-between">
        <label htmlFor="delivery-toggle" className="text-xs font-mono font-bold tracking-wider text-text-primary uppercase flex items-center gap-2 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow" />
          {t("title")}
        </label>
        <button
          id="delivery-toggle"
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggleEnabled(!enabled)}
          className={`w-11 h-6 rounded-full transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
            enabled ? "bg-primary-yellow" : "bg-white/10"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
              enabled ? "right-1" : "left-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
          {/* Origin Factory Info */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              {t("originLabel")}
            </span>
            <span className="text-xs font-semibold text-text-primary">
              {FACTORY_ORIGIN.name} ({FACTORY_ORIGIN.city})
            </span>
          </div>

          {/* Destination Address Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delivery-destination" className="text-[10px] font-mono text-text-secondary uppercase">
              {t("destinationLabel")}
            </label>
            <input
              id="delivery-destination"
              type="text"
              value={destinationAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder={t("destinationPlaceholder")}
              className="w-full bg-surface text-text-primary text-xs font-semibold rounded-lg px-3.5 py-2.5 border border-white/10 focus:border-primary-yellow/60 outline-none"
            />
          </div>

          {/* Calculated Distance Output */}
          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-text-secondary">{t("distanceLabel")}:</span>
            <span className="font-bold text-primary-yellow">
              ~{distanceKm} km
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
