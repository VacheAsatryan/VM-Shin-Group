"use client";

import { useTranslations } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";
import type { CalculationResult, EstimateSummaryPayload } from "@/lib/calculator/calculator.types";
import type { AddressSuggestion } from "@/lib/maps/addressProvider.types";
import type { MapRouteEstimate } from "@/lib/maps/mapProvider.types";
import AddressAutocomplete from "./AddressAutocomplete";
import YandexMapView from "./YandexMapView";
import { Button, LinkButton } from "@/components/ui/Button";

interface DeliveryStepProps {
  result: CalculationResult;
  destinationAddress: string;
  onAddressChange: (address: string) => void;
  selectedSuggestion: AddressSuggestion | null;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onInvalidateAddress: () => void;
  isMapAvailable: boolean;
  routeEstimate: MapRouteEstimate | null;
  isRouteCalculating: boolean;
  onBackToEstimate: () => void;
  onRequestOffer?: (payload: EstimateSummaryPayload) => void;
}

export default function DeliveryStep({
  result,
  destinationAddress,
  onAddressChange,
  selectedSuggestion,
  onSelectSuggestion,
  onInvalidateAddress,
  isMapAvailable,
  routeEstimate,
  isRouteCalculating,
  onBackToEstimate,
  onRequestOffer,
}: DeliveryStepProps) {
  const t = useTranslations("calculator");
  const currency = t("units.currency");

  const isAddressValidated = Boolean(selectedSuggestion && routeEstimate?.isAvailable);

  const deliveryCostText = isAddressValidated && result.pricing.deliveryEstimate !== null
    ? `${result.pricing.deliveryEstimate.toLocaleString()} ${currency}`
    : t("stepper.notCalculated");

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
      estimatedDistanceKm: isAddressValidated ? routeEstimate?.distanceKm || 0 : 0,
      isDemoData: true,
      timestamp: new Date().toISOString(),
    };

    if (onRequestOffer) {
      onRequestOffer(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="p-6 sm:p-8 rounded-xl bg-surface-elevated/90 backdrop-blur-md border border-white/10 relative overflow-hidden shadow-2xl flex flex-col gap-6">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-yellow/60 to-transparent"
          aria-hidden="true"
        />

        {/* Section Title */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs font-mono font-bold tracking-widest text-primary-yellow uppercase">
            {t("delivery.title")}
          </span>
          <span className="text-xs font-mono text-text-secondary uppercase">
            {t(`categories.${result.category}`)}
          </span>
        </div>

        {/* Plant Origin Info */}
        <div className="p-4 rounded-lg bg-background/60 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-secondary uppercase">
            {t("delivery.originLabel")}
          </span>
          <span className="text-xs font-bold text-text-primary">
            {FACTORY_ORIGIN.name} — {FACTORY_ORIGIN.address}, {FACTORY_ORIGIN.city}
          </span>
        </div>

        {/* Address Autocomplete Input */}
        <AddressAutocomplete
          value={destinationAddress}
          onChangeText={onAddressChange}
          onSelectSuggestion={onSelectSuggestion}
          onInvalidateAddress={onInvalidateAddress}
          isMapAvailable={isMapAvailable}
        />

        {/* Address Invalidation Warning if user typed text but didn't pick from dropdown */}
        {destinationAddress.trim().length > 0 && !selectedSuggestion && isMapAvailable && (
          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            ⚠ {t("delivery.addressInvalidated")}
          </div>
        )}

        {/* Yandex Map View with Route Loading Overlay */}
        <div className="relative">
          <YandexMapView
            destinationAddress={destinationAddress}
            isAvailable={isMapAvailable}
            routeEstimate={isAddressValidated ? routeEstimate : null}
          />

          {isRouteCalculating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-primary-yellow font-mono text-xs gap-2">
              <span className="animate-spin text-base">⚙</span>
              <span>{t("delivery.routeCalculating")}</span>
            </div>
          )}
        </div>

        {/* Delivery Summary Breakdown */}
        <div className="p-4 rounded-xl bg-background/80 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">{t("results.subtotal")}:</span>
            <span className="font-mono text-text-primary">
              {result.pricing.productSubtotal.toLocaleString()} {currency}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">{t("results.delivery")}:</span>
            <span className="font-mono text-primary-yellow">
              {deliveryCostText}
            </span>
          </div>

          <div className="h-px bg-white/10 my-1" />

          <div className="flex items-center justify-between text-sm sm:text-base font-bold">
            <span className="text-text-primary uppercase tracking-wider">{t("results.total")}:</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-primary-yellow">
              {result.pricing.estimatedTotal.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onBackToEstimate}
            className="flex-1 text-center"
          >
            {t("stepper.step3")}
          </Button>

          <LinkButton
            href="#contact"
            variant="primary"
            className="flex-1 text-center"
            onClick={handleRequestOfferClick}
          >
            {t("results.cta")}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
